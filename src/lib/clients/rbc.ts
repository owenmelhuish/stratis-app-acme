// ===========================================================================
// ACME Financial — Retail-banking client instance
// Representative campaign data + a full insight list + market news.
// Figures are illustrative (a demo dataset), grounded in ACME Financial's
// product lines, audiences, and agency roster.
// ===========================================================================
import type { Insight, NewsItem } from '@/types';
import { type CampaignDef, at, todayISO } from './_shared';
import { type InsightVisual, TEAL, RED, PURPLE, MUTED, GRID, BLUE, GOLD } from '../insight-visual-types';

export const RBC_CAMPAIGN_DEFS: CampaignDef[] = [
  // ── TIER 1 — NATIONAL BRAND (BBDO Toronto) ──
  { id: 'rbc-everyday-brand', name: 'Everyday Banking — Ideas Worth Banking On',
    enterprise: 'rbc', division: 'tier-1', agency: 'rbc-bbdo', productLine: 'rbc-chequing',
    audiences: ['rbc-switchers', 'rbc-students'], objective: 'awareness', status: 'live',
    channels: ['ctv', 'ooh', 'instagram', 'spotify'], geos: ['national'], budgetMultiplier: 1.70,
    plannedBudget: 14_800_000, revPerConvRange: [320, 720], cvrModifier: 0.95, cplCalibration: 0.70, revTrend: 0.0003 },
  { id: 'rbc-mortgages-spring', name: 'Mortgages — Spring Home-Buying Window',
    enterprise: 'rbc', division: 'tier-1', agency: 'rbc-bbdo', productLine: 'rbc-mortgages',
    audiences: ['rbc-first-home', 'rbc-mass-affluent'], objective: 'consideration', status: 'live',
    channels: ['google-search', 'facebook', 'instagram', 'ttd'], geos: ['national', 'ontario', 'bc'], budgetMultiplier: 1.55,
    plannedBudget: 12_200_000, revPerConvRange: [1_900, 3_300], cvrModifier: 1.15, cplCalibration: 0.85, revTrend: 0.0006 },
  { id: 'rbc-avion-conquest', name: 'Travel Rewards — Card Switcher Conquest',
    enterprise: 'rbc', division: 'tier-1', agency: 'rbc-bbdo', productLine: 'rbc-avion',
    audiences: ['rbc-switchers', 'rbc-mass-affluent'], objective: 'conversion', status: 'live',
    channels: ['google-search', 'instagram', 'facebook', 'ttd'], geos: ['national'], budgetMultiplier: 1.20,
    plannedBudget: 8_600_000, revPerConvRange: [420, 920], cvrModifier: 1.25, cplCalibration: 0.80, revTrend: 0.0004 },

  // ── TIER 2 — REGIONAL / MEDIA (Initiative) ──
  { id: 'rbc-newcomers-arrive', name: 'Newcomers — Arrive & Bank in 3 Steps',
    enterprise: 'rbc', division: 'tier-2', agency: 'rbc-initiative', productLine: 'rbc-newcomers',
    audiences: ['rbc-newcomers-aud', 'rbc-students'], objective: 'consideration', status: 'live',
    channels: ['facebook', 'instagram', 'google-search', 'tiktok'], geos: ['ontario', 'bc'], budgetMultiplier: 1.05,
    plannedBudget: 6_400_000, revPerConvRange: [360, 820], cvrModifier: 1.10, cplCalibration: 0.90, revTrend: 0.0005 },
  { id: 'rbc-wealth-affluent', name: 'Wealth & Investments — Mass-Affluent Always-On',
    enterprise: 'rbc', division: 'tier-2', agency: 'rbc-initiative', productLine: 'rbc-wealth',
    audiences: ['rbc-mass-affluent'], objective: 'consideration', status: 'live',
    channels: ['linkedin', 'google-search', 'ttd', 'ctv'], geos: ['national', 'ontario'], budgetMultiplier: 1.00,
    plannedBudget: 7_800_000, revPerConvRange: [1_300, 2_700], cvrModifier: 1.05, cplCalibration: 0.75, revTrend: 0.0004 },
  { id: 'rbc-students-bts', name: 'Students — Back-to-School No-Fee Chequing',
    enterprise: 'rbc', division: 'tier-2', agency: 'rbc-initiative', productLine: 'rbc-chequing',
    audiences: ['rbc-students'], objective: 'conversion', status: 'paused',
    channels: ['tiktok', 'instagram', 'google-search'], geos: ['national'], budgetMultiplier: 0.85,
    plannedBudget: 3_900_000, revPerConvRange: [220, 560], cvrModifier: 1.20, cplCalibration: 0.95, revTrend: 0.0003 },

  // ── TIER 3 — BRANCH & LOCAL ──
  { id: 'rbc-smallbiz-local', name: 'Small Business — Local Advisor Booking',
    enterprise: 'rbc', division: 'tier-3', agency: 'rbc-branch', productLine: 'rbc-business',
    audiences: ['rbc-small-biz'], objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'linkedin'], geos: ['ontario', 'alberta'], budgetMultiplier: 0.80,
    plannedBudget: 3_200_000, revPerConvRange: [640, 1_480], cvrModifier: 1.00, cplCalibration: 0.88, revTrend: 0.0004 },
  { id: 'rbc-mortgage-renewal', name: 'Mortgage Renewal — Retention & Rate-Hold',
    enterprise: 'rbc', division: 'tier-3', agency: 'rbc-branch', productLine: 'rbc-mortgages',
    audiences: ['rbc-mass-affluent', 'rbc-first-home'], objective: 'retention', status: 'live',
    channels: ['google-search', 'facebook'], geos: ['national'], budgetMultiplier: 0.75,
    plannedBudget: 2_900_000, revPerConvRange: [1_500, 2_800], cvrModifier: 1.10, cplCalibration: 0.92, revTrend: 0.0005 },
];

export const RBC_NEWS: NewsItem[] = [
  { id: 'news-rbc-boc-rate-hold', title: 'Bank of Canada Holds Overnight Rate at 2.75% — Spring Mortgage Demand Expected to Firm',
    source: 'Bank of Canada', date: '2026-05-07', tags: ['macro'], urgency: 'high', regions: ['national'],
    summary: 'The Bank of Canada held its policy rate at 2.75% for a third consecutive decision, signalling a stable-to-easing path into the second half. Fixed-rate mortgage pricing has already begun to compress at the major banks.',
    whyItMatters: 'A stable rate removes the biggest hesitation for first-time buyers. STRATIS flags the Spring Home-Buying mortgage flight as the campaign most exposed to the demand shift — branded "mortgage rate" search is the leading indicator to watch.',
    enterprises: ['rbc'] },
  { id: 'news-rbc-newcomer-targets', title: "Ottawa Confirms 2026 Immigration Levels — ~395K New Permanent Residents, Concentrated in ON & BC",
    source: 'IRCC', date: '2026-05-04', tags: ['macro', 'partnerships'], urgency: 'high', regions: ['ontario', 'bc'],
    summary: 'Immigration, Refugees and Citizenship Canada confirmed 2026 permanent-resident targets of roughly 395,000, with settlement concentrated in the Greater Toronto and Greater Vancouver areas.',
    whyItMatters: 'Newcomers open their first Canadian account within weeks of arrival — a narrow, high-LTV acquisition window. The Newcomers flight is regionally weighted to exactly where arrivals land; STRATIS is watching for under-served arrival cohorts.',
    enterprises: ['rbc'] },
  { id: 'news-rbc-td-cashback-offer', title: 'A Big-Five Rival Launches Aggressive $500 Chequing Cash-Bonus Offer — Heaviest Switcher Push in Two Years',
    source: 'The Globe and Mail', date: '2026-05-06', tags: ['competitors'], urgency: 'high', competitor: 'a Big-Five rival',
    regions: ['national'], summary: 'A Big-Five rival began a national $500 cash-bonus acquisition offer for new chequing accounts with direct-deposit conditions, backed by a heavy paid-search and social buy.',
    whyItMatters: 'A direct conquest threat to Everyday Banking and Travel Rewards switcher acquisition. STRATIS detected branded "ACME vs rival bank" comparison search rising in the days after launch — reported as correlation, see the linked recommendation.',
    enterprises: ['rbc'] },
  { id: 'news-rbc-interac-fraud', title: 'Interac Reports Spike in E-Transfer Fraud — Banks Asked to Lead Consumer-Education Messaging',
    source: 'Interac', date: '2026-04-29', tags: ['macro', 'social'], urgency: 'medium', regions: ['national'],
    summary: 'Interac flagged a quarter-over-quarter rise in e-transfer fraud attempts and asked member institutions to amplify consumer-protection education.',
    whyItMatters: 'A brand-trust opportunity adjacent to the Everyday Banking platform — security leadership is a proven switcher driver. No spend reallocation required yet; tracked at the brand level.',
    enterprises: ['rbc'] },
  { id: 'news-rbc-open-banking', title: 'Federal Consumer-Driven Banking Framework Finalized — Open-Banking Switching Goes Live 2027',
    source: 'Department of Finance Canada', date: '2026-04-22', tags: ['macro', 'launch'], urgency: 'medium', regions: ['national'],
    summary: 'The federal government finalized the consumer-driven banking (open banking) framework, with account-data portability obligations phasing in through 2027.',
    whyItMatters: 'Lowers switching friction industry-wide — raising the stakes on switcher conquest and retention simultaneously. A structural signal STRATIS is correlating against renewal and conquest performance.',
    enterprises: ['rbc'] },
];

