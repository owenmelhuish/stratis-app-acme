// ===========================================================================
// ACME Restaurants — QSR / Restaurant client instance
// Representative campaign data + a full insight list + market news.
// App/offer-led QSR; "conversions" are Loyalty Rewards sign-ups and offer
// redemptions, revenue is low-AOV per redemption. Illustrative demo figures
// grounded in the real product lines, audiences, and agency roster.
// ===========================================================================
import type { Insight, NewsItem } from '@/types';
import { type CampaignDef, at, todayISO } from './_shared';
import { type InsightVisual, TEAL, RED, BLUE, MUTED, GRID, PURPLE, GOLD } from '../insight-visual-types';

export const TIM_HORTONS_CAMPAIGN_DEFS: CampaignDef[] = [
  // ── TIER 1 — NATIONAL BRAND (Zulu Alpha Kilo) ──
  { id: 'th-hotbev-brand', name: 'Hot Beverages — It\'s ACME Time Brand Hero',
    enterprise: 'tim-hortons', division: 'tier-1', agency: 'th-zulu', productLine: 'th-hot-bev',
    audiences: ['th-daily-regulars', 'th-commuters'], objective: 'awareness', status: 'live',
    channels: ['ctv', 'ooh', 'instagram', 'spotify'], geos: ['national'], budgetMultiplier: 1.60,
    plannedBudget: 12_800_000, revPerConvRange: [9, 26], cvrModifier: 1.00, cplCalibration: 0.60, revTrend: 0.0003 },
  { id: 'th-coldbev-summer', name: 'Cold Beverages — Summer Refresh Hero',
    enterprise: 'tim-hortons', division: 'tier-1', agency: 'th-zulu', productLine: 'th-cold-bev',
    audiences: ['th-cold-younger', 'th-families'], objective: 'awareness', status: 'live',
    channels: ['ctv', 'tiktok', 'instagram', 'ooh'], geos: ['national', 'ontario'], budgetMultiplier: 1.35,
    plannedBudget: 9_200_000, revPerConvRange: [8, 24], cvrModifier: 1.05, cplCalibration: 0.60, revTrend: 0.0004 },
  { id: 'th-breakfast-value', name: 'Breakfast — Morning Value Routine',
    enterprise: 'tim-hortons', division: 'tier-1', agency: 'th-zulu', productLine: 'th-breakfast',
    audiences: ['th-commuters', 'th-value-seekers'], objective: 'consideration', status: 'live',
    channels: ['ctv', 'facebook', 'google-search', 'spotify'], geos: ['national'], budgetMultiplier: 1.15,
    plannedBudget: 6_900_000, revPerConvRange: [10, 28], cvrModifier: 1.10, cplCalibration: 0.62, revTrend: 0.0003 },

  // ── TIER 2 — REGIONAL / MEDIA (Touché!) ──
  { id: 'th-rewards-acquisition', name: 'Loyalty Rewards — App Sign-Up Acquisition',
    enterprise: 'tim-hortons', division: 'tier-2', agency: 'th-touche', productLine: 'th-rewards',
    audiences: ['th-app-members', 'th-daily-regulars'], objective: 'conversion', status: 'live',
    channels: ['tiktok', 'instagram', 'google-search', 'facebook'], geos: ['national'], budgetMultiplier: 1.25,
    plannedBudget: 7_600_000, revPerConvRange: [12, 32], cvrModifier: 1.25, cplCalibration: 0.68, revTrend: 0.0005 },
  { id: 'th-coldbrew-younger', name: 'Cold Brew — Younger Daypart Push',
    enterprise: 'tim-hortons', division: 'tier-2', agency: 'th-touche', productLine: 'th-cold-bev',
    audiences: ['th-cold-younger'], objective: 'consideration', status: 'live',
    channels: ['tiktok', 'instagram', 'spotify'], geos: ['ontario', 'quebec'], budgetMultiplier: 0.90,
    plannedBudget: 4_400_000, revPerConvRange: [9, 25], cvrModifier: 1.15, cplCalibration: 0.64, revTrend: 0.0005 },
  { id: 'th-lunch-daypart', name: 'Lunch — Afternoon Daypart Expansion',
    enterprise: 'tim-hortons', division: 'tier-2', agency: 'th-touche', productLine: 'th-lunch',
    audiences: ['th-value-seekers', 'th-families'], objective: 'consideration', status: 'paused',
    channels: ['facebook', 'instagram', 'google-search'], geos: ['national'], budgetMultiplier: 0.80,
    plannedBudget: 3_600_000, revPerConvRange: [11, 30], cvrModifier: 1.00, cplCalibration: 0.60, revTrend: 0.0004 },

  // ── TIER 3 — LOCAL STORE MARKETING ──
  { id: 'th-baked-lto-local', name: 'Baked Goods — Local LTO & Donut Drops',
    enterprise: 'tim-hortons', division: 'tier-3', agency: 'th-local', productLine: 'th-baked',
    audiences: ['th-families', 'th-daily-regulars'], objective: 'conversion', status: 'live',
    channels: ['instagram', 'facebook', 'ooh'], geos: ['ontario', 'atlantic'], budgetMultiplier: 0.70,
    plannedBudget: 2_900_000, revPerConvRange: [8, 22], cvrModifier: 1.10, cplCalibration: 0.66, revTrend: 0.0004 },
  { id: 'th-rewards-winback-local', name: 'Loyalty Rewards — Lapsed Visitor Win-Back',
    enterprise: 'tim-hortons', division: 'tier-3', agency: 'th-local', productLine: 'th-rewards',
    audiences: ['th-lapsed', 'th-value-seekers'], objective: 'retention', status: 'live',
    channels: ['facebook', 'google-search'], geos: ['national'], budgetMultiplier: 0.65,
    plannedBudget: 2_500_000, revPerConvRange: [10, 27], cvrModifier: 1.20, cplCalibration: 0.70, revTrend: 0.0005 },
];

export const TIM_HORTONS_NEWS: NewsItem[] = [
  { id: 'news-th-coldbrew-heatwave', title: 'Environment Canada Forecasts Hotter-Than-Average Summer — Cold-Beverage QSR Demand Expected to Surge',
    source: 'Environment Canada', date: '2026-05-07', tags: ['macro'], urgency: 'high', regions: ['national', 'ontario'],
    summary: 'Environment Canada\'s seasonal outlook points to a hotter-than-average summer across most of the country, a known driver of iced and cold-brew QSR demand.',
    whyItMatters: 'A weather tailwind landing as the Summer Refresh and Cold Brew flights ramp. STRATIS is correlating temperature against cold-beverage redemption to pace weight to the heat curve — see the linked recommendation.',
    enterprises: ['tim-hortons'] },
  { id: 'news-th-mcdonalds-coffee', title: "The Global QSR Leader Relaunches Its Coffee Rewards Program with Aggressive Free-Coffee Ladder",
    source: 'Restaurants Canada', date: '2026-05-05', tags: ['competitors'], urgency: 'high', competitor: "the global QSR leader",
    regions: ['national'], summary: "The global QSR leader relaunched its coffee rewards program with a faster free-drink ladder and a national app-install push targeting morning daypart regulars.",
    whyItMatters: 'A direct threat to morning-daypart loyalty and Loyalty Rewards acquisition. STRATIS detected rising "best coffee rewards app" comparison search — reported as correlation; see the recommended defense.',
    enterprises: ['tim-hortons'] },
  { id: 'news-th-app-loyalty-data', title: 'Loyalty-App Penetration in Canadian QSR Crosses 40% — Frequency Lift Concentrated in Top Quintile',
    source: 'Technomic', date: '2026-05-01', tags: ['macro', 'social'], urgency: 'high', regions: ['national'],
    summary: 'QSR loyalty-app penetration crossed 40% nationally, with the largest visit-frequency lift concentrated among the most engaged members.',
    whyItMatters: 'Confirms that app members drive disproportionate frequency. STRATIS flags the Rewards acquisition flight as the highest-leverage spend in the portfolio for compounding visit frequency.',
    enterprises: ['tim-hortons'] },
  { id: 'news-th-coffee-futures', title: 'Arabica Coffee Futures Ease from Multi-Year Highs as Brazil Harvest Firms',
    source: 'Bloomberg', date: '2026-04-28', tags: ['macro'], urgency: 'medium', regions: ['national'],
    summary: 'Arabica futures eased from multi-year highs on improved Brazilian harvest expectations, relieving input-cost pressure across coffee QSR.',
    whyItMatters: 'A modest margin tailwind that supports value-led messaging in the breakfast routine. Tracked at the brand level; no reallocation required yet.',
    enterprises: ['tim-hortons'] },
  { id: 'news-th-nhl-sponsorship', title: 'ACME Restaurants Renews Grassroots Hockey Programming Ahead of Playoff Co-Viewing Peak',
    source: 'Marketing Magazine', date: '2026-04-23', tags: ['sports', 'sponsorships', 'partnerships'], urgency: 'medium', regions: ['national'],
    summary: 'ACME Restaurants renewed its grassroots hockey programming heading into the national playoff co-viewing window, reinforcing a core brand-equity asset.',
    whyItMatters: 'A brand-equity moment adjacent to the Hot Beverages hero. STRATIS is correlating sponsorship salience against branded search; no media reallocation required.',
    enterprises: ['tim-hortons'] },
];

