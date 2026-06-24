// ===========================================================================
// ACME Beverage — CPG / Beverage client instance
// Representative campaign data + a full insight list + market news.
// Brand-led, awareness-heavy media; "conversions" proxy promo/offer redemptions
// and store-locator actions. Illustrative demo figures grounded in the real
// portfolio, audiences, and agency roster.
// ===========================================================================
import type { Insight, NewsItem } from '@/types';
import { type CampaignDef, at, todayISO } from './_shared';
import { type InsightVisual, TEAL, RED, BLUE, PURPLE, GOLD, MUTED, GRID } from '../insight-visual-types';

export const MOLSON_COORS_CAMPAIGN_DEFS: CampaignDef[] = [
  // ── TIER 1 — NATIONAL BRAND (Rethink) ──
  { id: 'mc-coorslight-summer', name: 'Core Light Lager — Made to Chill Summer Hero',
    enterprise: 'molson-coors', division: 'tier-1', agency: 'mc-rethink', productLine: 'mc-coors-light',
    audiences: ['mc-lda-young', 'mc-value-mainstream'], objective: 'awareness', status: 'live',
    channels: ['ctv', 'ooh', 'instagram', 'tiktok', 'spotify'], geos: ['national'], budgetMultiplier: 1.65,
    plannedBudget: 13_400_000, revPerConvRange: [48, 120], cvrModifier: 0.75, cplCalibration: 0.50, revTrend: 0.0002 },
  { id: 'mc-canadian-hockey', name: 'Flagship Lager — Hockey & The North',
    enterprise: 'molson-coors', division: 'tier-1', agency: 'mc-rethink', productLine: 'mc-molson-canadian',
    audiences: ['mc-sports-fans', 'mc-value-mainstream'], objective: 'awareness', status: 'live',
    channels: ['ctv', 'ooh', 'facebook', 'instagram'], geos: ['national', 'ontario'], budgetMultiplier: 1.40,
    plannedBudget: 9_800_000, revPerConvRange: [44, 110], cvrModifier: 0.80, cplCalibration: 0.50, revTrend: 0.0002 },
  { id: 'mc-bluemoon-premium', name: 'Craft Wheat Ale — Brunch & Premium Occasions',
    enterprise: 'molson-coors', division: 'tier-1', agency: 'mc-rethink', productLine: 'mc-blue-moon',
    audiences: ['mc-craft-curious'], objective: 'consideration', status: 'live',
    channels: ['instagram', 'ctv', 'ttd', 'spotify'], geos: ['national', 'bc'], budgetMultiplier: 0.95,
    plannedBudget: 5_200_000, revPerConvRange: [70, 160], cvrModifier: 0.90, cplCalibration: 0.55, revTrend: 0.0003 },

  // ── TIER 2 — REGIONAL / MEDIA (MediaCom) ──
  { id: 'mc-vizzy-flavor', name: 'Hard Seltzer — Flavor-Forward Seltzer Push',
    enterprise: 'molson-coors', division: 'tier-2', agency: 'mc-mediacom', productLine: 'mc-vizzy',
    audiences: ['mc-seltzer-flavor', 'mc-lda-young'], objective: 'consideration', status: 'live',
    channels: ['tiktok', 'instagram', 'ttd', 'spotify'], geos: ['national', 'ontario'], budgetMultiplier: 1.10,
    plannedBudget: 6_600_000, revPerConvRange: [52, 130], cvrModifier: 0.95, cplCalibration: 0.55, revTrend: 0.0004 },
  { id: 'mc-millerlite-value', name: 'Premium Light Lager — Original Light Value',
    enterprise: 'molson-coors', division: 'tier-2', agency: 'mc-mediacom', productLine: 'mc-miller-lite',
    audiences: ['mc-light-loyalists', 'mc-value-mainstream'], objective: 'consideration', status: 'live',
    channels: ['facebook', 'instagram', 'ooh'], geos: ['alberta', 'ontario'], budgetMultiplier: 0.85,
    plannedBudget: 4_200_000, revPerConvRange: [42, 104], cvrModifier: 0.85, cplCalibration: 0.50, revTrend: 0.0002 },
  { id: 'mc-coorslight-nba', name: 'Core Light Lager — Playoff Co-Viewing Surround',
    enterprise: 'molson-coors', division: 'tier-2', agency: 'mc-mediacom', productLine: 'mc-coors-light',
    audiences: ['mc-sports-fans', 'mc-lda-young'], objective: 'awareness', status: 'scheduled',
    channels: ['ctv', 'tiktok', 'spotify'], geos: ['national'], budgetMultiplier: 1.00,
    plannedBudget: 5_800_000, revPerConvRange: [48, 118], cvrModifier: 0.78, cplCalibration: 0.50, revTrend: 0.0003 },

  // ── TIER 3 — FIELD & ON-PREMISE ──
  { id: 'mc-banquet-onpremise', name: 'Heritage Lager — On-Premise & Bar Activation',
    enterprise: 'molson-coors', division: 'tier-3', agency: 'mc-field', productLine: 'mc-coors-banquet',
    audiences: ['mc-value-mainstream', 'mc-craft-curious'], objective: 'conversion', status: 'live',
    channels: ['instagram', 'facebook', 'ooh'], geos: ['alberta', 'bc'], budgetMultiplier: 0.70,
    plannedBudget: 2_800_000, revPerConvRange: [40, 96], cvrModifier: 1.00, cplCalibration: 0.55, revTrend: 0.0003 },
  { id: 'mc-vizzy-retail-promo', name: 'Hard Seltzer — Retail Display & Offer Redemption',
    enterprise: 'molson-coors', division: 'tier-3', agency: 'mc-field', productLine: 'mc-vizzy',
    audiences: ['mc-seltzer-flavor', 'mc-value-mainstream'], objective: 'conversion', status: 'live',
    channels: ['facebook', 'instagram', 'google-search'], geos: ['ontario'], budgetMultiplier: 0.65,
    plannedBudget: 2_400_000, revPerConvRange: [50, 124], cvrModifier: 1.05, cplCalibration: 0.58, revTrend: 0.0004 },
];

export const MOLSON_COORS_NEWS: NewsItem[] = [
  { id: 'news-mc-nhl-playoffs', title: 'NHL Confirms All Three Canadian Teams in Playoffs — Co-Viewing Audience Tracking Up Double Digits',
    source: 'Sportsnet', date: '2026-05-06', tags: ['sports', 'sponsorships'], urgency: 'high', regions: ['national', 'ontario'],
    summary: 'With three Canadian teams advancing, national playoff co-viewing is pacing well above last year, lifting CTV and social inventory demand during game windows.',
    whyItMatters: 'Flagship Lager and Core Light Lager over-index with playoff co-viewers. STRATIS flags a short, high-demand window where the Playoff Co-Viewing Surround should be pulled forward before CTV CPMs spike.',
    enterprises: ['molson-coors'] },
  { id: 'news-mc-seltzer-category', title: 'Hard-Seltzer Category Returns to Growth in Canada — Flavor-Forward SKUs Driving the Rebound',
    source: 'Nielsen Canada', date: '2026-05-03', tags: ['competitors', 'macro'], urgency: 'high', regions: ['national', 'ontario'],
    summary: 'Nielsen reports the Canadian hard-seltzer category returned to volume growth, led by flavor-forward and lower-sugar SKUs after two flat years.',
    whyItMatters: 'A tailwind for the Hard Seltzer brand precisely as the Flavor-Forward push is live. STRATIS is correlating the category lift against Hard Seltzer consideration and retail redemption — see the linked recommendation.',
    enterprises: ['molson-coors'] },
  { id: 'news-mc-aluminum-tariff', title: 'Aluminum Input Costs Rise on New Tariff Schedule — Packaging Margin Pressure Across Beverage',
    source: 'The Globe and Mail', date: '2026-04-30', tags: ['macro'], urgency: 'medium', regions: ['national'],
    summary: 'A revised tariff schedule lifted aluminum input costs, pressuring can-packaging margins across the beverage industry heading into peak summer season.',
    whyItMatters: 'Margin pressure raises the bar on media efficiency for the summer flights. STRATIS is watching cost-per-reach-point to protect working-media ratio as budgets tighten.',
    enterprises: ['molson-coors'] },
  { id: 'news-mc-abi-bud-light', title: 'National Mainstream Lager Lifts Summer Spend ~15% — Heaviest Light-Lager Push in Three Years',
    source: 'Marketing Magazine', date: '2026-05-01', tags: ['competitors'], urgency: 'high', competitor: 'a national mainstream lager',
    regions: ['national'], summary: 'A national mainstream lager confirmed a ~15% increase in summer media weight with a national CTV and OOH-led plan beginning this month.',
    whyItMatters: 'Direct SOV pressure on Core Light Lager and Premium Light Lager in the light-lager segment. Watch for CTV and OOH share-of-voice compression in the same markets.',
    enterprises: ['molson-coors'] },
  { id: 'news-mc-na-beer-growth', title: 'Non-Alcoholic Beer Posts Fourth Straight Year of Double-Digit Growth in Canada',
    source: 'Nielsen Canada', date: '2026-04-24', tags: ['macro', 'launch'], urgency: 'medium', regions: ['national'],
    summary: 'Non-alcoholic beer continued double-digit growth, broadening beyond early adopters into mainstream summer and sport occasions.',
    whyItMatters: 'A structural occasion shift adjacent to the core portfolio. Tracked at the brand level as a portfolio-whitespace signal; no active reallocation required yet.',
    enterprises: ['molson-coors'] },
];