export const RBC_RADAR_PINS = ['news-rbc-boc-rate-hold', 'news-rbc-td-cashback-offer', 'news-rbc-newcomer-targets'];

export const RBC_INSIGHTS: Insight[] = [
  // 1 — SATURATION DETECTED (channel-opt slider)
  {
    id: 'ins-rbc-01-saturation', createdAt: todayISO,
    enterprise: 'rbc', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'rbc-chequing',
    channels: ['ctv', 'google-search', 'spotify'],
    title: 'Connected TV on the Everyday Banking Brand Flight Has Hit Saturation — the Top ~17% of Its Budget Is Driving Almost No New Account-Opens, While the Same Dollars Still Convert in Search and Audio',
    summary: 'Connected TV is past the point where more money buys more account-opens. Its response curve has gone flat: the last ~17% of CTV spend is producing almost no incremental opens, because the mass-affluent audience that responds to TV has already been reached often enough. Search and audio, by contrast, are still on the steep part of their curves — every added dollar there still converts. A great buyer reads the saturation point off the curve once a quarter; STRATIS watches it continuously and calls it the week CTV flattens. Move the over-saturated tail to the channels that still have room.',
    evidence: [
      'CTV: each extra $100K is now driving ~5 account-opens, down from ~24 earlier in the flight.',
      'About 17% of CTV budget sits past the point where the response curve goes flat.',
      'Search and audio are still climbing — ~21 and ~15 opens per extra $100K.',
      'CTV frequency on the mass-affluent core has pushed well past the level where TV stops persuading.',
      'STRATIS flags saturation as it happens; a quarterly mix model would book the wasted tail as “working.”',
    ],
    confidence: 0.90,
    impactEstimate: 'Moving the saturated ~17% of CTV (~$2.5M) into search and audio drives roughly the same number of account-opens for less, or more opens for the same spend — recovered now, not at the next planning cycle.',
    recommendedAction: 'Pull the saturated top slice of CTV budget and redeploy it to high-intent search and audio, which still convert at the margin. STRATIS holds each channel against its own saturation point and rebalances as the curves move.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Cap CTV at the point its response curve flattens', subtitle: 'THE LAST 17% BUYS ALMOST NOTHING', type: 'budget', completed: false },
      { id: 's2', title: 'Redeploy the freed ~$2.5M to search + audio', subtitle: 'CHANNELS STILL ON THE STEEP CURVE', type: 'budget', completed: false },
      { id: 's3', title: 'Watch every channel’s saturation point continuously', subtitle: 'REBALANCE AS THE CURVES MOVE', type: 'scheduling', completed: false },
    ],
  },
  // 2 — MARKETING-MIX ALLOCATION BY EFFICIENCY (channel-opt slider)
  {
    id: 'ins-rbc-02-mix-reallocation', createdAt: at(0, '07:03:00'),
    enterprise: 'rbc', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'rbc-chequing',
    channels: ['ctv', 'ttd', 'google-search', 'facebook', 'spotify'],
    title: 'Three Channels Are Past Their Efficient Point and Three Have Room to Grow — Rebalancing the Everyday Banking Mix to Where Each Dollar Works Hardest Frees ~$3.1M at the Same Account-Open Volume',
    summary: 'The budget isn’t split to get the most account-opens per dollar. Lined up side by side, three channels are funded past the point where they pay back, while three are underfunded and still hungry — the next dollar would do far more good in the second group than it’s doing in the first. Rebalancing toward that efficiency frontier holds total opens flat while freeing spend, or grows opens at the same budget. This is the mix optimization a strategist does by hand once a quarter; STRATIS holds the frontier live and shows exactly how much to move and where.',
    evidence: [
      'Programmatic display and Facebook are funded ~28% past the point where each dollar pays back.',
      'Search, audio, and the high-intent switcher pool are underfunded with room to grow.',
      'Equalizing the marginal return across channels frees ~$3.1M at today’s account-open volume.',
      'No single platform sees this — each reports its own efficiency, not the cross-channel frontier.',
      'The recommended mix is shown as concrete dollar moves, not a directional “shift toward video.”',
    ],
    confidence: 0.88,
    impactEstimate: 'Rebalancing to the efficiency frontier frees ~$3.1M at flat account-open volume, or drives ~9% more opens at the same total budget.',
    recommendedAction: 'Move budget from the three over-funded channels into the three with headroom until the next dollar is equally productive everywhere. STRATIS recomputes the frontier as performance shifts.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Pull spend from the three past-efficient channels', subtitle: 'WHERE THE DOLLAR NO LONGER PAYS BACK', type: 'budget', completed: false },
      { id: 's2', title: 'Fund the three channels with headroom', subtitle: 'WHERE THE NEXT DOLLAR WORKS HARDEST', type: 'budget', completed: false },
      { id: 's3', title: 'Hold the mix on the efficiency frontier', subtitle: 'STRATIS RECOMPUTES AS IT MOVES', type: 'scheduling', completed: false },
    ],
  },
  // 3 — AUDIENCE EFFICIENCY & TARGETING
  {
    id: 'ins-rbc-03-audience-efficiency', createdAt: at(0, '07:06:00'),
    enterprise: 'rbc', category: 'audience-overlap', scope: 'division', division: 'tier-1', productLine: 'rbc-chequing',
    channels: ['ctv', 'ttd', 'google-search', 'facebook'],
    title: 'In-Market Switchers Convert at 2.3× the ROAS of the Broad Mass-Affluent Audience — but They Get Only a Third of the Targeting Budget',
    summary: 'Not every audience is worth the same. The in-market switcher segment — people actively comparing banks right now — converts at more than twice the ROAS of the broad mass-affluent audience, because they’re already in motion. But the budget is weighted to the broad audience because it’s bigger and cheaper to reach, so most of the money is chasing the least efficient people. Shifting targeting toward the high-intent segment, and trimming the broad-reach waste, lifts results without spending more.',
    evidence: [
      'In-market switcher segment: ~2.3× the account-opens per dollar of the broad mass-affluent audience.',
      'That high-intent segment receives only ~32% of acquisition targeting budget today.',
      'The broad mass-affluent audience absorbs most of the spend at the weakest conversion.',
      'The efficient segment is reachable through comparison-search intent and CRM-match switchers.',
      'STRATIS ranks every audience by opens per dollar, not by reach or CPM.',
    ],
    confidence: 0.87,
    impactEstimate: 'Reweighting targeting toward the high-intent switcher segment is projected to lift account-opens ~13% at the same spend, by moving dollars off the broad audience’s long inefficient tail.',
    recommendedAction: 'Shift targeting budget into the in-market switcher segment and trim the broad-reach tail. STRATIS keeps ranking audiences by opens per dollar and reallocates as efficiency shifts.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Raise the in-market switcher budget share', subtitle: 'FUND THE 2.3× AUDIENCE', type: 'targeting', completed: false },
      { id: 's2', title: 'Trim the broad mass-affluent reach tail', subtitle: 'STOP PAYING FOR THE WEAKEST CONVERTERS', type: 'targeting', completed: false },
      { id: 's3', title: 'Rank every audience by opens per dollar', subtitle: 'NOT BY REACH OR IMPRESSIONS', type: 'targeting', completed: false },
    ],
  },
  // 4 — RISING COST PER ACQUISITION
  {
    id: 'ins-rbc-04-acquisition-cost-rising', createdAt: at(0, '07:09:00'),
    enterprise: 'rbc', category: 'tactical-efficiency', scope: 'product', productLine: 'rbc-chequing',
    channels: ['google-search', 'ttd'],
    linkedNewsId: 'news-rbc-td-cashback-offer',
    title: 'Cost per New Chequing Account Through Search Now Runs ~$240 — Up From ~$195 Two Weeks Ago — Because a Big-Five Rival Bid Up a Handful of “Best Chequing Bonus” Terms',
    summary: 'The cost to acquire a chequing account through search has jumped about 23% in two weeks. It isn’t that the ads got worse — conversion is flat. It’s a price war: after the rival’s $500 cash-bonus launch, more advertisers piled onto a small cluster of “best chequing bonus” and comparison terms and bid the price up. So the fix is surgical — cap the bids on that handful of terms — not a blunt cut to the whole search program. A quarterly mix model would catch this about six weeks from now; STRATIS flagged it the day the cost crossed the line, with the cause attached.',
    evidence: [
      'Cost per account via search: ~$240, up from ~$195 two weeks ago.',
      'Conversion rate is flat — this is a rising-price problem, not a creative problem.',
      'The increase traces to a small cluster of bonus/comparison terms, not the whole account.',
      'Capping bids on those terms restores the cost without touching the rest of the program.',
      'STRATIS catches it the day the cost crosses the line; a quarterly model lags ~6 weeks.',
    ],
    confidence: 0.86,
    impactEstimate: 'Capping bids on the over-heated terms brings the cost-per-account back under ~$195 within days, recovering roughly $0.8M a quarter currently lost to the price war.',
    recommendedAction: 'Cap bids on the small cluster of bonus and comparison terms driving the increase, rather than cutting the whole search budget. STRATIS watches the cost-per-account continuously and alerts on the next crossing.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Pinpoint the bonus terms driving the spike', subtitle: 'A HANDFUL OF TERMS, NOT THE ACCOUNT', type: 'targeting', completed: false },
      { id: 's2', title: 'Cap their bids to restore the cost', subtitle: 'SURGICAL, NOT A PROGRAM-WIDE CUT', type: 'bidding', completed: false },
      { id: 's3', title: 'Alert the moment cost crosses the line', subtitle: 'DON’T WAIT FOR THE QUARTERLY MODEL', type: 'scheduling', completed: false },
    ],
  },
  // 5 — PRICE OF REACH UP, RESULTS FLAT
  {
    id: 'ins-rbc-05-price-of-reach', createdAt: at(0, '07:12:00'),
    enterprise: 'rbc', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'rbc-chequing',
    channels: ['ctv', 'spotify', 'google-search', 'facebook'],
    title: 'The Price of Reach on Connected TV Has Climbed Three Weeks Straight While Account-Opens Held Flat — We’re Paying More for the Same Result and the Budget Hasn’t Reacted',
    summary: 'Connected TV is getting more expensive to buy — the price of reaching a thousand people is up about 22% over three weeks — but it isn’t driving any more account-opens. We’re simply paying more for the same result, and the budget hasn’t moved to reflect it. STRATIS watches cost against result by channel every week, so it caught the gap as it opened rather than at the end of a monthly report. The move is a straightforward, reversible shift away from a channel that quietly got pricier toward channels still beating their benchmark.',
    evidence: [
      'CTV price of reach: up ~22% over three weeks.',
      'CTV account-opens over the same window: flat — more money, same result.',
      'CTV budget weight: unchanged since the price climb began.',
      'Audio and high-intent search are currently beating their benchmark — reversible targets.',
      'The shift fully reverses the moment CTV pricing normalizes.',
    ],
    confidence: 0.84,
    impactEstimate: 'Trimming the now-overpriced CTV share back to its efficient run-rate and redeploying it stops the climb in cost per account; fully reversible if CTV pricing comes back down.',
    recommendedAction: 'Trim the overpriced CTV share and redeploy to channels still beating their benchmark; STRATIS reverses the move automatically if CTV pricing normalizes.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Reduce CTV weight to its efficient run-rate', subtitle: 'REVERSIBLE', type: 'budget', completed: false },
      { id: 's2', title: 'Redeploy to channels beating their benchmark', subtitle: 'AUDIO + HIGH-INTENT SEARCH', type: 'budget', completed: false },
      { id: 's3', title: 'Alert when cost and results drift apart', subtitle: 'STRATIS WATCHES WEEKLY', type: 'scheduling', completed: false },
    ],
  },
  // 6 — GEOGRAPHIC EFFICIENCY
  {
    id: 'ins-rbc-06-geo-efficiency', createdAt: at(0, '07:15:00'),
    enterprise: 'rbc', category: 'national-regional', scope: 'division', division: 'tier-1', productLine: 'rbc-mortgages',
    channels: ['ctv', 'ttd', 'google-search'],
    linkedNewsId: 'news-rbc-boc-rate-hold',
    title: 'A Quarter of National Mortgage Spend Is Going to Provinces Converting 30% Below Average — the Media Map and the Demand Map Don’t Match',
    summary: 'Where the money goes and where it works have drifted apart. About a quarter of national mortgage spend is landing in provinces that convert roughly 30% below the national average, while several high-converting markets are underfunded. The plan is weighted to population and last year’s buy, not to where media actually converts today — and with the Bank of Canada holding rates, demand is firming unevenly across provinces. Re-weighting the geographic plan toward the markets that convert — and pulling back from the ones that don’t — lifts pre-approvals without adding budget.',
    evidence: [
      '~25% of national mortgage spend sits in provinces converting ~30% below the national average.',
      'Several high-converting provinces are underfunded relative to the demand they show.',
      'Spend tracks population and last year’s plan, not current conversion.',
      'Re-weighting to conversion is a pure reallocation — no new budget required.',
      'STRATIS scores every province on what media actually returns, refreshed continuously.',
    ],
    confidence: 0.85,
    impactEstimate: 'Re-weighting the geo plan toward converting provinces is projected to lift pre-approvals ~11% at flat spend by moving money off the weakest markets.',
    recommendedAction: 'Shift mortgage weight out of the low-converting provinces into the high-converting ones the plan currently underfunds. STRATIS re-scores provinces continuously and flags drift.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Pull weight from provinces converting below average', subtitle: 'STOP FUNDING POPULATION OVER DEMAND', type: 'budget', completed: false },
      { id: 's2', title: 'Fund the high-converting provinces that are starved', subtitle: 'MATCH SPEND TO WHERE IT WORKS', type: 'budget', completed: false },
      { id: 's3', title: 'Re-score every province continuously', subtitle: 'KEEP THE MAP AND THE PLAN ALIGNED', type: 'targeting', completed: false },
    ],
  },
  // 7 — ACCESS FRICTION (underwriting + advisor-booking friction)
  {
    id: 'ins-rbc-07-access-friction', createdAt: at(0, '07:18:00'),
    enterprise: 'rbc', category: 'national-regional', scope: 'brand',
    channels: ['google-search', 'ttd', 'ooh'],
    title: 'In Provinces Where Mortgage Underwriting and Advisor-Booking Waits Are Heaviest, the Same Ads Convert 32% Worse — We’re Still Spending Into the Friction',
    summary: 'Media performance is being dragged down by something that has nothing to do with the media. In provinces where the path from click to funded application is slowest — heaviest underwriting steps, longest advisor-booking waits — the exact same ads convert about 32% worse. The demand is there, but it stalls before it clears. Today the plan allocates on reach efficiency alone, pouring budget into markets where the application stalls. Weighting spend to access, and clearing the branch-advisor bottleneck first, turns wasted impressions into funded applications.',
    evidence: [
      'Heaviest-friction provinces convert the same creative ~32% worse than fast-access provinces.',
      'Spend tracks reach efficiency, not access — so money flows where applications stall.',
      '~$2.2M a year is going to the highest-friction provinces.',
      'Fast-access provinces return ~1.5× the result at equal spend.',
      'STRATIS joins advisor-booking and underwriting-time data to media performance — a link no media report sees.',
    ],
    confidence: 0.85,
    impactEstimate: 'Weighting the plan to access and clearing advisor-booking bottlenecks before reinvesting is projected to lift the return on media ~18% at flat spend.',
    recommendedAction: 'Add an access weight to the budget model, pull spend from the highest-friction provinces, and route advisor capacity to clear booking waits before reinvesting. STRATIS keeps the access-to-media link live.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Add a branch-access weight to the budget model', subtitle: 'DON’T ALLOCATE ON REACH ALONE', type: 'bidding', completed: false },
      { id: 's2', title: 'Pull spend from the highest-friction provinces', subtitle: 'WHERE THE APPLICATION STALLS', type: 'budget', completed: false },
      { id: 's3', title: 'Clear advisor-booking waits before reinvesting', subtitle: 'CLEAR THE HURDLE FIRST', type: 'targeting', completed: false },
    ],
  },
  // 8 — CREATIVE WINNER STARVED
  {
    id: 'ins-rbc-08-creative-winner', createdAt: at(0, '07:21:00'),
    enterprise: 'rbc', category: 'creative-performance', scope: 'division', division: 'tier-1', productLine: 'rbc-mortgages',
    channels: ['ooh', 'google-search', 'facebook', 'ctv'],
    linkedNewsId: 'news-rbc-boc-rate-hold',
    title: 'One “Lock Your Rate” Ad Is Driving Pre-Approvals at 1.6× the Rate of the Main Brand Spot — but It’s Only Getting 13% of the Views',
    summary: 'Ranked by how many pre-approvals each ad actually drove — not by last click — the rate-certainty “lock your rate” execution is the clear winner, converting at about 1.6× the rate of the legacy brand hero it runs beside, strongest at the point of decision. But it’s starved: it gets only ~13% of views because delivery defaults to the old hero. Since the Bank of Canada’s rate hold makes “certainty now” a true and timely message, this is a durable win you can capture for free — give the proven ad more of the views, then make more like it.',
    evidence: [
      'The “lock your rate” ad converts at ~1.6× the rate of the brand hero beside it.',
      'It holds only ~13% of views — delivery defaults to the legacy hero.',
      'It’s strongest at the point of decision, where rate certainty is the last hurdle.',
      'The edge repeats across independent provinces — not a one-market fluke.',
      'Measured on pre-approvals driven, not last click; the rate hold makes the edge durable.',
    ],
    confidence: 0.88,
    impactEstimate: 'Giving the proven ad more of the views lifts the overall pre-approval rate at no production cost — and tells the creative team exactly what to make more of.',
    recommendedAction: 'Shift views from the legacy hero to the winning rate-certainty ad in search, OOH, and social, and brief the agency to extend the winning idea. STRATIS keeps ranking creative by pre-approvals driven.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Rank creative by pre-approvals driven', subtitle: 'NOT BY LAST CLICK', type: 'creative', completed: false },
      { id: 's2', title: 'Give the proven rate-certainty ad more views', subtitle: 'FREE GAIN — NO NEW PRODUCTION', type: 'creative', completed: false },
      { id: 's3', title: 'Brief the agency to make more like the winner', subtitle: 'PROVEN IDEA → MORE OF IT', type: 'creative', completed: false },
    ],
  },
  // 9 — CREATIVE FATIGUE
  {
    id: 'ins-rbc-09-creative-fatigue', createdAt: at(0, '07:24:00'),
    enterprise: 'rbc', category: 'creative-performance', scope: 'division', division: 'tier-1', productLine: 'rbc-chequing',
    channels: ['ctv', 'facebook'],
    title: 'The “Ideas Worth Banking On” Brand Spot Has Lost ~18% of Its Pull in Three Weeks at the Same Spend — That’s Creative Wear-Out, Not a Delivery Problem, So the Fix Is a Refresh',
    summary: 'The flagship brand spot is tiring out. Its pull with the mass-affluent core is down about 18% over three weeks even though spend and audience haven’t changed. The instinct is to blame the buy, but the pattern says otherwise: people are simply seeing it too many times — response drops with each extra viewing while a fresher cut running beside it holds steady. That’s creative wear-out, and the fix is a refresh, not a change to the media. Spending the cycle re-tuning delivery would fix nothing. STRATIS calls the cause and flags the refresh window before the decay starts costing real account-opens.',
    evidence: [
      '“Ideas Worth Banking On” pull is down ~18% over three weeks at flat spend and a steady audience.',
      'Response drops with each additional viewing — the fingerprint of wear-out, not delivery.',
      'A fresher cut running beside it is holding steady, ruling out a market-wide delivery shift.',
      'Two lower-frequency cuts out-perform per viewing but get only ~10% of delivery.',
      'STRATIS separates wear-out from delivery so the team doesn’t fix the wrong thing.',
    ],
    confidence: 0.90,
    impactEstimate: 'Refreshing the worn spot before the decay deepens is projected to improve the cost per account ~16%, and avoids a wasted delivery change that wouldn’t have fixed wear-out.',
    recommendedAction: 'Treat it as wear-out: cap the tired spot’s delivery, promote the two best fresh cuts, and brief a new execution for the over-exposed audience. STRATIS confirms the cause and flags the refresh window.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Confirm wear-out before changing anything', subtitle: 'IT’S FREQUENCY, NOT THE BUY', type: 'creative', completed: false },
      { id: 's2', title: 'Cap the tired spot, promote the fresh cuts', subtitle: 'REFRESH, DON’T RE-TUNE DELIVERY', type: 'creative', completed: false },
      { id: 's3', title: 'Brief a new execution for the worn-out audience', subtitle: 'BEFORE IT COSTS REAL ACCOUNT-OPENS', type: 'creative', completed: false },
    ],
  },
  // 10 — FREQUENCY COLLISION
  {
    id: 'ins-rbc-10-frequency-collision', createdAt: at(0, '07:27:00'),
    enterprise: 'rbc', category: 'audience-overlap', scope: 'brand',
    channels: ['ctv', 'facebook', 'google-search', 'ttd'],
    title: 'The Average Mass-Affluent GTA Adult Is Seeing an ACME Financial Ad 26 Times a Week Across TV, Social, and Display — More Than Double What Actually Moves Them',
    summary: 'Each product line caps how often it shows an ad, but nobody caps across all of them at once. When you follow a single person across TV, social, display, and search, the average mass-affluent GTA adult is seeing ACME Financial about 26 times a week — more than double the ~10–12 range where extra exposure stops persuading and starts annoying. The over-exposure is invisible to any one product team because each only sees its own delivery; it only shows up when every campaign is matched to the same person. One cap across everything pulls exposure back to the effective range and frees the wasted impressions for people the brand isn’t reaching at all.',
    evidence: [
      'Matched to the person across four channels: ~26 ads a week to the average mass-affluent GTA adult.',
      'No single line goes above ~9 a week — the pile-up only shows up when you combine them.',
      'Extra exposure stops persuading past ~10–12 a week for this audience.',
      'About 22% of acquisition impressions land above that line — roughly $3.4M a year of waste.',
      'The waste is also burning out the brand spot faster in the over-exposed group.',
    ],
    confidence: 0.92,
    impactEstimate: 'One cap across all product lines pulls weekly exposure back to the effective range and moves ~$3.4M of wasted impressions to people the brand isn’t reaching — lifting net reach ~14% with no extra spend.',
    recommendedAction: 'Set a single ~12-per-week cap across every ACME Financial campaign and move the recovered budget to under-reached audiences and the under-served Wealth and Small Business pools. STRATIS matches audiences across campaigns and enforces the cap continuously.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Set one ~12/week cap across all product lines', subtitle: 'NOT PER-CAMPAIGN — ACROSS EVERYTHING', type: 'bidding', completed: false },
      { id: 's2', title: 'Move the savings to under-reached audiences', subtitle: 'BUY REACH WE’RE MISSING', type: 'budget', completed: false },
      { id: 's3', title: 'Enforce the combined cap continuously', subtitle: 'STRATIS MATCHES ACROSS CAMPAIGNS', type: 'scheduling', completed: false },
    ],
  },
  // 11 — COMPETITIVE OPPORTUNITY: conquest lane reopens
  {
    id: 'ins-rbc-11-conquest-opportunity', createdAt: at(0, '07:30:00'),
    enterprise: 'rbc', category: 'competitive-macro', scope: 'product', productLine: 'rbc-chequing',
    channels: ['google-search', 'linkedin', 'ttd'],
    linkedNewsId: 'news-rbc-td-cashback-offer',
    title: 'The Big-Five Rival’s Launch Burst Is Fading and Switching Interest Is Surging — the Door to Win Switchers Just Opened, and the Comparison Auction Is Cheaper Than It’s Been All Year',
    summary: 'Two things happened at once that add up to an opening, not a threat. Right after the rival’s $500 cash-bonus launch, people started searching “best chequing bonus” and “ACME vs rival bank” about three times as much — and that interest is still running hot. But the rival’s heavy launch-week paid push has tapered, so the cost to show up against those searches has dropped below where it’s been all year. Our switch campaign is only putting 6% of its budget here, and the matched-offer ad isn’t even surfaced in the comparison moment. The lane is open, cheap, and uncontested — but only while interest is running ahead of the rival’s spend.',
    evidence: [
      'Switching searches up ~210% within the launch window — and still elevated.',
      'The rival’s launch-week paid push has tapered ~40% — the comparison auction is the cheapest it’s been all year.',
      'Our switch campaign holds only 6% of search budget in the affected markets.',
      'The matched limited-time offer isn’t surfaced in the comparison-shopping moment.',
      'STRATIS reads the retreat and the interest spike together and calls it an opening.',
    ],
    confidence: 0.83,
    impactEstimate: 'Surging the switch campaign while the lane is cheap and interest is leading is projected to protect ~$4.6M a year of at-risk balances, at a lower cost to win each switcher than any point last year.',
    recommendedAction: 'Surge switch search and the matched-offer ad in the affected markets now, while the rival is quiet and costs are low. STRATIS holds the lane and alerts if the rival re-enters.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Raise switch-search budget from 6% to ~18%', subtitle: 'WHILE THE AUCTION IS CHEAP', type: 'budget', completed: false },
      { id: 's2', title: 'Surface the matched offer in the comparison moment', subtitle: 'WALK THROUGH THE OPEN DOOR', type: 'creative', completed: false },
      { id: 's3', title: 'Alert if the rival re-enters the auction', subtitle: 'STRATIS HOLDS THE LANE', type: 'scheduling', completed: false },
    ],
  },
  // 12 — TIER CHOREOGRAPHY: national TV → local branch pull-through
  {
    id: 'ins-rbc-12-pull-through', createdAt: at(0, '07:33:00'),
    enterprise: 'rbc', category: 'tier-choreography', scope: 'brand',
    channels: ['ctv', 'google-search', 'facebook'],
    title: 'Every Time a National Brand Flight Runs, Local “Bank Near Me” and Advisor-Booking Searches Climb 8 Days Later — but the Branch & Local Schedule Isn’t Lined Up to That Window',
    summary: 'The national and local sides of the plan are out of sync. In markets with heavy national brand TV (Tier 1), branded “bank near me” and advisor-booking searches see a clear bump about eight days later — people are carrying the brand prompt into a branch visit. But the Tier 3 Branch & Local media and advisor outreach run on a different calendar than the national flights, so the local touch usually lands outside that eight-day window when the customer is already deciding. The fix is timing, not more money — fire the local touch into the window the national TV already created.',
    evidence: [
      'Local “bank near me” + advisor-booking searches peak about eight days after a national TV flight in the same market.',
      'Heavy-TV markets see ~26% more local branded search than light-TV markets.',
      'Branch & Local schedules aren’t aligned to the national TV calendar — they run in separate systems.',
      'A customer’s post-TV local search converts ~2.0× better when a local touch lands inside the window.',
      'Only a view across both tiers sees the eight-day handoff — neither team sees it alone.',
    ],
    confidence: 0.86,
    impactEstimate: 'Timing the Branch & Local touch to the eight-day window is projected to lift conversions ~8–11% in aligned markets — with no extra media spend.',
    recommendedAction: 'Trigger Branch & Local media and advisor outreach to fire 6–9 days after each national TV flight by market. STRATIS pushes the flight calendar into the local systems so the window is hit by default.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Feed the national flight calendar into local systems', subtitle: 'ONE CALENDAR, NOT TWO', type: 'scheduling', completed: false },
      { id: 's2', title: 'Time the local touch to the 6–9 day window', subtitle: 'HIT THE HANDOFF', type: 'scheduling', completed: false },
      { id: 's3', title: 'Compare aligned vs unaligned markets for six weeks', subtitle: 'PROVE THE LIFT', type: 'targeting', completed: false },
    ],
  },
  // 13 — AUDIENCE MIGRATION (Facebook → TikTok, student/newcomer cohort)
  {
    id: 'ins-rbc-13-audience-migration', createdAt: at(0, '07:36:00'),
    enterprise: 'rbc', category: 'tactical-efficiency', scope: 'product', productLine: 'rbc-newcomers',
    channels: ['facebook', 'tiktok', 'instagram'],
    title: 'Move the Student & Newcomer Budget From Facebook to TikTok — the Under-30 Arrivals Who Made Facebook Efficient Last Year Have Moved to TikTok, Where They Now Open Accounts ~38% Cheaper',
    summary: 'The young-newcomer and student audience that made Facebook pay off last year — under-30 arrivals researching their first Canadian account — has shifted where it spends its attention. That activity has largely moved to TikTok (creators and in-language explainers), and the same people now respond there at a much lower cost, while Facebook’s cost to open an account from this cohort has climbed as the active audience thinned out. This is an audience-migration call: follow the people, not the plan. STRATIS tracks where an audience actually converts across platforms week to week, so it catches the shift while it’s happening.',
    evidence: [
      'Cost to open an account from the young-newcomer cohort: up ~44% on Facebook over the quarter, while TikTok is ~38% cheaper for the same audience.',
      'The active under-30 newcomer audience on Facebook has shrunk; the same users now convert on TikTok.',
      'Facebook still works for the older mass-affluent audience — this move is the young-newcomer slice only.',
      'TikTok delivery for this cohort has headroom; it isn’t yet saturated.',
      'Only a cross-platform view catches this — each platform’s own report looks “fine” in isolation.',
    ],
    confidence: 0.85,
    impactEstimate: 'Moving the young-newcomer slice from Facebook to TikTok is projected to lift account-opens from this cohort ~12% at flat spend, by following the audience to where it now converts.',
    recommendedAction: 'Shift the young-newcomer and student budget from Facebook to TikTok, keep Facebook only for the cohorts still converting there, and let STRATIS keep watching where the audience converts.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move the young-newcomer budget to TikTok', subtitle: 'FOLLOW THE AUDIENCE', type: 'budget', completed: false },
      { id: 's2', title: 'Keep only the Facebook cohorts still converting', subtitle: 'OLDER MASS-AFFLUENT, NOT UNDER-30', type: 'targeting', completed: false },
      { id: 's3', title: 'Watch where the audience converts week to week', subtitle: 'STRATIS TRACKS THE MIGRATION', type: 'scheduling', completed: false },
    ],
  },
  // 14 — DISCOVERY / INTENT (cold Facebook prospecting → high-intent Search)
  {
    id: 'ins-rbc-14-discovery-intent', createdAt: at(0, '07:39:00'),
    enterprise: 'rbc', category: 'tactical-efficiency', scope: 'product', productLine: 'rbc-mortgages',
    channels: ['facebook', 'google-search', 'instagram'],
    title: 'Shift a Slice of Cold Facebook Prospecting Into High-Intent Search — First-Home Buyers Planning a Purchase Are Already Searching “Mortgage Pre-Approval” and Convert at About a Third of Facebook’s Cold Cost',
    summary: 'Search is where people plan, and a real share of the first-home audience is there actively querying “mortgage pre-approval,” “first-time home buyer steps,” and rate questions. Because they arrive with intent, they convert to a qualified pre-approval at roughly a third of the cost of cold prospecting on Facebook. Facebook is still the right tool for re-engaging people who already know the brand — but the top-of-funnel prospecting dollar works far harder in high-intent search for this audience, and today search is capped while cold Facebook prospecting runs heavy.',
    evidence: [
      'Cost per qualified pre-approval: ~$58 from high-intent search vs ~$165 for cold Facebook prospecting.',
      'First-home buyers reach search already querying the decision — intent, not interruption.',
      'High-intent search is capped while cold Facebook prospecting holds the larger budget.',
      'Keep Facebook for retargeting known visitors — this moves the cold prospecting dollar only.',
      'STRATIS compares cost per qualified pre-approval across platforms, not each platform’s own metric.',
    ],
    confidence: 0.84,
    impactEstimate: 'Moving a slice of cold Facebook prospecting into high-intent search is projected to cut the blended cost of a qualified pre-approval ~22% and free Facebook for retargeting where it’s strongest.',
    recommendedAction: 'Shift cold prospecting budget from Facebook into high-intent search, and keep Facebook focused on retargeting known visitors. STRATIS holds the cross-platform efficiency comparison live.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move cold prospecting budget to high-intent search', subtitle: 'BUY INTENT, NOT INTERRUPTION', type: 'budget', completed: false },
      { id: 's2', title: 'Keep Facebook on retargeting known visitors', subtitle: 'WHERE FACEBOOK STILL WINS', type: 'targeting', completed: false },
      { id: 's3', title: 'Compare cost per pre-approval across platforms', subtitle: 'NOT EACH PLATFORM’S OWN METRIC', type: 'scheduling', completed: false },
    ],
  },
  // 15 — SUPPLY PATH (open exchange → curated TTD deals)
  {
    id: 'ins-rbc-15-supply-path', createdAt: at(0, '07:42:00'),
    enterprise: 'rbc', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'rbc-mortgages',
    channels: ['ttd'],
    title: 'Pull Mid-Funnel Display Out of the Open Exchange and Into Curated Finance Deals on The Trade Desk — Same Audience, ~27% Less Waste, and Ads Stop Landing Next to the Wrong Content',
    summary: 'A large share of programmatic display is still running through the open exchange, where about 27% of every dollar disappears into low-quality, never-seen, or off-target inventory — and ads sometimes land next to content a regulated bank can’t be near. Moving that money into curated private deals on The Trade Desk — finance and life-stage-relevant inventory bought directly — reaches the same prospects with far less waste and clean, on-topic adjacency. Same audience, more of the dollar actually working.',
    evidence: [
      'About 27% of open-exchange spend is lost to unviewable, low-quality, or off-target inventory.',
      'Curated private deals on The Trade Desk reach the same prospect audience with verified placement.',
      'Open-exchange viewability runs well below the curated-deal benchmark.',
      'Private deals also remove the brand-safety risk of unknown adjacency for a regulated bank.',
      'STRATIS reads delivered quality, not just the buying platform’s reported impressions.',
    ],
    confidence: 0.87,
    impactEstimate: 'Moving mid-funnel display from the open exchange into curated Trade Desk deals recovers ~27% of that spend into working impressions — roughly $1.3M a year at the same audience and reach.',
    recommendedAction: 'Shift mid-funnel display out of the open exchange into curated finance private deals on The Trade Desk. STRATIS keeps scoring delivered quality and flags waste as it reappears.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move display from open exchange to curated deals', subtitle: 'SAME AUDIENCE, LESS WASTE', type: 'budget', completed: false },
      { id: 's2', title: 'Hold delivery to verified, on-topic inventory', subtitle: 'BRAND-SAFE ADJACENCY', type: 'targeting', completed: false },
      { id: 's3', title: 'Score delivered quality, not reported impressions', subtitle: 'STRATIS WATCHES THE SUPPLY PATH', type: 'scheduling', completed: false },
    ],
  },
  // 16 — REACH SATURATION → NET-NEW REACH (audio out of new people → TTD)
  {
    id: 'ins-rbc-16-reach-cap', createdAt: at(0, '07:45:00'),
    enterprise: 'rbc', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'rbc-chequing',
    channels: ['spotify', 'ttd'],
    title: 'Audio Has Reached Almost Everyone It Can in the Mass-Affluent Audience — the Next Reach Dollar Belongs on The Trade Desk, Where There Are Still New People to Find',
    summary: 'Audio has done its job and hit its ceiling: it has now delivered to nearly everyone reachable in the mass-affluent audience, so each additional audio dollar just adds repeat listens to the same people instead of finding new ones. The Trade Desk still has real net-new reach into that same audience at a similar cost. This is different from cutting a channel for being inefficient — audio is efficient, it’s simply out of new people. Cap it at its reach ceiling and put the next reach dollar where new people still exist to convert.',
    evidence: [
      'Audio’s unique reach in this audience has flattened — added spend now adds frequency, not new people.',
      'The Trade Desk still reaches net-new people in the same audience at a similar cost.',
      'Audio stays funded up to its ceiling — this caps the overflow, it doesn’t cut the channel.',
      'Extra audio frequency past the ceiling is the same diminishing-returns trap as any saturated channel.',
      'STRATIS separates “out of new people” from “inefficient” — they call for different moves.',
    ],
    confidence: 0.85,
    impactEstimate: 'Capping audio at its reach ceiling and moving the overflow to The Trade Desk converts wasted repeat listens into net-new reach — lifting unique audience reached ~9% at the same spend.',
    recommendedAction: 'Cap audio at the point its unique reach flattens and move the overflow to The Trade Desk for net-new reach. STRATIS watches each channel’s reach ceiling and redirects the overflow.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Cap audio where its unique reach flattens', subtitle: 'EFFICIENT, BUT OUT OF NEW PEOPLE', type: 'budget', completed: false },
      { id: 's2', title: 'Move the overflow to The Trade Desk for net-new reach', subtitle: 'FIND PEOPLE, NOT FREQUENCY', type: 'budget', completed: false },
      { id: 's3', title: 'Watch each channel’s reach ceiling', subtitle: 'REDIRECT THE OVERFLOW', type: 'scheduling', completed: false },
    ],
  },
  // 17 — COMPETITIVE AUCTION PRESSURE (Meta crowded → TikTok + CTV)
  {
    id: 'ins-rbc-17-auction-pressure', createdAt: at(0, '07:48:00'),
    enterprise: 'rbc', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'rbc-chequing',
    channels: ['facebook', 'instagram', 'tiktok', 'ctv'],
    title: 'A Rival’s Spring Push Crowded the Meta Auction — Our Cost to Reach the Mass-Affluent Audience There Jumped ~29%; TikTok and CTV Are Uncontested and Cheaper Right Now',
    summary: 'Nothing changed on our side, but reaching the mass-affluent audience on Meta suddenly costs about 29% more — a rival’s spring campaign flooded the same audience and bid the auction up. TikTok and CTV, where that rival isn’t active, are reaching the same kinds of people at last quarter’s prices. The smart move is temporary and reversible: shift a portion of Meta reach to the uncontested channels while the auction is hot, and shift it back when the rival’s flight ends. Paying the inflated Meta price for reach we can get cheaper elsewhere is the avoidable cost.',
    evidence: [
      'Meta cost to reach the mass-affluent audience is up ~29% with no change in our targeting or creative.',
      'The increase lines up exactly with a rival’s spring flight on the same audience.',
      'TikTok and CTV, where the rival isn’t bidding, are still at last quarter’s cost.',
      'The shift is temporary and reversible — move it back when the rival’s flight ends.',
      'STRATIS ties the cost spike to the rival’s entry, so the cause is clear, not guessed.',
    ],
    confidence: 0.83,
    impactEstimate: 'Temporarily moving the inflated share of Meta reach to TikTok and CTV avoids the ~29% auction premium — protecting reach efficiency until the rival’s flight ends, then reversing.',
    recommendedAction: 'Shift a portion of Meta reach to TikTok and CTV while the rival has the Meta auction crowded, and move it back when their flight ends. STRATIS alerts when the auction normalizes.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move the inflated Meta reach to TikTok + CTV', subtitle: 'DON’T PAY THE AUCTION PREMIUM', type: 'budget', completed: false },
      { id: 's2', title: 'Keep the shift temporary and reversible', subtitle: 'MOVE BACK WHEN THEY STOP', type: 'budget', completed: false },
      { id: 's3', title: 'Alert when the Meta auction normalizes', subtitle: 'STRATIS WATCHES THE RIVAL', type: 'scheduling', completed: false },
    ],
  },
  // ───────────── CROSS-REGION INTELLIGENCE ─────────────
  // ACME Financial runs nationally across provinces, so a play proven in one
  // province is a tested, ready-to-port move for another. Each insight makes the
  // cross-province correlation explicit and quantified.

  // XR1 — CREATIVE TRANSFER: rate-certainty creative proven in BC → Ontario
  {
    id: 'ins-rbc-xr1-creative-transfer', createdAt: at(0, '07:51:00'),
    enterprise: 'rbc', category: 'cross-region', scope: 'brand', productLine: 'rbc-mortgages',
    channels: ['ctv', 'google-search', 'facebook', 'ooh'],
    linkedNewsId: 'news-rbc-boc-rate-hold',
    title: 'The “Lock Your Rate” Mortgage Creative Is Converting 1.5× the National Brand Hero — in BC — and Ontario Has the Same Post-Rate-Hold Certainty Story Sitting Untapped',
    summary: 'The same rate-certainty idea wins in two provinces, but it’s only deployed in one. In BC, the “lock your rate” execution is converting at about 1.5× the national brand hero on the identical pre-approval metric, where rate certainty is the last hurdle before an application. Ontario now has the same story to tell: with the Bank of Canada holding rates, “certainty now” is true and timely there too — yet Ontario delivery still leads with the legacy brand hero and the rate-certainty message holds a thin share of views. This is the cleanest cross-province transfer STRATIS sees — a creative proven on the same conversion metric in one market, with a macro tailwind that just made it true in the other. Port the asset, don’t re-test it from zero.',
    evidence: [
      'BC: the rate-certainty creative converts ~1.5× the national brand hero on the same pre-approval metric.',
      'The edge holds across BC metros — not a single-market fluke.',
      'Ontario: the Bank of Canada rate hold makes “certainty now” accurate there too.',
      'Ontario delivery still defaults to the legacy brand hero; the rate-certainty message holds a thin share of views.',
      'STRATIS correlates creative performance on a common metric across provinces — no single market’s report sees the other.',
    ],
    confidence: 0.88,
    impactEstimate: 'Porting the proven BC rate-certainty creative into Ontario — where the rate hold makes the message accurate — is projected to lift Ontario pre-approval rate ~14% at no incremental production cost, capturing a win already validated in-market.',
    recommendedAction: 'Adapt and ship the BC rate-certainty creative into the Ontario mix, give it real share of views against the legacy hero, and let STRATIS keep matching creative performance across provinces to surface the next portable asset.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Port the BC rate-certainty creative into Ontario', subtitle: 'PROVEN IN BC, NOW TRUE HERE POST-HOLD', type: 'creative', completed: false },
      { id: 's2', title: 'Give it real share of views vs the legacy hero', subtitle: 'DON’T LET DELIVERY DEFAULT BACK', type: 'creative', completed: false },
      { id: 's3', title: 'Match creative performance across provinces continuously', subtitle: 'STRATIS SURFACES THE NEXT PORTABLE WIN', type: 'creative', completed: false },
    ],
  },
  // XR2 — LEADING-INDICATOR: BC mortgage-search saturation predicts Ontario ~4 weeks out
  {
    id: 'ins-rbc-xr2-leading-indicator', createdAt: at(0, '07:54:00'),
    enterprise: 'rbc', category: 'cross-region', scope: 'brand', productLine: 'rbc-mortgages',
    channels: ['google-search', 'ttd', 'facebook'],
    title: 'Ontario’s Mortgage-Search Cost Curve Is Tracing the Exact BC Decay From Four Weeks Ago — Cap Ontario Search Bids Now, Before the Same ~$1.4M of Waste Lands',
    summary: 'One province is now a four-week early warning for the other. BC’s mortgage-search cost curve inflected earlier this spring — cost-per-application decayed into the floor as the auction heated and the in-market pool thinned. STRATIS has now detected the identical decay shape forming in Ontario, running about four weeks behind BC, week-for-week. This isn’t a vague “watch the East” note: it’s the same cost curve, same inflection, same auction-thinning fingerprint, on a lag. Because BC already showed where this ends, Ontario doesn’t have to spend its way to the same dead weight — cap Ontario search bids at the inflection the BC curve already mapped, before the waste arrives rather than after.',
    evidence: [
      'BC mortgage-search cost-per-application decayed to its floor ~4 weeks ago as the auction heated.',
      'Ontario is now tracing the identical decay shape, lagging BC by ~4 weeks week-for-week.',
      'The curves overlay almost exactly once shifted by four weeks — same inflection, same fingerprint.',
      'Ontario bids haven’t reacted — they’re funded toward the same flat tail BC already proved is dead weight.',
      'STRATIS aligns cost curves across provinces on a lag, turning one market into a leading indicator for the next.',
    ],
    confidence: 0.86,
    impactEstimate: 'Capping Ontario search bids at the inflection the BC curve already mapped avoids an estimated ~$1.4M of wasted Ontario spend before it lands — pre-empting the waste rather than booking it and reallocating after the fact.',
    recommendedAction: 'Treat the BC cost decay as Ontario’s forward map: cap Ontario search bids at the BC-proven inflection now and redeploy the freed budget into channels still converting at the margin. STRATIS keeps the lagged cross-province curve live and alerts as Ontario approaches the line.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Cap Ontario search bids at the BC-proven inflection', subtitle: 'FOUR WEEKS AHEAD OF THE WASTE', type: 'bidding', completed: false },
      { id: 's2', title: 'Redeploy freed Ontario budget to channels with headroom', subtitle: 'STILL ON THE STEEP CURVE THERE', type: 'budget', completed: false },
      { id: 's3', title: 'Hold the lagged cross-province curve live', subtitle: 'BC PREDICTS ONTARIO BY ~4 WEEKS', type: 'scheduling', completed: false },
    ],
  },
  // XR3 — DEMAND CORRELATION: newcomer arrival search → account-opens, ON led, now climbing in BC
  {
    id: 'ins-rbc-xr3-demand-correlation', createdAt: at(0, '07:57:00'),
    enterprise: 'rbc', category: 'cross-region', scope: 'brand', productLine: 'rbc-newcomers',
    channels: ['google-search', 'facebook', 'tiktok'],
    linkedNewsId: 'news-rbc-newcomer-targets',
    title: 'The Newcomer “Open a First Account” Search Surge That Led Ontario Account-Opens by Six Weeks Is Now Climbing the Same Curve in BC — Fund Newcomer Banking-Education There Ahead of the Proven Demand',
    summary: 'A demand signal that already paid out in one province is now repeating in another, early enough to get ahead of. In Ontario, a rise in newcomer “open a first Canadian account” and “newcomer banking” search reliably led the account-open lift by about six weeks; the search curve was the tell, and the campaign that funded banking-education into it captured the demand. With 2026 arrivals concentrating in both ON and BC, STRATIS now sees that same share-of-search curve climbing in BC, currently at the point Ontario sat roughly six weeks before its account-open inflection. The correlation is the same shape on the same need; the only difference is timing. Fund newcomer banking-education and arrival-search coverage in BC now, ahead of the proven curve — not after the account-open lift shows up in a report.',
    evidence: [
      'Ontario: newcomer arrival search led the account-open lift by ~6 weeks — search was the leading indicator.',
      'BC: the same share-of-search curve is now climbing, at the point Ontario sat ~6 weeks pre-inflection.',
      'The two curves overlay on the same search terms once aligned by the lag — same shape, different clock.',
      'BC newcomer banking-education and arrival-search coverage is currently underfunded relative to the rising demand.',
      'STRATIS correlates share-of-search to downstream account-opens across provinces, surfacing the demand before the data confirms it.',
    ],
    confidence: 0.84,
    impactEstimate: 'Funding BC newcomer banking-education ahead of the Ontario-proven ~6-week search-to-open curve is projected to capture the demand at materially lower cost-per-open than entering after the lift appears.',
    recommendedAction: 'Stand up newcomer banking-education and arrival-search coverage in BC now, sized to the rising search curve, using the Ontario search-to-open lag as the forecast. STRATIS keeps correlating share-of-search to account-opens across provinces and flags the inflection as BC approaches it.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Fund BC newcomer banking-education ahead of the curve', subtitle: 'ONTARIO SEARCH LED OPENS BY ~6 WEEKS', type: 'budget', completed: false },
      { id: 's2', title: 'Take arrival-search coverage before demand peaks', subtitle: 'BUY THE LANE BEFORE IT GETS CONTESTED', type: 'targeting', completed: false },
      { id: 's3', title: 'Correlate share-of-search to opens across provinces', subtitle: 'STRATIS FLAGS BC’S INFLECTION', type: 'scheduling', completed: false },
    ],
  },
];