export const TIM_HORTONS_RADAR_PINS = ['news-th-coldbrew-heatwave', 'news-th-mcdonalds-coffee', 'news-th-app-loyalty-data'];

export const TIM_HORTONS_INSIGHTS: Insight[] = [
  // 1 — SATURATION DETECTED (channel-opt)
  {
    id: 'ins-th-01-saturation', createdAt: todayISO,
    enterprise: 'tim-hortons', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'th-hot-bev',
    channels: ['ctv', 'tiktok', 'spotify'],
    title: 'National CTV Has Hit Saturation on the Hot-Beverage Audience — the Top ~17% of Its Budget Is Driving Almost No Incremental Visits, While the Same Dollars Still Convert on Short-Form and Audio',
    summary: 'Connected TV on the Hot Beverages hero is past the point where more money buys more visits. Its response curve has gone flat: the last ~17% of CTV weight is producing almost no additional redemptions, because the daily-regular audience that responds to TV has already been reached often enough. Short-form video and morning audio, by contrast, are still on the steep part of their curves — every added dollar there still drives visits. A great buyer reads the saturation point off the curve once a quarter; STRATIS watches it continuously and calls it the week CTV flattens. Move the over-saturated tail to the channels that still have room.',
    evidence: [
      'CTV: each extra $100K now drives ~5 incremental visits, down from ~24 earlier in the flight.',
      'About 17% of CTV budget sits past the point where the response curve goes flat.',
      'TikTok and Spotify are still climbing — ~18 and ~13 visits per extra $100K.',
      'CTV frequency on the daily-regular audience has pushed well past the level where TV stops persuading.',
      'STRATIS flags saturation as it happens; a quarterly mix model would book the wasted tail as “working.”',
    ],
    confidence: 0.90,
    impactEstimate: 'Moving the saturated ~17% of national CTV (~$2.1M) into short-form and audio drives roughly the same visits for less, or more visits at the same spend — recovered now, not at the next planning cycle.',
    recommendedAction: 'Pull the saturated top slice of CTV budget and redeploy it to TikTok and Spotify, which still convert at the margin. STRATIS holds each channel against its own saturation point and rebalances as curves move.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Cap CTV at the point its response curve flattens', subtitle: 'THE LAST 17% BUYS ALMOST NOTHING', type: 'budget', completed: false },
      { id: 's2', title: 'Redeploy the freed ~$2.1M to short-form + audio', subtitle: 'CHANNELS STILL ON THE STEEP CURVE', type: 'budget', completed: false },
      { id: 's3', title: 'Watch every channel’s saturation point continuously', subtitle: 'REBALANCE AS THE CURVES MOVE', type: 'scheduling', completed: false },
    ],
  },

  // 2 — MARKETING-MIX ALLOCATION BY EFFICIENCY (channel-opt)
  {
    id: 'ins-th-02-mix-reallocation', createdAt: at(1, '07:03:00'),
    enterprise: 'tim-hortons', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'th-cold-bev',
    channels: ['ctv', 'tiktok', 'instagram', 'facebook', 'spotify', 'ooh'],
    title: 'Three Channels Are Past Their Efficient Point and Three Have Room to Grow — Rebalancing the Summer Mix to Where Each Dollar Works Hardest Frees ~$2.6M at the Same Visit Volume',
    summary: 'The summer budget isn’t split to get the most visits per dollar. Lined up side by side, three channels are funded past the point where they pay back, while three are underfunded and still hungry — the next dollar would do far more good in the second group than it’s doing in the first. Rebalancing toward that efficiency frontier holds total redemptions flat while freeing spend, or grows redemptions at the same budget. This is the mix optimization a strategist does by hand once a quarter; STRATIS holds the frontier live and shows exactly how much to move and where.',
    evidence: [
      'CTV and Facebook are funded ~30% past the point where each dollar pays back.',
      'TikTok, Spotify, and proximity OOH are underfunded with room to grow.',
      'Equalizing the marginal return across channels frees ~$2.6M at today’s visit volume.',
      'No single platform sees this — each reports its own efficiency, not the cross-channel frontier.',
      'The recommended mix is shown as concrete dollar moves, not a directional “lean into short-form.”',
    ],
    confidence: 0.88,
    impactEstimate: 'Rebalancing to the efficiency frontier frees ~$2.6M at flat visit volume, or drives ~8% more redemptions at the same total budget.',
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
    id: 'ins-th-03-audience-efficiency', createdAt: at(1, '07:06:00'),
    enterprise: 'tim-hortons', category: 'audience-overlap', scope: 'division', division: 'tier-2', productLine: 'th-rewards',
    channels: ['tiktok', 'instagram', 'google-search', 'facebook'],
    title: 'App Members and Recently-Lapsed Regulars Convert at 2.4× the Visit-per-Dollar of the Broad Value-Seeker Audience — but They Get Only a Third of the Targeting Budget',
    summary: 'Not every audience is worth the same. The app-member and recently-lapsed-regular segments convert at more than twice the visits per dollar of the broad value-seeker audience — they already know the brand and are one nudge from a visit. But the budget is weighted to the broad audience because it’s bigger and cheaper to reach, so most of the money is chasing the least efficient people. Shifting targeting toward the high-intent segments, and trimming the broad-reach waste, lifts visits without spending more.',
    evidence: [
      'App members + recently-lapsed regulars: ~2.4× the visits per dollar of the broad value-seeker audience.',
      'Those high-intent segments receive only ~33% of acquisition targeting budget today.',
      'The broad value-seeker audience absorbs most of the spend at the weakest conversion.',
      'The efficient segments are reachable through CRM match, app-event audiences, and near-me search intent.',
      'STRATIS ranks every audience by visits per dollar, not by reach or CPM.',
    ],
    confidence: 0.87,
    impactEstimate: 'Reweighting targeting toward the high-intent segments is projected to lift redemptions ~12% at the same spend, by moving dollars off the broad audience’s long inefficient tail.',
    recommendedAction: 'Shift targeting budget into the app-member and recently-lapsed segments and trim the broad-reach tail. STRATIS keeps ranking audiences by visits per dollar and reallocates as efficiency shifts.',
    status: 'new',
    linkedNewsId: 'news-th-app-loyalty-data',
    actionSteps: [
      { id: 's1', title: 'Raise the high-intent segments’ budget share', subtitle: 'FUND THE 2.4× AUDIENCE', type: 'targeting', completed: false },
      { id: 's2', title: 'Trim the broad value-seeker reach tail', subtitle: 'STOP PAYING FOR THE WEAKEST CONVERTERS', type: 'targeting', completed: false },
      { id: 's3', title: 'Rank every audience by visits per dollar', subtitle: 'NOT BY REACH OR IMPRESSIONS', type: 'targeting', completed: false },
    ],
  },

  // 4 — RISING ACQUISITION COST (price war on a few terms)
  {
    id: 'ins-th-04-acquisition-cost-rising', createdAt: at(1, '07:09:00'),
    enterprise: 'tim-hortons', category: 'tactical-efficiency', scope: 'product', productLine: 'th-rewards',
    channels: ['google-search', 'tiktok'],
    title: 'Cost per App Sign-Up Through Search Now Runs ~$8.40 — Up From ~$6.90 Two Weeks Ago — Because a Rival’s App-Install Push Bid Up a Handful of “Coffee Rewards App” Terms',
    summary: 'The cost to acquire a Loyalty Rewards sign-up through search has jumped about 22% in two weeks. It isn’t that the ads got worse — sign-up rate is flat. It’s a price war: after a global QSR rival relaunched its rewards program with a national app-install push, more advertisers piled onto a small cluster of “coffee rewards app” and “best rewards app” terms and bid the price up. So the fix is surgical — cap the bids on that handful of terms — not a blunt cut to the whole search program. A quarterly model would catch this about six weeks from now; STRATIS flagged it the day the cost crossed the line, with the cause attached.',
    evidence: [
      'Cost per app sign-up via search: ~$8.40, up from ~$6.90 two weeks ago.',
      'Sign-up rate is flat — this is a rising-price problem, not a creative problem.',
      'The increase traces to a small cluster of rewards-app comparison terms, not the whole account.',
      'Capping bids on those terms restores the cost without touching the rest of the program.',
      'STRATIS catches it the day the cost crosses the line; a quarterly model lags ~6 weeks.',
    ],
    confidence: 0.86,
    impactEstimate: 'Capping bids on the over-heated terms brings the cost per sign-up back under ~$6.90 within days, recovering roughly $0.6M a quarter currently lost to the price war.',
    recommendedAction: 'Cap bids on the small cluster of rewards-app terms driving the increase, rather than cutting the whole search budget. STRATIS watches the cost per sign-up continuously and alerts on the next crossing.',
    status: 'new',
    linkedNewsId: 'news-th-mcdonalds-coffee',
    actionSteps: [
      { id: 's1', title: 'Pinpoint the comparison terms driving the spike', subtitle: 'A HANDFUL OF TERMS, NOT THE ACCOUNT', type: 'targeting', completed: false },
      { id: 's2', title: 'Cap their bids to restore the cost per sign-up', subtitle: 'SURGICAL, NOT A PROGRAM-WIDE CUT', type: 'bidding', completed: false },
      { id: 's3', title: 'Alert the moment cost crosses the line', subtitle: 'DON’T WAIT FOR THE QUARTERLY MODEL', type: 'scheduling', completed: false },
    ],
  },

  // 5 — PRICE OF REACH UP, RESULTS FLAT
  {
    id: 'ins-th-05-price-of-reach', createdAt: at(1, '07:12:00'),
    enterprise: 'tim-hortons', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'th-hot-bev',
    channels: ['ctv', 'spotify', 'instagram', 'ooh'],
    title: 'The Price of Reach on Connected TV Has Climbed Three Weeks Straight While Visits Held Flat — We’re Paying More for the Same Result and the Budget Hasn’t Reacted',
    summary: 'Connected TV is getting more expensive to buy — the price of reaching a thousand people is up about 22% over three weeks — but it isn’t driving any more visits. We’re simply paying more for the same result, and the budget hasn’t moved to reflect it. STRATIS watches cost against result by channel every week, so it caught the gap as it opened rather than at the end of a monthly report. The move is a straightforward, reversible shift away from a channel that quietly got pricier toward channels still beating their benchmark.',
    evidence: [
      'CTV price of reach: up ~22% over three weeks.',
      'CTV-attributed visits over the same window: flat — more money, same result.',
      'CTV budget weight: unchanged since the price climb began.',
      'Morning audio and proximity OOH are currently beating their benchmark — reversible targets.',
      'The shift fully reverses the moment CTV pricing normalizes.',
    ],
    confidence: 0.84,
    impactEstimate: 'Trimming the now-overpriced CTV share back to its efficient run-rate and redeploying it stops the climb in cost per visit; fully reversible if CTV pricing comes back down.',
    recommendedAction: 'Trim the overpriced CTV share and redeploy to channels still beating their benchmark; STRATIS reverses the move automatically if CTV pricing normalizes.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Reduce CTV weight to its efficient run-rate', subtitle: 'REVERSIBLE', type: 'budget', completed: false },
      { id: 's2', title: 'Redeploy to channels beating their benchmark', subtitle: 'MORNING AUDIO + PROXIMITY OOH', type: 'budget', completed: false },
      { id: 's3', title: 'Alert when cost and visits drift apart', subtitle: 'STRATIS WATCHES WEEKLY', type: 'scheduling', completed: false },
    ],
  },

  // 6 — GEOGRAPHIC EFFICIENCY
  {
    id: 'ins-th-06-geo-efficiency', createdAt: at(1, '07:15:00'),
    enterprise: 'tim-hortons', category: 'national-regional', scope: 'division', division: 'tier-2', productLine: 'th-cold-bev',
    channels: ['ctv', 'tiktok', 'ooh'],
    title: 'A Quarter of Cold-Beverage Spend Is Going to Markets Redeeming 30% Below Average — the Media Map and the Demand Map Don’t Match',
    summary: 'Where the money goes and where it works have drifted apart. About a quarter of cold-beverage spend is landing in markets that redeem roughly 30% below the national average, while several high-redemption markets are underfunded. The plan is weighted to population and last year’s buys, not to where media actually converts to visits today. Re-weighting the geographic plan toward the markets that redeem — and pulling back from the ones that don’t — lifts visits without adding budget.',
    evidence: [
      '~25% of cold-bev spend sits in markets redeeming ~30% below the national average.',
      'Several high-redemption markets are underfunded relative to the demand they show.',
      'Spend tracks population and last year’s plan, not current redemption.',
      'Re-weighting to redemption is a pure reallocation — no new budget required.',
      'STRATIS scores every market on what media actually returns in visits, refreshed continuously.',
    ],
    confidence: 0.85,
    impactEstimate: 'Re-weighting the geo plan toward redeeming markets is projected to lift visits ~10% at flat spend by moving money off the weakest markets.',
    recommendedAction: 'Shift cold-bev weight out of the low-redemption markets into the high-redemption ones the plan currently underfunds. STRATIS re-scores markets continuously and flags drift.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Pull weight from markets redeeming below average', subtitle: 'STOP FUNDING POPULATION OVER DEMAND', type: 'budget', completed: false },
      { id: 's2', title: 'Fund the high-redemption markets that are starved', subtitle: 'MATCH SPEND TO WHERE IT WORKS', type: 'budget', completed: false },
      { id: 's3', title: 'Re-score every market continuously', subtitle: 'KEEP THE MAP AND THE PLAN ALIGNED', type: 'targeting', completed: false },
    ],
  },

  // 7 — ACCESS FRICTION (drive-thru throughput / store density)
  {
    id: 'ins-th-07-access-friction', createdAt: at(1, '07:18:00'),
    enterprise: 'tim-hortons', category: 'national-regional', scope: 'brand',
    channels: ['google-search', 'ooh', 'instagram'],
    title: 'In Trade Areas With the Longest Drive-Thru Waits and Thinnest Store Density, the Same Ads Convert 34% Fewer Visits — We’re Still Spending Into the Bottleneck',
    summary: 'Media performance is being dragged down by something that has nothing to do with the media. In trade areas where the drive-thru wait is longest and the nearest restaurant is farthest, the exact same ads convert about 34% fewer visits — the demand is there, but it can’t clear the throughput. Today the plan allocates on reach efficiency alone, pouring budget into trade areas where the visit stalls at the line. Weighting spend to where throughput can absorb it, and routing the operations fix into the worst bottlenecks first, turns wasted impressions into actual visits.',
    evidence: [
      'Longest-wait / lowest-density trade areas convert the same creative ~34% fewer visits than easy-access ones.',
      'Spend tracks reach efficiency, not throughput — so money flows where the visit stalls.',
      '~$1.8M a year is going to the highest-friction trade areas.',
      'Easy-access trade areas return ~1.5× the visits at equal spend.',
      'STRATIS joins drive-thru wait and store-density data to media performance — a link no media report sees.',
    ],
    confidence: 0.85,
    impactEstimate: 'Weighting the plan to throughput and clearing the worst bottlenecks before reinvesting is projected to lift the return on media ~18% at flat spend.',
    recommendedAction: 'Add a throughput weight to the budget model, pull spend from the highest-friction trade areas, and route the operations fix to the worst bottlenecks before reinvesting. STRATIS keeps the throughput-to-media link live.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Add a drive-thru-throughput weight to the model', subtitle: 'DON’T ALLOCATE ON REACH ALONE', type: 'bidding', completed: false },
      { id: 's2', title: 'Pull spend from the highest-friction trade areas', subtitle: 'WHERE THE VISIT STALLS AT THE LINE', type: 'budget', completed: false },
      { id: 's3', title: 'Route the ops fix to the worst bottlenecks first', subtitle: 'CLEAR THE LINE BEFORE REINVESTING', type: 'targeting', completed: false },
    ],
  },

  // 8 — CREATIVE WINNER STARVED
  {
    id: 'ins-th-08-creative-winner', createdAt: at(1, '07:21:00'),
    enterprise: 'tim-hortons', category: 'creative-performance', scope: 'division', division: 'tier-1', productLine: 'th-breakfast',
    channels: ['ooh', 'google-search', 'facebook', 'ctv'],
    title: 'One “Here’s the Whole Combo Price” Value Ad Is Driving Visits at 1.6× the Rate of the Main Brand Spot — but It’s Only Getting 13% of the Views',
    summary: 'Ranked by how many visits each ad actually drove — not by last click — the price-clarity value execution is the clear winner, converting at about 1.6× the rate of the brand hero it runs beside, strongest at the point of decision in the morning. But it’s starved: it gets only ~13% of views because delivery defaults to the brand hero. With coffee input costs easing, the value story it tells is durable, not a one-week promo — so this is a win you can capture for free: give the proven ad more of the views, then make more like it.',
    evidence: [
      'The “whole combo price” value ad converts at ~1.6× the rate of the brand hero beside it.',
      'It holds only ~13% of views — delivery defaults to the brand hero.',
      'It’s strongest in the morning decision window, where value is the last hurdle.',
      'The edge repeats across independent markets — not a one-market fluke.',
      'Measured on visits driven, not last click; easing input costs make the value edge durable.',
    ],
    confidence: 0.88,
    impactEstimate: 'Giving the proven ad more of the views lifts the overall visit rate at no production cost — and tells the creative team exactly what to make more of.',
    recommendedAction: 'Shift views from the brand hero to the winning value ad at OOH, point of decision, and in search, and brief the agency to extend the winning idea. STRATIS keeps ranking creative by visits driven.',
    status: 'new',
    linkedNewsId: 'news-th-coffee-futures',
    actionSteps: [
      { id: 's1', title: 'Rank creative by visits driven', subtitle: 'NOT BY LAST CLICK', type: 'creative', completed: false },
      { id: 's2', title: 'Give the proven value ad more of the views', subtitle: 'FREE GAIN — NO NEW PRODUCTION', type: 'creative', completed: false },
      { id: 's3', title: 'Brief the agency to make more like the winner', subtitle: 'PROVEN IDEA → MORE OF IT', type: 'creative', completed: false },
    ],
  },

  // 9 — CREATIVE FATIGUE: wear, not delivery
  {
    id: 'ins-th-09-creative-fatigue', createdAt: at(1, '07:24:00'),
    enterprise: 'tim-hortons', category: 'creative-performance', scope: 'division', division: 'tier-1', productLine: 'th-hot-bev',
    channels: ['ctv', 'facebook'],
    title: 'The “It’s ACME Time” Hero Spot Has Lost ~19% of Its Pull in Three Weeks at the Same Spend — That’s Creative Wear-Out, Not a Delivery Problem, So the Fix Is a Refresh',
    summary: 'The flagship hot-beverage spot is tiring out. Its pull with the daily-regular audience is down about 19% over three weeks even though spend and audience haven’t changed. The instinct is to blame the buy, but the pattern says otherwise: people are simply seeing it too many times — response drops with each extra viewing while a fresher cut running beside it holds steady. That’s creative wear-out, and the fix is a refresh, not a change to the media. Spending the cycle re-tuning delivery would fix nothing. STRATIS calls the cause and flags the refresh window before the decay starts costing real visits.',
    evidence: [
      '“It’s ACME Time” pull is down ~19% over three weeks at flat spend and a steady audience.',
      'Response drops with each additional viewing — the fingerprint of wear-out, not delivery.',
      'A fresher cut running beside it is holding steady, ruling out a market-wide delivery shift.',
      'Two lower-frequency cuts out-perform per viewing but get only ~10% of delivery.',
      'STRATIS separates wear-out from delivery so the team doesn’t fix the wrong thing.',
    ],
    confidence: 0.90,
    impactEstimate: 'Refreshing the worn spot before the decay deepens is projected to improve the cost per visit ~16%, and avoids a wasted delivery change that wouldn’t have fixed wear-out.',
    recommendedAction: 'Treat it as wear-out: cap the tired spot’s delivery, promote the two best fresh cuts, and brief a new execution for the over-exposed regulars. STRATIS confirms the cause and flags the refresh window.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Confirm wear-out before changing anything', subtitle: 'IT’S FREQUENCY, NOT THE BUY', type: 'creative', completed: false },
      { id: 's2', title: 'Cap the tired spot, promote the fresh cuts', subtitle: 'REFRESH, DON’T RE-TUNE DELIVERY', type: 'creative', completed: false },
      { id: 's3', title: 'Brief a new execution for the worn-out regulars', subtitle: 'BEFORE IT COSTS REAL VISITS', type: 'creative', completed: false },
    ],
  },

  // 10 — FREQUENCY COLLISION
  {
    id: 'ins-th-10-frequency-collision', createdAt: at(1, '07:27:00'),
    enterprise: 'tim-hortons', category: 'audience-overlap', scope: 'brand',
    channels: ['ctv', 'facebook', 'instagram', 'spotify'],
    title: 'The Average Daily Regular Is Seeing an ACME Restaurants Ad 19 Times a Week Across TV, Social, Audio, and OOH — More Than Double What Actually Drives a Visit',
    summary: 'Each campaign caps how often it shows an ad, but nobody caps across all of them at once. When you follow a single daily regular across TV, social, audio, and OOH, the average regular is seeing ACME about 19 times a week — more than double the ~8–10 range where extra exposure stops driving visits and starts annoying. The over-exposure is invisible to any one team because each only sees its own delivery; it only shows up when every flight is matched to the same person. One cap across everything pulls exposure back to the effective range and frees the wasted impressions for lapsed and value-seeker audiences the brand is barely reaching.',
    evidence: [
      'Matched to the person across four media: ~19 ads a week to the average daily regular.',
      'No single channel goes above ~6 a week — the pile-up only shows up when you combine them.',
      'Extra exposure stops driving visits past ~8–10 a week for this audience.',
      'About 21% of impressions land above that line — roughly $2.0M a year of waste.',
      'The waste is also burning out the hero spot faster in the over-exposed group.',
    ],
    confidence: 0.92,
    impactEstimate: 'One cap across all flights pulls weekly exposure back to the effective range and moves ~$2.0M of wasted impressions to lapsed and value-seeker audiences — lifting net reach ~13% with no extra spend.',
    recommendedAction: 'Set a single ~10-per-week cap across every ACME Restaurants flight and move the recovered budget to under-reached lapsed and value-seeker audiences. STRATIS matches audiences across flights and enforces the cap continuously.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Set one ~10/week cap across all flights', subtitle: 'NOT PER-CAMPAIGN — ACROSS EVERYTHING', type: 'bidding', completed: false },
      { id: 's2', title: 'Move the savings to under-reached audiences', subtitle: 'LAPSED + VALUE-SEEKERS', type: 'budget', completed: false },
      { id: 's3', title: 'Enforce the combined cap continuously', subtitle: 'STRATIS MATCHES ACROSS FLIGHTS', type: 'scheduling', completed: false },
    ],
  },

  // 11 — COMPETITIVE OPPORTUNITY: conquest lane reopens
  {
    id: 'ins-th-11-conquest-opportunity', createdAt: at(1, '07:30:00'),
    enterprise: 'tim-hortons', category: 'competitive-macro', scope: 'brand',
    channels: ['google-search', 'ooh', 'ctv'],
    title: 'A Burger-Led QSR Rival Pulled Its Breakfast-Daypart Media ~35% After Its Promo Cycle Ended — the Morning Value Lane Just Opened, and It’s Cheaper Than It’s Been All Year',
    summary: 'Two things happened at once that add up to an opening, not a threat. As a burger-led QSR rival rotated its budget into a coffee-rewards push, it pulled its breakfast-daypart media back about 35%, and “breakfast deal near me” and morning-value search rose about three times as much. The cost to show up against those searches has dropped below where it’s been all year. Our Breakfast value flight is only putting a small share of budget into the morning value lane, and the combo-price message isn’t leading in search. The lane is open, cheap, and uncontested — but only while the rival is out.',
    evidence: [
      'Morning-value search up ~210% as the rival rotated out of the breakfast daypart.',
      'The rival cut its breakfast-daypart media ~35% — the morning auction is the cheapest it’s been all year.',
      'Our Breakfast flight holds only a small share of budget in the morning value lane.',
      'The combo-price value message isn’t leading in search at the decision moment.',
      'STRATIS reads the rival’s retreat and the interest spike together and calls it an opening.',
    ],
    confidence: 0.83,
    impactEstimate: 'Surging the morning value lane while it’s cheap and interest is leading is projected to capture ~$3.4M a year of incremental breakfast visits, at a lower cost per visit than any point last year.',
    recommendedAction: 'Surge morning-value search and OOH in the breakfast daypart and put the combo-price message live now, while the rival is out and costs are low. STRATIS holds the lane and alerts if the rival returns.',
    status: 'new',
    linkedNewsId: 'news-th-mcdonalds-coffee',
    actionSteps: [
      { id: 's1', title: 'Raise morning-value search budget while cheap', subtitle: 'WHILE THE AUCTION IS OPEN', type: 'budget', completed: false },
      { id: 's2', title: 'Put the combo-price message live in search', subtitle: 'WALK THROUGH THE OPEN DOOR', type: 'creative', completed: false },
      { id: 's3', title: 'Alert if the rival re-enters the daypart', subtitle: 'STRATIS HOLDS THE LANE', type: 'scheduling', completed: false },
    ],
  },

  // 12 — TIER CHOREOGRAPHY: national flight → local pull-through
  {
    id: 'ins-th-12-pull-through', createdAt: at(1, '07:33:00'),
    enterprise: 'tim-hortons', category: 'tier-choreography', scope: 'brand',
    channels: ['ctv', 'google-search', 'instagram'],
    title: 'Every Time a National LTO Flight Runs, “ACME Near Me” Search and App Opens Spike in Those Markets 6 Days Later — but the Local Store and App Pushes Aren’t Lined Up to That Window',
    summary: 'The national and local sides of the plan are out of sync. In markets with a heavy national LTO or brand-TV flight (Tier 1), “ACME near me” search and app opens show a clear bump about six days later — people are carrying the national prompt toward a nearby visit. But local store marketing and app push notifications (Tier 3) run on a different calendar than the national flights, so the local offer and the app nudge usually land outside that six-day window when intent is already cooling. The fix is timing, not more money — fire the local-and-app touch into the window the national flight already created.',
    evidence: [
      '“ACME near me” search and app opens peak about six days after a national LTO/brand flight in the same market.',
      'Heavy-national markets see ~26% more near-me search than light-national markets.',
      'Local store and app-push calendars aren’t aligned to the national flight calendar — they run in separate systems.',
      'A national-prompted near-me search converts ~2.0× better when a local/app touch lands inside the window.',
      'Only a view across both tiers sees the six-day handoff — neither team sees it alone.',
    ],
    confidence: 0.86,
    impactEstimate: 'Timing the local and app touch to the six-day window is projected to lift visits ~8–11% in aligned markets — with no extra media spend.',
    recommendedAction: 'Trigger local store offers and app pushes to fire 5–8 days after each national flight by market. STRATIS pushes the national flight calendar into the local and CRM systems so the window is hit by default.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Feed the national flight calendar into local + CRM', subtitle: 'ONE CALENDAR, NOT TWO', type: 'scheduling', completed: false },
      { id: 's2', title: 'Time the local + app touch to the 5–8 day window', subtitle: 'HIT THE HANDOFF', type: 'scheduling', completed: false },
      { id: 's3', title: 'Compare aligned vs unaligned markets for six weeks', subtitle: 'PROVE THE LIFT', type: 'targeting', completed: false },
    ],
  },

  // 13 — AUDIENCE MIGRATION (Facebook → TikTok)
  {
    id: 'ins-th-13-audience-migration', createdAt: at(1, '07:36:00'),
    enterprise: 'tim-hortons', category: 'tactical-efficiency', scope: 'division', division: 'tier-2', productLine: 'th-cold-bev',
    channels: ['facebook', 'tiktok', 'instagram'],
    title: 'Move the Younger Cold-Brew Budget From Facebook to TikTok — the Under-30 Audience That Made Facebook Efficient Last Year Has Moved to TikTok, Where They Now Convert ~40% Cheaper',
    summary: 'The younger cold-beverage audience that made Facebook pay off last year has shifted where it spends its attention. That conversation has largely moved to TikTok (food creators and Reels-style discovery), and the same people now respond there at a much lower cost, while Facebook’s cost to drive a younger redemption has climbed as the active audience thinned out. This is an audience-migration call: follow the people, not the plan. STRATIS tracks where an audience actually converts across platforms week to week, so it catches the shift while it’s happening.',
    evidence: [
      'Cost to drive a younger cold-bev redemption: up ~44% on Facebook over the quarter, while TikTok is ~40% cheaper for the same audience.',
      'The active under-30 audience on Facebook has shrunk; the same users now show up and convert on TikTok.',
      'Facebook still works for the family and value-seeker audience — this move is the younger slice only, not all of Facebook.',
      'TikTok younger-audience delivery has headroom; it isn’t yet saturated for this segment.',
      'Only a cross-platform view catches this — each platform’s own report looks “fine” in isolation.',
    ],
    confidence: 0.85,
    impactEstimate: 'Moving the younger slice from Facebook to TikTok is projected to lift younger-audience redemptions ~12% at flat spend, by following the audience to where it now converts.',
    recommendedAction: 'Shift the younger cold-brew budget from Facebook to TikTok, keep only the Facebook audiences still working for families and value-seekers, and let STRATIS keep watching where the audience converts.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move the younger budget from Facebook to TikTok', subtitle: 'FOLLOW THE AUDIENCE', type: 'budget', completed: false },
      { id: 's2', title: 'Keep only the Facebook audiences still converting', subtitle: 'FAMILIES + VALUE, NOT UNDER-30', type: 'targeting', completed: false },
      { id: 's3', title: 'Watch where the audience converts week to week', subtitle: 'STRATIS TRACKS THE MIGRATION', type: 'scheduling', completed: false },
    ],
  },

  // 14 — DISCOVERY / INTENT (cold social → near-me search intent)
  {
    id: 'ins-th-14-discovery-intent', createdAt: at(1, '07:39:00'),
    enterprise: 'tim-hortons', category: 'tactical-efficiency', scope: 'division', division: 'tier-2', productLine: 'th-rewards',
    channels: ['facebook', 'google-search', 'instagram'],
    title: 'Shift a Slice of Cold Social Prospecting Into Near-Me Search — People Already Looking for “Coffee / Breakfast Near Me” Sign Up to Rewards at About a Third of Cold Social’s Cost',
    summary: 'Search is where intent already lives, and a real share of the prospect audience is there actively looking for “coffee near me,” “breakfast deals,” and “rewards app.” Because they arrive with intent, they convert to a Rewards sign-up at roughly a third of the cost of cold prospecting on social. Social is still the right tool for re-engaging people who already know the brand — but the top-of-funnel prospecting dollar works far harder on near-me and deal search, and today that lane gets almost none of it.',
    evidence: [
      'Cost per Rewards sign-up: ~$2.90 on near-me / deal search vs ~$8.60 for cold social prospecting.',
      'These prospects arrive already searching for a visit — intent, not interruption.',
      'Intent search holds a low single-digit share of prospecting budget today despite the efficiency.',
      'Keep social for retargeting known visitors — this moves the cold prospecting dollar only.',
      'STRATIS compares cost per sign-up across surfaces, not each platform’s own metric.',
    ],
    confidence: 0.84,
    impactEstimate: 'Moving a slice of cold social prospecting into near-me/deal search is projected to cut the blended cost of a Rewards sign-up ~22% and free spend for retargeting where social is strongest.',
    recommendedAction: 'Shift cold prospecting budget from social into near-me and deal search, and keep social focused on retargeting known visitors. STRATIS holds the cross-surface efficiency comparison live.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move cold prospecting from social to intent search', subtitle: 'BUY INTENT, NOT INTERRUPTION', type: 'budget', completed: false },
      { id: 's2', title: 'Keep social on retargeting known visitors', subtitle: 'WHERE SOCIAL STILL WINS', type: 'targeting', completed: false },
      { id: 's3', title: 'Compare cost per sign-up across surfaces', subtitle: 'NOT EACH PLATFORM’S OWN METRIC', type: 'scheduling', completed: false },
    ],
  },

  // 15 — SUPPLY PATH (open exchange → curated TTD deals)
  {
    id: 'ins-th-15-supply-path', createdAt: at(1, '07:42:00'),
    enterprise: 'tim-hortons', category: 'tactical-efficiency', scope: 'division', division: 'tier-2', productLine: 'th-rewards',
    channels: ['ttd'],
    title: 'Pull Mid-Funnel Display Out of the Open Exchange and Into Curated Deals on The Trade Desk — Same Audience, ~28% Less Waste, and Ads Stop Landing Next to the Wrong Content',
    summary: 'A large share of programmatic display is still running through the open exchange, where about 28% of every dollar disappears into low-quality, never-seen, or off-target inventory — and ads sometimes land next to content the brand can’t be near. Moving that money into curated private deals on The Trade Desk — food, sports, and local-news inventory bought directly — reaches the same audience with far less waste and clean, on-topic adjacency. Same audience, more of the dollar actually working.',
    evidence: [
      'About 28% of open-exchange spend is lost to unviewable, low-quality, or off-target inventory.',
      'Curated private deals on The Trade Desk reach the same audience with verified placement.',
      'Open-exchange viewability runs well below the curated-deal benchmark.',
      'Private deals also remove the brand-safety risk of unknown adjacency.',
      'STRATIS reads delivered quality, not just the buying platform’s reported impressions.',
    ],
    confidence: 0.87,
    impactEstimate: 'Moving mid-funnel display from the open exchange into curated Trade Desk deals recovers ~28% of that spend into working impressions — roughly $0.8M a year at the same audience and reach.',
    recommendedAction: 'Shift mid-funnel display out of the open exchange into curated private deals on The Trade Desk. STRATIS keeps scoring delivered quality and flags waste as it reappears.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move display from open exchange to curated deals', subtitle: 'SAME AUDIENCE, LESS WASTE', type: 'budget', completed: false },
      { id: 's2', title: 'Hold delivery to verified, on-topic inventory', subtitle: 'BRAND-SAFE ADJACENCY', type: 'targeting', completed: false },
      { id: 's3', title: 'Score delivered quality, not reported impressions', subtitle: 'STRATIS WATCHES THE SUPPLY PATH', type: 'scheduling', completed: false },
    ],
  },

  // 16 — REACH CAP → net-new reach
  {
    id: 'ins-th-16-reach-cap', createdAt: at(1, '07:45:00'),
    enterprise: 'tim-hortons', category: 'tactical-efficiency', scope: 'division', division: 'tier-2', productLine: 'th-cold-bev',
    channels: ['tiktok', 'ttd'],
    title: 'TikTok Has Reached Almost Everyone It Can in the Younger Cold-Bev Audience — the Next Reach Dollar Belongs on The Trade Desk, Where There Are Still New People to Find',
    summary: 'TikTok has done its job and hit its ceiling: it has now delivered to nearly everyone reachable in the under-30 cold-beverage audience, so each additional TikTok dollar just adds repeat views to the same people instead of finding new ones. The Trade Desk still has real net-new reach into that same audience at a similar cost. This is different from cutting a channel for being inefficient — TikTok is efficient, it’s simply out of new people. Cap it at its reach ceiling and put the next reach dollar where new people still exist to convert.',
    evidence: [
      'TikTok’s unique reach in this audience has flattened — added spend now adds frequency, not new people.',
      'The Trade Desk still reaches net-new people in the same audience at a similar cost.',
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
      { id: 's2', title: 'Move the overflow to The Trade Desk', subtitle: 'FIND PEOPLE, NOT FREQUENCY', type: 'budget', completed: false },
      { id: 's3', title: 'Watch each platform’s reach ceiling', subtitle: 'REDIRECT THE OVERFLOW', type: 'scheduling', completed: false },
    ],
  },

  // 17 — COMPETITIVE AUCTION PRESSURE
  {
    id: 'ins-th-17-auction-pressure', createdAt: at(1, '07:48:00'),
    enterprise: 'tim-hortons', category: 'tactical-efficiency', scope: 'division', division: 'tier-1', productLine: 'th-cold-bev',
    channels: ['facebook', 'instagram', 'tiktok', 'spotify'],
    title: 'A Rival’s Summer Push Crowded the Meta Auction — Our Cost to Reach the Cold-Bev Audience There Jumped ~30%; TikTok and Audio Are Uncontested and Cheaper Right Now',
    summary: 'Nothing changed on our side, but reaching the cold-beverage audience on Meta suddenly costs about 30% more — a rival’s summer campaign flooded the same audience and bid the auction up. TikTok and Spotify, where that rival isn’t active, are reaching the same kinds of people at last quarter’s prices. The smart move is temporary and reversible: shift a portion of Meta reach to the uncontested platforms while the auction is hot, and shift it back when the rival’s flight ends. Paying the inflated Meta price for reach we can get cheaper elsewhere is the avoidable cost.',
    evidence: [
      'Meta cost to reach the cold-bev audience is up ~30% with no change in our targeting or creative.',
      'The increase lines up exactly with a rival’s summer flight on the same audience.',
      'TikTok and Spotify, where the rival isn’t bidding, are still at last quarter’s cost.',
      'The shift is temporary and reversible — move it back when the rival’s flight ends.',
      'STRATIS ties the cost spike to the rival’s entry, so the cause is clear, not guessed.',
    ],
    confidence: 0.83,
    impactEstimate: 'Temporarily moving the inflated share of Meta reach to TikTok and audio avoids the ~30% auction premium — protecting reach efficiency until the rival’s flight ends, then reversing.',
    recommendedAction: 'Shift a portion of Meta reach to TikTok and Spotify while the rival has the Meta auction crowded, and move it back when their flight ends. STRATIS alerts when the auction normalizes.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Move the inflated Meta reach to TikTok + audio', subtitle: 'DON’T PAY THE AUCTION PREMIUM', type: 'budget', completed: false },
      { id: 's2', title: 'Keep the shift temporary and reversible', subtitle: 'MOVE BACK WHEN THEY STOP', type: 'budget', completed: false },
      { id: 's3', title: 'Alert when the Meta auction normalizes', subtitle: 'STRATIS WATCHES THE COMPETITOR', type: 'scheduling', completed: false },
    ],
  },

  // ───────────── CROSS-REGION INTELLIGENCE ─────────────
  // ACME Restaurants runs nationally across distinct provincial markets, so a play
  // proven in one province is a tested, ready-to-port move for another — surfaced and
  // quantified across markets no single regional report sees.

  // XR1 — CREATIVE TRANSFER: value cold-bev creative, Quebec → Ontario
  {
    id: 'ins-th-xr1-creative-transfer', createdAt: at(1, '07:51:00'),
    enterprise: 'tim-hortons', category: 'cross-region', scope: 'brand', productLine: 'th-cold-bev',
    channels: ['ctv', 'tiktok', 'instagram', 'ooh'],
    title: 'The “Summer Value Combo” Cold-Bev Creative Is Converting 1.5× the National Hero — in Quebec — and Ontario Has the Same Heat-Driven Value Story Sitting Untapped',
    summary: 'The same value idea wins in two markets, but it’s only deployed in one. In Quebec, the value-combo cold-beverage execution — “here’s the whole iced combo for one price” — is converting at about 1.5× the national hero on the identical metric, where value is the last hurdle before a visit. Ontario now has the same story to tell: with a hotter-than-average summer arriving there first, cold-bev demand is climbing and value pressure is high, yet Ontario delivery still leads with the national hero and the value creative holds a thin share of views. This is the cleanest cross-region transfer STRATIS sees — a creative proven on the same conversion metric in one province, with a weather tailwind that just made it true in the other. Port the asset, don’t re-test it from zero.',
    evidence: [
      'Quebec: the value-combo cold-bev creative converts ~1.5× the national hero on the same metric.',
      'The edge holds across Quebec markets — not a single-market fluke.',
      'Ontario: a hotter-than-average summer is arriving first, lifting cold-bev demand and value sensitivity.',
      'Ontario delivery still defaults to the national hero; the value creative holds a thin share of views.',
      'STRATIS correlates creative performance on a common conversion metric across provinces — no single market’s report sees the other.',
    ],
    confidence: 0.88,
    impactEstimate: 'Porting the proven Quebec value creative into Ontario — where the heat tailwind makes the value story land — is projected to lift Ontario cold-bev visit rate ~13% at no incremental production cost, capturing a win already validated in-market.',
    recommendedAction: 'Adapt and ship the Quebec value-combo creative into the Ontario cold-bev mix under the summer-value message, give it real share of views against the national hero, and let STRATIS keep matching creative performance across provinces to surface the next portable asset.',
    status: 'new',
    linkedNewsId: 'news-th-coldbrew-heatwave',
    actionSteps: [
      { id: 's1', title: 'Port the Quebec value creative into Ontario', subtitle: 'PROVEN THERE, NOW TRUE HERE WITH THE HEAT', type: 'creative', completed: false },
      { id: 's2', title: 'Give it real share of views vs the national hero', subtitle: 'DON’T LET DELIVERY DEFAULT BACK', type: 'creative', completed: false },
      { id: 's3', title: 'Match creative performance across provinces', subtitle: 'STRATIS SURFACES THE NEXT PORTABLE WIN', type: 'creative', completed: false },
    ],
  },

  // XR2 — LEADING INDICATOR: Ontario CTV saturation predicts BC ~5 weeks out
  {
    id: 'ins-th-xr2-leading-indicator', createdAt: at(1, '07:54:00'),
    enterprise: 'tim-hortons', category: 'cross-region', scope: 'brand', productLine: 'th-cold-bev',
    channels: ['ctv', 'tiktok', 'spotify'],
    title: 'BC’s Cold-Bev CTV Curve Is Tracing the Exact Ontario Marginal-Visit Decay From Five Weeks Ago — Cap BC Connected TV Now, Before the Same ~$1.4M of Waste Lands',
    summary: 'One province is now a five-week early warning for the other. The Ontario cold-bev CTV response curve flattened earlier this summer — marginal visits-per-dollar decayed into the floor as the audience hit saturation. STRATIS has now detected the identical decay shape forming in BC, running about five weeks behind Ontario, week-for-week. This isn’t a vague “watch the West” note: it’s the same marginal-visit curve, same inflection, same audience-saturation fingerprint, on a lag. Because Ontario already showed where this ends, BC doesn’t have to spend its way to the same dead weight — cap BC CTV at the inflection the Ontario curve already mapped, before the waste arrives rather than after.',
    evidence: [
      'Ontario cold-bev CTV marginal visits decayed to the floor ~5 weeks ago as the audience saturated.',
      'BC cold-bev CTV is now tracing the identical decay shape, lagging Ontario by ~5 weeks week-for-week.',
      'The curves overlay almost exactly once shifted by five weeks — same inflection, same saturation fingerprint.',
      'BC budget hasn’t reacted — it’s funded toward the same flat tail Ontario already proved is dead weight.',
      'STRATIS aligns marginal-visit curves across provinces on a lag, turning one market into a leading indicator for the next.',
    ],
    confidence: 0.86,
    impactEstimate: 'Capping BC CTV at the inflection the Ontario curve already mapped avoids an estimated ~$1.4M of saturated BC spend before it lands — pre-empting the waste rather than booking it and reallocating after the fact.',
    recommendedAction: 'Treat the Ontario CTV decay as BC’s forward map: cap BC CTV at the Ontario-proven inflection point now and redeploy the freed budget into BC short-form and audio, which still convert at the margin. STRATIS keeps the lagged cross-province curve live and alerts as BC approaches the line.',
    status: 'new',
    actionSteps: [
      { id: 's1', title: 'Cap BC CTV at the Ontario-proven inflection point', subtitle: 'FIVE WEEKS AHEAD OF THE WASTE', type: 'budget', completed: false },
      { id: 's2', title: 'Redeploy freed BC budget to short-form + audio', subtitle: 'STILL ON THE STEEP CURVE THERE', type: 'budget', completed: false },
      { id: 's3', title: 'Hold the lagged cross-province curve live', subtitle: 'ONTARIO PREDICTS BC BY ~5 WEEKS', type: 'scheduling', completed: false },
    ],
  },

  // XR3 — DEMAND CORRELATION: Ontario heat→cold-bev demand now climbing in the Prairies
  {
    id: 'ins-th-xr3-demand-correlation', createdAt: at(1, '07:57:00'),
    enterprise: 'tim-hortons', category: 'cross-region', scope: 'brand', productLine: 'th-cold-bev',
    channels: ['google-search', 'ctv', 'tiktok'],
    title: 'The Heat-Driven Cold-Bev Demand Surge That Led Ontario Visits by Three Weeks Is Now Climbing the Same Curve in the Prairies — Fund Cold-Bev There Ahead of the Proven Demand',
    summary: 'A demand signal that already paid out in one region is now repeating in another, early enough to get ahead of. In Ontario, a rise in temperature and “iced / cold brew near me” search reliably led the cold-bev visit lift by about three weeks; the search-and-heat curve was the tell, and the weight that funded into it captured the demand. STRATIS now sees that same share-of-search-and-heat curve climbing in the Prairies, currently at the point Ontario sat roughly three weeks before its visit inflection. The correlation is the same shape on the same occasion; the only difference is timing. Fund cold-bev media and pace weight in the Prairies now, ahead of the proven curve — not after the visit lift shows up in a report.',
    evidence: [
      'Ontario: heat + cold-bev search led the visit lift by ~3 weeks — search and temperature were the leading indicator.',
      'Prairies: the same heat-and-search curve is now climbing, at the point Ontario sat ~3 weeks pre-inflection.',
      'The two curves overlay on the same occasion once aligned by the lag — same shape, different clock.',
      'Prairies cold-bev weight is currently underfunded relative to the rising demand.',
      'STRATIS correlates heat and share-of-search to downstream visits across provinces, surfacing demand before the visit data confirms it.',
    ],
    confidence: 0.84,
    impactEstimate: 'Funding Prairies cold-bev ahead of the Ontario-proven ~3-week heat-to-visit curve is projected to capture the demand at materially lower cost-per-visit than entering after the lift appears — getting in front of the curve Ontario already validated.',
    recommendedAction: 'Pace cold-bev media into the Prairies now, sized to the rising heat-and-search curve, using the Ontario heat-to-visit lag as the forecast. STRATIS keeps correlating heat and search to visits across provinces and flags the inflection as the Prairies approach it.',
    status: 'new',
    linkedNewsId: 'news-th-coldbrew-heatwave',
    actionSteps: [
      { id: 's1', title: 'Fund Prairies cold-bev ahead of the curve', subtitle: 'ONTARIO HEAT LED VISITS BY ~3 WEEKS', type: 'budget', completed: false },
      { id: 's2', title: 'Pace weight to the heat curve before the peak', subtitle: 'GET IN BEFORE DEMAND CRESTS', type: 'scheduling', completed: false },
      { id: 's3', title: 'Correlate heat + search to visits across provinces', subtitle: 'STRATIS FLAGS THE PRAIRIES INFLECTION', type: 'targeting', completed: false },
    ],
  },
];

