# STRATIS — ACME

Intelligence orchestration layer for ACME's multi-tier marketing ecosystem. Built to give ACME Automotive's CMO a single unified view across the three-tier agency landscape — National (Tier 1), Regional (Tier 2), and Dealer Network (Tier 3) — without requiring agencies to adopt anything new.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the Cross-Tier Intelligence Dashboard.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** for components
- **Recharts** + **react-simple-maps** for data visualization
- **Zustand** for state management
- **Deterministic mock data** — seeded PRNG generating 180 days of time series across ~22 campaigns, 6 regions (provinces), 9 channels, 3 tiers

## Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Cross-Tier Intelligence Dashboard with Brand / Region / Campaign drill-down views |
| `/news` | Aggregated news feed — competitor (EV Disruptor, Domestic Rival A, Domestic Rival B, Import Leader, Value Import, Import Rival), iZEV macro, brand, sponsorship signals |
| `/insights` | AI-derived insights with human-in-the-loop approval workflow |
| `/creative-studio` | Creative Studio (coming soon) |
| `/assistant` | STRATIS Assistant (coming soon) |
| `/simulation` | Simulation Sandbox (coming soon) |
| `/launch-campaign` | Launch Campaign (coming soon) |

## Demo Script — ACME CMO Flow

1. **Open: Cross-Tier Intelligence Dashboard.** The CMO sees, for the first time, a single unified view across all three tiers. The Canada map flags Southeast Ontario in red. 23 days remaining in the Electric Pickup launch window. Hero numbers: Tier 2 Ontario CPL $298, Tier 1 National benchmark $218, gap 37%.

2. **Move to Insights Feed.** The three pinned insights tell the entire STRATIS story:
   - **SE Ontario CPL anomaly** — STRATIS caught something nobody saw
   - **Electric Pickup 5-signal convergence** — STRATIS connects signals no agency sees together
   - **EV Disruptor electric-pickup response** — STRATIS reacts to live competitive events

3. **Land on Agency Benchmarking.** The BC vs Ontario Regional comparison: BC Regional CPL $148 (beating Tier 1 benchmark) vs Ontario Regional CPL $298 — same budget, very different performance.

4. **Live event — EV Disruptor electric-pickup price cut (May 8, 2026).** Pinned news item; Insight Card 06 with $1.6M counter-response recommendation, Conquest — EV Disruptor audience overlay.

## Key Concepts

- **Three-tier ecosystem:** Tier 1 National (Mindshare AOR, $61.2M), Tier 2 Regional (Cossette + 4 regional agencies, $41.8M), Tier 3 Dealer Network (aggregate, $21.4M).
- **Nameplate-led:** Full-Size Truck, Electric Pickup (hero), Rugged SUV, Three-Row SUV, Electric Crossover, Plug-In Hybrid SUV, Commercial Van, Midsize SUV.
- **CPL as primary KPI**, not ROAS. ACME thinks in dealer leads.
- **iZEV** federal EV incentive program — Electric Pickup, Electric Crossover, Plug-In Hybrid SUV eligibility.
- **Conquest audiences** for EV Disruptor, Domestic Rival, Import Leader, Value Imports.

## Mock Data

All data is generated deterministically from a seeded PRNG (seed: 42). No external APIs. The generator produces:

- ~22 campaigns across 3 tiers, 7 agencies, 8 nameplates, 6 provinces/regions
- 180 days of daily metrics per campaign per channel, ending 2026-05-08
- Province-level spend allocation for Canada choropleth map
- Channel-specific distributions tuned to land specific CPL targets
- ~22 news items with 3 pinned (EV Disruptor electric pickup, iZEV extension, Domestic Rival A full-size pickup)
- 50+ insights with 3 hand-authored heroes (Scenarios 1, 3, 4)
