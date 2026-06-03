/**
 * STRATIS Assistant — multi-tenant "chat with data" endpoint.
 *
 * Each request carries the active `enterprise` (client instance). The Claude
 * tool-use loop queries that client's siloed SQLite DB:
 *   question -> Claude writes SQL -> we run it against the client's data
 *   -> Claude narrates an answer citing those numbers + emits a chart spec.
 *
 * `steps` are the proof points: the exact SQL run and rows returned.
 */
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { runReadOnlySql, schemaDocFor, enterpriseName, VALID_ENTERPRISES } from "@/lib/assistant/db";
import type { EnterpriseId } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";
const MAX_TURNS = 8;

function systemInstructions(enterpriseId: EnterpriseId): string {
  const name = enterpriseName(enterpriseId);
  return `
You are the STRATIS Assistant, an AI media strategist for ${name}. You answer
questions by querying ${name}'s real campaign-performance database and grounding
every number in query results.

HOW YOU WORK
- Use the run_sql tool to fetch the data you need before answering. Prefer one or
  two well-aggregated queries over many tiny ones.
- Never state a metric you did not retrieve from a query. If a query returns
  nothing useful, say so rather than guessing.
- All data is scoped to ${name} only — do not reference other clients.
- When you have the data, write a concise, executive answer in Markdown. Use
  **bold** for key figures, short bullet lists, and a Markdown table when
  comparing several rows. Keep it tight — this is a busy operator.
- Round sensibly: currency to whole dollars or $X.XXM, ratios to 2 decimals,
  rates to 1 decimal percent.

VISUALIZATION
- When a chart would help (a comparison, ranking, or trend), end your answer with
  a single fenced code block tagged \`stratis-chart\` containing JSON of the form:
  {
    "type": "bar" | "line" | "area",
    "title": "Short chart title",
    "xKey": "label",
    "series": [{"key": "roas", "label": "ROAS"}],
    "data": [{"label": "Google Search", "roas": 2.41}, ...]
  }
- The chart data MUST come from the rows your queries returned — do not invent points.
- Use "bar" for rankings/comparisons, "line"/"area" for time series. Limit bar
  charts to ~10 categories. Omit the chart entirely if it would not add insight.
`.trim();
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "run_sql",
    description:
      "Run a single read-only SQLite SELECT (or WITH) query against the active client's campaign database and get the rows back. Use this to gather every figure you cite.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "A single SELECT/WITH SQLite statement, no trailing semicolon." },
      },
      required: ["query"],
    },
  },
];

interface Step {
  query: string;
  rowCount: number;
  columns: string[];
  sample: Record<string, unknown>[];
  error?: string;
}

interface ChartSpec {
  type: "bar" | "line" | "area";
  title?: string;
  xKey: string;
  series: { key: string; label?: string }[];
  data: Record<string, unknown>[];
}

function extractChart(text: string): { answer: string; chart: ChartSpec | null } {
  const fence = /```stratis-chart\s*([\s\S]*?)```/;
  const m = text.match(fence);
  if (!m) return { answer: text.trim(), chart: null };
  let chart: ChartSpec | null = null;
  try {
    const parsed = JSON.parse(m[1].trim());
    if (parsed && parsed.xKey && Array.isArray(parsed.data) && Array.isArray(parsed.series)) chart = parsed;
  } catch {
    chart = null;
  }
  return { answer: text.replace(fence, "").trim(), chart };
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 500 });
  }

  let body: { messages?: { role: "user" | "assistant"; content: string }[]; enterprise?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Resolve the active client; fall back to the first enterprise if unset/invalid.
  const enterprise = (VALID_ENTERPRISES as string[]).includes(body.enterprise ?? "")
    ? (body.enterprise as EnterpriseId)
    : VALID_ENTERPRISES[0];

  const history = (body.messages ?? []).filter((m) => m.content?.trim());
  if (!history.length) return NextResponse.json({ error: "No messages provided." }, { status: 400 });

  const client = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));
  const steps: Step[] = [];

  try {
    let finalText = "";
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: [
          { type: "text", text: systemInstructions(enterprise) },
          // Schema is large and static per client — cache it across the conversation.
          { type: "text", text: schemaDocFor(enterprise), cache_control: { type: "ephemeral" } },
        ],
        tools: TOOLS,
        messages,
      });

      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason === "tool_use") {
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const block of response.content) {
          if (block.type !== "tool_use" || block.name !== "run_sql") continue;
          const query = String((block.input as { query?: string }).query ?? "");
          try {
            const result = runReadOnlySql(query, enterprise);
            steps.push({ query, rowCount: result.rowCount, columns: result.columns, sample: result.rows.slice(0, 50) });
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify({ row_count: result.rowCount, columns: result.columns, rows: result.rows.slice(0, 200) }),
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            steps.push({ query, rowCount: 0, columns: [], sample: [], error: message });
            toolResults.push({ type: "tool_result", tool_use_id: block.id, content: `ERROR: ${message}`, is_error: true });
          }
        }
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      finalText = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      break;
    }

    if (!finalText) finalText = "I wasn't able to complete that analysis. Try rephrasing the question.";

    const { answer, chart } = extractChart(finalText);
    return NextResponse.json({ answer, chart, steps, enterprise });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message, steps }, { status: 500 });
  }
}
