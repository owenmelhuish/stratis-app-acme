// Per-insight chart specs. Each insight gets a chart whose TYPE and SHAPE
// illustrate the specific finding in its headline — not a generic trend line.
// Consumed by <InsightChart /> (card grid + detail modal).

import {
  type InsightVisual, TEAL, RED, BLUE, PURPLE, GOLD, MUTED, GRID,
} from './insight-visual-types';
// Per-client visual maps live with their data modules so each client is self-contained.
import { RBC_VISUALS } from './clients/rbc';
import { MOLSON_COORS_VISUALS } from './clients/molson-coors';
import { LULULEMON_VISUALS } from './clients/lululemon';
import { TIM_HORTONS_VISUALS } from './clients/tim-hortons';
import { AUTO_CAMPAIGN_VISUALS } from './automotive-scoped-campaign-insights';
import { AUTO_CONTEXT_VISUALS } from './automotive-scoped-context-insights';

// Re-export the chart types so existing importers (insight-chart.tsx) keep working.
export type { InsightChartKind, InsightRefLine, InsightVisual } from './insight-visual-types';

const VISUALS: Record<string, InsightVisual> = {
  // ──────────────────────────────────────────────────────────────
  // ACME AUTOMOTIVE — mirrored gold-standard lineup
  // ──────────────────────────────────────────────────────────────

  // 01 — saturation: marginal leads per extra $100K, declining to ~0
  'ins-auto-01-saturation': {
    kind: 'line',
    xKey: 'spend',
    series: ['ctv', 'search'],
    config: {
      ctv: { label: 'CTV — leads per +$100K', color: RED },
      search: { label: 'Search — leads per +$100K', color: TEAL },
    },
    refLines: [{ axis: 'x', value: '$2.6M', label: 'CTV saturation point', color: GOLD }],
    data: [
      { spend: '$1.4M', ctv: 23, search: 22 }, { spend: '$2.0M', ctv: 16, search: 21 },
      { spend: '$2.6M', ctv: 9, search: 20 }, { spend: '$3.2M', ctv: 5, search: 20 },
      { spend: '$3.8M', ctv: 4, search: 19 },
    ],
    caption: 'Past ~$2.6M, each extra CTV dollar drives almost nothing — while search keeps converting.',
  },

  // 02 — mix allocation: marginal efficiency by channel vs the frontier line
  'ins-auto-02-mix-reallocation': {
    kind: 'bar',
    xKey: 'channel',
    series: ['efficiency'],
    perBarColor: true,
    config: { efficiency: { label: 'Return on the next dollar (index)', color: TEAL } },
    refLines: [{ axis: 'y', value: 100, label: 'Efficiency frontier', color: GOLD }],
    data: [
      { channel: 'Search', efficiency: 136, fill: TEAL },
      { channel: 'Audio', efficiency: 122, fill: TEAL },
      { channel: 'High-intent social', efficiency: 116, fill: TEAL },
      { channel: 'CTV', efficiency: 97, fill: MUTED },
      { channel: 'Display', efficiency: 72, fill: RED },
      { channel: 'Meta', efficiency: 68, fill: RED },
    ],
    legend: [
      { label: 'Headroom — fund these', color: TEAL },
      { label: 'Past efficient — pull back', color: RED },
    ],
    caption: 'Move dollars from the red channels to the teal ones until the next dollar is equally productive everywhere.',
  },

  // 03 — audience efficiency: return by segment
  'ins-auto-03-audience-efficiency': {
    kind: 'bar',
    xKey: 'audience',
    series: ['efficiency'],
    perBarColor: true,
    config: { efficiency: { label: 'Leads per dollar (index)', color: TEAL } },
    data: [
      { audience: 'In-market truck intenders', efficiency: 168, fill: TEAL },
      { audience: 'Configurator visitors', efficiency: 132, fill: TEAL },
      { audience: 'Family-SUV shoppers', efficiency: 104, fill: BLUE },
      { audience: 'Broad auto audience', efficiency: 70, fill: RED },
    ],
    legend: [
      { label: 'High-intent — gets only ~33% of budget', color: TEAL },
      { label: 'Broad auto — gets most of the budget', color: RED },
    ],
    caption: 'The most efficient audience is the least funded — shift targeting toward intent.',
  },

  // 04 — rising cost per lead: crossing the prior line
  'ins-auto-04-acquisition-cost-rising': {
    kind: 'line',
    xKey: 'week',
    series: ['cost'],
    config: { cost: { label: 'Cost per lead ($)', color: TEAL } },
    refLines: [{ axis: 'y', value: 96, label: 'Two weeks ago: $96', color: RED }],
    data: [
      { week: 'W-7', cost: 93 }, { week: 'W-6', cost: 95 }, { week: 'W-5', cost: 96 },
      { week: 'W-4', cost: 96 }, { week: 'W-3', cost: 104 }, { week: 'W-2', cost: 112 },
      { week: 'W-1', cost: 116 }, { week: 'Now', cost: 118 },
    ],
    caption: 'A price war on a few comparison terms pushed the cost up ~23% in two weeks — a targeted bid cap reverses it.',
  },

  // 05 — price of reach up, results flat
  'ins-auto-05-price-of-reach': {
    kind: 'line',
    xKey: 'week',
    series: ['price', 'leads'],
    config: {
      price: { label: 'Price of reach (index)', color: RED },
      leads: { label: 'Leads (index)', color: TEAL },
    },
    data: [
      { week: 'W-4', price: 100, leads: 100 }, { week: 'W-3', price: 108, leads: 101 },
      { week: 'W-2', price: 116, leads: 99 }, { week: 'W-1', price: 121, leads: 100 },
      { week: 'Now', price: 123, leads: 98 },
    ],
    caption: 'Reach got ~23% pricier while leads held flat — paying more for the same result.',
  },

  // 06 — geographic efficiency: spend vs conversion by province
  'ins-auto-06-geo-efficiency': {
    kind: 'scatter',
    xKey: 'spend',
    series: ['conversion'],
    xName: 'National spend (index)',
    yName: 'Conversion vs national avg (%)',
    perBarColor: true,
    config: { conversion: { label: 'Province', color: PURPLE } },
    refLines: [{ axis: 'y', value: 0, label: 'National average', color: GOLD }],
    data: [
      { spend: 142, conversion: -31, fill: RED, name: 'Over-funded, under-converting' },
      { spend: 128, conversion: -24, fill: RED, name: 'Over-funded, under-converting' },
      { spend: 119, conversion: -16, fill: MUTED, name: 'Province' },
      { spend: 96, conversion: 6, fill: MUTED, name: 'Province' },
      { spend: 84, conversion: 14, fill: TEAL, name: 'Underfunded winner' },
      { spend: 71, conversion: 22, fill: TEAL, name: 'Underfunded winner' },
      { spend: 58, conversion: 30, fill: TEAL, name: 'Underfunded winner' },
    ],
    caption: 'High-spend provinces converting below average (lower right) should fund the underfunded winners (upper left).',
  },

  // 07 — access friction: dealer-inventory availability vs return on media
  'ins-auto-07-access-friction': {
    kind: 'scatter',
    xKey: 'gap',
    series: ['roi'],
    xName: 'Inventory gap — nameplate thin on lots (%)',
    yName: 'Return on media (index)',
    perBarColor: true,
    config: { roi: { label: 'Province', color: PURPLE } },
    data: [
      { gap: 8, roi: 151, fill: TEAL, name: 'Well-stocked' },
      { gap: 15, roi: 137, fill: TEAL, name: 'Well-stocked' },
      { gap: 22, roi: 120, fill: MUTED, name: 'Province' },
      { gap: 30, roi: 108, fill: MUTED, name: 'Province' },
      { gap: 38, roi: 90, fill: RED, name: 'Spending into the gap' },
      { gap: 47, roi: 78, fill: RED, name: 'Spending into the gap' },
      { gap: 55, roi: 66, fill: RED, name: 'Spending into the gap' },
    ],
    caption: 'The thinner the nameplate is on dealer lots, the worse the same ads convert — spend should follow inventory.',
  },

  // 08 — creative winner: leads per impression by ad
  'ins-auto-08-creative-winner': {
    kind: 'bar',
    xKey: 'ad',
    series: ['rate'],
    perBarColor: true,
    config: { rate: { label: 'Leads driven (index)', color: TEAL } },
    data: [
      { ad: 'Brand hero', rate: 100, fill: MUTED },
      { ad: '“What you’ll pay”', rate: 162, fill: TEAL },
      { ad: 'Capability', rate: 116, fill: BLUE },
    ],
    legend: [
      { label: 'Winner — only ~12% of views today', color: TEAL },
      { label: 'Brand hero — most of the views', color: MUTED },
    ],
    caption: 'Ranked by leads actually driven, the rebate ad wins ~1.6× — but barely gets shown.',
  },

  // 09 — creative fatigue: pull drops with each viewing; fresh cut holds
  'ins-auto-09-creative-fatigue': {
    kind: 'line',
    xKey: 'views',
    series: ['hero', 'fresh'],
    config: {
      hero: { label: 'Flagship truck spot', color: RED },
      fresh: { label: 'Fresh cut', color: TEAL },
    },
    data: [
      { views: '1–3', hero: 100, fresh: 112 }, { views: '4–6', hero: 82, fresh: 111 },
      { views: '7–9', hero: 49, fresh: 109 }, { views: '10+', hero: 34, fresh: 104 },
    ],
    caption: 'The tired spot collapses with repeat viewings while the fresh cut holds — that’s wear-out, not delivery.',
  },

  // 10 — frequency collision: per-channel vs combined with the effective line
  'ins-auto-10-frequency-collision': {
    kind: 'bar',
    xKey: 'channel',
    series: ['freq'],
    perBarColor: true,
    config: { freq: { label: 'Ads seen per week', color: TEAL } },
    refLines: [{ axis: 'y', value: 11, label: 'Where it stops working (~11)', color: RED }],
    data: [
      { channel: 'TV', freq: 5.3, fill: TEAL },
      { channel: 'Social', freq: 4.9, fill: TEAL },
      { channel: 'Display', freq: 5.0, fill: TEAL },
      { channel: 'Online video', freq: 3.9, fill: TEAL },
      { channel: 'Combined', freq: 19.1, fill: RED },
    ],
    caption: 'No single channel looks high — only adding them up for one shopper reveals the over-exposure.',
  },

  // 11 — conquest opportunity: interest up as competitor spend retreats
  'ins-auto-11-conquest-opportunity': {
    kind: 'line',
    xKey: 'day',
    series: ['interest', 'competitor'],
    config: {
      interest: { label: 'Switching interest', color: TEAL },
      competitor: { label: 'Disruptor search spend', color: RED },
    },
    data: [
      { day: 'D0', interest: 100, competitor: 100 }, { day: 'D1', interest: 168, competitor: 96 },
      { day: 'D2', interest: 244, competitor: 84 }, { day: 'D3', interest: 310, competitor: 72 },
      { day: 'D4', interest: 296, competitor: 64 }, { day: 'D5', interest: 281, competitor: 60 },
    ],
    caption: 'Interest surged as the disruptor pulled back — the door is open and the auction is cheap.',
  },

  // 12 — pull-through: dealer search peaks 9 days after a national TV flight
  'ins-auto-12-pull-through': {
    kind: 'line',
    xKey: 'lag',
    series: ['lift'],
    config: { lift: { label: 'Dealer “near me” search lift', color: TEAL } },
    refLines: [{ axis: 'x', value: '+9d', label: 'Best window to fire dealer media', color: GOLD }],
    data: [
      { lag: '0d', lift: 18 }, { lag: '+3d', lift: 31 }, { lag: '+6d', lift: 49 },
      { lag: '+9d', lift: 63 }, { lag: '+12d', lift: 52 }, { lag: '+15d', lift: 34 },
    ],
    caption: 'Dealer-side interest peaks nine days after the national flight — the window Tier 3 keeps missing.',
  },

  // 13 — Facebook → TikTok: cost to reach the adventure audience diverging
  'ins-auto-13-audience-migration': {
    kind: 'line',
    xKey: 'month',
    series: ['facebook', 'tiktok'],
    config: {
      facebook: { label: 'Facebook — cost per configured lead', color: RED },
      tiktok: { label: 'TikTok — cost per configured lead', color: TEAL },
    },
    data: [
      { month: 'Jan', facebook: 100, tiktok: 104 }, { month: 'Feb', facebook: 112, tiktok: 97 },
      { month: 'Mar', facebook: 127, tiktok: 86 }, { month: 'Apr', facebook: 140, tiktok: 74 },
      { month: 'May', facebook: 144, tiktok: 72 },
    ],
    caption: 'The adventure audience moved to TikTok — its cost fell there while Facebook’s climbed. Follow the people.',
  },

  // 14 — cold Meta → high-intent search: cost per qualified dealer visit
  'ins-auto-14-discovery-intent': {
    kind: 'bar',
    xKey: 'platform',
    series: ['cost'],
    perBarColor: true,
    config: { cost: { label: 'Cost per qualified dealer visit ($)', color: TEAL } },
    data: [
      { platform: 'Meta (cold prospecting)', cost: 15.4, fill: RED },
      { platform: 'Instagram (cold)', cost: 10.8, fill: MUTED },
      { platform: 'High-intent search', cost: 5.2, fill: TEAL },
    ],
    legend: [
      { label: 'Search — thin share of budget today', color: TEAL },
      { label: 'Meta cold prospecting — most of it', color: RED },
    ],
    caption: 'Shoppers arrive at search already configuring — they convert at about a third of cold Meta’s cost.',
  },

  // 15 — open exchange → Trade Desk PMP: share of spend lost to waste
  'ins-auto-15-supply-path': {
    kind: 'bar',
    xKey: 'route',
    series: ['waste'],
    perBarColor: true,
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

  // 16 — OOH reach cap → Trade Desk: unique reach curves
  'ins-auto-16-reach-cap': {
    kind: 'line',
    xKey: 'spend',
    series: ['ooh', 'ttd'],
    config: {
      ooh: { label: 'OOH — new people reached', color: RED },
      ttd: { label: 'The Trade Desk — new people reached', color: TEAL },
    },
    refLines: [{ axis: 'x', value: '$1.0M', label: 'OOH reach ceiling', color: GOLD }],
    data: [
      { spend: '$0.4M', ooh: 18, ttd: 16 }, { spend: '$0.7M', ooh: 14, ttd: 15 },
      { spend: '$1.0M', ooh: 6, ttd: 15 }, { spend: '$1.3M', ooh: 2, ttd: 14 },
      { spend: '$1.6M', ooh: 1, ttd: 14 },
    ],
    caption: 'Past ~$1.0M, OOH just adds frequency — The Trade Desk still finds new people at the same cost.',
  },

  // 17 — Meta auction pressure: cost of reach spikes as competitor enters
  'ins-auto-17-auction-pressure': {
    kind: 'line',
    xKey: 'week',
    series: ['meta', 'alt'],
    config: {
      meta: { label: 'Meta — cost of reach', color: RED },
      alt: { label: 'TikTok + audio — cost of reach', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W-3', label: 'Rival flight starts', color: GOLD }],
    data: [
      { week: 'W-5', meta: 100, alt: 100 }, { week: 'W-4', meta: 101, alt: 99 },
      { week: 'W-3', meta: 108, alt: 100 }, { week: 'W-2', meta: 122, alt: 101 },
      { week: 'W-1', meta: 129, alt: 100 }, { week: 'Now', meta: 131, alt: 99 },
    ],
    caption: 'A rival crowded the Meta auction — the same reach is ~30% cheaper on the uncontested channels.',
  },

  // XR1 — creative transfer: rebate creative vs brand hero, Quebec vs national
  'ins-auto-xr1-creative-transfer': {
    kind: 'bar',
    xKey: 'region',
    series: ['hero', 'rebate'],
    config: {
      hero: { label: 'Brand hero — conversion (index)', color: MUTED },
      rebate: { label: '“What you’ll pay” rebate — conversion (index)', color: TEAL },
    },
    data: [
      { region: 'National (running today)', hero: 100, rebate: 92 },
      { region: 'Quebec (proven)', hero: 100, rebate: 151 },
    ],
    legend: [
      { label: 'Rebate creative — proven 1.5× in Quebec', color: TEAL },
      { label: 'Brand hero — national default', color: MUTED },
    ],
    caption: 'The rebate creative wins ~1.5× in Quebec on the same metric — and post-iZEV the rest of Canada can finally run it. Port the asset.',
  },

  // XR2 — leading indicator: Alberta (lead) vs Ontario (lag ~6 weeks) tracing the same decay
  'ins-auto-xr2-leading-indicator': {
    kind: 'line',
    xKey: 'week',
    series: ['ab', 'on'],
    config: {
      ab: { label: 'Alberta CTV marginal leads (leading)', color: RED },
      on: { label: 'Ontario CTV marginal leads (lagging ~6 wks)', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W4', label: 'Ontario reaches the Alberta inflection', color: GOLD }],
    data: [
      { week: 'W1', ab: 71, on: 100 },
      { week: 'W2', ab: 52, on: 99 },
      { week: 'W3', ab: 38, on: 88 },
      { week: 'W4', ab: 30, on: 71 },
      { week: 'W5', ab: 27, on: 52 },
      { week: 'W6', ab: 26, on: 38 },
    ],
    caption: 'Ontario is tracing the exact Alberta decay ~6 weeks behind — cap Ontario CTV at the inflection Alberta already mapped, before the waste lands.',
  },

  // XR3 — demand correlation: BC gas→PHEV search (earlier) vs Prairies (now)
  'ins-auto-xr3-demand-correlation': {
    kind: 'line',
    xKey: 'phase',
    series: ['bc', 'prairies'],
    config: {
      bc: { label: 'BC gas→PHEV search → led leads by ~8 wks', color: BLUE },
      prairies: { label: 'Prairies gas→PHEV search (now)', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W3', label: 'Prairies today (~8 wks pre-lead lift)', color: GOLD }],
    data: [
      { phase: 'W1', bc: 148, prairies: 100 },
      { phase: 'W2', bc: 176, prairies: 102 },
      { phase: 'W3', bc: 198, prairies: 121 },
      { phase: 'W4', bc: 206, prairies: 149 },
      { phase: 'W5', bc: 209, prairies: 177 },
    ],
    caption: 'The Prairies are climbing the same gas→PHEV search curve BC rode into its lead lift ~8 weeks earlier — fund efficiency messaging ahead of it.',
  },

  // ══════════════════════════════════════════════════════════════
  // ACME LUXURY (luxury division)
  // ══════════════════════════════════════════════════════════════

  // Luxury Midsize SUV conquest: import-luxury no longer converting; pivot to prestige / progressive
  'ins-lincoln-001-nautilus-rx-pivot': {
    kind: 'bar', xKey: 'segment', series: ['val'], perBarColor: true,
    xTitle: 'Conquest segment',
    config: { val: { label: 'Conversion index' } },
    refLines: [{ axis: 'y', value: 100, label: 'Breakeven', color: GRID }],
    data: [
      { segment: 'Import Luxury SUV', val: 62, fill: RED },
      { segment: 'Prestige Luxury SUV', val: 128, fill: TEAL },
      { segment: 'Progressive Luxury SUV', val: 119, fill: TEAL },
    ],
    caption: 'Import-luxury conquest has stopped converting; prestige and progressive are where the demand is',
  },

  // Sport-luxury rival's new SUV opens below Luxury Three-Row SUV top trim
  'ins-lincoln-002-aviator-x5-pricing': {
    kind: 'bar', xKey: 'model', series: ['price'], perBarColor: true,
    xTitle: 'Mid-size luxury SUV', yTitle: 'Starting price ($)',
    config: { price: { label: 'Starting price ($)' } },
    data: [
      { model: 'Luxury Three-Row SUV', price: 79100, fill: TEAL },
      { model: 'Sport-Luxury Rival SUV', price: 74900, fill: RED },
    ],
    caption: 'The sport-luxury rival opens ~$4,200 below the Luxury Three-Row SUV — premium gap compressed',
  },

  // Cossette QC French Luxury Compact SUV creative beats Hudson Rouge adaptation
  'ins-lincoln-003-corsair-quebec-french': {
    kind: 'bar', xKey: 'agency', series: ['val'], perBarColor: true,
    xTitle: 'Quebec French creative', yTitle: 'ThruPlay rate (index)',
    config: { val: { label: 'ThruPlay rate (idx)' } },
    data: [
      { agency: 'Cossette Luxury', val: 230, fill: TEAL },
      { agency: 'Hudson Rouge', val: 100, fill: MUTED },
    ],
    caption: "Cossette's Quebec French Luxury Compact SUV creative delivers ~2.3× the ThruPlay",
  },

  // Luxury-tax threshold lift removes friction on top trims
  'ins-lincoln-004-luxury-tax-window': {
    kind: 'bar', xKey: 'trim', series: ['val'], perBarColor: true,
    xTitle: 'Eligible trim', yTitle: 'Tax friction removed ($)',
    config: { val: { label: 'Friction removed ($)' } },
    data: [
      { trim: 'Luxury Three-Row SUV (top trim)', val: 6000, fill: TEAL },
      { trim: 'Luxury Full-Size SUV (top trim)', val: 8000, fill: TEAL },
    ],
    caption: 'July 1 luxury-tax threshold lift removes $4K–$8K of friction on these trims',
  },

  // Luxury Full-Size SUV vs Luxury Three-Row SUV on the Sport-Luxury-conquest audience
  'ins-lincoln-005-navigator-conquest-bmw': {
    kind: 'bar', xKey: 'nameplate', series: ['val'], perBarColor: true,
    xTitle: 'Product line on Conquest — Sport Luxury', yTitle: 'Conversion index',
    config: { val: { label: 'Sport-Luxury-conquest conversion' } },
    data: [
      { nameplate: 'Luxury Full-Size SUV', val: 134, fill: TEAL },
      { nameplate: 'Luxury Three-Row SUV', val: 96, fill: MUTED },
    ],
    caption: 'The Luxury Full-Size SUV converts the Sport-Luxury-conquest audience better — it should own the segment',
  },

  // Luxury Three-Row SUV launch SOV below competitive set
  'ins-lincoln-006-aviator-launch-q3-prep': {
    kind: 'bar', xKey: 'entrant', series: ['val'], perBarColor: true,
    xTitle: 'Launch share of voice', yTitle: 'Tier 1 SOV (×)',
    config: { val: { label: 'Tier 1 SOV (×)' } },
    refLines: [{ axis: 'y', value: 1, label: 'Parity 1.0×', color: GRID }],
    data: [
      { entrant: 'Luxury Three-Row SUV (planned)', val: 0.7, fill: RED },
      { entrant: 'Competitive avg', val: 1.0, fill: MUTED },
    ],
    caption: 'The Luxury Three-Row SUV launches in 84 days at 0.7× the competitive Tier 1 weight',
  },

  // ══════════════════════════════════════════════════════════════
  // DEALERSHIP NETWORK
  // ══════════════════════════════════════════════════════════════

  // 01 — saturation: marginal showroom visits per extra $100K, declining to ~0
  'ins-dn-01-saturation': {
    kind: 'line', xKey: 'spend', series: ['ctv', 'search'],
    config: {
      ctv: { label: 'Network CTV — visits per +$100K', color: RED },
      search: { label: 'Local Search — visits per +$100K', color: TEAL },
    },
    refLines: [{ axis: 'x', value: '$2.6M', label: 'CTV saturation point', color: GOLD }],
    data: [
      { spend: '$1.4M', ctv: 24, search: 22 }, { spend: '$2.0M', ctv: 17, search: 21 },
      { spend: '$2.6M', ctv: 9, search: 20 }, { spend: '$3.2M', ctv: 6, search: 19 },
      { spend: '$3.8M', ctv: 5, search: 19 },
    ],
    caption: 'Past ~$2.6M, each extra co-op CTV dollar drives almost nothing — while local Search keeps converting',
  },

  // 02 — mix allocation: marginal efficiency by channel vs the frontier line
  'ins-dn-02-mix-reallocation': {
    kind: 'bar', xKey: 'channel', series: ['efficiency'], perBarColor: true,
    config: { efficiency: { label: 'Return on the next dollar (index)', color: TEAL } },
    refLines: [{ axis: 'y', value: 100, label: 'Efficiency frontier', color: GOLD }],
    data: [
      { channel: 'Local Search', efficiency: 136, fill: TEAL },
      { channel: 'CTV', efficiency: 121, fill: TEAL },
      { channel: 'OOH', efficiency: 116, fill: TEAL },
      { channel: 'TTD', efficiency: 94, fill: MUTED },
      { channel: 'Display', efficiency: 71, fill: RED },
      { channel: 'Facebook', efficiency: 67, fill: RED },
    ],
    legend: [
      { label: 'Headroom — fund these', color: TEAL },
      { label: 'Past efficient — pull back', color: RED },
    ],
    caption: 'Move co-op dollars from the red channels to the teal ones until the next dollar is equally productive everywhere',
  },

  // 03 — audience efficiency: test-drive ROAS by segment
  'ins-dn-03-audience-efficiency': {
    kind: 'bar', xKey: 'audience', series: ['efficiency'], perBarColor: true,
    config: { efficiency: { label: 'Test drives per dollar (index)', color: TEAL } },
    data: [
      { audience: 'Finance & Deal Seekers', efficiency: 162, fill: TEAL },
      { audience: 'Active in-market', efficiency: 128, fill: TEAL },
      { audience: 'Service Loyalists', efficiency: 104, fill: BLUE },
      { audience: 'Broad local radius', efficiency: 71, fill: RED },
    ],
    legend: [
      { label: 'High-intent — gets only ~33% of budget', color: TEAL },
      { label: 'Broad radius — gets most of the budget', color: RED },
    ],
    caption: 'The most efficient local audience is the least funded — shift targeting toward intent',
  },

  // 04 — rising cost per lead: CPL crossing the prior line
  'ins-dn-04-acquisition-cost-rising': {
    kind: 'line', xKey: 'week', series: ['cost'],
    config: { cost: { label: 'Cost per lead — Toronto DMA ($)', color: TEAL } },
    refLines: [{ axis: 'y', value: 47, label: 'Two weeks ago: $47', color: RED }],
    data: [
      { week: 'W-7', cost: 46 }, { week: 'W-6', cost: 46 }, { week: 'W-5', cost: 47 },
      { week: 'W-4', cost: 47 }, { week: 'W-3', cost: 50 }, { week: 'W-2', cost: 54 },
      { week: 'W-1', cost: 57 }, { week: 'Now', cost: 58 },
    ],
    caption: 'Dealers bidding each other up on a few brand terms pushed cost per lead up ~23% — a coordinated map reverses it',
  },

  // 05 — price of reach up, results flat
  'ins-dn-05-price-of-reach': {
    kind: 'line', xKey: 'week', series: ['price', 'visits'],
    config: {
      price: { label: 'Local OOH price of reach (index)', color: RED },
      visits: { label: 'Showroom visits (index)', color: TEAL },
    },
    data: [
      { week: 'W-4', price: 100, visits: 100 }, { week: 'W-3', price: 108, visits: 101 },
      { week: 'W-2', price: 115, visits: 99 }, { week: 'W-1', price: 120, visits: 100 },
      { week: 'Now', price: 122, visits: 98 },
    ],
    caption: 'Local OOH got ~22% pricier while showroom visits held flat — paying more for the same result',
  },

  // 06 — geographic efficiency: spend vs conversion by regional rollup
  'ins-dn-06-geo-efficiency': {
    kind: 'scatter', xKey: 'spend', series: ['conversion'],
    xName: 'Co-op spend (index)', yName: 'Conversion vs network avg (%)',
    config: { conversion: { label: 'Regional rollup', color: PURPLE } },
    refLines: [{ axis: 'y', value: 0, label: 'Network average', color: GOLD }],
    data: [
      { spend: 138, conversion: -29 }, { spend: 126, conversion: -22 }, { spend: 118, conversion: -16 },
      { spend: 97, conversion: 5 }, { spend: 86, conversion: 14 }, { spend: 72, conversion: 24 },
    ],
    caption: 'High-spend rollups converting below average (lower right) should fund the underfunded winners (upper left)',
  },

  // 07 — access friction: provincial compliance burden vs return on media
  'ins-dn-07-access-friction': {
    kind: 'scatter', xKey: 'burden', series: ['roi'],
    xName: 'Provincial compliance burden (%)', yName: 'Return on co-op media (index)',
    config: { roi: { label: 'Regional rollup', color: PURPLE } },
    data: [
      { burden: 9, roi: 150 }, { burden: 16, roi: 134 }, { burden: 22, roi: 118 }, { burden: 30, roi: 106 },
      { burden: 38, roi: 90 }, { burden: 46, roi: 80 }, { burden: 53, roi: 69 },
    ],
    caption: 'The more compliance steps a rollup demands, the worse the same campaigns convert — spend should follow readiness',
  },

  // 08 — creative winner: test drives per impression by format
  'ins-dn-08-creative-winner': {
    kind: 'bar', xKey: 'format', series: ['rate'], perBarColor: true,
    config: { rate: { label: 'Test drives driven (index)', color: TEAL } },
    data: [
      { format: 'Static inventory ad', rate: 100, fill: MUTED },
      { format: 'Vertical walkaround', rate: 161, fill: TEAL },
      { format: 'Offer card', rate: 116, fill: BLUE },
    ],
    legend: [
      { label: 'Winner — only ~12% of views today', color: TEAL },
      { label: 'Static ad — most of the views', color: MUTED },
    ],
    caption: 'Ranked by test drives actually driven, the walkaround wins ~1.6× — but barely gets shown',
  },

  // 09 — creative fatigue: pull drops with each viewing; fresh cut holds
  'ins-dn-09-creative-fatigue': {
    kind: 'line', xKey: 'views', series: ['spot', 'fresh'],
    config: {
      spot: { label: '“Event Sales” spot', color: RED },
      fresh: { label: 'Fresh cut', color: TEAL },
    },
    data: [
      { views: '1–3', spot: 100, fresh: 110 }, { views: '4–6', spot: 84, fresh: 109 },
      { views: '7–9', spot: 52, fresh: 108 }, { views: '10+', spot: 38, fresh: 103 },
    ],
    caption: 'The tired spot collapses with repeat viewings while the fresh cut holds — that’s wear-out, not delivery',
  },

  // 10 — frequency collision: per-dealer vs combined with the effective line
  'ins-dn-10-frequency-collision': {
    kind: 'bar', xKey: 'source', series: ['freq'], perBarColor: true,
    config: { freq: { label: 'Ads seen per week', color: TEAL } },
    refLines: [{ axis: 'y', value: 8, label: 'Where it stops working (~8)', color: RED }],
    data: [
      { source: 'Dealer A', freq: 4.1, fill: TEAL },
      { source: 'Dealer B', freq: 3.6, fill: TEAL },
      { source: 'Dealer C', freq: 3.8, fill: TEAL },
      { source: 'Dealers D+E', freq: 6.7, fill: TEAL },
      { source: 'Combined', freq: 18.2, fill: RED },
    ],
    caption: 'No single dealer looks high — only adding up the nearby dealers for one shopper reveals the over-exposure',
  },

  // 11 — conquest opportunity: interest up as rival spend retreats
  'ins-dn-11-conquest-opportunity': {
    kind: 'line', xKey: 'day', series: ['interest', 'rival'],
    config: {
      interest: { label: 'Comparison-search interest', color: TEAL },
      rival: { label: 'Import-leader search spend', color: RED },
    },
    data: [
      { day: 'D0', interest: 100, rival: 100 }, { day: 'D1', interest: 162, rival: 95 },
      { day: 'D2', interest: 238, rival: 82 }, { day: 'D3', interest: 305, rival: 70 },
      { day: 'D4', interest: 291, rival: 66 }, { day: 'D5', interest: 276, rival: 65 },
    ],
    caption: 'Comparison interest surged as the rival pulled back — the corridor lane is open and the auction is cheap',
  },

  // 12 — pull-through: satellite search peaks 7 days after a flagship flight
  'ins-dn-12-pull-through': {
    kind: 'line', xKey: 'lag', series: ['lift'],
    config: { lift: { label: 'Satellite search lift', color: TEAL } },
    refLines: [{ axis: 'x', value: '+7d', label: 'Best window for the satellite touch', color: GOLD }],
    data: [
      { lag: '0d', lift: 16 }, { lag: '+3d', lift: 33 }, { lag: '+5d', lift: 49 },
      { lag: '+7d', lift: 61 }, { lag: '+10d', lift: 47 }, { lag: '+14d', lift: 28 },
    ],
    caption: 'Satellite interest peaks seven days after the flagship flight — the window the satellites keep missing',
  },

  // 13 — audience migration: cost to reach the younger shopper diverging over the quarter
  'ins-dn-13-audience-migration': {
    kind: 'line', xKey: 'month', series: ['facebook', 'tiktok'],
    config: {
      facebook: { label: 'Facebook — cost per younger shopper', color: RED },
      tiktok: { label: 'TikTok — cost per younger shopper', color: TEAL },
    },
    data: [
      { month: 'Jan', facebook: 100, tiktok: 103 }, { month: 'Feb', facebook: 111, tiktok: 96 },
      { month: 'Mar', facebook: 126, tiktok: 84 }, { month: 'Apr', facebook: 139, tiktok: 73 },
      { month: 'May', facebook: 144, tiktok: 71 },
    ],
    caption: 'The younger shopper moved to TikTok — its cost fell there while Facebook’s climbed. Follow the people',
  },

  // 14 — cold social → Vehicle Listing Ads: cost per qualified lead by platform
  'ins-dn-14-discovery-intent': {
    kind: 'bar', xKey: 'platform', series: ['cost'], perBarColor: true,
    config: { cost: { label: 'Cost per qualified lead ($)', color: TEAL } },
    data: [
      { platform: 'Facebook (cold)', cost: 63, fill: RED },
      { platform: 'Instagram (cold)', cost: 48, fill: MUTED },
      { platform: 'Vehicle Listing Ads', cost: 22, fill: TEAL },
    ],
    legend: [
      { label: 'Listing Ads — ~4% of budget today', color: TEAL },
      { label: 'Cold social prospecting — most of it', color: RED },
    ],
    caption: 'Shoppers arrive on Search already pricing inventory — they convert at about a third of cold social’s cost',
  },

  // 15 — open exchange → curated TTD deals: share of spend lost to waste
  'ins-dn-15-supply-path': {
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
    caption: 'Same shoppers, far less waste — the curated path puts ~27% more of the co-op dollar to work',
  },

  // 16 — Facebook reach cap → Trade Desk: unique reach curves
  'ins-dn-16-reach-cap': {
    kind: 'line', xKey: 'spend', series: ['facebook', 'ttd'],
    config: {
      facebook: { label: 'Facebook — new people reached', color: RED },
      ttd: { label: 'The Trade Desk — new people reached', color: TEAL },
    },
    refLines: [{ axis: 'x', value: '$0.8M', label: 'Facebook reach ceiling', color: GOLD }],
    data: [
      { spend: '$0.3M', facebook: 19, ttd: 16 }, { spend: '$0.5M', facebook: 15, ttd: 15 },
      { spend: '$0.8M', facebook: 6, ttd: 15 }, { spend: '$1.1M', facebook: 2, ttd: 14 },
      { spend: '$1.4M', facebook: 1, ttd: 14 },
    ],
    caption: 'Past ~$0.8M local Facebook just adds frequency — The Trade Desk still finds new people at the same cost',
  },

  // 17 — auction pressure: cost of reach spikes as a rival enters the rollup
  'ins-dn-17-auction-pressure': {
    kind: 'line', xKey: 'week', series: ['search', 'ctvSocial'],
    config: {
      search: { label: 'Search — cost of reach', color: RED },
      ctvSocial: { label: 'CTV + social — cost of reach', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W-3', label: 'Rival flight starts', color: GOLD }],
    data: [
      { week: 'W-5', search: 100, ctvSocial: 100 }, { week: 'W-4', search: 101, ctvSocial: 99 },
      { week: 'W-3', search: 109, ctvSocial: 100 }, { week: 'W-2', search: 123, ctvSocial: 101 },
      { week: 'W-1', search: 129, ctvSocial: 100 }, { week: 'Now', search: 130, ctvSocial: 99 },
    ],
    caption: 'A rival crowded the Search auction across the rollup — the same reach is ~30% cheaper on CTV and social',
  },

  // xr1 — creative transfer: walkaround vs static, BC (proven) vs Ontario (untapped)
  'ins-dn-xr1-creative-transfer': {
    kind: 'bar', xKey: 'region', series: ['static', 'walkaround'],
    config: {
      static: { label: 'Static inventory ad — conversion (index)', color: MUTED },
      walkaround: { label: 'Vertical walkaround — conversion (index)', color: TEAL },
    },
    data: [
      { region: 'Ontario (running today)', static: 100, walkaround: 93 },
      { region: 'BC (proven)', static: 100, walkaround: 151 },
    ],
    legend: [
      { label: 'Walkaround — proven 1.5× in BC', color: TEAL },
      { label: 'Static ad — Ontario default', color: MUTED },
    ],
    caption: 'The walkaround wins ~1.5× in BC on the same metric — and Ontario has the same browsing shopper. Port the asset',
  },

  // xr2 — leading indicator: Alberta (lead) vs Prairies (lag ~5 weeks) tracing the same decay
  'ins-dn-xr2-leading-indicator': {
    kind: 'line', xKey: 'week', series: ['alberta', 'prairies'],
    config: {
      alberta: { label: 'Alberta cost per visit (leading)', color: RED },
      prairies: { label: 'Prairies cost per visit (lagging ~5 wks)', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W4', label: 'Prairies reach the Alberta inflection', color: GOLD }],
    data: [
      { week: 'W1', alberta: 142, prairies: 100 },
      { week: 'W2', alberta: 158, prairies: 101 },
      { week: 'W3', alberta: 171, prairies: 116 },
      { week: 'W4', alberta: 176, prairies: 142 },
      { week: 'W5', alberta: 178, prairies: 158 },
    ],
    caption: 'The Prairies are tracing the exact Alberta cost climb ~5 weeks behind — pull weight at the inflection Alberta already mapped',
  },

  // xr3 — demand correlation: Ontario corridor (earlier) vs BC (now) on the same comparison-search curve
  'ins-dn-xr3-demand-correlation': {
    kind: 'line', xKey: 'phase', series: ['ontario', 'bc'],
    config: {
      ontario: { label: 'Ontario comparison-search → led conquest by ~6 wks', color: BLUE },
      bc: { label: 'BC comparison-search (now)', color: TEAL },
    },
    refLines: [{ axis: 'x', value: 'W3', label: 'BC today (~6 wks pre-conquest)', color: GOLD }],
    data: [
      { phase: 'W1', ontario: 146, bc: 100 },
      { phase: 'W2', ontario: 174, bc: 103 },
      { phase: 'W3', ontario: 197, bc: 122 },
      { phase: 'W4', ontario: 205, bc: 150 },
      { phase: 'W5', ontario: 208, bc: 178 },
    ],
    caption: 'BC is climbing the same comparison-search curve Ontario rode into its conquest lift ~6 weeks earlier — fund ahead of it',
  },
};

// ACME / ACME Luxury / Franchise visuals (above) plus the self-contained per-client maps.
const ALL_VISUALS: Record<string, InsightVisual> = {
  ...VISUALS,
  ...RBC_VISUALS,
  ...MOLSON_COORS_VISUALS,
  ...LULULEMON_VISUALS,
  ...TIM_HORTONS_VISUALS,
  ...AUTO_CAMPAIGN_VISUALS,
  ...AUTO_CONTEXT_VISUALS,
};

// Fallback for any unmapped insight (ACME Luxury, dealership network, market radar):
// a clean single-series trend rather than the old noisy composed chart.
export function getInsightVisual(insightId: string): InsightVisual {
  const v = ALL_VISUALS[insightId];
  if (v) return v;

  // Deterministic-ish gentle upward trend so fallbacks look intentional, not random.
  const seed = insightId.length;
  const base = 60 + (seed % 12);
  const data = Array.from({ length: 6 }, (_, i) => ({
    week: `W${i + 1}`,
    value: Math.round(base + i * (4 + (seed % 3)) + (i % 2 === 0 ? 2 : -1)),
  }));
  return {
    kind: 'line',
    xKey: 'week',
    series: ['value'],
    config: { value: { label: 'Performance index', color: TEAL } },
    data,
    caption: 'Trailing performance trend',
  };
}