export const MOLSON_COORS_RADAR_PINS = ['news-mc-nhl-playoffs', 'news-mc-seltzer-category', 'news-mc-abi-bud-light'];

export const MOLSON_COORS_INSIGHTS: Insight[] = [
  // 1 — SATURATION DETECTED (channel-opt)
  {
    id: 'ins-mc-01-saturation', createdAt: todayISO,
    enterprise: 'molson-coors', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'mc-coors-light',
    channels: ['ctv', 'spotify', 'ooh'],
    title: 'Connected TV on the Summer Hero Has Hit Saturation — the Top ~17% of Its Budget Is Adding Almost No Incremental Reach, While Audio and OOH Still Build It',
    summary: 'The Core Light Lager summer hero is buying past the point where more CTV adds more people. Its reach curve has gone flat: the last ~17% of CTV spend is delivering almost no incremental reach into the LDA 21–34 audience, because the fans who respond to TV have already been reached often enough. Audio and OOH, by contrast, are still on the steep part of their curves — every added dollar there still finds new people. A great planner reads the saturation point off the curve once a season; STRATIS watches it continuously and calls it the week CTV flattens. Move the over-saturated tail to the channels that still have room.',
    evidence: [
      'CTV: each extra $100K is now adding ~3 incremental reach-points, down from ~16 earlier in the flight.',
      'About 17% of CTV budget sits past the point where the reach curve goes flat.',
      'Spotify and OOH are still climbing — ~13 and ~11 reach-points per extra $100K.',
      'CTV frequency on the core LDA audience has pushed well past the level where it stops building reach.',
      'STRATIS flags saturation as it happens; a seasonal plan would book the wasted tail as “working.”',
    ],
    confidence: 0.89,
    impactEstimate: 'Moving the saturated ~17% of CTV (~$2.3M) into audio and OOH buys roughly the same reach for less, or more reach for the same spend — recovered now, not at the next planning cycle.',
    recommendedAction: 'Pull the saturated top slice of CTV budget and redeploy it to audio and OOH, which still build reach at the margin. STRATIS holds each channel against its own saturation point and rebalances as curves move.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Cap CTV where its reach curve flattens', subtitle: 'THE LAST 17% BUILDS ALMOST NOTHING', type: 'budget', completed: false },
      { id: 's2', title: 'Redeploy the freed ~$2.3M to audio + OOH', subtitle: 'CHANNELS STILL ON THE STEEP CURVE', type: 'budget', completed: false },
      { id: 's3', title: 'Watch every channel’s saturation point continuously', subtitle: 'REBALANCE AS THE CURVES MOVE', type: 'scheduling', completed: false },
    ],
  },

  // 2 — MARKETING-MIX ALLOCATION BY EFFICIENCY (channel-opt)
  {
    id: 'ins-mc-02-mix-reallocation', createdAt: at(1, '07:03:00'),
    enterprise: 'molson-coors', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'mc-coors-light',
    channels: ['ctv', 'ooh', 'spotify', 'instagram', 'tiktok'],
    title: 'Three Channels in the Summer Mix Are Past Their Efficient Point and Three Have Room to Grow — Rebalancing to Where Each Dollar Works Hardest Frees ~$3.1M at the Same Reach',
    summary: 'The summer budget isn’t split to get the most reach per dollar. Lined up side by side, three channels are funded past the point where they pay back, while three are underfunded and still hungry — the next dollar would do far more good in the second group than it’s doing in the first. Rebalancing toward that efficiency frontier holds total reach flat while freeing spend, or grows reach at the same budget. This is the mix work a planner does by hand once a season; STRATIS holds the frontier live and shows exactly how much to move and where.',
    evidence: [
      'CTV and OOH are funded ~30% past the point where each dollar pays back in incremental reach.',
      'Spotify, TikTok, and the LDA-young social pool are underfunded with room to grow.',
      'Equalizing the marginal return across channels frees ~$3.1M at today’s reach.',
      'No single platform sees this — each reports its own efficiency, not the cross-channel frontier.',
      'The recommended mix is shown as concrete dollar moves, not a directional “shift to digital.”',
    ],
    confidence: 0.87,
    impactEstimate: 'Rebalancing to the efficiency frontier frees ~$3.1M at flat reach, or drives ~8% more reach at the same total budget.',
    recommendedAction: 'Move budget from the over-funded channels into the three with headroom until the next dollar is equally productive everywhere. STRATIS recomputes the frontier as performance shifts.',
    status: 'new',
    linkedNewsId: 'news-mc-aluminum-tariff',
    actionSteps: [
      { id: 's1', title: 'Pull spend from the past-efficient channels', subtitle: 'WHERE THE DOLLAR NO LONGER PAYS BACK', type: 'budget', completed: false },
      { id: 's2', title: 'Fund the three channels with headroom', subtitle: 'WHERE THE NEXT DOLLAR WORKS HARDEST', type: 'budget', completed: false },
      { id: 's3', title: 'Hold the mix on the efficiency frontier', subtitle: 'STRATIS RECOMPUTES AS IT MOVES', type: 'scheduling', completed: false },
    ],
  },

  // 3 — AUDIENCE EFFICIENCY & TARGETING
  {
    id: 'ins-mc-03-audience-efficiency', createdAt: at(1, '07:06:00'),
    enterprise: 'molson-coors', category: 'audience-overlap', scope: 'division', division: 'tier-2', productLine: 'mc-vizzy',
    channels: ['tiktok', 'instagram', 'ttd', 'spotify'],
    title: 'Flavor & Seltzer Seekers Convert to Retail Redemption at 2.3× the Rate of the Broad Value-Mainstream Audience — but They Get Only a Third of the Targeting Budget',
    summary: 'Not every audience is worth the same. The flavor-and-seltzer-seeker segment redeems and converts at more than twice the rate of the broad value-mainstream audience — they’re already leaning into the category. But the budget is weighted to the broad audience because it’s bigger and cheaper to reach, so most of the money is chasing the least efficient drinkers. Shifting targeting toward the high-intent flavor seekers, and trimming the broad-reach waste, lifts results without spending more — exactly as the category tailwind builds.',
    evidence: [
      'Flavor & Seltzer Seekers: ~2.3× the redemptions per dollar of the broad value-mainstream audience.',
      'That high-intent segment receives only ~33% of Hard Seltzer targeting budget today.',
      'The broad value-mainstream audience absorbs most of the spend at the weakest conversion.',
      'The efficient segment is reachable through flavor-interest, category-intent, and lookalike audiences.',
      'STRATIS ranks every audience by conversions per dollar, not by reach or CPM.',
    ],
    confidence: 0.86,
    impactEstimate: 'Reweighting toward the high-intent flavor segment is projected to lift redemptions ~13% at the same spend, by moving dollars off the broad audience’s inefficient tail.',
    recommendedAction: 'Shift targeting budget into the flavor-and-seltzer-seeker segment and trim the broad-reach tail. STRATIS keeps ranking audiences by conversions per dollar and reallocates as efficiency shifts.',
    status: 'new',
    linkedNewsId: 'news-mc-seltzer-category',
    actionSteps: [
      { id: 's1', title: 'Raise the flavor-seeker segment’s budget share', subtitle: 'FUND THE 2.3× AUDIENCE', type: 'targeting', completed: false },
      { id: 's2', title: 'Trim the broad value-mainstream tail', subtitle: 'STOP PAYING FOR THE WEAKEST CONVERTERS', type: 'targeting', completed: false },
      { id: 's3', title: 'Rank every audience by conversions per dollar', subtitle: 'NOT BY REACH OR IMPRESSIONS', type: 'targeting', completed: false },
    ],
  },

  // 4 — RISING ACQUISITION COST (plain ceiling breach)
  {
    id: 'ins-mc-04-acquisition-cost-rising', createdAt: at(1, '07:09:00'),
    enterprise: 'molson-coors', category: 'tactical-efficiency', scope: 'product', productLine: 'mc-vizzy',
    channels: ['google-search', 'ttd'],
    title: 'Cost per Retail Redemption Through Search Now Runs ~$6.40 — Up From ~$5.20 Two Weeks Ago — Because the Whole Category Is Bidding Up a Handful of “Where to Buy Seltzer” Terms',
    summary: 'The cost to drive a Hard Seltzer retail redemption through search has jumped about 23% in two weeks. It isn’t that the creative got worse — conversion is flat. It’s a bidding war: as the seltzer category returned to growth, more brands piled onto a small cluster of “flavored seltzer near me” and “where to buy seltzer” terms and bid the price up. So the fix is surgical — cap the bids on that handful of terms — not a blunt cut to the whole search program. A quarterly efficiency review would catch this six weeks from now; STRATIS flagged it the day the cost crossed the line, with the cause attached.',
    evidence: [
      'Cost per retail redemption via search: ~$6.40, up from ~$5.20 two weeks ago.',
      'Conversion rate is flat — this is a rising-price problem, not a creative problem.',
      'The increase traces to a small cluster of category “where to buy” terms, not the whole account.',
      'Capping bids on those terms restores the cost without touching the rest of the program.',
      'STRATIS catches it the day the cost crosses the line; a quarterly review lags ~6 weeks.',
    ],
    confidence: 0.85,
    impactEstimate: 'Capping bids on the over-heated terms brings cost per redemption back under ~$5.20 within days, recovering roughly $310K a quarter currently lost to the bidding war.',
    recommendedAction: 'Cap bids on the small cluster of category terms driving the increase, rather than cutting the whole search budget. STRATIS watches the cost continuously and alerts on the next crossing.',
    status: 'new',
    linkedNewsId: 'news-mc-seltzer-category',
    actionSteps: [
      { id: 's1', title: 'Pinpoint the category terms driving the spike', subtitle: 'A HANDFUL OF TERMS, NOT THE ACCOUNT', type: 'targeting', completed: false },
      { id: 's2', title: 'Cap their bids to restore the cost', subtitle: 'SURGICAL, NOT A PROGRAM-WIDE CUT', type: 'bidding', completed: false },
      { id: 's3', title: 'Alert the moment cost crosses the line', subtitle: 'DON’T WAIT FOR THE QUARTERLY REVIEW', type: 'scheduling', completed: false },
    ],
  },

  // 5 — PRICE OF REACH UP, RESULTS FLAT
  {
    id: 'ins-mc-05-price-of-reach', createdAt: at(1, '07:12:00'),
    enterprise: 'molson-coors', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'mc-coors-light',
    channels: ['ctv', 'spotify', 'ooh'],
    title: 'The Price of Reach on Connected TV Has Climbed Three Weeks Straight While Reach Held Flat — We’re Paying More for the Same Audience and the Budget Hasn’t Reacted',
    summary: 'Connected TV is getting more expensive to buy — the price of reaching a thousand people is up about 22% over three weeks — but it isn’t reaching any more people. We’re simply paying more for the same audience, and the summer budget hasn’t moved to reflect it. With aluminum margin pressure raising the working-media bar this year, that gap matters more than usual. STRATIS watches cost against reach by channel every week, so it caught the gap as it opened rather than at the end of a monthly report. The move is a straightforward, reversible shift away from a channel that quietly got pricier toward channels still beating their benchmark.',
    evidence: [
      'CTV price of reach: up ~22% over three weeks.',
      'CTV unique reach over the same window: flat — more money, same audience.',
      'CTV budget weight: unchanged since the price climb began.',
      'Audio and OOH are currently beating their cost-per-reach benchmark — reversible targets.',
      'The shift fully reverses the moment CTV pricing normalizes.',
    ],
    confidence: 0.84,
    impactEstimate: 'Trimming the now-overpriced CTV share back to its efficient run-rate and redeploying it stops the climb in cost per reach-point; fully reversible if CTV pricing comes back down.',
    recommendedAction: 'Trim the overpriced CTV share and redeploy to channels still beating their benchmark; STRATIS reverses the move automatically if CTV pricing normalizes.',
    status: 'new',
    linkedNewsId: 'news-mc-aluminum-tariff',
    actionSteps: [
      { id: 's1', title: 'Reduce CTV weight to its efficient run-rate', subtitle: 'REVERSIBLE', type: 'budget', completed: false },
      { id: 's2', title: 'Redeploy to channels beating their benchmark', subtitle: 'AUDIO + OOH', type: 'budget', completed: false },
      { id: 's3', title: 'Alert when cost and reach drift apart', subtitle: 'STRATIS WATCHES WEEKLY', type: 'scheduling', completed: false },
    ],
  },

  // 6 — GEOGRAPHIC EFFICIENCY
  {
    id: 'ins-mc-06-geo-efficiency', createdAt: at(1, '07:15:00'),
    enterprise: 'molson-coors', category: 'national-regional', scope: 'division', division: 'tier-2', productLine: 'mc-molson-canadian',
    channels: ['ctv', 'ooh', 'instagram'],
    title: 'A Quarter of National Lager Spend Is Going to Provinces Converting ~28% Below Average — the Media Map and the Demand Map Don’t Match',
    summary: 'Where the money goes and where it works have drifted apart. About a quarter of the Flagship Lager budget is landing in provinces that convert roughly 28% below the national average, while several high-velocity markets — the strongest NHL and heritage provinces — are underfunded. The plan is weighted to population and last year’s buy, not to where the brand actually moves today. Re-weighting toward the markets that convert — and pulling back from the ones that don’t — lifts velocity without adding budget.',
    evidence: [
      '~25% of national lager spend sits in provinces converting ~28% below the national average.',
      'Several high-velocity NHL and heritage markets are underfunded relative to demand.',
      'Spend tracks population and last year’s plan, not current conversion.',
      'Re-weighting to conversion is a pure reallocation — no new budget required.',
      'STRATIS scores every province on what media actually returns, refreshed continuously.',
    ],
    confidence: 0.85,
    impactEstimate: 'Re-weighting the provincial plan toward converting markets is projected to lift conversion ~11% at flat spend by moving money off the weakest provinces.',
    recommendedAction: 'Shift national lager weight out of the low-converting provinces into the high-converting ones the plan currently underfunds. STRATIS re-scores provinces continuously and flags drift.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Pull weight from provinces converting below average', subtitle: 'STOP FUNDING POPULATION OVER DEMAND', type: 'budget', completed: false },
      { id: 's2', title: 'Fund the high-velocity provinces that are starved', subtitle: 'MATCH SPEND TO WHERE IT WORKS', type: 'budget', completed: false },
      { id: 's3', title: 'Re-score every province continuously', subtitle: 'KEEP THE MAP AND THE PLAN ALIGNED', type: 'targeting', completed: false },
    ],
  },

  // 7 — ACCESS FRICTION (distribution / listing analog)
  {
    id: 'ins-mc-07-access-friction', createdAt: at(1, '07:18:00'),
    enterprise: 'molson-coors', category: 'national-regional', scope: 'brand',
    channels: ['ooh', 'ctv', 'instagram'],
    title: 'In Provinces Where Shelf Listing and On-Premise Presence Are Thinnest, the Same Ads Convert 31% Worse — We’re Spending Into Markets Where the Product Is Hard to Actually Buy',
    summary: 'Media performance is being dragged down by something that has nothing to do with the media. In provinces where the liquor-board listing is thinnest and on-premise (bar and restaurant) presence is weakest, the exact same ads convert about 31% worse — the demand is there, but drinkers can’t easily find the product to buy it. Today the plan allocates on reach efficiency alone, pouring budget into markets where the purchase stalls at the shelf. Weighting spend to distribution strength, and sending the field team to win listings and taps first, turns wasted impressions into actual sales.',
    evidence: [
      'Thinnest-distribution provinces convert the same creative ~31% worse than well-listed markets.',
      'Spend tracks reach efficiency, not distribution — so money flows where the purchase stalls.',
      '~$2.1M a year is going to the lowest-availability provinces.',
      'Well-distributed markets return ~1.5× the velocity at equal spend.',
      'STRATIS joins listing and on-premise data to media performance — a link no media report sees.',
    ],
    confidence: 0.84,
    impactEstimate: 'Weighting the plan to distribution and winning listings before reinvesting is projected to lift the return on media ~18% at flat spend.',
    recommendedAction: 'Add a distribution weight to the budget model, pull spend from the lowest-availability provinces, and route the field team to win shelf and on-premise presence before reinvesting. STRATIS keeps the distribution-to-media link live.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Add a distribution weight to the budget model', subtitle: 'DON’T ALLOCATE ON REACH ALONE', type: 'bidding', completed: false },
      { id: 's2', title: 'Pull spend from the lowest-availability provinces', subtitle: 'WHERE THE PURCHASE STALLS', type: 'budget', completed: false },
      { id: 's3', title: 'Send the field team to win listings first', subtitle: 'CLEAR THE SHELF HURDLE', type: 'targeting', completed: false },
    ],
  },

  // 8 — CREATIVE WINNER STARVED
  {
    id: 'ins-mc-08-creative-winner', createdAt: at(1, '07:21:00'),
    enterprise: 'molson-coors', category: 'creative-performance', scope: 'division', division: 'tier-1', productLine: 'mc-coors-light',
    channels: ['tiktok', 'instagram', 'ooh', 'ctv'],
    title: 'One “Cold-Activated Can” Occasion Cut Is Driving Conversions at 1.6× the Rate of the Summer Brand Hero — but It’s Only Getting 13% of the Views',
    summary: 'Ranked by how many conversions each ad actually drove — not by last click — the occasion-led “cold-activated can” cut is the clear winner, converting at about 1.6× the rate of the summer brand hero it runs beside, strongest at the patio and point-of-purchase moment. But it’s starved: it gets only ~13% of views because delivery defaults to the hero. The occasion it dramatizes is exactly the summer moment the brand owns, so this is a durable win you can capture for free — give the proven cut more of the views, then brief more like it.',
    evidence: [
      'The “cold-activated can” cut converts at ~1.6× the rate of the summer hero beside it.',
      'It holds only ~13% of views — delivery defaults to the brand hero.',
      'It’s strongest at the patio and point-of-purchase moment, where the occasion is live.',
      'The edge repeats across independent markets — not a one-market fluke.',
      'Measured on conversions driven, not last click; the owned summer occasion makes the edge durable.',
    ],
    confidence: 0.88,
    impactEstimate: 'Giving the proven cut more of the views lifts the overall conversion rate at no production cost — and tells the creative team exactly what to make more of.',
    recommendedAction: 'Shift views from the brand hero to the winning occasion cut on social and at point-of-purchase, and brief the agency to extend the winning idea. STRATIS keeps ranking creative by conversions driven.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Rank creative by conversions driven', subtitle: 'NOT BY LAST CLICK', type: 'creative', completed: false },
      { id: 's2', title: 'Give the proven occasion cut more of the views', subtitle: 'FREE GAIN — NO NEW PRODUCTION', type: 'creative', completed: false },
      { id: 's3', title: 'Brief the agency to make more like the winner', subtitle: 'PROVEN IDEA → MORE OF IT', type: 'creative', completed: false },
    ],
  },

  // 9 — CREATIVE FATIGUE (wear, not delivery)
  {
    id: 'ins-mc-09-creative-fatigue', createdAt: at(1, '07:24:00'),
    enterprise: 'molson-coors', category: 'creative-performance', scope: 'division', division: 'tier-1', productLine: 'mc-coors-light',
    channels: ['tiktok', 'instagram'],
    title: 'The “Made to Chill” Hero Has Lost ~18% of Its Pull on Social in Three Weeks at the Same Spend — That’s Creative Wear-Out, Not a Delivery Problem, So the Fix Is a Refresh',
    summary: 'The summer hero is tiring out. Its pull with the LDA 21–34 audience on social is down about 18% over three weeks even though spend and audience haven’t changed. The instinct is to blame the buy, but the pattern says otherwise: people are simply seeing it too many times — response drops with each extra viewing while a fresher cut running beside it holds steady. That’s creative wear-out on a fast-cycling platform, and the fix is a refresh, not a change to the media. Spending the cycle re-tuning delivery would fix nothing. STRATIS calls the cause and flags the refresh window before the decay starts costing real conversions in peak season.',
    evidence: [
      '“Made to Chill” pull is down ~18% over three weeks at flat spend and a steady audience.',
      'Response drops with each additional viewing — the fingerprint of wear-out, not delivery.',
      'A fresher cut running beside it is holding steady, ruling out a platform-wide delivery shift.',
      'Two lower-frequency cuts out-perform per viewing but get only ~10% of delivery.',
      'STRATIS separates wear-out from delivery so the team doesn’t fix the wrong thing.',
    ],
    confidence: 0.89,
    impactEstimate: 'Refreshing the worn hero before the decay deepens is projected to improve cost per conversion ~16%, and avoids a wasted delivery change that wouldn’t have fixed wear-out.',
    recommendedAction: 'Treat it as wear-out: cap the tired hero’s delivery, promote the two best fresh cuts, and brief a new execution for the over-exposed audience. STRATIS confirms the cause and flags the refresh window.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Confirm wear-out before changing anything', subtitle: 'IT’S FREQUENCY, NOT THE BUY', type: 'creative', completed: false },
      { id: 's2', title: 'Cap the tired hero, promote the fresh cuts', subtitle: 'REFRESH, DON’T RE-TUNE DELIVERY', type: 'creative', completed: false },
      { id: 's3', title: 'Brief a new execution for the worn-out audience', subtitle: 'BEFORE IT COSTS PEAK-SEASON CONVERSIONS', type: 'creative', completed: false },
    ],
  },

  // 10 — FREQUENCY COLLISION
  {
    id: 'ins-mc-10-frequency-collision', createdAt: at(1, '07:27:00'),
    enterprise: 'molson-coors', category: 'audience-overlap', scope: 'brand',
    channels: ['ctv', 'ooh', 'instagram', 'tiktok'],
    title: 'The Average Playoff Sports Fan Is Seeing an ACME Beverage Ad 22 Times a Week Across TV, OOH, and Social — More Than Double What Actually Builds the Brand',
    summary: 'Each campaign caps how often it shows an ad, but nobody caps across all of them at once. When you follow a single fan across CTV, OOH, and social, the average playoff sports fan is seeing an ACME Beverage message about 22 times a week — more than double the ~8–11 range where extra exposure stops building the brand and starts annoying. The over-exposure is invisible to any one brand team because each only sees its own delivery; it only shows up when every light-lager campaign is matched to the same person. One cap across everything pulls exposure back to the effective range and frees the wasted impressions for fans the portfolio isn’t reaching at all.',
    evidence: [
      'Matched to the person across three channels: ~22 ads a week to the average playoff sports fan.',
      'No single brand goes above ~9 a week — the pile-up only shows up when you combine them.',
      'Extra exposure stops building the brand past ~8–11 a week for this audience.',
      'About 24% of light-lager impressions land above that line — roughly $2.8M a year of waste.',
      'The waste is also burning out the summer hero faster in the over-exposed group.',
    ],
    confidence: 0.90,
    impactEstimate: 'One cap across all light-lager campaigns pulls weekly exposure back to the effective range and moves ~$2.8M of wasted impressions to fans the portfolio isn’t reaching — lifting net reach ~13% with no extra spend.',
    recommendedAction: 'Set a single ~11-per-week cap across every light-lager campaign and move the recovered budget to under-reached audiences and provinces. STRATIS matches audiences across campaigns and enforces the cap continuously.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Set one ~11/week cap across all light-lager campaigns', subtitle: 'NOT PER-CAMPAIGN — ACROSS EVERYTHING', type: 'bidding', completed: false },
      { id: 's2', title: 'Move the savings to under-reached fans', subtitle: 'BUY REACH WE’RE MISSING', type: 'budget', completed: false },
      { id: 's3', title: 'Enforce the combined cap continuously', subtitle: 'STRATIS MATCHES ACROSS CAMPAIGNS', type: 'scheduling', completed: false },
    ],
  },

  // 11 — COMPETITIVE OPPORTUNITY: conquest lane reopens
  {
    id: 'ins-mc-11-conquest-opportunity', createdAt: at(1, '07:30:00'),
    enterprise: 'molson-coors', category: 'competitive-macro', scope: 'product', productLine: 'mc-vizzy',
    channels: ['tiktok', 'google-search', 'ttd'],
    title: 'A Flavored-Malt Rival Pulled Its Seltzer Support Back ~35% Just as the Category Returned to Growth — the Door to Win Switchers Just Opened, and the Auction Is Cheaper Than It’s Been All Year',
    summary: 'Two things happened at once that add up to an opening, not a threat. Right as the hard-seltzer category returned to growth, drinkers started searching “flavored seltzer” and comparing brands about three times as much — ahead of any actual shift in what they buy. At the same time a flavored-malt rival pulled its seltzer support back about 35%, so the cost to show up against that rising interest has dropped below where it’s been all year. Our Hard Seltzer push is only putting a small slice of budget against the comparison moment, and the flavor-led objection cut isn’t live in search. The lane is open, cheap, and uncontested — but only while interest is running ahead of purchase.',
    evidence: [
      'Category “flavored seltzer” and brand-comparison search up ~190% as the rebound landed — ahead of any purchase shift.',
      'A flavored-malt rival cut its seltzer support ~35% — the auction is the cheapest it’s been all year.',
      'Our Hard Seltzer push holds only a small slice of budget in the comparison moment.',
      'The flavor-led “better-tasting seltzer” objection cut isn’t running in search.',
      'STRATIS reads the retreat and the interest spike together and calls it an opening.',
    ],
    confidence: 0.83,
    impactEstimate: 'Surging the Hard Seltzer push while the lane is cheap and interest is leading is projected to capture switchers at a lower cost-per-acquisition than any point this year, riding a confirmed category tailwind.',
    recommendedAction: 'Surge flavor-comparison search and short-video in the affected markets and put the objection cut live now, while the rival is out and costs are low. STRATIS holds the lane and alerts if the rival returns.',
    status: 'new',
    linkedNewsId: 'news-mc-seltzer-category',
    actionSteps: [
      { id: 's1', title: 'Raise comparison-search + short-video budget', subtitle: 'WHILE THE AUCTION IS CHEAP', type: 'budget', completed: false },
      { id: 's2', title: 'Put the flavor objection cut live in search', subtitle: 'WALK THROUGH THE OPEN DOOR', type: 'creative', completed: false },
      { id: 's3', title: 'Alert if the rival re-enters the auction', subtitle: 'STRATIS HOLDS THE LANE', type: 'scheduling', completed: false },
    ],
  },

  // 12 — TIER CHOREOGRAPHY: national flight → on-premise pull-through
  {
    id: 'ins-mc-12-pull-through', createdAt: at(1, '07:33:00'),
    enterprise: 'molson-coors', category: 'tier-choreography', scope: 'brand', productLine: 'mc-molson-canadian',
    channels: ['ctv', 'ooh', 'google-search'],
    title: 'Every Time a National Hockey Flight Runs, On-Premise Velocity and “Where to Buy” Search in That Market Jump 8 Days Later — but the Field Team’s Activation Calendar Isn’t Lined Up to That Window',
    summary: 'The national brand and local field sides of the plan are out of sync. In markets with heavy national hockey-flight weight, on-premise (bar and restaurant) velocity and local “where to buy” search show a clear bump about eight days later — fans are carrying the brand into the purchase occasion. But the Tier 3 field team’s on-premise activation and local promo run on a different calendar than the national flights, so the bar push and retail display usually land outside that eight-day window when demand is already peaking. The fix is timing, not more money — fire the local activation into the window the national flight already created.',
    evidence: [
      'On-premise velocity and local “where to buy” search peak about eight days after a national hockey flight in the same market.',
      'Heavy-flight markets see ~26% more on-premise velocity than light-flight markets.',
      'Field activation and national media run on separate calendars, in separate systems.',
      'A local promo converts ~2.0× better when it lands inside the eight-day window.',
      'Only a view across both tiers sees the eight-day handoff — neither team sees it alone.',
    ],
    confidence: 0.86,
    impactEstimate: 'Timing field and on-premise activation to the eight-day window is projected to lift conversion ~8–11% in aligned markets — with no extra media spend.',
    recommendedAction: 'Trigger field activation and local promo to fire 6–9 days after each national hockey flight by market. STRATIS pushes the flight calendar into the field system so the window is hit by default.',
    status: 'new',
    linkedNewsId: 'news-mc-nhl-playoffs',
    actionSteps: [
      { id: 's1', title: 'Feed the national flight calendar into the field system', subtitle: 'ONE CALENDAR, NOT TWO', type: 'scheduling', completed: false },
      { id: 's2', title: 'Time on-premise activation to the 6–9 day window', subtitle: 'HIT THE HANDOFF', type: 'scheduling', completed: false },
      { id: 's3', title: 'Compare aligned vs unaligned markets for six weeks', subtitle: 'PROVE THE LIFT', type: 'targeting', completed: false },
    ],
  },

  // 13 — AUDIENCE MIGRATION (Meta → TikTok)
  {
    id: 'ins-mc-13-audience-migration', createdAt: at(1, '07:36:00'),
    enterprise: 'molson-coors', category: 'tactical-efficiency', scope: 'division', division: 'tier-2', productLine: 'mc-vizzy',
    channels: ['facebook', 'tiktok', 'instagram'],
    title: 'Move the Young-Adult Seltzer Budget From Facebook to TikTok — the LDA 21–34 Flavor Seekers Who Made Facebook Efficient Last Year Have Moved to TikTok, Where They Now Convert ~38% Cheaper',
    summary: 'The young-adult flavor-seeker audience that made Facebook pay off last year has shifted where it spends its attention. That conversation has largely moved to TikTok (flavor creators and short-form), and the same drinkers now respond there at a much lower cost, while Facebook’s cost to drive a seltzer redemption has climbed as the active audience thinned out. This is an audience-migration call: follow the people, not the plan. STRATIS tracks where an audience actually converts across platforms week to week, so it catches the shift while it’s happening.',
    evidence: [
      'Cost to drive a seltzer redemption: up ~44% on Facebook over the quarter, while TikTok is ~38% cheaper for the same audience.',
      'The active LDA 21–34 flavor audience on Facebook has shrunk; the same users now convert on TikTok.',
      'Facebook still works for the older value-mainstream audience — this move is the young-adult slice only.',
      'TikTok flavor-seeker delivery has headroom; it isn’t yet saturated for this audience.',
      'Only a cross-platform view catches this — each platform’s own report looks “fine” in isolation.',
    ],
    confidence: 0.85,
    impactEstimate: 'Moving the young-adult slice from Facebook to TikTok is projected to lift young-adult redemptions ~12% at flat spend, by following the audience to where it now converts.',
    recommendedAction: 'Shift the young-adult seltzer budget from Facebook to TikTok, keep only the Facebook audiences still working for value-mainstream, and let STRATIS keep watching where the audience converts.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move the young-adult budget from Facebook to TikTok', subtitle: 'FOLLOW THE AUDIENCE', type: 'budget', completed: false },
      { id: 's2', title: 'Keep only the Facebook audiences still converting', subtitle: 'VALUE-MAINSTREAM, NOT YOUNG-ADULT', type: 'targeting', completed: false },
      { id: 's3', title: 'Watch where the audience converts week to week', subtitle: 'STRATIS TRACKS THE MIGRATION', type: 'scheduling', completed: false },
    ],
  },

  // 14 — DISCOVERY INTENT (cold Meta → search/intent)
  {
    id: 'ins-mc-14-discovery-intent', createdAt: at(1, '07:39:00'),
    enterprise: 'molson-coors', category: 'tactical-efficiency', scope: 'division', division: 'tier-2', productLine: 'mc-vizzy',
    channels: ['facebook', 'google-search', 'instagram'],
    title: 'Shift a Slice of Cold Facebook Prospecting Into “Where to Buy” Search — Drinkers Already Hunting a Flavored Seltzer Convert to a Store-Locator Action at About a Third of Facebook’s Cost',
    summary: 'Search is where people already in the occasion show up, and a real share of the seltzer audience is there actively hunting “flavored seltzer near me” and “where to buy.” Because they arrive with intent, they convert to a store-locator action at roughly a third of the cost of cold prospecting on Facebook. Facebook is still the right tool for warming people who don’t know the brand yet — but the bottom-of-funnel dollar works far harder on intent search for this audience, and today it gets almost none of it.',
    evidence: [
      'Cost per store-locator action: ~$3.10 on intent search vs ~$9.20 for cold Facebook prospecting.',
      'Searchers reach the query already in the occasion — intent, not interruption.',
      'Intent search holds a thin share of the seltzer prospecting budget today despite the efficiency.',
      'Keep Facebook for warming unaware drinkers — this moves the bottom-of-funnel dollar only.',
      'STRATIS compares cost per store-locator action across platforms, not each platform’s own metric.',
    ],
    confidence: 0.84,
    impactEstimate: 'Moving a slice of cold Facebook prospecting to intent search is projected to cut the blended cost of a store-locator action ~22% and free spend for warming where Facebook is strongest.',
    recommendedAction: 'Shift bottom-of-funnel budget from cold Facebook prospecting into “where to buy” intent search, and keep Facebook focused on warming unaware drinkers. STRATIS holds the cross-platform efficiency comparison live.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move bottom-of-funnel budget to intent search', subtitle: 'BUY INTENT, NOT INTERRUPTION', type: 'budget', completed: false },
      { id: 's2', title: 'Keep Facebook on warming unaware drinkers', subtitle: 'WHERE FACEBOOK STILL WINS', type: 'targeting', completed: false },
      { id: 's3', title: 'Compare cost per store-locator action across platforms', subtitle: 'NOT EACH PLATFORM’S OWN METRIC', type: 'scheduling', completed: false },
    ],
  },

  // 15 — SUPPLY PATH (open exchange → curated TTD deals)
  {
    id: 'ins-mc-15-supply-path', createdAt: at(1, '07:42:00'),
    enterprise: 'molson-coors', category: 'tactical-efficiency', scope: 'division', division: 'tier-2', productLine: 'mc-vizzy',
    channels: ['ttd'],
    title: 'Pull Programmatic Display Out of the Open Exchange and Into Curated Deals on The Trade Desk — Same Audience, ~28% Less Waste, and Ads Stop Landing on Age-Inappropriate or Off-Target Inventory',
    summary: 'A large share of programmatic display is still running through the open exchange, where about 28% of every dollar disappears into low-quality, never-seen, or off-target inventory — and for an alcohol brand, ads sometimes land on inventory that fails age-gating or sits next to content the brand can’t be near. Moving that money into curated private deals on The Trade Desk — verified, age-appropriate, occasion-relevant inventory bought directly — reaches the same drinkers with far less waste and clean adjacency. Same audience, more of the dollar actually working.',
    evidence: [
      'About 28% of open-exchange spend is lost to unviewable, low-quality, or off-target inventory.',
      'Curated private deals on The Trade Desk reach the same LDA audience with verified placement.',
      'Open-exchange viewability runs well below the curated-deal benchmark.',
      'Private deals also remove the age-gating and adjacency risk that matters for an alcohol brand.',
      'STRATIS reads delivered quality, not just the buying platform’s reported impressions.',
    ],
    confidence: 0.87,
    impactEstimate: 'Moving display from the open exchange into curated Trade Desk deals recovers ~28% of that spend into working, age-safe impressions — roughly $0.9M a year at the same audience and reach.',
    recommendedAction: 'Shift programmatic display out of the open exchange into curated private deals on The Trade Desk. STRATIS keeps scoring delivered quality and flags waste as it reappears.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move display from open exchange to curated deals', subtitle: 'SAME AUDIENCE, LESS WASTE', type: 'budget', completed: false },
      { id: 's2', title: 'Hold delivery to verified, age-safe inventory', subtitle: 'CLEAN ADJACENCY', type: 'targeting', completed: false },
      { id: 's3', title: 'Score delivered quality, not reported impressions', subtitle: 'STRATIS WATCHES THE SUPPLY PATH', type: 'scheduling', completed: false },
    ],
  },

  // 16 — REACH CAP (TikTok out of new people → TTD net-new reach)
  {
    id: 'ins-mc-16-reach-cap', createdAt: at(1, '07:45:00'),
    enterprise: 'molson-coors', category: 'tactical-efficiency', scope: 'division', division: 'tier-2', productLine: 'mc-vizzy',
    channels: ['tiktok', 'ttd'],
    title: 'TikTok Has Reached Almost Everyone It Can in the Young-Adult Seltzer Audience — the Next Reach Dollar Belongs on The Trade Desk, Where There Are Still New People to Find',
    summary: 'TikTok has done its job and hit its ceiling: it has now delivered to nearly everyone reachable in the LDA 21–34 flavor-seeker audience, so each additional TikTok dollar just adds repeat views to the same people instead of finding new ones. The Trade Desk still has real net-new reach into that same audience at a similar cost. This is different from cutting a channel for being inefficient — TikTok is efficient, it’s simply out of new people. Cap it at its reach ceiling and put the next reach dollar where new people still exist.',
    evidence: [
      'TikTok’s unique reach in this audience has flattened — added spend now adds frequency, not new people.',
      'The Trade Desk still reaches net-new people in the same LDA audience at a similar cost.',
      'TikTok stays funded up to its ceiling — this caps the overflow, it doesn’t cut the channel.',
      'Extra TikTok frequency past the ceiling is the same diminishing-returns trap as any saturated channel.',
      'STRATIS separates “out of new people” from “inefficient” — they call for different moves.',
    ],
    confidence: 0.85,
    impactEstimate: 'Capping TikTok at its reach ceiling and moving the overflow to The Trade Desk converts wasted repeat views into net-new reach — lifting unique audience reached ~9% at the same spend.',
    recommendedAction: 'Cap TikTok at the point its unique reach flattens and move the overflow to The Trade Desk for net-new reach. STRATIS watches each platform’s reach ceiling and redirects the overflow.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Cap TikTok where its unique reach flattens', subtitle: 'EFFICIENT, BUT OUT OF NEW PEOPLE', type: 'budget', completed: false },
      { id: 's2', title: 'Move the overflow to The Trade Desk for net-new reach', subtitle: 'FIND PEOPLE, NOT FREQUENCY', type: 'budget', completed: false },
      { id: 's3', title: 'Watch each platform’s reach ceiling', subtitle: 'REDIRECT THE OVERFLOW', type: 'scheduling', completed: false },
    ],
  },

  // 17 — AUCTION PRESSURE (competitor crowds CTV → shift to uncontested)
  {
    id: 'ins-mc-17-auction-pressure', createdAt: at(1, '07:48:00'),
    enterprise: 'molson-coors', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'mc-coors-light',
    channels: ['ctv', 'spotify', 'ooh'],
    title: 'A Rival National Lager’s ~15% Summer Push Crowded the CTV Game-Window Auction — Our Cost to Reach the Light-Lager Audience There Jumped ~30%; Audio and OOH Are Uncontested and Cheaper Right Now',
    summary: 'Nothing changed on our side, but reaching the light-lager audience in CTV game windows suddenly costs about 30% more — a rival national lager’s heaviest summer push in three years flooded the same audience and bid the auction up. Audio and OOH, where that rival isn’t pushing, are reaching the same kinds of drinkers at last quarter’s prices. The smart move is temporary and reversible: shift a portion of CTV game-window reach to the uncontested channels while the auction is hot, and shift it back when the rival’s flight ends. Paying the inflated CTV price for reach we can get cheaper elsewhere is the avoidable cost.',
    evidence: [
      'CTV cost to reach the light-lager audience in game windows is up ~30% with no change in our targeting or creative.',
      'The increase lines up exactly with the rival national lager’s ~15% summer flight on the same audience.',
      'Audio and OOH, where the rival isn’t pushing, are still at last quarter’s cost.',
      'The shift is temporary and reversible — move it back when the rival’s flight ends.',
      'STRATIS ties the cost spike to the competitor’s entry, so the cause is clear, not guessed.',
    ],
    confidence: 0.83,
    impactEstimate: 'Temporarily moving the inflated share of CTV reach to audio and OOH avoids the ~30% auction premium — protecting reach efficiency until the rival’s flight ends, then reversing.',
    recommendedAction: 'Shift a portion of CTV game-window reach to audio and OOH while the rival has the auction crowded, and move it back when their flight ends. STRATIS alerts when the auction normalizes.',
    status: 'new',
    linkedNewsId: 'news-mc-abi-bud-light',
    actionSteps: [
      { id: 's1', title: 'Move the inflated CTV reach to audio + OOH', subtitle: 'DON’T PAY THE AUCTION PREMIUM', type: 'budget', completed: false },
      { id: 's2', title: 'Keep the shift temporary and reversible', subtitle: 'MOVE BACK WHEN THEY STOP', type: 'budget', completed: false },
      { id: 's3', title: 'Alert when the CTV auction normalizes', subtitle: 'STRATIS WATCHES THE COMPETITOR', type: 'scheduling', completed: false },
    ],
  },

  // ───────────── CROSS-REGION INTELLIGENCE ─────────────
  // ACME Beverage runs province by province through different liquor boards and
  // distribution, so a pattern proven in one province is a tested, ready-to-port
  // play for another. Each insight makes the cross-province correlation explicit
  // and quantified, names both provinces, and hands over a concrete portable move.

  // XR1 — CREATIVE TRANSFER: heritage creative proven in Quebec → Atlantic
  {
    id: 'ins-mc-xr1-creative-transfer', createdAt: at(1, '07:51:00'),
    enterprise: 'molson-coors', category: 'cross-region', scope: 'brand', productLine: 'mc-molson-canadian',
    channels: ['ctv', 'ooh', 'instagram', 'facebook'],
    title: 'The French-Language Heritage Cut Is Converting 1.5× the National Hockey Hero — in Quebec — and the Atlantic Francophone Markets Have the Same Heritage Story Sitting Untapped',
    summary: 'The same heritage idea wins in two markets, but it is only deployed in one. In Quebec, the French-language, local-brewing heritage cut is converting at about 1.5× the national hockey hero on the identical metric, where local pride is the strongest purchase cue. The Atlantic francophone markets now have the same story to tell — the same heritage and language affinity — yet delivery there still leads with the national hockey hero and the heritage cut holds a thin share of views. This is the cleanest cross-province transfer STRATIS sees: a creative proven on the same conversion metric in one province, with a near-identical audience in the other. Port the asset, don’t re-test it from zero.',
    evidence: [
      'Quebec: the French-language heritage cut converts ~1.5× the national hockey hero on the same metric.',
      'The Atlantic francophone markets index nearly as high on heritage and local-pride cues.',
      'Atlantic delivery still defaults to the national hockey hero; the heritage cut holds a thin share of views.',
      'The two markets share language and heritage affinity — the creative transfers with light adaptation.',
      'STRATIS correlates creative performance on a common conversion metric across provinces — no single regional report sees the other.',
    ],
    confidence: 0.87,
    impactEstimate: 'Porting the proven Quebec heritage cut into the Atlantic francophone markets is projected to lift conversion ~13% there at no incremental production cost, capturing a win already validated in-market next door.',
    recommendedAction: 'Adapt and ship the Quebec heritage creative into the Atlantic francophone markets, give it real share of views against the national hero, and let STRATIS keep matching creative performance across provinces to surface the next portable asset.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Port the Quebec heritage cut into Atlantic', subtitle: 'PROVEN NEXT DOOR, SAME AUDIENCE', type: 'creative', completed: false },
      { id: 's2', title: 'Give it real share of views vs the national hero', subtitle: 'DON’T LET DELIVERY DEFAULT BACK', type: 'creative', completed: false },
      { id: 's3', title: 'Match creative performance across provinces continuously', subtitle: 'STRATIS SURFACES THE NEXT PORTABLE WIN', type: 'creative', completed: false },
    ],
  },

  // XR2 — LEADING-INDICATOR CORRELATION: BC summer CTV saturation predicts Ontario ~3 weeks out
  {
    id: 'ins-mc-xr2-leading-indicator', createdAt: at(1, '07:54:00'),
    enterprise: 'molson-coors', category: 'cross-region', scope: 'brand', productLine: 'mc-coors-light',
    channels: ['ctv', 'spotify', 'ooh'],
    title: 'Ontario’s Summer CTV Curve Is Tracing the Exact BC Reach-Decay From Three Weeks Ago — Cap Ontario Connected TV Now, Before the Same ~$1.4M of Waste Lands',
    summary: 'One province is now a three-week early warning for the other. BC’s summer ramps earlier, and its CTV reach curve flattened earlier this season — incremental reach decayed into the floor as the audience saturated. STRATIS has now detected the identical decay shape forming in Ontario, running about three weeks behind BC, week for week. This isn’t a vague “watch the East” note: it’s the same reach curve, same inflection, same audience-saturation fingerprint, on a lag. Because BC already showed where this ends, Ontario doesn’t have to spend its way to the same dead weight — cap Ontario CTV at the inflection the BC curve already mapped, before the waste arrives rather than after.',
    evidence: [
      'BC CTV incremental reach decayed to its floor ~3 weeks ago as the audience saturated.',
      'Ontario CTV is now tracing the identical decay shape, lagging BC by ~3 weeks week-for-week.',
      'The curves overlay almost exactly once shifted by three weeks — same inflection, same saturation fingerprint.',
      'Ontario budget hasn’t reacted — it’s funded toward the same flat tail BC already proved is dead weight.',
      'STRATIS aligns reach curves across provinces on a lag, turning one market into a leading indicator for the next.',
    ],
    confidence: 0.86,
    impactEstimate: 'Capping Ontario CTV at the inflection the BC curve already mapped avoids an estimated ~$1.4M of saturated Ontario spend before it lands — pre-empting the waste rather than booking it and reallocating after the fact.',
    recommendedAction: 'Treat the BC CTV decay as Ontario’s forward map: cap Ontario CTV at the BC-proven inflection now and redeploy the freed budget into Ontario audio and OOH, which still build reach. STRATIS keeps the lagged cross-province curve live and alerts as Ontario approaches the line.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Cap Ontario CTV at the BC-proven inflection', subtitle: 'THREE WEEKS AHEAD OF THE WASTE', type: 'budget', completed: false },
      { id: 's2', title: 'Redeploy freed Ontario budget to audio + OOH', subtitle: 'STILL ON THE STEEP CURVE THERE', type: 'budget', completed: false },
      { id: 's3', title: 'Hold the lagged cross-province curve live', subtitle: 'BC PREDICTS ONTARIO BY ~3 WEEKS', type: 'scheduling', completed: false },
    ],
  },

  // XR3 — DEMAND CORRELATION: Ontario seltzer-search → redemption now repeating in BC
  {
    id: 'ins-mc-xr3-demand-correlation', createdAt: at(1, '07:57:00'),
    enterprise: 'molson-coors', category: 'cross-region', scope: 'product', productLine: 'mc-vizzy',
    channels: ['google-search', 'tiktok', 'ttd'],
    title: 'The Seltzer-Search Surge That Led Ontario Retail Redemption by Five Weeks Is Now Climbing the Same Curve in BC — Fund the Hard Seltzer There Ahead of the Proven Demand',
    summary: 'A demand signal that already paid out in one province is now repeating in another, early enough to get ahead of. In Ontario, a rise in “flavored seltzer” and “where to buy” search reliably led the retail-redemption lift by about five weeks; the search curve was the tell, and the weight that funded it captured the demand. STRATIS now sees that same share-of-search curve climbing in BC, currently at the point Ontario sat roughly five weeks before its redemption inflection. The correlation is the same shape on the same category; the only difference is timing. Fund Hard Seltzer search and short-video coverage in BC now, ahead of the proven curve — not after the redemption lift shows up in a Nielsen report.',
    evidence: [
      'Ontario: “flavored seltzer” search led the retail-redemption lift by ~5 weeks — search was the leading indicator.',
      'BC: the same share-of-search curve is now climbing, at the point Ontario sat ~5 weeks pre-inflection.',
      'The two curves overlay on the same category terms once aligned by the lag — same shape, different clock.',
      'BC Hard Seltzer search and short-video coverage is currently underfunded relative to the rising demand.',
      'STRATIS correlates share-of-search to downstream redemption across provinces, surfacing the demand before the sales data confirms it.',
    ],
    confidence: 0.84,
    impactEstimate: 'Funding BC Hard Seltzer coverage ahead of the Ontario-proven ~5-week search-to-redemption curve is projected to capture the demand at materially lower cost-per-redemption than entering after the lift appears.',
    recommendedAction: 'Stand up Hard Seltzer search and short-video coverage in BC now, sized to the rising search curve, using the Ontario search-to-redemption lag as the forecast. STRATIS keeps correlating share-of-search to redemption across provinces and flags the inflection as BC approaches it.',
    status: 'new',
    linkedNewsId: 'news-mc-seltzer-category',
    actionSteps: [
      { id: 's1', title: 'Fund BC Hard Seltzer ahead of the curve', subtitle: 'ONTARIO SEARCH LED REDEMPTION BY ~5 WEEKS', type: 'budget', completed: false },
      { id: 's2', title: 'Take search + short-video coverage before demand peaks', subtitle: 'BUY THE LANE BEFORE IT GETS CONTESTED', type: 'targeting', completed: false },
      { id: 's3', title: 'Correlate share-of-search to redemption across provinces', subtitle: 'STRATIS FLAGS BC’S INFLECTION', type: 'scheduling', completed: false },
    ],
  },
];