// ===== Per-insight charts (each illustrates its insight's specific headline) =====
export const TIM_HORTONS_VISUALS: Record<string, InsightVisual> = {
  // 1 — saturation: marginal visits per extra $100K, declining to ~0
  'ins-th-01-saturation': {
    kind: 'line', xKey: 'spend', series: ['ctv', 'shortform'],
    config: {
      ctv: { label: 'CTV — visits per +$100K', color: RED },
      shortform: { label: 'Short-form + audio — visits per +$100K', color: TEAL },
    },
    refLines: [{ axis: 'x', value: '$1.6M', label: 'CTV saturation point', color: GOLD }],
    data: [
      { spend: '$0.8M', ctv: 24, shortform: 25 }, { spend: '$1.2M', ctv: 17, shortform: 23 },
      { spend: '$1.6M', ctv: 9, shortform: 21 }, { spend: '$2.0M', ctv: 5, shortform: 20 },
      { spend: '$2.4M', ctv: 4, shortform: 19 },
    ],
    caption: 'Past ~$1.6M, each extra CTV dollar drives almost no visits — while short-form keeps converting.',
  },

  // 2 — mix allocation: marginal efficiency by channel vs the frontier line
  'ins-th-02-mix-reallocation': {
    kind: 'bar', xKey: 'channel', series: ['efficiency'], perBarColor: true,
    config: { efficiency: { label: 'Return on the next dollar (index)', color: TEAL } },
    refLines: [{ axis: 'y', value: 100, label: 'Efficiency frontier', color: GOLD }],
    data: [
      { channel: 'TikTok', efficiency: 136, fill: TEAL },
      { channel: 'Spotify', efficiency: 122, fill: TEAL },
      { channel: 'Prox. OOH', efficiency: 116, fill: TEAL },
      { channel: 'Instagram', efficiency: 98, fill: MUTED },
      { channel: 'Facebook', efficiency: 74, fill: RED },
      { channel: 'CTV', efficiency: 69, fill: RED },
    ],
    legend: [
      { label: 'Headroom — fund these', color: TEAL },
      { label: 'Past efficient — pull back', color: RED },
    ],
    caption: 'Move dollars from the red channels to the teal ones until the next dollar is equally productive everywhere.',
  },

  // 3 — audience efficiency: visits per dollar by segment
  'ins-th-03-audience-efficiency': {
    kind: 'bar', xKey: 'audience', series: ['efficiency'], perBarColor: true,
    config: { efficiency: { label: 'Visits per dollar (index)', color: TEAL } },
    data: [
      { audience: 'App members', efficiency: 166, fill: TEAL },
      { audience: 'Recently lapsed', efficiency: 134, fill: TEAL },
      { audience: 'Families', efficiency: 104, fill: BLUE },
      { audience: 'Broad value-seekers', efficiency: 70, fill: RED },
    ],
    legend: [
      { label: 'High-intent — gets only ~33% of budget', color: TEAL },
      { label: 'Broad value-seekers — gets most of the budget', color: RED },
    ],
    caption: 'The most efficient audiences are the least funded — shift targeting toward intent.',
  },

  // 4 — rising cost per sign-up crossing the prior line
  'ins-th-04-acquisition-cost-rising': {
    kind: 'line', xKey: 'week', series: ['cost'],
    config: { cost: { label: 'Cost per app sign-up ($)', color: TEAL } },
    refLines: [{ axis: 'y', value: 6.9, label: 'Two weeks ago: $6.90', color: RED }],
    data: [
      { week: 'W-7', cost: 6.7 }, { week: 'W-6', cost: 6.8 }, { week: 'W-5', cost: 6.9 },
      { week: 'W-4', cost: 6.9 }, { week: 'W-3', cost: 7.4 }, { week: 'W-2', cost: 8.0 },
      { week: 'W-1', cost: 8.3 }, { week: 'Now', cost: 8.4 },
    ],
    caption: 'A price war on a few rewards-app terms pushed the cost up ~22% in two weeks — a targeted bid cap reverses it.',
  },

  // 5 — price of reach up, results flat
  'ins-th-05-price-of-reach': {
    kind: 'line', xKey: 'week', series: ['price', 'visits'],
    config: {
      price: { label: 'Price of reach (index)', color: RED },
      visits: { label: 'Visits (index)', color: TEAL },
    },
    data: [
      { week: 'W-4', price: 100, visits: 100 }, { week: 'W-3', price: 107, visits: 101 },
      { week: 'W-2', price: 115, visits: 99 }, { week: 'W-1', price: 120, visits: 100 },
      { week: 'Now', price: 122, visits: 98 },
    ],
    caption: 'Reach got ~22% pricier while visits held flat — paying more for the same result.',
  },

  // 6 — geographic efficiency: spend vs redemption by market
  'ins-th-06-geo-efficiency': {
    kind: 'scatter', xKey: 'spend', series: ['redemption'],
    xName: 'Cold-bev spend (index)', yName: 'Redemption vs national avg (%)',
    config: { redemption: { label: 'Market', color: PURPLE } },
    refLines: [{ axis: 'y', value: 0, label: 'National average', color: GOLD }],
    data: [
      { spend: 140, redemption: -30 }, { spend: 126, redemption: -23 }, { spend: 118, redemption: -17 },
      { spend: 95, redemption: 5 }, { spend: 87, redemption: 13 }, { spend: 73, redemption: 22 },
      { spend: 60, redemption: 28 }, { spend: 51, redemption: 34 },
    ],
    caption: 'High-spend markets redeeming below average (lower right) should fund the underfunded winners (upper left).',
  },

  // 7 — access friction: drive-thru wait vs return on media
  'ins-th-07-access-friction': {
    kind: 'scatter', xKey: 'wait', series: ['roi'],
    xName: 'Drive-thru wait / low density (index)', yName: 'Return on media (index)',
    config: { roi: { label: 'Trade area', color: PURPLE } },
    data: [
      { wait: 8, roi: 150 }, { wait: 14, roi: 137 }, { wait: 19, roi: 120 }, { wait: 27, roi: 108 },
      { wait: 35, roi: 91 }, { wait: 41, roi: 83 }, { wait: 48, roi: 70 }, { wait: 55, roi: 66 },
    ],
    caption: 'The longer the drive-thru wait, the worse the same ads convert — spend should follow throughput.',
  },

  // 8 — creative winner: visits per impression by ad
  'ins-th-08-creative-winner': {
    kind: 'bar', xKey: 'ad', series: ['rate'], perBarColor: true,
    config: { rate: { label: 'Visits driven (index)', color: TEAL } },
    data: [
      { ad: 'Brand hero', rate: 100, fill: MUTED },
      { ad: '“Whole combo price”', rate: 161, fill: TEAL },
      { ad: 'Morning routine', rate: 116, fill: BLUE },
    ],
    legend: [
      { label: 'Winner — only ~13% of views today', color: TEAL },
      { label: 'Brand hero — most of the views', color: MUTED },
    ],
    caption: 'Ranked by visits actually driven, the value ad wins ~1.6× — but barely gets shown.',
  },

  // 9 — creative fatigue: pull drops with each viewing; fresh cut holds
  'ins-th-09-creative-fatigue': {
    kind: 'line', xKey: 'views', series: ['hero', 'fresh'],
    config: {
      hero: { label: '“It’s ACME Time” spot', color: RED },
      fresh: { label: 'Fresh cut', color: TEAL },
    },
    data: [
      { views: '1–3', hero: 100, fresh: 110 }, { views: '4–6', hero: 82, fresh: 109 },
      { views: '7–9', hero: 49, fresh: 108 }, { views: '10+', hero: 34, fresh: 103 },
    ],
    caption: 'The tired spot collapses with repeat viewings while the fresh cut holds — that’s wear-out, not delivery.',
  },

  // 10 — frequency collision: per-channel vs combined with the effective line
  'ins-th-10-frequency-collision': {
    kind: 'bar', xKey: 'channel', series: ['freq'], perBarColor: true,
    config: { freq: { label: 'Ads seen per week', color: TEAL } },
    refLines: [{ axis: 'y', value: 10, label: 'Where it stops working (~10)', color: RED }],
    data: [
      { channel: 'TV', freq: 5.3, fill: TEAL },
      { channel: 'Social', freq: 4.9, fill: TEAL },
      { channel: 'Audio', freq: 4.6, fill: TEAL },
      { channel: 'OOH', freq: 4.2, fill: TEAL },
      { channel: 'Combined', freq: 19.0, fill: RED },
    ],
    caption: 'No single channel looks high — only adding them up for one regular reveals the over-exposure.',
  },

  // 11 — conquest opportunity: interest up as competitor pulls back
  'ins-th-11-conquest-opportunity': {
    kind: 'line', xKey: 'day', series: ['interest', 'competitor'],
    config: {
      interest: { label: 'Morning-value search', color: TEAL },
      competitor: { label: 'Rival breakfast media', color: RED },
    },
    data: [
      { day: 'D0', interest: 100, competitor: 100 }, { day: 'D1', interest: 162, competitor: 92 },
      { day: 'D2', interest: 238, competitor: 80 }, { day: 'D3', interest: 305, competitor: 70 },
      { day: 'D4', interest: 292, competitor: 66 }, { day: 'D5', interest: 278, competitor: 65 },
    ],
    caption: 'Morning-value search surged as the rival pulled out of the daypart — the lane is open and cheap.',
  },

  // 12 — pull-through: near-me search peaks 6 days after a national flight
  'ins-th-12-pull-through': {
    kind: 'line', xKey: 'lag', series: ['lift'],
    config: { lift: { label: '“ACME near me” search lift', color: TEAL } },
    refLines: [{ axis: 'x', value: '+6d', label: 'Best window for the local touch', color: GOLD }],
    data: [
      { lag: '0d', lift: 16 }, { lag: '+2d', lift: 29 }, { lag: '+4d', lift: 47 },
      { lag: '+6d', lift: 61 }, { lag: '+8d', lift: 50 }, { lag: '+10d', lift: 33 },
    ],
    caption: 'Local intent peaks six days after the national flight — the window the local team keeps missing.',
  },

  // 13 — Facebook → TikTok: cost to reach the younger audience diverging
  'ins-th-13-audience-migration': {
    kind: 'line', xKey: 'month', series: ['facebook', 'tiktok'],
    config: {
      facebook: { label: 'Facebook — cost per younger redemption', color: RED },
      tiktok: { label: 'TikTok — cost per younger redemption', color: TEAL },
    },
    data: [
      { month: 'Jan', facebook: 100, tiktok: 104 }, { month: 'Feb', facebook: 113, tiktok: 96 },
      { month: 'Mar', facebook: 127, tiktok: 84 }, { month: 'Apr', facebook: 140, tiktok: 73 },
      { month: 'May', facebook: 144, tiktok: 71 },
    ],
    caption: 'The younger audience moved to TikTok — its cost fell there while Facebook’s climbed. Follow the people.',
  },

  // 14 — cold social → intent search: cost per sign-up by surface
  'ins-th-14-discovery-intent': {
    kind: 'bar', xKey: 'surface', series: ['cost'], perBarColor: true,
    config: { cost: { label: 'Cost per Rewards sign-up ($)', color: TEAL } },
    data: [
      { surface: 'Social (cold prospecting)', cost: 8.6, fill: RED },
      { surface: 'Instagram (cold)', cost: 6.2, fill: MUTED },
      { surface: 'Near-me / deal search', cost: 2.9, fill: TEAL },
    ],
    legend: [
      { label: 'Intent search — a few % of budget today', color: TEAL },
      { label: 'Cold social prospecting — most of it', color: RED },
    ],
    caption: 'People already searching for a visit sign up at about a third of cold social’s cost.',
  },

  // 15 — open exchange → curated TTD deals: share of spend lost to waste
  'ins-th-15-supply-path': {
    kind: 'bar', xKey: 'route', series: ['waste'], perBarColor: true,
    config: { waste: { label: 'Spend lost to waste (%)', color: TEAL } },
    data: [
      { route: 'Open exchange', waste: 28, fill: RED },
      { route: 'Curated deals (The Trade Desk)', waste: 6, fill: TEAL },
    ],
    legend: [
      { label: 'Unviewable / off-target / unsafe', color: RED },
      { label: 'Verified, on-topic inventory', color: TEAL },
    ],
    caption: 'Same audience, far less waste — the curated path puts ~28% more of the dollar to work.',
  },

  // 16 — TikTok reach cap → TTD: unique reach curves
  'ins-th-16-reach-cap': {
    kind: 'line', xKey: 'spend', series: ['tiktok', 'ttd'],
    config: {
      tiktok: { label: 'TikTok — new people reached', color: RED },
      ttd: { label: 'The Trade Desk — new people reached', color: TEAL },
    },
    refLines: [{ axis: 'x', value: '$0.7M', label: 'TikTok reach ceiling', color: GOLD }],
    data: [
      { spend: '$0.2M', tiktok: 18, ttd: 16 }, { spend: '$0.45M', tiktok: 13, ttd: 15 },
      { spend: '$0.7M', tiktok: 6, ttd: 15 }, { spend: '$0.95M', tiktok: 2, ttd: 14 },
      { spend: '$1.2M', tiktok: 1, ttd: 14 },
    ],
    caption: 'Past ~$0.7M TikTok just adds frequency — The Trade Desk still finds new people at the same cost.',
  },

  // 17 — Meta auction pressure: cost of reach spikes as competitor enters
  'ins-th-17-auction-pressure': {
    kind: 'line', xKey: 'week', series: ['meta', 'uncontested'],
    config: {
      meta: { label: 'Meta — cost of reach', color: RED },
      uncontested: { label: 'TikTok + audio — cost of reach', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W-3', label: 'Rival flight starts', color: GOLD }],
    data: [
      { week: 'W-5', meta: 100, uncontested: 100 }, { week: 'W-4', meta: 101, uncontested: 99 },
      { week: 'W-3', meta: 108, uncontested: 100 }, { week: 'W-2', meta: 121, uncontested: 101 },
      { week: 'W-1', meta: 129, uncontested: 100 }, { week: 'Now', meta: 130, uncontested: 99 },
    ],
    caption: 'A rival crowded the Meta auction — the same reach is ~30% cheaper on the uncontested platforms.',
  },

  // XR1 — creative transfer: value creative vs national hero, Ontario vs Quebec
  'ins-th-xr1-creative-transfer': {
    kind: 'bar', xKey: 'region', series: ['hero', 'value'],
    config: {
      hero: { label: 'National hero — conversion (index)', color: MUTED },
      value: { label: '“Value combo” creative — conversion (index)', color: TEAL },
    },
    data: [
      { region: 'Ontario (running today)', hero: 100, value: 94 },
      { region: 'Quebec (proven)', hero: 100, value: 151 },
    ],
    legend: [
      { label: 'Value creative — proven 1.5× in Quebec', color: TEAL },
      { label: 'National hero — Ontario default', color: MUTED },
    ],
    caption: 'The value creative wins ~1.5× in Quebec on the same metric — and the heat tailwind means Ontario can run it now. Port the asset.',
  },

  // XR2 — leading indicator: Ontario marginal visits (lead) vs BC (lag ~5 weeks)
  'ins-th-xr2-leading-indicator': {
    kind: 'line', xKey: 'week', series: ['ontario', 'bc'],
    config: {
      ontario: { label: 'Ontario CTV marginal visits (leading)', color: RED },
      bc: { label: 'BC CTV marginal visits (lagging ~5 wks)', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W4', label: 'BC reaches the Ontario inflection', color: GOLD }],
    data: [
      { week: 'W1', ontario: 70, bc: 100 },
      { week: 'W2', ontario: 51, bc: 99 },
      { week: 'W3', ontario: 38, bc: 87 },
      { week: 'W4', ontario: 30, bc: 70 },
      { week: 'W5', ontario: 27, bc: 51 },
      { week: 'W6', ontario: 26, bc: 38 },
    ],
    caption: 'BC is tracing the exact Ontario decay ~5 weeks behind — cap BC CTV at the inflection Ontario already mapped, before the waste lands.',
  },

  // XR3 — demand correlation: Ontario heat→visits (earlier) vs Prairies (now)
  'ins-th-xr3-demand-correlation': {
    kind: 'line', xKey: 'phase', series: ['ontario', 'prairies'],
    config: {
      ontario: { label: 'Ontario heat-search → led visits by ~3 wks', color: BLUE },
      prairies: { label: 'Prairies heat-search (now)', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W3', label: 'Prairies today (~3 wks pre-visit lift)', color: GOLD }],
    data: [
      { phase: 'W1', ontario: 146, prairies: 100 },
      { phase: 'W2', ontario: 174, prairies: 103 },
      { phase: 'W3', ontario: 197, prairies: 122 },
      { phase: 'W4', ontario: 205, prairies: 150 },
      { phase: 'W5', ontario: 208, prairies: 178 },
    ],
    caption: 'The Prairies are climbing the same heat-to-visit curve Ontario rode ~3 weeks earlier — fund cold-bev ahead of it.',
  },
};