// ===== Per-insight charts (each illustrates its insight's specific headline) =====
export const RBC_VISUALS: Record<string, InsightVisual> = {
  // 1 — saturation: marginal account-opens per extra $100K, declining to ~0
  'ins-rbc-01-saturation': {
    kind: 'line', xKey: 'spend', series: ['ctv', 'search'],
    config: {
      ctv: { label: 'CTV — opens per +$100K', color: RED },
      search: { label: 'Search — opens per +$100K', color: TEAL },
    },
    refLines: [{ axis: 'x', value: '$2.0M', label: 'CTV saturation point', color: GOLD }],
    data: [
      { spend: '$1.0M', ctv: 24, search: 26 }, { spend: '$1.5M', ctv: 17, search: 24 },
      { spend: '$2.0M', ctv: 10, search: 23 }, { spend: '$2.5M', ctv: 6, search: 22 },
      { spend: '$3.0M', ctv: 5, search: 21 },
    ],
    caption: 'Past ~$2.0M, each extra CTV dollar opens almost nothing — while search keeps converting.',
  },
  // 2 — mix allocation: return on the next dollar by channel vs the frontier
  'ins-rbc-02-mix-reallocation': {
    kind: 'bar', xKey: 'channel', series: ['efficiency'], perBarColor: true,
    config: { efficiency: { label: 'Return on the next dollar (index)', color: TEAL } },
    refLines: [{ axis: 'y', value: 100, label: 'Efficiency frontier', color: GOLD }],
    data: [
      { channel: 'Search', efficiency: 136, fill: TEAL },
      { channel: 'Audio', efficiency: 122, fill: TEAL },
      { channel: 'Switcher pool', efficiency: 116, fill: TEAL },
      { channel: 'CTV', efficiency: 97, fill: MUTED },
      { channel: 'Display', efficiency: 74, fill: RED },
      { channel: 'Facebook', efficiency: 69, fill: RED },
    ],
    legend: [
      { label: 'Headroom — fund these', color: TEAL },
      { label: 'Past efficient — pull back', color: RED },
    ],
    caption: 'Move dollars from the red channels to the teal ones until the next dollar is equally productive everywhere.',
  },
  // 3 — audience efficiency: ROAS by segment
  'ins-rbc-03-audience-efficiency': {
    kind: 'bar', xKey: 'audience', series: ['efficiency'], perBarColor: true,
    config: { efficiency: { label: 'ROAS (index)', color: TEAL } },
    data: [
      { audience: 'In-market switchers', efficiency: 164, fill: TEAL },
      { audience: 'Comparison-search', efficiency: 131, fill: TEAL },
      { audience: 'First-home', efficiency: 106, fill: BLUE },
      { audience: 'Broad mass-affluent', efficiency: 72, fill: RED },
    ],
    legend: [
      { label: 'High-intent — gets only ~32% of budget', color: TEAL },
      { label: 'Broad mass-affluent — gets most of the budget', color: RED },
    ],
    caption: 'The most efficient audience is the least funded — shift targeting toward intent.',
  },
  // 4 — rising cost per acquisition: crossing the prior line
  'ins-rbc-04-acquisition-cost-rising': {
    kind: 'line', xKey: 'week', series: ['cost'],
    config: { cost: { label: 'Cost per new account ($)', color: TEAL } },
    refLines: [{ axis: 'y', value: 195, label: 'Two weeks ago: $195', color: RED }],
    data: [
      { week: 'W-7', cost: 190 }, { week: 'W-6', cost: 192 }, { week: 'W-5', cost: 194 },
      { week: 'W-4', cost: 195 }, { week: 'W-3', cost: 210 }, { week: 'W-2', cost: 228 },
      { week: 'W-1', cost: 237 }, { week: 'Now', cost: 240 },
    ],
    caption: 'A price war on a few bonus terms pushed the cost up ~23% in two weeks — a targeted bid cap reverses it.',
  },
  // 5 — price of reach up, results flat
  'ins-rbc-05-price-of-reach': {
    kind: 'line', xKey: 'week', series: ['price', 'opens'],
    config: {
      price: { label: 'Price of reach (index)', color: RED },
      opens: { label: 'Account-opens (index)', color: TEAL },
    },
    data: [
      { week: 'W-4', price: 100, opens: 100 }, { week: 'W-3', price: 108, opens: 101 },
      { week: 'W-2', price: 116, opens: 99 }, { week: 'W-1', price: 120, opens: 100 },
      { week: 'Now', price: 122, opens: 98 },
    ],
    caption: 'Reach got ~22% pricier while opens held flat — paying more for the same result.',
  },
  // 6 — geographic efficiency: spend vs conversion by province
  'ins-rbc-06-geo-efficiency': {
    kind: 'scatter', xKey: 'spend', series: ['conversion'],
    xName: 'Mortgage spend (index)', yName: 'Conversion vs national avg (%)',
    config: { conversion: { label: 'Province', color: PURPLE } },
    refLines: [{ axis: 'y', value: 0, label: 'National average', color: GOLD }],
    data: [
      { spend: 140, conversion: -30 }, { spend: 126, conversion: -23 }, { spend: 118, conversion: -17 },
      { spend: 95, conversion: 5 }, { spend: 86, conversion: 13 }, { spend: 72, conversion: 22 },
      { spend: 60, conversion: 28 }, { spend: 51, conversion: 33 },
    ],
    caption: 'High-spend provinces converting below average (lower right) should fund the underfunded winners (upper left).',
  },
  // 7 — access friction: branch/underwriting friction vs return on media
  'ins-rbc-07-access-friction': {
    kind: 'scatter', xKey: 'friction', series: ['roi'],
    xName: 'Underwriting + booking-wait burden (%)', yName: 'Return on media (index)',
    config: { roi: { label: 'Province', color: PURPLE } },
    data: [
      { friction: 8, roi: 150 }, { friction: 14, roi: 137 }, { friction: 19, roi: 120 }, { friction: 27, roi: 108 },
      { friction: 35, roi: 92 }, { friction: 41, roi: 84 }, { friction: 48, roi: 72 }, { friction: 55, roi: 67 },
    ],
    caption: 'The more underwriting and booking-wait friction a province carries, the worse the same ads convert — spend should follow access.',
  },
  // 8 — creative winner: pre-approvals driven by ad
  'ins-rbc-08-creative-winner': {
    kind: 'bar', xKey: 'ad', series: ['rate'], perBarColor: true,
    config: { rate: { label: 'Pre-approvals driven (index)', color: TEAL } },
    data: [
      { ad: 'Brand hero', rate: 100, fill: MUTED },
      { ad: '“Lock your rate”', rate: 160, fill: TEAL },
      { ad: 'Lifestyle', rate: 112, fill: BLUE },
    ],
    legend: [
      { label: 'Winner — only ~13% of views today', color: TEAL },
      { label: 'Brand hero — most of the views', color: MUTED },
    ],
    caption: 'Ranked by pre-approvals actually driven, the rate-certainty ad wins ~1.6× — but barely gets shown.',
  },
  // 9 — creative fatigue: pull drops with each viewing; fresh cut holds
  'ins-rbc-09-creative-fatigue': {
    kind: 'line', xKey: 'views', series: ['hero', 'fresh'],
    config: {
      hero: { label: '“Ideas Worth Banking On” spot', color: RED },
      fresh: { label: 'Fresh cut', color: TEAL },
    },
    data: [
      { views: '1–3', hero: 100, fresh: 110 }, { views: '4–6', hero: 83, fresh: 109 },
      { views: '7–9', hero: 51, fresh: 108 }, { views: '10+', hero: 36, fresh: 103 },
    ],
    caption: 'The tired spot collapses with repeat viewings while the fresh cut holds — that’s wear-out, not delivery.',
  },
  // 10 — frequency collision: per-channel vs combined with the effective line
  'ins-rbc-10-frequency-collision': {
    kind: 'bar', xKey: 'channel', series: ['freq'], perBarColor: true,
    config: { freq: { label: 'Ads seen per week', color: TEAL } },
    refLines: [{ axis: 'y', value: 12, label: 'Where it stops working (~12)', color: RED }],
    data: [
      { channel: 'TV', freq: 7.2, fill: TEAL },
      { channel: 'Social', freq: 6.4, fill: TEAL },
      { channel: 'Display', freq: 6.8, fill: TEAL },
      { channel: 'Search', freq: 5.6, fill: TEAL },
      { channel: 'Combined', freq: 26.0, fill: RED },
    ],
    caption: 'No single channel looks high — only adding them up for one person reveals the over-exposure.',
  },
  // 11 — conquest opportunity: interest up as rival spend retreats
  'ins-rbc-11-conquest-opportunity': {
    kind: 'line', xKey: 'day', series: ['interest', 'competitor'],
    config: {
      interest: { label: 'Switching interest', color: TEAL },
      competitor: { label: 'Rival search spend', color: RED },
    },
    data: [
      { day: 'D0', interest: 100, competitor: 100 }, { day: 'D3', interest: 188, competitor: 98 },
      { day: 'D6', interest: 256, competitor: 86 }, { day: 'D9', interest: 310, competitor: 72 },
      { day: 'D12', interest: 298, competitor: 64 }, { day: 'D15', interest: 286, competitor: 60 },
    ],
    caption: 'Interest stayed high as the rival’s launch push faded — the door is open and the auction is cheap.',
  },
  // 12 — pull-through: local search peaks 8 days after a national TV flight
  'ins-rbc-12-pull-through': {
    kind: 'line', xKey: 'lag', series: ['lift'],
    config: { lift: { label: 'Local “bank near me” + booking lift', color: TEAL } },
    refLines: [{ axis: 'x', value: '+8d', label: 'Best window for the local touch', color: GOLD }],
    data: [
      { lag: '0d', lift: 16 }, { lag: '+3d', lift: 29 }, { lag: '+6d', lift: 47 },
      { lag: '+8d', lift: 61 }, { lag: '+11d', lift: 50 }, { lag: '+14d', lift: 32 },
    ],
    caption: 'Local interest peaks eight days after the national flight — the window Branch & Local keeps missing.',
  },
  // 13 — Facebook → TikTok: cost to acquire the young-newcomer cohort diverging
  'ins-rbc-13-audience-migration': {
    kind: 'line', xKey: 'month', series: ['facebook', 'tiktok'],
    config: {
      facebook: { label: 'Facebook — cost per open', color: RED },
      tiktok: { label: 'TikTok — cost per open', color: TEAL },
    },
    data: [
      { month: 'Jan', facebook: 100, tiktok: 104 }, { month: 'Feb', facebook: 113, tiktok: 96 },
      { month: 'Mar', facebook: 129, tiktok: 84 }, { month: 'Apr', facebook: 140, tiktok: 70 },
      { month: 'May', facebook: 144, tiktok: 68 },
    ],
    caption: 'The young-newcomer audience moved to TikTok — its cost fell there while Facebook’s climbed. Follow the people.',
  },
  // 14 — cold Facebook → high-intent Search: cost per qualified pre-approval
  'ins-rbc-14-discovery-intent': {
    kind: 'bar', xKey: 'platform', series: ['cost'], perBarColor: true,
    config: { cost: { label: 'Cost per qualified pre-approval ($)', color: TEAL } },
    data: [
      { platform: 'Facebook (cold prospecting)', cost: 165, fill: RED },
      { platform: 'Instagram (cold)', cost: 118, fill: MUTED },
      { platform: 'Search (intent)', cost: 58, fill: TEAL },
    ],
    legend: [
      { label: 'High-intent search — capped today', color: TEAL },
      { label: 'Cold Facebook prospecting — most of it', color: RED },
    ],
    caption: 'First-home buyers arrive in search already querying the decision — they convert at about a third of cold Facebook’s cost.',
  },
  // 15 — open exchange → curated TTD deals: share of spend lost to waste
  'ins-rbc-15-supply-path': {
    kind: 'bar', xKey: 'route', series: ['waste'], perBarColor: true,
    config: { waste: { label: 'Spend lost to waste (%)', color: TEAL } },
    data: [
      { route: 'Open exchange', waste: 27, fill: RED },
      { route: 'Curated deals (The Trade Desk)', waste: 6, fill: TEAL },
    ],
    legend: [
      { label: 'Unviewable / off-target / unsafe', color: RED },
      { label: 'Verified, on-topic inventory', color: TEAL },
    ],
    caption: 'Same audience, far less waste — the curated path puts ~27% more of the dollar to work.',
  },
  // 16 — audio reach cap → TTD: unique reach curves
  'ins-rbc-16-reach-cap': {
    kind: 'line', xKey: 'spend', series: ['audio', 'ttd'],
    config: {
      audio: { label: 'Audio — new people reached', color: RED },
      ttd: { label: 'The Trade Desk — new people reached', color: TEAL },
    },
    refLines: [{ axis: 'x', value: '$0.8M', label: 'Audio reach ceiling', color: GOLD }],
    data: [
      { spend: '$0.2M', audio: 18, ttd: 16 }, { spend: '$0.5M', audio: 14, ttd: 15 },
      { spend: '$0.8M', audio: 6, ttd: 15 }, { spend: '$1.1M', audio: 2, ttd: 14 },
      { spend: '$1.4M', audio: 1, ttd: 14 },
    ],
    caption: 'Past ~$0.8M audio just adds frequency — The Trade Desk still finds new people at the same cost.',
  },
  // 17 — Meta auction pressure: cost of reach spikes as rival enters
  'ins-rbc-17-auction-pressure': {
    kind: 'line', xKey: 'week', series: ['meta', 'alt'],
    config: {
      meta: { label: 'Meta — cost of reach', color: RED },
      alt: { label: 'TikTok + CTV — cost of reach', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W-3', label: 'Rival flight starts', color: GOLD }],
    data: [
      { week: 'W-5', meta: 100, alt: 100 }, { week: 'W-4', meta: 101, alt: 99 },
      { week: 'W-3', meta: 108, alt: 100 }, { week: 'W-2', meta: 121, alt: 101 },
      { week: 'W-1', meta: 127, alt: 100 }, { week: 'Now', meta: 129, alt: 99 },
    ],
    caption: 'A rival crowded the Meta auction — the same reach is ~29% cheaper on the uncontested channels.',
  },
  // XR1 — creative transfer: rate-certainty creative vs brand hero, Ontario vs BC
  'ins-rbc-xr1-creative-transfer': {
    kind: 'bar', xKey: 'region', series: ['hero', 'certainty'],
    config: {
      hero: { label: 'Brand hero — pre-approval (index)', color: MUTED },
      certainty: { label: '“Lock your rate” — pre-approval (index)', color: TEAL },
    },
    data: [
      { region: 'Ontario (running today)', hero: 100, certainty: 94 },
      { region: 'BC (proven)', hero: 100, certainty: 150 },
    ],
    legend: [
      { label: 'Rate-certainty creative — proven 1.5× in BC', color: TEAL },
      { label: 'Brand hero — Ontario default', color: MUTED },
    ],
    caption: 'The rate-certainty creative wins ~1.5× in BC on the same metric — and post-rate-hold Ontario can finally run it. Port the asset.',
  },
  // XR2 — leading indicator: BC cost decay (lead) vs Ontario (lag ~4 weeks)
  'ins-rbc-xr2-leading-indicator': {
    kind: 'line', xKey: 'week', series: ['bc', 'on'],
    config: {
      bc: { label: 'BC search cost-per-app (leading)', color: RED },
      on: { label: 'Ontario (lagging ~4 wks)', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W4', label: 'Ontario reaches the BC inflection', color: GOLD }],
    data: [
      { week: 'W1', bc: 72, on: 100 },
      { week: 'W2', bc: 53, on: 99 },
      { week: 'W3', bc: 39, on: 88 },
      { week: 'W4', bc: 31, on: 72 },
      { week: 'W5', bc: 28, on: 53 },
      { week: 'W6', bc: 27, on: 39 },
    ],
    caption: 'Ontario is tracing the exact BC decay ~4 weeks behind — cap Ontario bids at the inflection BC already mapped, before the waste lands.',
  },
  // XR3 — demand correlation: Ontario newcomer search (earlier) vs BC (now)
  'ins-rbc-xr3-demand-correlation': {
    kind: 'line', xKey: 'phase', series: ['on', 'bc'],
    config: {
      on: { label: 'Ontario newcomer search → led opens by ~6 wks', color: BLUE },
      bc: { label: 'BC newcomer search (now)', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W3', label: 'BC today (~6 wks pre-inflection)', color: GOLD }],
    data: [
      { phase: 'W1', on: 148, bc: 100 },
      { phase: 'W2', on: 176, bc: 103 },
      { phase: 'W3', on: 198, bc: 122 },
      { phase: 'W4', on: 206, bc: 150 },
      { phase: 'W5', on: 209, bc: 178 },
    ],
    caption: 'BC is climbing the same newcomer-search curve Ontario rode into its account-open lift ~6 weeks earlier — fund banking-education ahead of it.',
  },
};