// ===== Per-insight charts (each illustrates its insight's specific headline) =====
export const MOLSON_COORS_VISUALS: Record<string, InsightVisual> = {
  // 1 — saturation: marginal reach per extra $100K, declining to ~0
  'ins-mc-01-saturation': {
    kind: 'line', xKey: 'spend', series: ['ctv', 'audio'],
    config: {
      ctv: { label: 'CTV — reach-points per +$100K', color: RED },
      audio: { label: 'Audio — reach-points per +$100K', color: TEAL },
    },
    refLines: [{ axis: 'x', value: '$2.0M', label: 'CTV saturation point', color: GOLD }],
    data: [
      { spend: '$1.0M', ctv: 16, audio: 17 }, { spend: '$1.5M', ctv: 12, audio: 16 },
      { spend: '$2.0M', ctv: 6, audio: 15 }, { spend: '$2.5M', ctv: 4, audio: 14 },
      { spend: '$3.0M', ctv: 3, audio: 14 },
    ],
    caption: 'Past ~$2.0M, each extra CTV dollar adds almost no reach — while audio keeps building it.',
  },
  // 2 — mix allocation: marginal efficiency by channel vs the frontier line
  'ins-mc-02-mix-reallocation': {
    kind: 'bar', xKey: 'channel', series: ['efficiency'], perBarColor: true,
    config: { efficiency: { label: 'Return on the next dollar (index)', color: TEAL } },
    refLines: [{ axis: 'y', value: 100, label: 'Efficiency frontier', color: GOLD }],
    data: [
      { channel: 'TikTok', efficiency: 136, fill: TEAL },
      { channel: 'Spotify', efficiency: 122, fill: TEAL },
      { channel: 'Instagram', efficiency: 116, fill: TEAL },
      { channel: 'CTV', efficiency: 94, fill: MUTED },
      { channel: 'OOH', efficiency: 74, fill: RED },
    ],
    legend: [
      { label: 'Headroom — fund these', color: TEAL },
      { label: 'Past efficient — pull back', color: RED },
    ],
    caption: 'Move dollars from the red channels to the teal ones until the next dollar is equally productive everywhere.',
  },
  // 3 — audience efficiency: conversions per dollar by segment
  'ins-mc-03-audience-efficiency': {
    kind: 'bar', xKey: 'audience', series: ['efficiency'], perBarColor: true,
    config: { efficiency: { label: 'Conversions per $ (index)', color: TEAL } },
    data: [
      { audience: 'Flavor & Seltzer Seekers', efficiency: 164, fill: TEAL },
      { audience: 'LDA 21–34', efficiency: 128, fill: TEAL },
      { audience: 'Craft-Curious', efficiency: 102, fill: BLUE },
      { audience: 'Value-Mainstream', efficiency: 71, fill: RED },
    ],
    legend: [
      { label: 'High-intent — gets only ~33% of budget', color: TEAL },
      { label: 'Broad value-mainstream — gets most of it', color: RED },
    ],
    caption: 'The most efficient audience is the least funded — shift targeting toward intent.',
  },
  // 4 — rising cost: cost per redemption crossing the prior line
  'ins-mc-04-acquisition-cost-rising': {
    kind: 'line', xKey: 'week', series: ['cost'],
    config: { cost: { label: 'Cost per retail redemption ($)', color: TEAL } },
    refLines: [{ axis: 'y', value: 5.2, label: 'Two weeks ago: $5.20', color: RED }],
    data: [
      { week: 'W-7', cost: 5.05 }, { week: 'W-6', cost: 5.1 }, { week: 'W-5', cost: 5.15 },
      { week: 'W-4', cost: 5.2 }, { week: 'W-3', cost: 5.6 }, { week: 'W-2', cost: 6.05 },
      { week: 'W-1', cost: 6.3 }, { week: 'Now', cost: 6.4 },
    ],
    caption: 'A bidding war on a few category terms pushed cost up ~23% in two weeks — a targeted bid cap reverses it.',
  },
  // 5 — price of reach up, results flat
  'ins-mc-05-price-of-reach': {
    kind: 'line', xKey: 'week', series: ['price', 'reach'],
    config: {
      price: { label: 'Price of reach (index)', color: RED },
      reach: { label: 'Unique reach (index)', color: TEAL },
    },
    data: [
      { week: 'W-4', price: 100, reach: 100 }, { week: 'W-3', price: 108, reach: 101 },
      { week: 'W-2', price: 115, reach: 99 }, { week: 'W-1', price: 120, reach: 100 },
      { week: 'Now', price: 122, reach: 98 },
    ],
    caption: 'Reach got ~22% pricier while unique reach held flat — paying more for the same audience.',
  },
  // 6 — geographic efficiency: spend vs conversion by province
  'ins-mc-06-geo-efficiency': {
    kind: 'scatter', xKey: 'spend', series: ['conversion'],
    xName: 'Provincial spend (index)', yName: 'Conversion vs national avg (%)',
    config: { conversion: { label: 'Province', color: PURPLE } },
    refLines: [{ axis: 'y', value: 0, label: 'National average', color: GOLD }],
    data: [
      { spend: 140, conversion: -28 }, { spend: 126, conversion: -21 }, { spend: 116, conversion: -15 },
      { spend: 95, conversion: 5 }, { spend: 86, conversion: 13 }, { spend: 72, conversion: 22 },
      { spend: 60, conversion: 29 }, { spend: 51, conversion: 33 },
    ],
    caption: 'High-spend provinces converting below average (lower right) should fund the underfunded winners (upper left).',
  },
  // 7 — access/distribution friction: listing burden vs return on media
  'ins-mc-07-access-friction': {
    kind: 'scatter', xKey: 'gaps', series: ['roi'],
    xName: 'Distribution gap (%)', yName: 'Return on media (index)',
    config: { roi: { label: 'Province', color: PURPLE } },
    data: [
      { gaps: 8, roi: 150 }, { gaps: 14, roi: 136 }, { gaps: 20, roi: 120 }, { gaps: 28, roi: 108 },
      { gaps: 36, roi: 90 }, { gaps: 43, roi: 82 }, { gaps: 50, roi: 70 }, { gaps: 57, roi: 64 },
    ],
    caption: 'The thinner a province’s listing and on-premise presence, the worse the same ads convert — spend should follow distribution.',
  },
  // 8 — creative winner: conversions driven by ad
  'ins-mc-08-creative-winner': {
    kind: 'bar', xKey: 'ad', series: ['rate'], perBarColor: true,
    config: { rate: { label: 'Conversions driven (index)', color: TEAL } },
    data: [
      { ad: 'Summer brand hero', rate: 100, fill: MUTED },
      { ad: '“Cold-activated can”', rate: 161, fill: TEAL },
      { ad: 'Patio lifestyle', rate: 116, fill: BLUE },
    ],
    legend: [
      { label: 'Winner — only ~13% of views today', color: TEAL },
      { label: 'Brand hero — most of the views', color: MUTED },
    ],
    caption: 'Ranked by conversions actually driven, the occasion cut wins ~1.6× — but barely gets shown.',
  },
  // 9 — creative fatigue: pull drops with each viewing; fresh cut holds
  'ins-mc-09-creative-fatigue': {
    kind: 'line', xKey: 'views', series: ['hero', 'fresh'],
    config: {
      hero: { label: '“Made to Chill” hero', color: RED },
      fresh: { label: 'Fresh cut', color: TEAL },
    },
    data: [
      { views: '1–3', hero: 100, fresh: 110 }, { views: '4–6', hero: 84, fresh: 109 },
      { views: '7–9', hero: 52, fresh: 108 }, { views: '10+', hero: 38, fresh: 103 },
    ],
    caption: 'The tired hero collapses with repeat viewings while the fresh cut holds — that’s wear-out, not delivery.',
  },
  // 10 — frequency collision: per-channel vs combined with the effective line
  'ins-mc-10-frequency-collision': {
    kind: 'bar', xKey: 'channel', series: ['freq'], perBarColor: true,
    config: { freq: { label: 'Ads seen per week', color: TEAL } },
    refLines: [{ axis: 'y', value: 11, label: 'Where it stops working (~11)', color: RED }],
    data: [
      { channel: 'CTV', freq: 6.1, fill: TEAL },
      { channel: 'OOH', freq: 5.4, fill: TEAL },
      { channel: 'Social', freq: 5.8, fill: TEAL },
      { channel: 'TikTok', freq: 4.7, fill: TEAL },
      { channel: 'Combined', freq: 22.0, fill: RED },
    ],
    caption: 'No single channel looks high — only adding them up for one fan reveals the over-exposure.',
  },
  // 11 — conquest opportunity: interest up as competitor support retreats
  'ins-mc-11-conquest-opportunity': {
    kind: 'line', xKey: 'day', series: ['interest', 'competitor'],
    config: {
      interest: { label: 'Seltzer-comparison interest', color: TEAL },
      competitor: { label: 'Rival seltzer support', color: RED },
    },
    data: [
      { day: 'D0', interest: 100, competitor: 100 }, { day: 'D1', interest: 158, competitor: 95 },
      { day: 'D2', interest: 226, competitor: 84 }, { day: 'D3', interest: 290, competitor: 72 },
      { day: 'D4', interest: 281, competitor: 66 }, { day: 'D5', interest: 270, competitor: 65 },
    ],
    caption: 'Interest surged as the rival pulled back — the door is open and the auction is cheap.',
  },
  // 12 — pull-through: on-premise velocity peaks 8 days after a national flight
  'ins-mc-12-pull-through': {
    kind: 'line', xKey: 'lag', series: ['lift'],
    config: { lift: { label: 'On-premise velocity lift', color: TEAL } },
    refLines: [{ axis: 'x', value: '+8d', label: 'Best window for field activation', color: GOLD }],
    data: [
      { lag: '0d', lift: 16 }, { lag: '+3d', lift: 29 }, { lag: '+6d', lift: 47 },
      { lag: '+8d', lift: 61 }, { lag: '+11d', lift: 50 }, { lag: '+14d', lift: 33 },
    ],
    caption: 'On-premise velocity peaks eight days after the national flight — the window the field keeps missing.',
  },
  // 13 — audience migration: cost to reach young-adult diverging over the quarter
  'ins-mc-13-audience-migration': {
    kind: 'line', xKey: 'month', series: ['facebook', 'tiktok'],
    config: {
      facebook: { label: 'Facebook — cost per redemption', color: RED },
      tiktok: { label: 'TikTok — cost per redemption', color: TEAL },
    },
    data: [
      { month: 'Jan', facebook: 100, tiktok: 103 }, { month: 'Feb', facebook: 111, tiktok: 96 },
      { month: 'Mar', facebook: 126, tiktok: 84 }, { month: 'Apr', facebook: 139, tiktok: 73 },
      { month: 'May', facebook: 144, tiktok: 72 },
    ],
    caption: 'The young-adult audience moved to TikTok — its cost fell there while Facebook’s climbed. Follow the people.',
  },
  // 14 — discovery intent: cost per store-locator action by platform
  'ins-mc-14-discovery-intent': {
    kind: 'bar', xKey: 'platform', series: ['cost'], perBarColor: true,
    config: { cost: { label: 'Cost per store-locator action ($)', color: TEAL } },
    data: [
      { platform: 'Facebook (cold prospecting)', cost: 9.2, fill: RED },
      { platform: 'Instagram (cold)', cost: 6.4, fill: MUTED },
      { platform: 'Intent search', cost: 3.1, fill: TEAL },
    ],
    legend: [
      { label: 'Intent search — thin share today', color: TEAL },
      { label: 'Cold Facebook prospecting — most of it', color: RED },
    ],
    caption: 'Searchers arrive already in the occasion — they convert at about a third of cold Facebook’s cost.',
  },
  // 15 — supply path: share of spend lost to waste
  'ins-mc-15-supply-path': {
    kind: 'bar', xKey: 'route', series: ['waste'], perBarColor: true,
    config: { waste: { label: 'Spend lost to waste (%)', color: TEAL } },
    data: [
      { route: 'Open exchange', waste: 28, fill: RED },
      { route: 'Curated deals (The Trade Desk)', waste: 6, fill: TEAL },
    ],
    legend: [
      { label: 'Unviewable / off-target / age-unsafe', color: RED },
      { label: 'Verified, age-safe inventory', color: TEAL },
    ],
    caption: 'Same audience, far less waste — the curated path puts ~28% more of the dollar to work.',
  },
  // 16 — reach cap: unique reach curves, TikTok vs Trade Desk
  'ins-mc-16-reach-cap': {
    kind: 'line', xKey: 'spend', series: ['tiktok', 'ttd'],
    config: {
      tiktok: { label: 'TikTok — new people reached', color: RED },
      ttd: { label: 'The Trade Desk — new people reached', color: TEAL },
    },
    refLines: [{ axis: 'x', value: '$0.8M', label: 'TikTok reach ceiling', color: GOLD }],
    data: [
      { spend: '$0.3M', tiktok: 17, ttd: 15 }, { spend: '$0.55M', tiktok: 13, ttd: 14 },
      { spend: '$0.8M', tiktok: 6, ttd: 14 }, { spend: '$1.05M', tiktok: 2, ttd: 13 },
      { spend: '$1.3M', tiktok: 1, ttd: 13 },
    ],
    caption: 'Past ~$0.8M TikTok just adds frequency — The Trade Desk still finds new people at the same cost.',
  },
  // 17 — auction pressure: cost of reach spikes as competitor enters
  'ins-mc-17-auction-pressure': {
    kind: 'line', xKey: 'week', series: ['ctv', 'audioOoh'],
    config: {
      ctv: { label: 'CTV game windows — cost of reach', color: RED },
      audioOoh: { label: 'Audio + OOH — cost of reach', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W-3', label: 'Rival flight starts', color: GOLD }],
    data: [
      { week: 'W-5', ctv: 100, audioOoh: 100 }, { week: 'W-4', ctv: 101, audioOoh: 99 },
      { week: 'W-3', ctv: 109, audioOoh: 100 }, { week: 'W-2', ctv: 123, audioOoh: 101 },
      { week: 'W-1', ctv: 129, audioOoh: 100 }, { week: 'Now', ctv: 131, audioOoh: 99 },
    ],
    caption: 'A rival crowded the CTV game-window auction — the same reach is ~30% cheaper on the uncontested channels.',
  },
  // XR1 — creative transfer: heritage cut vs national hero, Quebec vs Atlantic
  'ins-mc-xr1-creative-transfer': {
    kind: 'bar', xKey: 'region', series: ['hero', 'heritage'],
    config: {
      hero: { label: 'National hockey hero — conversion (index)', color: MUTED },
      heritage: { label: 'French heritage cut — conversion (index)', color: TEAL },
    },
    data: [
      { region: 'Atlantic (running today)', hero: 100, heritage: 94 },
      { region: 'Quebec (proven)', hero: 100, heritage: 151 },
    ],
    legend: [
      { label: 'Heritage cut — proven 1.5× in Quebec', color: TEAL },
      { label: 'National hero — Atlantic default', color: MUTED },
    ],
    caption: 'The heritage cut wins ~1.5× in Quebec on the same metric — and the Atlantic francophone markets can run it. Port the asset.',
  },
  // XR2 — leading indicator: BC reach decay (lead) vs Ontario (lag ~3 weeks)
  'ins-mc-xr2-leading-indicator': {
    kind: 'line', xKey: 'week', series: ['bc', 'on'],
    config: {
      bc: { label: 'BC CTV incremental reach (leading)', color: RED },
      on: { label: 'Ontario CTV incremental reach (lagging ~3 wks)', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W4', label: 'Ontario reaches the BC inflection', color: GOLD }],
    data: [
      { week: 'W1', bc: 70, on: 100 }, { week: 'W2', bc: 52, on: 98 },
      { week: 'W3', bc: 38, on: 86 }, { week: 'W4', bc: 30, on: 70 },
      { week: 'W5', bc: 27, on: 52 }, { week: 'W6', bc: 26, on: 38 },
    ],
    caption: 'Ontario is tracing the exact BC decay ~3 weeks behind — cap Ontario CTV at the inflection BC already mapped, before the waste lands.',
  },
  // XR3 — demand correlation: Ontario seltzer-search (earlier) vs BC (now)
  'ins-mc-xr3-demand-correlation': {
    kind: 'line', xKey: 'phase', series: ['on', 'bc'],
    config: {
      on: { label: 'Ontario search → led redemption by ~5 wks', color: BLUE },
      bc: { label: 'BC seltzer-search (now)', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W3', label: 'BC today (~5 wks pre-redemption)', color: GOLD }],
    data: [
      { phase: 'W1', on: 146, bc: 100 }, { phase: 'W2', on: 174, bc: 103 },
      { phase: 'W3', on: 196, bc: 122 }, { phase: 'W4', on: 205, bc: 150 },
      { phase: 'W5', on: 208, bc: 178 },
    ],
    caption: 'BC is climbing the same seltzer-search curve Ontario rode into its redemption lift ~5 weeks earlier — fund ahead of it.',
  },
};
