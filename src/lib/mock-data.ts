import { subDays, format } from 'date-fns';
import type {
  ChannelId, Campaign,
  DailyMetrics, AggregatedKPIs, KPIDelta, KPIKey,
  NewsItem, NewsTag, NewsUrgency,
  Insight, InsightActionStep,
  Anomaly,
  GeoId,
  EnterpriseId,
} from '@/types';
import { CHANNEL_LABELS } from '@/types';
import { type CampaignDef } from './clients/_shared';
import { RBC_CAMPAIGN_DEFS, RBC_INSIGHTS, RBC_NEWS, RBC_RADAR_PINS } from './clients/rbc';
import { MOLSON_COORS_CAMPAIGN_DEFS, MOLSON_COORS_INSIGHTS, MOLSON_COORS_NEWS, MOLSON_COORS_RADAR_PINS } from './clients/molson-coors';
import { LULULEMON_CAMPAIGN_DEFS, LULULEMON_INSIGHTS, LULULEMON_NEWS, LULULEMON_RADAR_PINS } from './clients/lululemon';
import { TIM_HORTONS_CAMPAIGN_DEFS, TIM_HORTONS_INSIGHTS, TIM_HORTONS_NEWS, TIM_HORTONS_RADAR_PINS } from './clients/tim-hortons';
// ACME Automotive filter-specific (scoped) signals — surface only when a campaign / region / channel is selected
import { AUTO_CAMPAIGN_INSIGHTS } from './automotive-scoped-campaign-insights';
import { AUTO_CONTEXT_INSIGHTS } from './automotive-scoped-context-insights';

// ===== Seedable PRNG (Mulberry32) =====
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

function randBetween(min: number, max: number): number {
  return min + rng() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(randBetween(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}

function gaussian(): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ===== Constants =====
const END_DATE = new Date('2026-05-08');
const DATA_DAYS = 180;
const START_DATE = subDays(END_DATE, DATA_DAYS - 1);
const ALL_GEOS: GeoId[] = ['national', 'bc', 'alberta', 'ontario', 'quebec', 'atlantic'];
const ALL_CHANNELS: ChannelId[] = ['instagram', 'facebook', 'tiktok', 'google-search', 'ttd', 'ctv', 'spotify', 'linkedin', 'ooh'];

// ===== Channel Profiles =====
// Tuned so Tier 1 campaigns aggregate to roughly $218 CPL (per-campaign cplCalibration adjusts off this baseline).
interface ChannelProfile {
  baseSpend: number;
  cpmRange: [number, number];
  ctrRange: [number, number];
  cvrRange: [number, number];
  cpcRange: [number, number];
  videoViewRate: number;
  videoCompletionRate: number;
  engagementMultiplier: number;
  volatility: number;
}

const CHANNEL_PROFILES: Record<ChannelId, ChannelProfile> = {
  'google-search': { baseSpend: 2085, cpmRange: [18, 38], ctrRange: [3, 7],     cvrRange: [0.36, 0.84], cpcRange: [3, 7],   videoViewRate: 0,   videoCompletionRate: 0,   engagementMultiplier: 0.5, volatility: 0.15 },
  'facebook':      { baseSpend: 1730, cpmRange: [10, 22], ctrRange: [0.9, 2.0], cvrRange: [0.24, 0.56], cpcRange: [1.2, 3.5], videoViewRate: 0.3, videoCompletionRate: 0.25, engagementMultiplier: 1.2, volatility: 0.12 },
  'instagram':     { baseSpend: 1535, cpmRange: [10, 24], ctrRange: [0.8, 1.8], cvrRange: [0.21, 0.49], cpcRange: [1.5, 4],   videoViewRate: 0.4, videoCompletionRate: 0.3,  engagementMultiplier: 1.5, volatility: 0.10 },
  'tiktok':        { baseSpend: 1185, cpmRange: [6, 18],  ctrRange: [0.6, 1.6], cvrRange: [0.15, 0.35], cpcRange: [0.8, 2.5], videoViewRate: 0.8, videoCompletionRate: 0.15, engagementMultiplier: 2.0, volatility: 0.25 },
  'ttd':           { baseSpend: 2570, cpmRange: [6, 18],  ctrRange: [0.2, 0.8], cvrRange: [0.30, 0.70], cpcRange: [1.5, 5],   videoViewRate: 0.2, videoCompletionRate: 0.2,  engagementMultiplier: 0.3, volatility: 0.08 },
  'ctv':           { baseSpend: 3200, cpmRange: [22, 45], ctrRange: [0.15, 0.5],cvrRange: [0.09, 0.21], cpcRange: [4, 10],    videoViewRate: 0.9, videoCompletionRate: 0.7,  engagementMultiplier: 0.2, volatility: 0.06 },
  'spotify':       { baseSpend: 1400, cpmRange: [12, 28], ctrRange: [0.4, 1.2], cvrRange: [0.09, 0.21], cpcRange: [2, 5],     videoViewRate: 0.0, videoCompletionRate: 0.0,  engagementMultiplier: 0.4, volatility: 0.10 },
  'linkedin':      { baseSpend: 1800, cpmRange: [15, 35], ctrRange: [0.5, 1.5], cvrRange: [0.45, 1.05], cpcRange: [3, 8],     videoViewRate: 0.15, videoCompletionRate: 0.2, engagementMultiplier: 0.6, volatility: 0.10 },
  'ooh':           { baseSpend: 2200, cpmRange: [8, 20],  ctrRange: [0.1, 0.3], cvrRange: [0.048, 0.112], cpcRange: [5, 15],  videoViewRate: 0,   videoCompletionRate: 0,   engagementMultiplier: 0.1, volatility: 0.05 },
};

// ===== Geo multipliers (spend weighting per region) =====
const GEO_MULTIPLIERS: Record<GeoId, number> = {
  'national': 1.4,
  'ontario':  1.3,
  'quebec':   1.1,
  'bc':       1.15,
  'alberta':  1.0,
  'atlantic': 0.7,
};

// ===== Province-level distribution (ACME dealers ~554 across Canada) =====
export const PROVINCE_BRANCH_WEIGHT: Record<string, number> = {
  'ON': 0.380, 'QC': 0.220, 'AB': 0.140, 'BC': 0.130,
  'NS': 0.040, 'NB': 0.035, 'MB': 0.025, 'SK': 0.020,
  'NL': 0.007, 'PE': 0.003,
};

// ===== Geo region → Canadian provinces mapping =====
export const GEO_TO_PROVINCES: Record<GeoId, string[]> = {
  'national': ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL'],
  'bc':       ['BC'],
  'alberta':  ['AB'],
  'ontario':  ['ON'],
  'quebec':   ['QC'],
  'atlantic': ['NB', 'NS', 'PE', 'NL'],
};

// ===== Campaign definitions =====
// ~22 hand-authored campaigns with budget targets:
//   Tier 1 ~$61.2M, Tier 2 ~$41.8M, Tier 3 ~$21.4M, total ~$124M
// cplCalibration directly scales final lead count to land specific CPL outcomes.
//   1.0 = Tier 1 baseline (~$218 CPL)
//   <1 = worse CPL (Ontario Regional 0.73 → ~$298)
//   >1 = better CPL (BC Regional 1.47 → ~$148, Transit 2.32 → ~$94)
// CampaignDef is defined in ./clients/_shared and imported above so the
// cross-industry client modules can share the exact shape.

const CAMPAIGN_DEFS: CampaignDef[] = [
  // ── TIER 1 — NATIONAL (Mindshare AOR) — ~$61.2M ──
  // cplCalibration tuned so Tier 1 aggregate ≈ $218 CPL; BC Regional ≈ $148; Ontario Regional ≈ $298; Transit ≈ $94
  { id: 'ford-lightning-launch-hero', name: 'Electric Pickup Launch — National Hero',
    enterprise: 'ford-canada', division: 'tier-1', agency: 'mindshare', productLine: 'lightning',
    audiences: ['truck-intenders', 'ev-considerers', 'conquest-tesla'],
    objective: 'awareness', status: 'live',
    channels: ['ctv', 'ttd', 'google-search', 'instagram', 'ooh'],
    geos: ['national'], budgetMultiplier: 1.85, plannedBudget: 12_400_000,
    revPerConvRange: [42_000, 68_000], cvrModifier: 1.05, cplCalibration: 0.40, revTrend: 0.0006 },

  { id: 'ford-f150-built-tough', name: 'Full-Size Truck Built ACME Tough — Spring',
    enterprise: 'ford-canada', division: 'tier-1', agency: 'mindshare', productLine: 'f150',
    audiences: ['truck-intenders', 'fleet-commercial'],
    objective: 'awareness', status: 'live',
    channels: ['ctv', 'ttd', 'google-search', 'ooh'],
    geos: ['national'], budgetMultiplier: 1.55, plannedBudget: 8_800_000,
    revPerConvRange: [38_000, 58_000], cvrModifier: 1.0, cplCalibration: 0.40, revTrend: 0.0003 },

  { id: 'ford-mach-e-defense', name: 'Electric Crossover vs Compact Electric SUV Defense',
    enterprise: 'ford-canada', division: 'tier-1', agency: 'mindshare', productLine: 'mach-e',
    audiences: ['ev-considerers', 'conquest-gm', 'conquest-hyundai-kia'],
    objective: 'consideration', status: 'live',
    channels: ['google-search', 'instagram', 'tiktok', 'ttd'],
    geos: ['national'], budgetMultiplier: 1.20, plannedBudget: 5_400_000,
    revPerConvRange: [42_000, 58_000], cvrModifier: 0.95, cplCalibration: 0.40, revTrend: -0.0002 },

  { id: 'ford-bronco-adventure-national', name: 'Rugged SUV Adventure — National',
    enterprise: 'ford-canada', division: 'tier-1', agency: 'mindshare', productLine: 'bronco',
    audiences: ['adventure-lifestyle'],
    objective: 'awareness', status: 'live',
    channels: ['ctv', 'instagram', 'tiktok', 'ttd'],
    geos: ['national'], budgetMultiplier: 1.35, plannedBudget: 6_800_000,
    revPerConvRange: [38_000, 52_000], cvrModifier: 1.05, cplCalibration: 0.40, revTrend: 0.0004 },

  { id: 'ford-explorer-family', name: 'Three-Row SUV Family — Conquest from Compact SUV',
    enterprise: 'ford-canada', division: 'tier-1', agency: 'mindshare', productLine: 'explorer',
    audiences: ['family-suv-shoppers', 'conquest-toyota'],
    objective: 'consideration', status: 'live',
    channels: ['ctv', 'google-search', 'instagram', 'facebook'],
    geos: ['national'], budgetMultiplier: 1.40, plannedBudget: 7_200_000,
    revPerConvRange: [44_000, 60_000], cvrModifier: 1.0, cplCalibration: 0.40, revTrend: 0.0002 },

  { id: 'ford-escape-phev-izev', name: 'Plug-In Hybrid SUV — iZEV Opportunity',
    enterprise: 'ford-canada', division: 'tier-1', agency: 'mindshare', productLine: 'escape-phev',
    audiences: ['phev-shoppers', 'family-suv-shoppers', 'conquest-toyota'],
    objective: 'consideration', status: 'live',
    channels: ['google-search', 'instagram', 'facebook', 'ttd'],
    geos: ['national'], budgetMultiplier: 0.90, plannedBudget: 3_400_000,
    revPerConvRange: [36_000, 48_000], cvrModifier: 1.10, cplCalibration: 0.42, revTrend: 0.0005 },

  { id: 'ford-transit-fleet', name: 'Commercial Van Fleet & Commercial',
    enterprise: 'ford-canada', division: 'tier-1', agency: 'mindshare', productLine: 'transit',
    audiences: ['fleet-commercial'],
    objective: 'conversion', status: 'live',
    channels: ['linkedin', 'google-search', 'ttd'],
    geos: ['national'], budgetMultiplier: 1.05, plannedBudget: 4_200_000,
    revPerConvRange: [48_000, 72_000], cvrModifier: 1.20, cplCalibration: 0.93, revTrend: 0.0006 },

  { id: 'ford-edge-mature', name: 'Midsize SUV — Mature Nameplate Maintenance',
    enterprise: 'ford-canada', division: 'tier-1', agency: 'mindshare', productLine: 'edge',
    audiences: ['family-suv-shoppers'],
    objective: 'awareness', status: 'live',
    channels: ['google-search', 'facebook', 'ttd'],
    geos: ['national'], budgetMultiplier: 0.80, plannedBudget: 2_800_000,
    revPerConvRange: [34_000, 46_000], cvrModifier: 0.85, cplCalibration: 0.34, revTrend: -0.0004 },

  { id: 'ford-brand-q2', name: 'Built ACME Tough — Master Brand Q2',
    enterprise: 'ford-canada', division: 'tier-1', agency: 'mindshare', productLine: 'f150',
    audiences: ['truck-intenders'],
    objective: 'awareness', status: 'live',
    channels: ['ctv', 'ooh', 'spotify'],
    geos: ['national'], budgetMultiplier: 1.65, plannedBudget: 10_200_000,
    revPerConvRange: [40_000, 56_000], cvrModifier: 0.90, cplCalibration: 0.38, revTrend: 0.0001 },

  // ── TIER 2 — REGIONAL — ~$41.8M ──

  // BC Regional — best-in-class CPL ($148) — Scenario 2 hero
  { id: 'ford-lightning-bc-regional', name: 'Electric Pickup Regional — BC',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'bc-regional', productLine: 'lightning',
    audiences: ['truck-intenders', 'ev-considerers'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'instagram', 'facebook'],
    geos: ['bc'], budgetMultiplier: 0.85, plannedBudget: 2_400_000,
    revPerConvRange: [42_000, 64_000], cvrModifier: 1.20, cplCalibration: 0.59, revTrend: 0.0006 },

  { id: 'ford-bronco-bc-regional', name: 'Rugged SUV Adventure — BC Regional',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'bc-regional', productLine: 'bronco',
    audiences: ['adventure-lifestyle'],
    objective: 'consideration', status: 'live',
    channels: ['instagram', 'tiktok', 'google-search'],
    geos: ['bc'], budgetMultiplier: 0.75, plannedBudget: 1_800_000,
    revPerConvRange: [38_000, 52_000], cvrModifier: 1.15, cplCalibration: 0.59, revTrend: 0.0005 },

  { id: 'ford-f150-bc-regional', name: 'Full-Size Truck — BC Regional',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'bc-regional', productLine: 'f150',
    audiences: ['truck-intenders'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'instagram'],
    geos: ['bc'], budgetMultiplier: 0.95, plannedBudget: 3_200_000,
    revPerConvRange: [40_000, 56_000], cvrModifier: 1.20, cplCalibration: 0.59, revTrend: 0.0004 },

  // Ontario Regional — anomaly market ($298 CPL) — Scenario 1 + 2
  { id: 'ford-lightning-on-regional', name: 'Electric Pickup Regional — Ontario',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'ontario-regional', productLine: 'lightning',
    audiences: ['truck-intenders', 'ev-considerers'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'instagram', 'facebook', 'spotify'],
    geos: ['ontario'], budgetMultiplier: 1.05, plannedBudget: 3_400_000,
    revPerConvRange: [42_000, 64_000], cvrModifier: 0.85, cplCalibration: 0.29, revTrend: -0.0001 },

  { id: 'ford-f150-on-regional', name: 'Full-Size Truck — Ontario Regional',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'ontario-regional', productLine: 'f150',
    audiences: ['truck-intenders'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'instagram', 'ttd'],
    geos: ['ontario'], budgetMultiplier: 1.30, plannedBudget: 5_200_000,
    revPerConvRange: [40_000, 56_000], cvrModifier: 0.90, cplCalibration: 0.29, revTrend: 0.0001 },

  { id: 'ford-explorer-on-regional', name: 'Three-Row SUV — Ontario Regional',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'ontario-regional', productLine: 'explorer',
    audiences: ['family-suv-shoppers'],
    objective: 'consideration', status: 'live',
    channels: ['google-search', 'facebook', 'instagram'],
    geos: ['ontario'], budgetMultiplier: 0.95, plannedBudget: 2_800_000,
    revPerConvRange: [42_000, 58_000], cvrModifier: 0.85, cplCalibration: 0.29, revTrend: 0 },

  // Alberta Regional — slightly above Tier 1 baseline (~$210)
  { id: 'ford-f150-ab-regional', name: 'Full-Size Truck — Alberta Regional',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'alberta-regional', productLine: 'f150',
    audiences: ['truck-intenders', 'fleet-commercial'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'instagram'],
    geos: ['alberta'], budgetMultiplier: 1.00, plannedBudget: 3_600_000,
    revPerConvRange: [40_000, 56_000], cvrModifier: 1.05, cplCalibration: 0.42, revTrend: 0.0003 },

  { id: 'ford-bronco-ab-regional', name: 'Rugged SUV — Alberta Regional',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'alberta-regional', productLine: 'bronco',
    audiences: ['adventure-lifestyle'],
    objective: 'consideration', status: 'live',
    channels: ['instagram', 'tiktok', 'facebook'],
    geos: ['alberta'], budgetMultiplier: 0.70, plannedBudget: 1_400_000,
    revPerConvRange: [38_000, 52_000], cvrModifier: 1.05, cplCalibration: 0.42, revTrend: 0.0003 },

  // Cossette (Quebec) — at Tier 1 baseline
  { id: 'ford-f150-qc-cossette', name: 'Full-Size Truck — Quebec (Cossette)',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'cossette', productLine: 'f150',
    audiences: ['truck-intenders'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'instagram', 'spotify'],
    geos: ['quebec'], budgetMultiplier: 1.05, plannedBudget: 3_800_000,
    revPerConvRange: [40_000, 56_000], cvrModifier: 1.0, cplCalibration: 0.40, revTrend: 0.0002 },

  { id: 'ford-escape-qc-cossette', name: 'Plug-In Hybrid SUV — Quebec (Cossette)',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'cossette', productLine: 'escape-phev',
    audiences: ['phev-shoppers'],
    objective: 'consideration', status: 'live',
    channels: ['google-search', 'facebook', 'instagram'],
    geos: ['quebec'], budgetMultiplier: 0.85, plannedBudget: 2_200_000,
    revPerConvRange: [36_000, 48_000], cvrModifier: 1.05, cplCalibration: 0.42, revTrend: 0.0004 },

  // Atlantic Regional — modestly below Tier 1
  { id: 'ford-f150-at-regional', name: 'Full-Size Truck — Atlantic Regional',
    enterprise: 'ford-canada', division: 'tier-2', agency: 'atlantic-regional', productLine: 'f150',
    audiences: ['truck-intenders'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'instagram'],
    geos: ['atlantic'], budgetMultiplier: 0.80, plannedBudget: 1_600_000,
    revPerConvRange: [38_000, 52_000], cvrModifier: 0.95, cplCalibration: 0.38, revTrend: 0 },

  // ── TIER 3 — DEALER NETWORK (aggregate) — ~$21.4M ──
  { id: 'ford-dealer-spring-sales', name: 'Franchise Spring Sales Event (Aggregate)',
    enterprise: 'ford-canada', division: 'tier-3', agency: 'dealer-network', productLine: 'f150',
    audiences: ['truck-intenders'],
    objective: 'conversion', status: 'live',
    channels: ['facebook', 'instagram', 'google-search'],
    geos: ['ontario', 'alberta', 'bc', 'quebec', 'atlantic'],
    budgetMultiplier: 1.45, plannedBudget: 12_400_000,
    revPerConvRange: [38_000, 52_000], cvrModifier: 0.85, cplCalibration: 0.34, revTrend: 0.0001 },

  { id: 'ford-dealer-lightning-leads', name: 'Franchise Electric Pickup Lead Gen (Aggregate)',
    enterprise: 'ford-canada', division: 'tier-3', agency: 'dealer-network', productLine: 'lightning',
    audiences: ['ev-considerers', 'truck-intenders'],
    objective: 'conversion', status: 'live',
    channels: ['facebook', 'instagram', 'google-search'],
    geos: ['ontario', 'alberta', 'bc', 'quebec'],
    budgetMultiplier: 1.10, plannedBudget: 6_200_000,
    revPerConvRange: [42_000, 64_000], cvrModifier: 0.85, cplCalibration: 0.34, revTrend: 0.0003 },

  { id: 'ford-dealer-suv-shoppers', name: 'Franchise SUV Lead Gen (Aggregate)',
    enterprise: 'ford-canada', division: 'tier-3', agency: 'dealer-network', productLine: 'explorer',
    audiences: ['family-suv-shoppers'],
    objective: 'conversion', status: 'live',
    channels: ['facebook', 'instagram', 'google-search'],
    geos: ['ontario', 'alberta', 'bc'],
    budgetMultiplier: 0.85, plannedBudget: 2_800_000,
    revPerConvRange: [40_000, 56_000], cvrModifier: 0.90, cplCalibration: 0.34, revTrend: 0.0002 },

  // ═══════════════════════════════════════════════════════════════════
  // ACME LUXURY — luxury division (~$34M total) — Hudson Rouge AOR + Cossette Luxury
  // Higher CPL ($340-$580), heavier CTV/OOH/Spotify, conquest from European Luxury + Import Luxury
  // ═══════════════════════════════════════════════════════════════════

  // ── Luxury Three-Row SUV (mid-size luxury SUV, halo nameplate) ──
  { id: 'lincoln-aviator-quiet-luxury', name: 'Luxury Three-Row SUV — Quiet Luxury Hero',
    enterprise: 'lincoln', division: 'tier-1', agency: 'hudson-rouge', productLine: 'lincoln-aviator',
    audiences: ['luxury-intenders', 'conquest-bmw', 'conquest-mercedes'],
    objective: 'awareness', status: 'live',
    channels: ['ctv', 'spotify', 'ooh', 'instagram'],
    geos: ['national'], budgetMultiplier: 1.0, plannedBudget: 5_400_000,
    revPerConvRange: [78_000, 102_000], cvrModifier: 0.88, cplCalibration: 0.18, revTrend: 0.0004 },

  { id: 'lincoln-aviator-conquest-x5', name: 'Luxury Three-Row SUV vs Sport-Luxury SUV — Conquest Search',
    enterprise: 'lincoln', division: 'tier-1', agency: 'hudson-rouge', productLine: 'lincoln-aviator',
    audiences: ['conquest-bmw', 'conquest-audi'],
    objective: 'consideration', status: 'live',
    channels: ['google-search', 'ttd', 'instagram'],
    geos: ['national'], budgetMultiplier: 0.85, plannedBudget: 2_800_000,
    revPerConvRange: [78_000, 102_000], cvrModifier: 0.92, cplCalibration: 0.20, revTrend: 0.0003 },

  // ── Luxury Midsize SUV (volume mid-size luxury SUV) ──
  { id: 'lincoln-nautilus-launch', name: 'Luxury Midsize SUV 2026 — Hybrid Launch',
    enterprise: 'lincoln', division: 'tier-1', agency: 'hudson-rouge', productLine: 'lincoln-nautilus',
    audiences: ['luxury-intenders', 'phev-shoppers', 'conquest-lexus', 'conquest-mercedes'],
    objective: 'awareness', status: 'live',
    channels: ['ctv', 'ttd', 'google-search', 'spotify'],
    geos: ['national'], budgetMultiplier: 1.20, plannedBudget: 6_800_000,
    revPerConvRange: [68_000, 88_000], cvrModifier: 1.0, cplCalibration: 0.22, revTrend: 0.0005 },

  { id: 'lincoln-nautilus-mature', name: 'Luxury Midsize SUV — Mid-funnel Always-On',
    enterprise: 'lincoln', division: 'tier-2', agency: 'cossette-luxury', productLine: 'lincoln-nautilus',
    audiences: ['luxury-intenders', 'lincoln-loyalists'],
    objective: 'consideration', status: 'live',
    channels: ['google-search', 'instagram', 'facebook'],
    geos: ['ontario', 'quebec', 'bc'], budgetMultiplier: 0.70, plannedBudget: 2_400_000,
    revPerConvRange: [68_000, 88_000], cvrModifier: 1.05, cplCalibration: 0.24, revTrend: 0.0002 },

  // ── Luxury Compact SUV (entry luxury — gateway nameplate) ──
  { id: 'lincoln-corsair-entry-luxury', name: 'Luxury Compact SUV — First-Time Luxury Buyers',
    enterprise: 'lincoln', division: 'tier-1', agency: 'hudson-rouge', productLine: 'lincoln-corsair',
    audiences: ['luxury-intenders', 'conquest-audi', 'conquest-lexus'],
    objective: 'consideration', status: 'live',
    channels: ['instagram', 'google-search', 'tiktok', 'ttd'],
    geos: ['national'], budgetMultiplier: 0.90, plannedBudget: 3_400_000,
    revPerConvRange: [54_000, 68_000], cvrModifier: 1.10, cplCalibration: 0.28, revTrend: 0.0006 },

  { id: 'lincoln-corsair-quebec-fr', name: 'Luxury Compact SUV — Quebec French-Language',
    enterprise: 'lincoln', division: 'tier-2', agency: 'cossette-luxury', productLine: 'lincoln-corsair',
    audiences: ['luxury-intenders'],
    objective: 'consideration', status: 'live',
    channels: ['instagram', 'facebook', 'spotify'],
    geos: ['quebec'], budgetMultiplier: 0.65, plannedBudget: 1_800_000,
    revPerConvRange: [54_000, 68_000], cvrModifier: 1.05, cplCalibration: 0.30, revTrend: 0.0004 },

  // ── Luxury Full-Size SUV (flagship full-size luxury SUV) ──
  { id: 'lincoln-navigator-flagship', name: 'Luxury Full-Size SUV — Flagship Hero',
    enterprise: 'lincoln', division: 'tier-1', agency: 'hudson-rouge', productLine: 'lincoln-navigator',
    audiences: ['luxury-intenders', 'conquest-mercedes', 'lincoln-loyalists'],
    objective: 'awareness', status: 'live',
    channels: ['ctv', 'ooh', 'spotify', 'instagram'],
    geos: ['national'], budgetMultiplier: 1.30, plannedBudget: 7_200_000,
    revPerConvRange: [108_000, 142_000], cvrModifier: 0.78, cplCalibration: 0.14, revTrend: 0.0003 },

  { id: 'lincoln-navigator-conquest-escalade', name: 'Luxury Full-Size SUV vs Full-Size Luxury SUV — Conquest',
    enterprise: 'lincoln', division: 'tier-1', agency: 'hudson-rouge', productLine: 'lincoln-navigator',
    audiences: ['luxury-intenders', 'conquest-bmw'],
    objective: 'consideration', status: 'live',
    channels: ['google-search', 'ttd', 'linkedin'],
    geos: ['national'], budgetMultiplier: 0.95, plannedBudget: 3_800_000,
    revPerConvRange: [108_000, 142_000], cvrModifier: 0.82, cplCalibration: 0.16, revTrend: 0.0002 },

  // ═══════════════════════════════════════════════════════════════════
  // DEALERSHIP NETWORK — aggregate co-op rollup view (~$42M total)
  // 6 regional rollups representing 890+ dealers' aggregated co-op spend
  // Heavy local Search + Meta retargeting; lower CPL ($95-$180); high local relevance
  // ═══════════════════════════════════════════════════════════════════

  { id: 'dn-bc-coop-aggregate', name: 'BC Franchise Co-op — Aggregate Rollup',
    enterprise: 'dealership-network', division: 'tier-3', agency: 'dealer-network', productLine: 'dn-bc-rollup',
    audiences: ['local-shoppers', 'service-loyalists', 'finance-deal-seekers'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'instagram'],
    geos: ['bc'], budgetMultiplier: 1.10, plannedBudget: 6_800_000,
    revPerConvRange: [38_000, 54_000], cvrModifier: 1.25, cplCalibration: 1.40, revTrend: 0.0003 },

  { id: 'dn-ontario-coop-aggregate', name: 'Ontario Franchise Co-op — Aggregate Rollup',
    enterprise: 'dealership-network', division: 'tier-3', agency: 'dealer-network', productLine: 'dn-ontario-rollup',
    audiences: ['local-shoppers', 'finance-deal-seekers'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'instagram'],
    geos: ['ontario'], budgetMultiplier: 1.45, plannedBudget: 12_400_000,
    revPerConvRange: [38_000, 54_000], cvrModifier: 1.10, cplCalibration: 0.95, revTrend: 0.0002 },

  { id: 'dn-quebec-coop-aggregate', name: 'Quebec Franchise Co-op — Aggregate Rollup',
    enterprise: 'dealership-network', division: 'tier-3', agency: 'dealer-network', productLine: 'dn-quebec-rollup',
    audiences: ['local-shoppers', 'service-loyalists'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'instagram'],
    geos: ['quebec'], budgetMultiplier: 1.15, plannedBudget: 7_400_000,
    revPerConvRange: [38_000, 54_000], cvrModifier: 1.20, cplCalibration: 1.30, revTrend: 0.0004 },

  { id: 'dn-alberta-coop-aggregate', name: 'Alberta Franchise Co-op — Aggregate Rollup',
    enterprise: 'dealership-network', division: 'tier-3', agency: 'dealer-network', productLine: 'dn-alberta-rollup',
    audiences: ['local-shoppers', 'finance-deal-seekers'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'instagram'],
    geos: ['alberta'], budgetMultiplier: 1.05, plannedBudget: 5_800_000,
    revPerConvRange: [38_000, 54_000], cvrModifier: 1.15, cplCalibration: 1.10, revTrend: 0.0003 },

  { id: 'dn-atlantic-coop-aggregate', name: 'Atlantic Franchise Co-op — Aggregate Rollup',
    enterprise: 'dealership-network', division: 'tier-3', agency: 'dealer-network', productLine: 'dn-atlantic-rollup',
    audiences: ['local-shoppers', 'service-loyalists'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook'],
    geos: ['atlantic'], budgetMultiplier: 0.85, plannedBudget: 3_400_000,
    revPerConvRange: [38_000, 54_000], cvrModifier: 1.05, cplCalibration: 1.00, revTrend: 0.0002 },

  { id: 'dn-prairies-coop-aggregate', name: 'Prairies Franchise Co-op — Aggregate Rollup',
    enterprise: 'dealership-network', division: 'tier-3', agency: 'dealer-network', productLine: 'dn-prairies-rollup',
    audiences: ['local-shoppers', 'finance-deal-seekers'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook'],
    geos: ['alberta'], budgetMultiplier: 0.90, plannedBudget: 4_200_000,
    revPerConvRange: [38_000, 54_000], cvrModifier: 1.10, cplCalibration: 1.05, revTrend: 0.0003 },

  // Service & finance overlays (cross-regional)
  { id: 'dn-service-loyalty-national', name: 'Service Loyalty — National Email + Search',
    enterprise: 'dealership-network', division: 'tier-3', agency: 'dealer-network', productLine: 'dn-ontario-rollup',
    audiences: ['service-loyalists'],
    objective: 'retention', status: 'live',
    channels: ['google-search', 'facebook'],
    geos: ['national'], budgetMultiplier: 0.40, plannedBudget: 1_400_000,
    revPerConvRange: [800, 1_400], cvrModifier: 1.80, cplCalibration: 2.20, revTrend: 0.0004 },

  { id: 'dn-finance-rate-deals', name: 'Finance Rate Deals — National Co-op',
    enterprise: 'dealership-network', division: 'tier-3', agency: 'dealer-network', productLine: 'dn-bc-rollup',
    audiences: ['finance-deal-seekers'],
    objective: 'conversion', status: 'live',
    channels: ['google-search', 'facebook', 'instagram'],
    geos: ['national'], budgetMultiplier: 0.60, plannedBudget: 1_800_000,
    revPerConvRange: [38_000, 52_000], cvrModifier: 1.30, cplCalibration: 1.50, revTrend: 0.0002 },

  // ── Cross-industry agency clients (authored in src/lib/clients/*) ──
  ...RBC_CAMPAIGN_DEFS,
  ...MOLSON_COORS_CAMPAIGN_DEFS,
  ...LULULEMON_CAMPAIGN_DEFS,
  ...TIM_HORTONS_CAMPAIGN_DEFS,
];

// ===== Events (anomaly + scenario context) =====
interface DataEvent {
  name: string; dayOffset: number; duration: number;
  geos: GeoId[]; spendMult: number; cvrMult: number; engageMult: number;
}

const DATA_EVENTS: DataEvent[] = [
  { name: 'Spring Truck Buying Season', dayOffset: 80,  duration: 30, geos: ['national'],            spendMult: 1.30, cvrMult: 1.15, engageMult: 1.0 },
  { name: 'Domestic Rival A Full-Size Pickup National Push', dayOffset: 110, duration: 14, geos: ['national'],         spendMult: 1.0,  cvrMult: 0.90, engageMult: 0.85 },
  { name: 'Electric Pickup Pre-Launch', dayOffset: 130, duration: 30, geos: ['national'],            spendMult: 1.40, cvrMult: 1.20, engageMult: 1.30 },
  { name: 'iZEV Extension Announcement', dayOffset: 165, duration: 7, geos: ['national'],            spendMult: 1.10, cvrMult: 1.15, engageMult: 1.10 },
  { name: 'EV Disruptor Electric Pickup Price Cut',  dayOffset: 175, duration: 5, geos: ['national'],            spendMult: 1.0,  cvrMult: 0.85, engageMult: 0.85 },
];

// ===== Data Generation =====
function generateDailyData(campaignDefs: CampaignDef[] = CAMPAIGN_DEFS): Record<string, Record<string, DailyMetrics[]>> {
  const data: Record<string, Record<string, DailyMetrics[]>> = {};

  for (const campaign of campaignDefs) {
    data[campaign.id] = {};
    const geoMult = GEO_MULTIPLIERS[campaign.geos[0]] || 1.0;

    for (const channel of campaign.channels) {
      const profile = CHANNEL_PROFILES[channel];
      const days: DailyMetrics[] = [];

      for (let d = 0; d < DATA_DAYS; d++) {
        const date = format(subDays(END_DATE, DATA_DAYS - 1 - d), 'yyyy-MM-dd');
        const dayOfWeek = new Date(date).getDay();
        const weekendMult = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.75 : 1.0;
        const seasonality = 1 + 0.03 * Math.sin((d / DATA_DAYS) * Math.PI * 4);
        const growthTrend = 0.88 + (d / DATA_DAYS) * 0.24;

        let eventSpendMult = 1, eventCvrMult = 1, eventEngageMult = 1;
        for (const evt of DATA_EVENTS) {
          if (d >= evt.dayOffset && d < evt.dayOffset + evt.duration &&
              evt.geos.some(g => campaign.geos.includes(g) || g === 'national')) {
            eventSpendMult *= evt.spendMult;
            eventCvrMult *= evt.cvrMult;
            eventEngageMult *= evt.engageMult;
          }
        }

        const noise = 1 + gaussian() * profile.volatility;
        const spendBase = profile.baseSpend * campaign.budgetMultiplier * geoMult * weekendMult * seasonality * growthTrend * eventSpendMult * Math.max(0.3, noise);
        const spend = Math.max(10, spendBase);

        const cpm = randBetween(profile.cpmRange[0], profile.cpmRange[1]) * (1 + gaussian() * 0.1);
        const impressions = Math.round((spend / cpm) * 1000);
        const reach = Math.round(impressions * randBetween(0.6, 0.85));

        const ctr = randBetween(profile.ctrRange[0], profile.ctrRange[1]) * Math.max(0.5, 1 + gaussian() * 0.15) / 100;
        const clicks = Math.round(impressions * ctr);

        const lpvRate = randBetween(0.5, 0.8);
        const landingPageViews = Math.round(clicks * lpvRate);

        const cvr = randBetween(profile.cvrRange[0], profile.cvrRange[1]) * campaign.cvrModifier * eventCvrMult * Math.max(0.3, 1 + gaussian() * 0.15) / 100;
        const conversions = Math.max(0, Math.round(clicks * cvr));
        // Apply per-campaign cplCalibration to lead count (higher = better CPL)
        const leadBase = conversions * randBetween(1.5, 3) * campaign.cplCalibration;
        const leads = Math.round(leadBase);

        const dayTrend = 1 + (campaign.revTrend * d);
        const avgOrderValue = randBetween(campaign.revPerConvRange[0], campaign.revPerConvRange[1]);
        const revenue = conversions * avgOrderValue * randBetween(0.85, 1.15) * dayTrend;

        const videoViews3s = Math.round(impressions * profile.videoViewRate * randBetween(0.8, 1.2));
        const videoViewsThruplay = Math.round(videoViews3s * profile.videoCompletionRate * randBetween(0.7, 1.3));

        const engagements = Math.round(impressions * profile.engagementMultiplier * eventEngageMult * randBetween(0.01, 0.04));
        const assistedConversions = Math.round(conversions * randBetween(0.2, 0.5));

        days.push({
          date, spend, impressions, reach, clicks, landingPageViews,
          leads, conversions, revenue, videoViews3s, videoViewsThruplay,
          engagements, assistedConversions,
        });
      }
      data[campaign.id][channel] = days;
    }
  }
  return data;
}

// ===== Aggregation =====
export function aggregateMetrics(dailyData: DailyMetrics[]): AggregatedKPIs {
  if (dailyData.length === 0) {
    return {
      date: '', spend: 0, impressions: 0, reach: 0, clicks: 0, landingPageViews: 0,
      leads: 0, conversions: 0, revenue: 0, videoViews3s: 0, videoViewsThruplay: 0,
      engagements: 0, assistedConversions: 0,
      frequency: 0, ctr: 0, cpc: 0, cpm: 0, lpvRate: 0, cpl: 0, cpa: 0, roas: 0,
      videoCompletionRate: 0, threeSecondViewRate: 0, engagementRate: 0, brandSearchLift: 0, shareOfVoice: 0,
      volatilityScore: 0, anomalyCount: 0, budgetPacing: 0, creativeFatigueIndex: 0,
    };
  }

  const sum = (key: keyof DailyMetrics) => dailyData.reduce((s, d) => s + (d[key] as number), 0);

  const spend = sum('spend');
  const impressions = sum('impressions');
  const reach = sum('reach');
  const clicks = sum('clicks');
  const landingPageViews = sum('landingPageViews');
  const leads = sum('leads');
  const conversions = sum('conversions');
  const revenue = sum('revenue');
  const videoViews3s = sum('videoViews3s');
  const videoViewsThruplay = sum('videoViewsThruplay');
  const engagements = sum('engagements');
  const assistedConversions = sum('assistedConversions');

  const frequency = reach > 0 ? impressions / reach : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const lpvRate = clicks > 0 ? (landingPageViews / clicks) * 100 : 0;
  const cpl = leads > 0 ? spend / leads : 0;
  const cpa = conversions > 0 ? spend / conversions : 0;
  const roas = spend > 0 ? revenue / spend : 0;
  const videoCompletionRate = videoViews3s > 0 ? (videoViewsThruplay / videoViews3s) * 100 : 0;
  const threeSecondViewRate = impressions > 0 ? (videoViews3s / impressions) * 100 : 0;
  const engagementRate = impressions > 0 ? (engagements / impressions) * 100 : 0;

  const spendValues = dailyData.map(d => d.spend);
  const mean = spendValues.reduce((a, b) => a + b, 0) / spendValues.length;
  const stdDev = Math.sqrt(spendValues.reduce((s, v) => s + (v - mean) ** 2, 0) / spendValues.length);
  const volatilityScore = mean > 0 ? (stdDev / mean) * 100 : 0;

  const last7 = dailyData.slice(-7);
  let anomalyCount = 0;
  for (const day of last7) {
    const zScore = mean > 0 ? Math.abs(day.spend - mean) / (stdDev || 1) : 0;
    if (zScore > 2) anomalyCount++;
  }

  const brandSearchLift = 50 + rng() * 50;
  const shareOfVoice = 10 + rng() * 30;
  const budgetPacing = 82 + rng() * 13;
  const creativeFatigueIndex = 20 + rng() * 60;

  return {
    date: dailyData[dailyData.length - 1]?.date ?? '',
    spend, impressions, reach, clicks, landingPageViews, leads, conversions, revenue,
    videoViews3s, videoViewsThruplay, engagements, assistedConversions,
    frequency, ctr, cpc, cpm, lpvRate, cpl, cpa, roas,
    videoCompletionRate, threeSecondViewRate, engagementRate, brandSearchLift, shareOfVoice,
    volatilityScore, anomalyCount, budgetPacing, creativeFatigueIndex,
  };
}

export function computeDeltas(current: AggregatedKPIs, previous: AggregatedKPIs): Record<KPIKey, KPIDelta> {
  const result: Record<string, KPIDelta> = {};
  const keys: KPIKey[] = [
    'spend', 'impressions', 'reach', 'clicks', 'landingPageViews', 'leads', 'conversions', 'revenue',
    'videoViews3s', 'videoViewsThruplay', 'engagements', 'assistedConversions',
    'frequency', 'ctr', 'cpc', 'cpm', 'lpvRate', 'cpl', 'cpa', 'roas',
    'videoCompletionRate', 'threeSecondViewRate', 'engagementRate', 'brandSearchLift', 'shareOfVoice',
    'volatilityScore', 'anomalyCount', 'budgetPacing', 'creativeFatigueIndex',
  ];
  for (const key of keys) {
    const v = current[key] as number;
    const pv = previous[key] as number;
    result[key] = {
      value: v, previousValue: pv,
      delta: v - pv,
      deltaPercent: pv !== 0 ? ((v - pv) / pv) * 100 : 0,
    };
  }
  return result as Record<KPIKey, KPIDelta>;
}

// ===== Anomaly Detection =====
function detectAnomalies(dailyData: Record<string, Record<string, DailyMetrics[]>>, campaignDefs: CampaignDef[] = CAMPAIGN_DEFS): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const metricsToCheck: (keyof DailyMetrics)[] = ['spend', 'clicks', 'conversions', 'leads'];

  for (const campaignDef of campaignDefs) {
    for (const channel of campaignDef.channels) {
      const series = dailyData[campaignDef.id]?.[channel];
      if (!series || series.length < 30) continue;

      for (const metric of metricsToCheck) {
        const values = series.map(d => d[metric] as number);
        const rollingWindow = 30;

        for (let i = rollingWindow; i < values.length; i++) {
          const window = values.slice(i - rollingWindow, i);
          const windowMean = window.reduce((a, b) => a + b, 0) / window.length;
          const windowStd = Math.sqrt(window.reduce((s, v) => s + (v - windowMean) ** 2, 0) / window.length);

          if (windowStd === 0) continue;
          const zScore = Math.abs(values[i] - windowMean) / windowStd;

          if (zScore > 2.5) {
            const severity = zScore > 3.5 ? 'high' : zScore > 3 ? 'medium' : 'low';
            anomalies.push({
              id: `anom-${campaignDef.id}-${channel}-${metric}-${i}`,
              date: series[i].date,
              geo: campaignDef.geos[0],
              division: campaignDef.division,
              productLine: campaignDef.productLine,
              campaign: campaignDef.id,
              channel: channel,
              metric: metric as KPIKey,
              severity,
              zScore: Math.round(zScore * 100) / 100,
              description: `${metric} ${values[i] > windowMean ? 'spike' : 'drop'} in ${campaignDef.name} (${CHANNEL_LABELS[channel]}): z-score ${zScore.toFixed(1)}`,
            });
          }
        }
      }
    }
  }

  return anomalies.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 200);
}

// ===== News Generation =====
const NEWS_SOURCES_BY_TAG: Record<string, string[]> = {
  brand:        ['AdAge', 'Marketing Magazine', 'Strategy Online', 'Globe and Mail', 'BNN Bloomberg'],
  automotive:   ['Automotive News Canada', 'Driving.ca', 'MotorTrend', 'Car and Driver', 'AutoTrader Insights'],
  ev:           ['Electrek', 'InsideEVs', 'Driving.ca EV', 'Reuters', 'Automotive News Canada'],
  launch:       ['Reuters', 'Automotive News Canada', 'Globe and Mail', 'BNN Bloomberg'],
  izev:         ['Transport Canada', 'BNN Bloomberg', 'Globe and Mail', 'CBC News'],
  social:       ['Reddit r/cars', 'Reddit r/electricvehicles', 'TikTok #CarTok', 'X/Twitter Auto', 'Reddit r/ACME'],
  sports:       ['TSN', 'Sportsnet', 'AdAge', 'The Athletic'],
  sponsorships: ['TSN', 'AdAge', 'Marketing Magazine', 'Strategy Online'],
  partnerships: ['Reuters', 'Bloomberg', 'TechCrunch', 'Globe and Mail', 'BNN Bloomberg'],
  competitors:  ['Reuters', 'Automotive News Canada', 'Bloomberg', 'Driving.ca', 'Electrek'],
  macro:        ['Statistics Canada', 'Bank of Canada', 'Globe and Mail', 'BNN Bloomberg'],
};

interface NewsTemplate {
  title: string;
  tags: NewsTag[];
  urgency: NewsUrgency;
  summary: string;
  whyItMatters: string;
  competitor?: string;
}

function generateNews(): NewsItem[] {
  const items: NewsItem[] = [];

  // ── PINNED — top of feed, hand-authored ──
  const pinnedItems: NewsItem[] = [
    {
      id: 'news-tesla-cybertruck-cut',
      title: 'EV Disruptor Cuts Electric Pickup Base Pricing by ~$8,400 in Canada — Direct Pressure on the Electric Pickup',
      source: 'Reuters Canada',
      date: '2026-05-08',
      tags: ['competitors', 'ev'],
      urgency: 'high',
      competitor: 'EV Disruptor',
      regions: ['national'],
      summary: 'The EV Disruptor announced a CAD $8,400 reduction in its electric pickup base pricing across Canadian markets effective immediately. The move follows similar US pricing actions and is widely interpreted as direct conquest pressure against the Electric Pickup ahead of ACME\'s Q2 launch window.',
      whyItMatters: 'With 23 days remaining in the Electric Pickup launch window, STRATIS detected this pricing move and, in the days after, observed a measurable rise in Electric-Pickup-vs-rival comparison-shopping search — reported as a correlation, not a causal claim. See the linked STRATIS signal for the recommended test-scale response.',
      enterprises: ['ford-canada'],
    },
    {
      id: 'news-izev-extension',
      title: 'Federal iZEV Program Extended Through 2027 — Electric Pickup and Plug-In Hybrid SUV Remain Eligible',
      source: 'Transport Canada',
      date: '2026-05-02',
      tags: ['izev', 'macro', 'ev'],
      urgency: 'high',
      regions: ['national'],
      summary: 'Transport Canada confirmed extension of the federal iZEV consumer incentive program through 2027. The Electric Pickup, Electric Crossover, and Plug-In Hybrid SUV all remain eligible. The Electric Crossover moved from Tier A to Tier B eligibility, reducing rebate by $1,500.',
      whyItMatters: 'Policy tailwind for Electric Pickup and Plug-In Hybrid SUV launch positioning. The Electric Crossover now faces a CAD $1,500 net price disadvantage vs the Value Import electric crossover in iZEV-driven purchase calculus.',
      enterprises: ['ford-canada'],
    },
    {
      id: 'news-gm-silverado-fleet',
      title: 'Domestic Rival A Confirms Electric Pickup Canadian Fleet Push — National CTV Campaign Active',
      source: 'Automotive News Canada',
      date: '2026-05-05',
      tags: ['competitors', 'ev'],
      urgency: 'high',
      competitor: 'Domestic Rival A',
      regions: ['national'],
      summary: 'Domestic Rival A confirmed an expanded electric pickup national push with focus on fleet conquest and a national CTV campaign that began this week. Estimated media weight is $12M over 8 weeks.',
      whyItMatters: 'Domestic Rival A\'s electric pickup is the most institutional competitive threat to the Electric Pickup. The fleet push targets the Commercial Van\'s adjacent audience as well. Watch for SOV compression in CTV and Search.',
      enterprises: ['ford-canada'],
    },

    // ── AUDIENCE SENTIMENT & COMMUNITY LISTENING ──
    // Normal radar articles whose source is STRATIS keyword listening across relevant
    // r/ forums — surfaced in the "Audience Sentiment & Community Listening" section.
    {
      id: 'news-auto-social-ev-pickup',
      title: 'STRATIS Listening: r/electricvehicles Sentiment on the Electric Pickup Turns Positive After the Pricing Move',
      source: 'Reddit r/electricvehicles',
      date: '2026-06-20',
      tags: ['social'],
      urgency: 'high',
      regions: ['national'],
      summary: 'Custom keyword scraping flagged a sharp shift in r/electricvehicles threads discussing the Electric Pickup: posts moved from "priced out" to "actually makes sense now" within days of the latest pricing change, with EV considerers re-running commute-plus-towing math in the comments.',
      whyItMatters: 'STRATIS measured Electric-Pickup mention volume up ~38% week-over-week with sentiment flipping from mixed to positive — the same conquest window the linked competitive signal flagged, now visible in community conversation. Mirror the language shoppers are using ("finally makes sense") into conquest search and social retargeting while the window is open.',
      enterprises: ['ford-canada'],
    },
    {
      id: 'news-auto-social-fullsize-truck',
      title: 'STRATIS Listening: Capability Praise vs. Payment Frustration for the Full-Size Truck in r/Trucks',
      source: 'Reddit r/Trucks',
      date: '2026-06-19',
      tags: ['social'],
      urgency: 'medium',
      regions: ['national'],
      summary: 'r/Trucks threads remain strongly positive on the Full-Size Truck for towing and reliability, but one objection dominates the comments: the monthly payment at current rates. Sentiment reads as "want the truck, stuck on the financing."',
      whyItMatters: 'STRATIS scored product sentiment as durably positive while the only negative driver is financing, not the vehicle. The objection is addressable with message, not product — surface rate / lease-offer creative against in-market truck intenders to convert the praise that is already there.',
      enterprises: ['ford-canada'],
    },
    {
      id: 'news-auto-social-phev',
      title: 'STRATIS Listening: Gas Prices and the Rebate Drive Rising Plug-In Hybrid SUV Interest in r/PHEV',
      source: 'Reddit r/PHEV',
      date: '2026-06-21',
      tags: ['social'],
      urgency: 'high',
      regions: ['national'],
      summary: 'r/PHEV and r/electricvehicles threads show in-market shoppers running the plug-in math out loud — "with gas where it is and the rebate back, the Plug-In Hybrid SUV finally pencils out." Volume is climbing faster than any other nameplate STRATIS tracks.',
      whyItMatters: 'STRATIS measured Plug-In Hybrid SUV consideration chatter up ~52% over four weeks, correlated to fuel prices and the iZEV rebate — the macro tailwind from the linked policy signal now showing up in conversation. Fund Plug-In Hybrid SUV consideration while sentiment is climbing, not after the quarter closes.',
      enterprises: ['ford-canada'],
    },
    {
      id: 'news-auto-social-threerow-suv',
      title: 'STRATIS Listening: r/whatcarshouldIbuy Shoppers Cross-Shop the Three-Row SUV Against an Import on Fuel Economy',
      source: 'Reddit r/whatcarshouldIbuy',
      date: '2026-06-17',
      tags: ['social'],
      urgency: 'medium',
      regions: ['national'],
      summary: 'Recommendation threads repeatedly pit the Three-Row SUV against an import leader. Shoppers praise the third-row space but default to the import on fuel economy — the comparison consistently turns on mileage, not features.',
      whyItMatters: 'STRATIS identified fuel economy as the single axis where the cross-shopped import wins the thread. Lead Three-Row SUV consideration creative with efficiency and hybrid proof points to neutralize the one losing comparison before it reaches the dealer.',
      enterprises: ['ford-canada'],
    },
    {
      id: 'news-auto-social-ev-crossover',
      title: 'STRATIS Listening: Software and Resale Worries Soften Electric Crossover Sentiment in r/electricvehicles',
      source: 'Reddit r/electricvehicles',
      date: '2026-06-16',
      tags: ['social'],
      urgency: 'high',
      regions: ['national'],
      summary: 'Owner and shopper threads praise how the Electric Crossover drives but increasingly raise two concerns: infotainment glitches and uncertain three-year resale value. Net sentiment has drifted negative over the past month.',
      whyItMatters: 'STRATIS scored Electric Crossover sentiment down week-over-week, driven by software and residual-value anxiety — the same softness the Electric Crossover defense signal is tracking. Answer with reassurance (OTA-update cadence, residual / warranty guarantees), not another price cut, which the threads read as a resale red flag.',
      enterprises: ['ford-canada'],
    },
    {
      id: 'news-auto-social-rugged-suv',
      title: 'STRATIS Listening: Rugged SUV Build Community Thrives in r/Overlanding — but Dealer-Stock Frustration Recurs',
      source: 'Reddit r/Overlanding',
      date: '2026-06-18',
      tags: ['social'],
      urgency: 'medium',
      regions: ['national'],
      summary: 'r/Overlanding threads are strongly positive on the Rugged SUV — build photos, mods, and trip reports drive high-engagement, enthusiast-led conversation. The one recurring friction: "no dealer near me has one in stock."',
      whyItMatters: 'STRATIS scored enthusiast sentiment as a durable brand strength to amplify, with availability the only negative driver. Align dealer-stock and "find one near you" messaging to where demand already is, and feed the community build content into owned and social channels.',
      enterprises: ['ford-canada'],
    },
  ];

  items.push(...pinnedItems);

  // ── PROCEDURAL templates — ACME automotive landscape (ACME relevance audited per item) ──
  const templates: NewsTemplate[] = [
    // ════════════════════════════════════════════
    // EV DISRUPTOR WATCH — deep competitive coverage
    // ════════════════════════════════════════════
    { title: 'EV Disruptor Charging Network Opens to Electric Pickup and Electric Crossover in Canada — ACME Charging Network Plus Live',
      tags: ['competitors', 'ev'], urgency: 'high', competitor: 'EV Disruptor',
      summary: 'The EV Disruptor confirmed full charging-network access for Electric Pickup and Electric Crossover owners across 240+ Canadian charging locations effective May 1. ACME Charging Network Plus integration is fully operational with ACME app billing.',
      whyItMatters: 'This neutralizes the EV Disruptor\'s most-cited differentiator — charging network — and removes a key barrier for Electric Pickup conquest from its electric pickup and electric crossover considerers. Update Electric Pickup launch creative to lead with "now charges at every fast charger across Canada."' },
    { title: 'EV Disruptor Q1 Earnings Miss — Marketing Pulse Pivots Away From Electric Pickup Toward Electric Crossover Refresh',
      tags: ['competitors'], urgency: 'high', competitor: 'EV Disruptor',
      summary: 'The EV Disruptor\'s Q1 earnings missed analyst estimates by 8%, with electric pickup Canadian deliveries below internal targets. Its executives signaled marketing reallocation toward an electric crossover refresh and away from electric pickup launch programs.',
      whyItMatters: 'Reduced EV Disruptor pressure on its electric pickup creates a 60–90 day window for the Electric Pickup to consolidate truck conquest. Increase Electric Pickup Tier 1 CTV weight while the EV Disruptor recedes from the truck conversation.' },
    { title: 'EV Disruptor Electric Crossover Refresh Spotted in Canadian Test Markets — Electric Crossover Q3 Defense Window Tightening',
      tags: ['competitors', 'ev'], urgency: 'medium', competitor: 'EV Disruptor',
      summary: 'The EV Disruptor\'s electric crossover refresh units have been spotted at Canadian dealer prep facilities, suggesting Q3 launch timing. Marketing teaser activity expected to intensify through summer with focus on Toronto and Vancouver markets.',
      whyItMatters: 'The refresh will draw consideration share from the Electric Crossover in upper-trim premium audiences. Schedule Electric Crossover Q3 defense brief with Mindshare ahead of the EV Disruptor teaser cycle. Conquest — EV Disruptor overlay essential.' },
    { title: 'EV Disruptor Insurance Launches in BC and Ontario — Direct ACME Financing Concern',
      tags: ['competitors'], urgency: 'medium', competitor: 'EV Disruptor',
      summary: 'The EV Disruptor\'s insurance arm opened to Canadian customers in BC and Ontario, offering integrated insurance with telematics-linked pricing. Quotes 18–22% below market average for low-mileage drivers.',
      whyItMatters: 'The EV Disruptor\'s vertical integration of insurance creates an ownership-cost advantage ACME Financing cannot fully match. Counter with competitive ACME Financing rate messaging in BC and Ontario, plus emphasize dealer service network.' },
    { title: 'EV Disruptor CEO Canadian Content Backlash — Brand Sentiment Down 12% in Quebec',
      tags: ['competitors', 'social'], urgency: 'medium', competitor: 'EV Disruptor',
      summary: 'Quebec brand tracking shows EV Disruptor brand consideration down 12% over 60 days following multiple high-profile political statements by its CEO. Younger French-speaking buyers showing strongest sentiment shifts.',
      whyItMatters: 'Material conquest opportunity in Quebec (Cossette region). Electric Pickup and Electric Crossover creative should subtly emphasize "Built in North America" / "Canadian-made" positioning vs the EV Disruptor in QC media. Conquest — EV Disruptor activation in Cossette plan.' },
    { title: 'EV Disruptor Service Center Wait Times Hit 14 Days in GTA — ACME Dealer Network Advantage Resurfaces',
      tags: ['competitors'], urgency: 'medium', competitor: 'EV Disruptor',
      summary: 'The EV Disruptor\'s service center wait times in the Greater Toronto Area have averaged 14 days for the past month, well above the 3–5 day industry standard. ACME\'s 60+ Ontario dealer service network presents a clear contrast.',
      whyItMatters: 'Service network is a moment-of-truth differentiator. Ontario Regional dealer co-op messaging should highlight "service in days, not weeks." Material conquest message vs the EV Disruptor — particularly for Electric Pickup prospects considering long-term ownership.' },
    { title: 'EV Disruptor Cuts Canadian Marketing Headcount — Reduced Paid Spend Expected in CTV and Search',
      tags: ['competitors'], urgency: 'high', competitor: 'EV Disruptor',
      summary: 'The EV Disruptor\'s Canadian marketing team reduced by ~40% over the past quarter, with major paid media spending paused on CTV and accelerated only on owned/social channels. Expected SOV impact on auto category in Q2.',
      whyItMatters: 'EV Disruptor SOV reduction in CTV is a directly actionable opening — Electric Pickup launch CTV weight should fill the void on Tier 1 inventory. Coordinate with Mindshare on accelerated buy.' },
    { title: 'EV Disruptor Performance EV Canadian Pre-Orders Hit $50M — Halo Drives Electric Pickup Cross-Shop',
      tags: ['competitors', 'ev'], urgency: 'low', competitor: 'EV Disruptor',
      summary: 'The EV Disruptor\'s performance EV reservations from Canadian customers crossed CAD $50M cumulative, with the brand noting strong cross-shop interest into its electric pickup. The halo effect partially offsets the recent electric pickup pricing reduction.',
      whyItMatters: 'The EV Disruptor halo remains strong despite tactical missteps. Electric Pickup marketing should focus on practical differentiation (towing, fleet, ACME Cruise, Charging Network Plus) rather than fight the EV Disruptor on aspirational positioning.' },

    // ════════════════════════════════════════════
    // DOMESTIC RIVAL A WATCH — deep competitive coverage
    // ════════════════════════════════════════════
    { title: 'Domestic Rival A Luxury EV Canadian Launch — $69,995 Starting Price Targets Electric Crossover GT Buyers',
      tags: ['competitors', 'ev', 'launch'], urgency: 'high', competitor: 'Domestic Rival A',
      summary: 'Domestic Rival A\'s luxury EV Canadian launch confirmed at $69,995 starting MSRP, positioned directly against the Electric Crossover GT ($72,995). Its dealer activations begin May 15 with a national CTV campaign of estimated $6M weight.',
      whyItMatters: 'The luxury EV targets the same upper-trim Electric Crossover buyer segment. Electric Crossover GT defense should activate before the rival\'s dealer arrivals — Conquest — Domestic Rival audience overlay essential. Coordinate with Mindshare on response media plan.' },
    { title: 'Domestic Rival A Battery Plant in Ingersoll, Ontario Reaches Q1 Production Milestone',
      tags: ['competitors', 'ev', 'automotive'], urgency: 'medium', competitor: 'Domestic Rival A',
      summary: 'Domestic Rival A\'s battery joint venture plant in Ingersoll, Ontario produced its 100,000th battery pack, signaling on-track ramp for its full-size pickup, electric pickup, and compact electric SUV production. Local battery production strengthens its CUSMA compliance position.',
      whyItMatters: 'Local Canadian battery production gives Domestic Rival A a domestic content advantage in iZEV/CUSMA discussions. ACME Battery Canadian readiness is the counter-narrative — coordinate with corporate comms on Electric Pickup supply messaging.' },
    { title: 'Domestic Rival A Electric Pickup Canadian Reservations Open — Direct Conquest Threat to ACME Pro Electric Pickup',
      tags: ['competitors', 'ev', 'launch'], urgency: 'high', competitor: 'Domestic Rival A',
      summary: 'Domestic Rival A\'s electric pickup (first edition) opened Canadian reservations at $158K starting MSRP. Strong early interest from premium truck buyers and fleet/commercial accounts.',
      whyItMatters: 'The rival\'s electric pickup is the institutional fleet competitor to the ACME Pro Electric Pickup. Brief ACME Pro fleet sales team on its positioning ahead of Q3 customer conversations. ACME Pro Electric Pickup creative should emphasize availability now vs the rival\'s waitlist.' },
    { title: 'Domestic Rival A Electric Van Canadian Fleet Pilot — DHL Canada First Customer',
      tags: ['competitors', 'ev'], urgency: 'high', competitor: 'Domestic Rival A',
      summary: 'Domestic Rival A\'s electric van began Canadian fleet pilots with DHL Canada as first major operator. 200 units allocated to GTA delivery operations.',
      whyItMatters: 'Direct competitor to the ACME Pro Commercial Van EV. Commercial Van fleet messaging should pre-empt with reliability data, service network density, and ACME Pro Telematics positioning. Brief LinkedIn Commercial Van campaign team.' },
    { title: 'Domestic Rival A Autonomy Unit Layoffs Hit Canadian Office — Autonomous Driving Investment Pulled Back',
      tags: ['competitors'], urgency: 'medium', competitor: 'Domestic Rival A',
      summary: 'Domestic Rival A eliminated its Canadian autonomy engineering office as part of broader autonomous vehicle investment cuts. ACME Cruise (ACME\'s autonomous tech) gains relative position in Canadian L2+ autonomy market.',
      whyItMatters: 'ACME Cruise positioning is relatively strengthened. Electric Pickup, Electric Crossover, and Electric Crossover GT should emphasize ACME Cruise as the leading Canadian-tested L2+ system in launch creative. Trust-signal opportunity.' },
    { title: 'Domestic Rival A Compact EV Returns to Canada — $32,995 Sub-Compact EV Aggression',
      tags: ['competitors', 'ev'], urgency: 'medium', competitor: 'Domestic Rival A',
      summary: 'Domestic Rival A confirmed its compact EV return to the Canadian market at $32,995 starting MSRP, the lowest-priced EV in Canada. Targets entry-level EV buyers and first-time EV households.',
      whyItMatters: 'The compact EV creates pricing pressure in the entry-EV segment, indirectly impacting Electric Crossover and Plug-In Hybrid SUV consideration. Plug-In Hybrid SUV iZEV-net pricing messaging should sharpen value comparison.' },

    // ════════════════════════════════════════════
    // DOMESTIC RIVAL B WATCH
    // ════════════════════════════════════════════
    { title: 'Domestic Rival B Electric Pickup Production Push Confirmed for 2027 — Targets Electric Pickup and Full-Size Pickup Buyers',
      tags: ['competitors', 'ev', 'launch'], urgency: 'medium', competitor: 'Domestic Rival B',
      summary: 'Domestic Rival B confirmed an accelerated electric pickup production schedule with first Canadian deliveries projected for early 2027. Marketing positioning emphasizes a 500-mile range estimate and standalone fleet financing program.',
      whyItMatters: 'The rival\'s electric pickup is the largest medium-term threat to the Electric Pickup. While not yet on market, its pre-marketing is already drawing Electric Pickup consideration shoppers into wait-and-see mode. Activate "available now" messaging in Electric Pickup creative.' },
    { title: 'Domestic Rival B Windsor Plant EV Transition — EV Concept and Off-Road SUV EV by 2027',
      tags: ['competitors', 'ev', 'automotive'], urgency: 'medium', competitor: 'Domestic Rival B',
      summary: 'Domestic Rival B\'s Windsor Assembly Plant confirmed full EV transition with an EV concept and an off-road SUV EV scheduled for 2027 ramp. Plant transformation cost: $3.6B.',
      whyItMatters: 'The Windsor EV ramp creates additional Canadian battery EV competition. The off-road SUV EV is a direct Rugged SUV threat. Brief the Rugged SUV team on its positioning ahead of 2027.' },
    { title: 'Domestic Rival B Off-Road SUV PHEV Canadian Q1 Sales — Strongest PHEV Quarter in Brand History',
      tags: ['competitors', 'ev'], urgency: 'high', competitor: 'Domestic Rival B',
      summary: 'Domestic Rival B\'s off-road SUV PHEV Canadian Q1 sales reached 4,200 units, the strongest PHEV quarter in the brand\'s history. The Adventure Lifestyle audience is strongly drawn to PHEV off-road capability.',
      whyItMatters: 'Direct headwind for the Rugged SUV. Rugged SUV Adventure creative should emphasize the top trim / off-road package as PHEV-equivalent off-road capability without PHEV maintenance complexity. Activate Conquest creative against the rival\'s off-road SUV PHEV.' },
    { title: 'Domestic Rival B Performance EV Canadian Pricing Released — $63,995 for Mid Trim',
      tags: ['competitors', 'ev', 'launch'], urgency: 'medium', competitor: 'Domestic Rival B',
      summary: 'Domestic Rival B\'s performance EV Canadian pricing revealed at $63,995 for the mid trim. Performance EV positioning targets the Electric Crossover GT and the EV Disruptor\'s electric sedan performance buyers.',
      whyItMatters: 'Adjacent EV performance threat. Electric Crossover GT performance creative should emphasize all-wheel drive and lower 0-60 times. Cross-shop competitive set expanding.' },
    { title: 'Domestic Rival B Cargo Van EV Canadian Fleet Allocation Doubled — Direct Commercial Van Competition',
      tags: ['competitors', 'ev'], urgency: 'high', competitor: 'Domestic Rival B',
      summary: 'Domestic Rival B doubled Canadian fleet allocation for its cargo van EV in Q2, citing strong demand from delivery and commercial operators. Aggressive fleet pricing announced.',
      whyItMatters: 'The cargo van EV is now a credible Commercial Van fleet competitor. The Commercial Van fleet team should adjust competitive positioning vs the rival\'s cargo van EV in Q2 fleet RFPs. LinkedIn campaign should reference the comparison.' },

    // ════════════════════════════════════════════
    // IMPORT LEADER WATCH
    // ════════════════════════════════════════════
    { title: 'Import Leader Compact PHEV Wins Best PHEV in Canada — Direct Pressure on Plug-In Hybrid SUV and Three-Row SUV',
      tags: ['competitors', 'launch'], urgency: 'medium', competitor: 'Import Leader',
      summary: 'Driving.ca named the Import Leader\'s compact PHEV its 2026 Best PHEV winner. The award cites real-world all-electric range and resale value. The Import Leader responded with a $4M paid amplification campaign.',
      whyItMatters: 'The compact PHEV award amplification will directly compress Three-Row SUV family-SUV consideration and Plug-In Hybrid SUV intent. Conquest — Import Leader creative should be elevated this quarter across Search and Meta.' },
    { title: 'Import Leader Midsize Pickup Hybrid Canadian Launch — Truck Intender Audience at Risk',
      tags: ['competitors', 'launch'], urgency: 'medium', competitor: 'Import Leader',
      summary: 'The Import Leader\'s midsize pickup hybrid launched in Canada with $48,995 starting MSRP. Targets the mid-size truck market but pulls consideration from full-size truck buyers seeking efficiency.',
      whyItMatters: 'The midsize pickup hybrid creates secondary pressure on the Full-Size Truck truck intender funnel. Full-Size Truck messaging should emphasize full-size capability, payload, and towing differentiation in cross-shop creative.' },
    { title: 'Import Leader Cambridge Ontario Plant Hybrid Production Reaches 350K Annual Run-Rate',
      tags: ['competitors', 'automotive'], urgency: 'low', competitor: 'Import Leader',
      summary: 'The Import Leader\'s Canadian manufacturing plant (Cambridge, Ontario) produced its 350,000th vehicle of the fiscal year, including its compact SUV hybrid, import luxury SUV, and compact PHEV.',
      whyItMatters: 'Local Ontario Import Leader production strengthens its "made in Ontario" narrative — a direct concern for ACME\'s Canadian heritage messaging. Brand Q2 campaign should reinforce ACME\'s deeper Canadian manufacturing footprint and Ontario job count.' },
    { title: 'Import Leader Premium Hybrid Wagon Canadian Order Books Open — Compact PHEV Retention Tool',
      tags: ['competitors', 'launch'], urgency: 'medium', competitor: 'Import Leader',
      summary: 'The Import Leader\'s premium hybrid wagon opened Canadian order books, positioned as an upgrade path for compact PHEV customers reaching renewal cycle.',
      whyItMatters: 'The Import Leader retention strategy locks in compact PHEV customers — closes one Three-Row SUV conquest path. Three-Row SUV Family creative should target compact PHEV cross-shoppers BEFORE the premium wagon retention activates.' },
    { title: 'Import Leader Electric Crossover Canadian Sales Q1 — Underperforming vs Electric Crossover and Value Import Electric Crossover',
      tags: ['competitors', 'ev'], urgency: 'low', competitor: 'Import Leader',
      summary: 'The Import Leader\'s electric crossover Q1 Canadian registrations of 1,100 units lag the Electric Crossover (3,400) and the Value Import electric crossover (3,800). The Import Leader is considering pricing repositioning for Q3.',
      whyItMatters: 'The electric crossover\'s weakness reduces immediate Import Leader EV pressure but expect an aggressive Q3 pricing response. The Electric Crossover should consolidate position now while the rival is on the back foot.' },

    // ════════════════════════════════════════════
    // VALUE IMPORT WATCH
    // ════════════════════════════════════════════
    { title: 'Value Import Electric Crossover Outsells Electric Crossover in Q1 Canadian Market — Aggressive Pricing Cited',
      tags: ['competitors', 'ev'], urgency: 'high', competitor: 'Value Import',
      summary: 'Q1 Canadian registration data shows the Value Import\'s electric crossover outselling the Electric Crossover for the first time, with the Value Import citing iZEV-aligned pricing and strong brand momentum.',
      whyItMatters: 'Electric Crossover SOV compression now showing up in registration data. Defense campaign against the compact electric SUV and the Value Import electric crossover must be activated now, not at quarter end. Electric Crossover refresh creative needs accelerated rollout.' },
    { title: 'Value Import Electric SUV Canadian Launch — $59,995 Starting Price, 7-Seat Family SUV',
      tags: ['competitors', 'ev', 'launch'], urgency: 'high', competitor: 'Value Import',
      summary: 'The Value Import\'s electric SUV Canadian launch at $59,995 starting MSRP positions as a 7-seat family SUV EV. Direct Three-Row SUV family-SUV cross-shop threat with national TV launch.',
      whyItMatters: 'The electric SUV is a major Family SUV cross-shop threat to the Three-Row SUV. Three-Row SUV family creative needs immediate response highlighting the Three-Row SUV\'s 3rd row, towing rating, and ACME Co-Pilot 360 advantages.' },
    { title: 'Value Import Luxury EV Canadian Launch — Premium EV Crossover Direct Electric Crossover GT Threat',
      tags: ['competitors', 'ev', 'launch'], urgency: 'medium', competitor: 'Value Import',
      summary: 'The Value Import\'s luxury sub-brand EV (Performance trim) launched in Canada at $74,995. The group\'s premium EV play targets the Electric Crossover GT, the EV Disruptor\'s performance electric crossover, and European Luxury compact EV buyers.',
      whyItMatters: 'Premium EV competitive set expanding. Electric Crossover GT defense weight needed in luxury EV-considerer audiences. Conquest — Value Imports activation across Tier 1 Search.' },
    { title: 'Value Import Crossover Pickup Q1 Canadian Sales — 3,800 Units, Crossover Pickup Niche Confirmed',
      tags: ['competitors', 'automotive'], urgency: 'medium', competitor: 'Value Import',
      summary: 'The Value Import\'s crossover pickup Q1 Canadian sales reached 3,800 units, confirming demand for the crossover pickup segment. Targets first-time truck buyers without full-size commitment.',
      whyItMatters: 'The crossover pickup creates secondary pressure on the Full-Size Truck truck intender funnel — particularly first-time truck buyers. Full-Size Truck entry-level trim messaging should address this in Truck Intender Search.' },
    { title: 'Value Import Electric SUV Canadian Pricing Drop — $9,000 Reduction to $69,995',
      tags: ['competitors', 'ev'], urgency: 'high', competitor: 'Value Import',
      summary: 'The Value Import announced a $9,000 price reduction on its electric SUV to $69,995 in Canada effective immediately. Aggressive move to recapture Q2 EV consideration share.',
      whyItMatters: 'The Value Import pricing moves directly compress the Electric Crossover GT value position. Conquest — Value Imports audience activation should accelerate; consider counter-pricing or rebate via ACME Financing on the Electric Crossover GT.' },

    // ════════════════════════════════════════════
    // IMPORT RIVAL WATCH
    // ════════════════════════════════════════════
    { title: 'Import Rival Compact SUV Hybrid Strong Loyalty Numbers in Q1 — Midsize SUV and Three-Row SUV Defection Risk',
      tags: ['competitors'], urgency: 'low', competitor: 'Import Rival',
      summary: 'The Import Rival\'s compact SUV hybrid posted an 87% Canadian loyalty rate in Q1, the highest in the family-SUV category. Midsize SUV and Three-Row SUV cross-shoppers continue to defect to the Import Rival where price-parity is achievable.',
      whyItMatters: 'The Midsize SUV maintenance budget is already under review. Import Rival data reinforces the case to redirect investment toward Three-Row SUV and Plug-In Hybrid SUV defense.' },
    { title: 'Import Rival Electric Crossover Canadian Launch — Its First EV in Canada at $61,995',
      tags: ['competitors', 'ev', 'launch'], urgency: 'high', competitor: 'Import Rival',
      summary: 'The Import Rival\'s electric crossover (its first EV, built on a Domestic Rival A battery platform) launched in Canada at $61,995 starting MSRP. Strong dealer network distribution gives quick scale.',
      whyItMatters: 'The Import Rival\'s brand loyalty (87% on its compact SUV hybrid) translating into EV consideration is an Electric Crossover and Plug-In Hybrid SUV concern. Activate Import Rival conquest audience overlays in Electric Crossover creative across Search and Meta.' },
    { title: 'Import Rival Alliston Plant EV Transition Confirmed — Compact SUV EV and Subcompact SUV EV by 2028',
      tags: ['competitors', 'ev', 'automotive'], urgency: 'medium', competitor: 'Import Rival',
      summary: 'The Import Rival confirmed full EV transition for its Alliston, Ontario plant by 2028, including compact SUV EV and subcompact SUV EV production. $15B investment commitment.',
      whyItMatters: 'The Import Rival\'s local Ontario EV ramp will reshape the family-SUV competitive set in 2027–2028. Long-term Three-Row SUV and Midsize SUV strategy must factor in its EV positioning. Brief brand strategy team.' },

    // ════════════════════════════════════════════
    // CORPORATE PARTNERSHIPS — ACME strategic alliances
    // ════════════════════════════════════════════
    { title: 'ACME-SK On Joint Venture ACME Battery Plant — Canadian Production Milestone',
      tags: ['partnerships', 'brand', 'ev'], urgency: 'high',
      summary: 'ACME Battery (ACME-SK On JV) reached a 50,000-pack production milestone for North American Electric Pickup supply. Canadian dealer allocation accelerates as a result.',
      whyItMatters: 'Electric Pickup supply constraints easing — pre-order pacing should accelerate. Update Electric Pickup launch creative to address inventory availability and "ships in 8 weeks" timing.' },
    { title: 'ACME-Google Cloud Partnership Expansion — Canadian Dealer In-Vehicle AI Rollout',
      tags: ['partnerships', 'brand'], urgency: 'medium',
      summary: 'ACME and Google announced expanded in-vehicle AI rollout to all Canadian ACME dealers by Q3 2026. Includes dealer-floor AI, customer service automation, and CRM integration.',
      whyItMatters: 'Dealer experience modernization advantage vs Domestic Rival A and Domestic Rival B. Dealer co-op brand messaging can now lean on tech sophistication. Brief dealer council on talking points.' },
    { title: 'ACME Pro Charging-Suncor Petro-Canada Partnership — 600 New Charging Stations Across Canada',
      tags: ['partnerships', 'ev', 'launch'], urgency: 'high',
      summary: 'ACME Pro Charging and Suncor Petro-Canada announced an expansion partnership for 600 additional fast-charging stations across Canada by end of 2026. Electric Pickup, Electric Crossover, and Plug-In Hybrid SUV owners get integrated ACME app billing.',
      whyItMatters: 'Charging convenience is the #1 EV adoption barrier. This solves it directly for ACME EVs. Update Electric Pickup launch creative to emphasize "1 in 4 fuel stations is now an ACME charging station." Material conquest message.' },
    { title: 'ACME-Microsoft AI Partnership — Predictive Maintenance for Commercial Van and Full-Size Truck Pro',
      tags: ['partnerships', 'brand'], urgency: 'medium',
      summary: 'ACME and Microsoft announced an expanded AI partnership for predictive maintenance, fleet optimization, and ACME Pro Telematics. Beta program with 50 Canadian fleet operators begins June 1.',
      whyItMatters: 'Strengthens ACME Pro fleet differentiation vs Domestic Rival A\'s electric van, the EV Disruptor\'s semi, and Domestic Rival B\'s cargo van. Brief Commercial Van fleet team on partnership talking points for LinkedIn campaign.' },
    { title: 'ACME-ADT Security Partnership — Vehicle Theft Prevention Integrated Into the ACME App',
      tags: ['partnerships'], urgency: 'medium',
      summary: 'ACME announced an integration partnership with ADT Canada for advanced vehicle theft prevention. The Rugged SUV, Full-Size Truck, and Electric Pickup will get integrated ADT alerts via the ACME app.',
      whyItMatters: 'Vehicle theft is a hot-button issue in Canadian media (especially GTA). ADT integration is a credible differentiator for Full-Size Truck, Rugged SUV, and Electric Pickup theft protection messaging in Ontario Regional creative.' },
    { title: 'ACME Apple CarPlay Ultra Integration — First North American Brand With Full Implementation',
      tags: ['partnerships', 'launch', 'brand'], urgency: 'medium',
      summary: 'ACME confirmed full Apple CarPlay Ultra integration for 2026 model year vehicles. The Full-Size Truck, Electric Pickup, Electric Crossover, and Rugged SUV models get the upgrade. ACME is the first North American brand with full CarPlay Ultra.',
      whyItMatters: 'Apple-first audiences (especially in BC and ON) gain a tech-forward reason to choose ACME. Update Electric Crossover and Electric Pickup creative to lead with CarPlay Ultra in tech-buyer audience targeting.' },

    // ════════════════════════════════════════════
    // EV / Launch — ACME direct
    // ════════════════════════════════════════════
    { title: 'Electric Pickup Pre-Order Pacing Beats Plan by 28% — Strongest Q2 Indicator Since Electric Crossover Launch',
      tags: ['launch', 'ev', 'brand'], urgency: 'high',
      summary: 'Electric Pickup pre-order pacing across the Canadian dealer network is running 28% above plan with three weeks remaining to launch window. Strong demand signals across Ontario, BC, and Alberta.',
      whyItMatters: 'Strong pre-order pacing reinforces the Electric Pickup launch-window signals STRATIS is tracking, including the EV Disruptor electric pickup comparison-search shift. Supports holding Electric Pickup launch weight through the window.' },
    { title: 'Canadian EV Market Share Hits 14% in Q1 — Federal iZEV Spend Up 22%',
      tags: ['ev', 'macro', 'izev'], urgency: 'medium',
      summary: 'StatCan reports Canadian battery-electric vehicle market share reached 14% of new vehicle sales in Q1 2026, up from 11% prior year. Federal iZEV program expenditure grew 22% YoY.',
      whyItMatters: 'EV adoption tailwind validates Electric Pickup launch, Electric Crossover defense, and Plug-In Hybrid SUV positioning. Use this in CMO narrative as macro context.' },
    { title: 'ACME Pro Electric Pickup Fleet Edition Reservations Open — 800 Canadian Fleet Inquiries in 48 Hours',
      tags: ['ev', 'launch'], urgency: 'high',
      summary: 'ACME Pro opened reservations for the ACME Pro Electric Pickup Fleet Edition with strong early Canadian fleet response — 800 dealer inquiries in the first 48 hours. ACME Pro forecast: 4,000+ Canadian fleet units in year one.',
      whyItMatters: 'Strong ACME Pro Electric Pickup fleet signal. Commercial Van Fleet team can leverage cross-sell into mixed Electric Pickup + Commercial Van fleets. Brief LinkedIn fleet campaign on ACME Pro Electric Pickup availability.' },
    { title: 'Electric Crossover GT Performance Edition Canadian Reveal — 400-Mile Range Estimate',
      tags: ['launch', 'ev'], urgency: 'medium',
      summary: 'The Electric Crossover GT Performance Edition revealed for the Canadian market with an estimated 400-mile range and 0-100 km/h in 3.4 seconds. Positioned at $89,995.',
      whyItMatters: 'Direct response to the EV Disruptor\'s performance electric crossover and Domestic Rival A\'s luxury EV performance. Premium performance EV consideration set. Conquest — EV Disruptor and Domestic Rival activations across upper-trim audiences.' },
    { title: 'Electric Pickup Towing Capacity Validated — 11,000 lbs Real-World RV Test',
      tags: ['launch', 'ev'], urgency: 'medium',
      summary: 'RV Lifestyle Magazine completed an independent towing test with the ACME Pro Electric Pickup reaching 11,000 lbs validated tow capacity over 500-mile routes. Real-world capability exceeds the EV Disruptor\'s electric pickup under load.',
      whyItMatters: 'Towing parity vs the EV Disruptor and Domestic Rival B is a critical Electric Pickup differentiator for truck intenders. Surface in Electric Pickup launch creative for the Truck Intenders audience. Trust signal for Conquest — EV Disruptor.' },
    { title: 'Rugged SUV Off-Road Series Wins Adventure Lifestyle Award — Strong Engagement on TikTok',
      tags: ['brand', 'launch'], urgency: 'medium',
      summary: 'The Rugged SUV Off-Road series content secured Adventure Magazine\'s 2026 Branded Content Award. TikTok engagement on Rugged SUV-related ACME content up 48% YoY.',
      whyItMatters: 'Rugged SUV audience momentum is real — consider expanding budget reallocation toward TikTok and Instagram Rugged SUV Adventure investments.' },
    { title: 'Rugged SUV Sport Hybrid Confirmed for 2027 — Strategic Retention Tool',
      tags: ['launch'], urgency: 'low',
      summary: 'ACME internal Rugged SUV Sport hybrid variant confirmed for 2027 launch, with a PHEV variant under evaluation. Targets adventure-lifestyle buyers wanting hybrid efficiency.',
      whyItMatters: 'Strategic retention against the Import Leader\'s compact PHEV and Domestic Rival B\'s off-road SUV PHEV in the adventure-lifestyle audience. Long-term roadmap context for Rugged SUV brand strategy.' },
    { title: 'Electric Crossover Q2 Refresh Lands in Showrooms — Updated Range and Charging Speed',
      tags: ['launch', 'ev', 'brand'], urgency: 'medium',
      summary: 'The Electric Crossover Q2 mid-cycle refresh has begun arriving at Canadian ACME dealers with updated range estimates and DC fast-charge improvements. Pricing held flat.',
      whyItMatters: 'Refresh is a defensive move against the compact electric SUV and the Value Import electric crossover. Use refreshed range numbers in the Electric Crossover creative refresh.' },
    { title: 'Plug-In Hybrid SUV Sales Up 33% Year-over-Year — Fuel Price Spike Driving PHEV Interest',
      tags: ['ev', 'launch', 'macro'], urgency: 'medium',
      summary: 'Plug-In Hybrid SUV registrations up 33% YoY in Q1 2026 according to dealer reporting, alongside the recent $1.65/L national average gasoline price spike. PHEV consideration broadly elevated.',
      whyItMatters: 'The Plug-In Hybrid SUV is currently underweighted in mix relative to demand signal. iZEV eligibility plus fuel price momentum creates a short-term tailwind — scale media weight.' },
    { title: 'Electric Pickup Pre-Production Test Mile Hits 50 Million in Canadian Conditions',
      tags: ['launch', 'ev'], urgency: 'medium',
      summary: 'The Electric Pickup pre-production fleet completed 50 million test miles in Canadian winter and rural driving conditions. Reliability data exceeds projections.',
      whyItMatters: 'Reliability is the #1 buyer concern for first-time EV buyers in Canadian winter. Update Electric Pickup launch creative with the "50M test miles in Canadian conditions" trust signal across Ontario and Alberta media.' },
    { title: 'Commercial Van Most Efficient Lead Generation Channel for ACME in Q1',
      tags: ['brand', 'automotive'], urgency: 'low',
      summary: 'Internal Q1 review identifies the Commercial Van as ACME\'s most efficient nameplate by cost-per-lead, driven primarily by LinkedIn fleet/commercial targeting.',
      whyItMatters: 'The Commercial Van is structurally efficient and currently underweighted in budget allocation. Consider rebalancing 5–8% of total Tier 1 spend toward Commercial Van fleet.' },

    // ════════════════════════════════════════════
    // iZEV / FEDERAL & PROVINCIAL POLICY
    // ════════════════════════════════════════════
    { title: 'Quebec Roulez Vert EV Subsidy Increased to $7,500 — Electric Crossover and Plug-In Hybrid SUV Net Price Improvement',
      tags: ['izev', 'macro', 'ev'], urgency: 'high',
      summary: 'Quebec confirmed Roulez Vert provincial EV subsidy increase to $7,500 (from $5,000) effective immediately. Combined with $5,000 federal iZEV, Quebec Electric Crossover and Plug-In Hybrid SUV buyers see $12,500 in stacked rebates.',
      whyItMatters: 'Massive Quebec Electric Crossover and Plug-In Hybrid SUV opportunity. Cossette Quebec campaigns must amplify Roulez Vert messaging in Electric Crossover and Plug-In Hybrid SUV creative immediately.' },
    { title: 'BC ZEV Sales Mandate 2026 Enforcement Begins — 26% New Vehicle Sales Must Be ZEV',
      tags: ['izev', 'macro', 'ev'], urgency: 'high',
      summary: 'BC ZEV mandate enforcement begins June 1, 2026 — 26% of new vehicle sales in BC must be ZEV. Manufacturers face fines for non-compliance.',
      whyItMatters: 'BC dealers under pressure to sell EVs. Electric Pickup and Electric Crossover BC dealer allocation should accelerate. BC Regional CPL of $148 makes this an efficient market for additional EV media weight.' },
    { title: 'Ontario Provincial EV Subsidy Discussion Gains Traction — May Reinstate by Q4',
      tags: ['izev', 'macro', 'ev'], urgency: 'medium',
      summary: 'Ontario provincial government discussions around reinstating EV subsidies have gained traction in legislature. Implementation possible by Q4 2026.',
      whyItMatters: 'If reinstated, would amplify Electric Pickup and Electric Crossover positioning in Ontario. Track for Q4 Ontario Regional planning.' },
    { title: 'Federal Critical Minerals Strategy — $4.5B Canadian Battery Supply Chain Investment',
      tags: ['izev', 'macro', 'ev'], urgency: 'medium',
      summary: 'Federal Critical Minerals Strategy announced $4.5B investment in Canadian battery supply chain, including processing and recycling. ACME Battery JV cited as benefiting partner.',
      whyItMatters: 'Long-term Electric Pickup supply chain advantage vs the EV Disruptor (which sources globally). Brand campaigns can lean into "Canadian-built batteries powering Canadian-built ACME" messaging in Q3.' },

    // ════════════════════════════════════════════
    // MACRO CONSUMER & ECONOMIC
    // ════════════════════════════════════════════
    { title: 'Bank of Canada Holds Rate at 3.75% — Auto Financing Activity Stable',
      tags: ['macro'], urgency: 'low',
      summary: 'The Bank of Canada held its overnight rate at 3.75%, citing balanced inflation and employment data. Auto financing activity remains stable across major lenders.',
      whyItMatters: 'Rate stability is neutral for auto sector — neither tailwind nor headwind. ACME Financing messaging stays consistent.' },
    { title: 'Canadian Gas Prices Hold Above $1.65/L Average — PHEV Consideration Up Across Categories',
      tags: ['macro', 'ev'], urgency: 'medium',
      summary: 'Canadian retail gasoline prices remain above $1.65/L national average for the third consecutive month. PHEV vehicle consideration up across all OEMs.',
      whyItMatters: 'PHEV tailwind reinforces Plug-In Hybrid SUV opportunity. Use fuel price data in Plug-In Hybrid SUV Search and Meta creative.' },
    { title: 'Canadian Auto Loan Delinquency Rates Stable at 1.4% — No Credit Stress Signal',
      tags: ['macro'], urgency: 'low',
      summary: 'Q1 Canadian auto loan delinquency rates held at 1.4%, in line with historical norms. No credit stress signal across ACME Financing, the major bank auto-lenders, or other captive financiers.',
      whyItMatters: 'Credit environment is healthy — supports Electric Pickup, Electric Crossover, and Electric Crossover GT premium pricing. No need to soften pricing in Tier 1 creative.' },
    { title: 'Canadian Used Vehicle Wholesale Index Down 8% YoY — Trade-In Equity Compressed',
      tags: ['macro'], urgency: 'medium',
      summary: 'Canadian used vehicle wholesale index down 8% YoY, with truck and SUV residuals compressing. Trade-in equity for new vehicle buyers is reduced.',
      whyItMatters: 'Lower trade-in equity may slow new vehicle pace but creates an ACME Financing lease opportunity as buyers shift from purchase to lease. Update lease-forward messaging in dealer co-op creative.' },
    { title: 'Canadian Vehicle Theft Crisis — Full-Size Trucks Among Top Targets in Ontario',
      tags: ['automotive', 'macro'], urgency: 'high',
      summary: 'Canadian vehicle theft crisis continues with full-size trucks among top theft targets in Ontario. Insurance premiums for the Full-Size Truck in the GTA up 18% YoY.',
      whyItMatters: 'Theft is a top-of-mind concern for Ontario truck buyers. Full-Size Truck dealer co-op messaging should integrate ADT theft prevention prominently — also surface in Ontario Regional creative.' },

    // ════════════════════════════════════════════
    // BRAND & CORPORATE NARRATIVE
    // ════════════════════════════════════════════
    { title: 'ACME Q1 Financial Results — Record Revenue, Electric Pickup Pre-Order Demand Cited',
      tags: ['brand'], urgency: 'medium',
      summary: 'ACME reported record Q1 revenue of $4.2B, with Q1 vehicle sales up 4.7% YoY. Electric Pickup pre-order demand and Rugged SUV growth cited as key drivers.',
      whyItMatters: 'Strong financial signal supports premium positioning across the ACME lineup. Brand campaigns can lean into "Canada\'s #1 selling truck brand" with quantified validation.' },
    { title: 'Full-Size Truck Surpasses 47-Year Sales Leadership Mark — Anniversary Campaign in Development',
      tags: ['brand', 'launch'], urgency: 'low',
      summary: 'The Full-Size Truck confirmed Canada\'s best-selling truck for the 47th consecutive year. Master brand team developing anniversary campaign concepts for Q4.',
      whyItMatters: 'The Full-Size Truck leadership story is the brand\'s most durable equity asset. Q4 anniversary campaign should integrate with Electric Pickup launch storytelling for a unified Full-Size Truck series narrative.' },
    { title: 'Electric Pickup Wins 2026 Canadian Black Book Truck of the Year — 12% Brand Search Lift',
      tags: ['brand', 'launch'], urgency: 'high',
      summary: 'The Electric Pickup won the 2026 Canadian Black Book Truck of the Year award. Brand search volume for "ACME Electric Pickup Canada" up 12% in the week following announcement.',
      whyItMatters: 'Authoritative third-party validation. Update Electric Pickup launch creative with award badge across all CTV and Search creative immediately.' },
    { title: 'ACME CEO Canadian Visit — Toronto and Montreal Dealer Council Meetings',
      tags: ['brand'], urgency: 'low',
      summary: 'The ACME CEO confirmed a Canadian visit including Toronto and Montreal dealer council meetings. Electric Pickup launch and Rugged SUV strategy on agenda.',
      whyItMatters: 'Executive engagement signals corporate priority on the Canadian market. Dealer-tier campaigns can leverage the CEO-led narrative for Electric Pickup launch activation.' },
    { title: 'ACME Pro Commercial Brand Launch — National Fleet Customer Awareness Campaign',
      tags: ['brand', 'launch'], urgency: 'medium',
      summary: 'The ACME Pro standalone commercial brand launch began in Canada with a national CTV campaign targeting fleet decision-makers. Total media weight: $8.4M.',
      whyItMatters: 'ACME Pro brand visibility advantage vs Domestic Rival A\'s commercial division. Commercial Van Fleet should align messaging with ACME Pro umbrella branding in LinkedIn creative.' },

    // ════════════════════════════════════════════
    // SPORTS & SPONSORSHIPS — ACME partnerships
    // ════════════════════════════════════════════
    { title: 'ACME Renews CFL Title Sponsorship — Multi-Year Extension Through 2028',
      tags: ['sponsorships', 'sports', 'brand'], urgency: 'low',
      summary: 'ACME confirmed multi-year CFL title sponsorship renewal. Activation will extend through to the 2028 season with expanded digital fan experiences.',
      whyItMatters: 'CFL sponsorship anchors ACME\'s sports brand presence — ensure Full-Size Truck and Rugged SUV brand campaigns lean into game-day moments through Q3.' },
    { title: 'ACME Performance Wins Canadian Tire Motorsport Park Endurance Race',
      tags: ['sports', 'brand'], urgency: 'low',
      summary: 'The ACME Performance team scored an overall victory at the Canadian Tire Motorsport Park endurance race. Performance Coupe and Rugged SUV performance content saw strong organic engagement.',
      whyItMatters: 'Performance heritage feeds Rugged SUV and Electric Crossover brand equity. Consider amplifying race highlights in Rugged SUV Adventure creative.' },
    { title: 'Built ACME Tough TV Spot Wins Canadian Marketing Award — Mindshare Cited',
      tags: ['brand', 'sponsorships'], urgency: 'low',
      summary: 'The "Built ACME Tough" Spring TV spot won the Canadian Marketing Association\'s 2026 Automotive Brand Campaign award. Mindshare cited for media strategy execution.',
      whyItMatters: 'Award validation strengthens AOR partnership narrative. Reference in CMO trust-building moments around media investment efficacy.' },
    { title: 'ACME CFL Title Sponsorship 2026 Activation — 8 Stadium Branding Refresh',
      tags: ['sponsorships', 'sports'], urgency: 'medium',
      summary: 'ACME\'s CFL title sponsorship 2026 activation includes refreshed stadium branding across all 8 CFL stadiums. The Full-Size Truck and Rugged SUV prominently featured in fan zones.',
      whyItMatters: 'CFL fan demographic indexes high for the Full-Size Truck and Rugged SUV. Sponsorship leverage in regional campaigns (Ontario, Alberta, Atlantic).' },
    { title: 'ACME Performance Cup Canadian Race Series — 8 Events Across Ontario, Quebec, BC',
      tags: ['sponsorships', 'sports'], urgency: 'low',
      summary: 'The ACME Performance Cup Canadian race series confirmed for 2026 with 8 events across Ontario, Quebec, and BC. The Electric Crossover GT featured in the performance category.',
      whyItMatters: 'Performance heritage feeds the Electric Crossover GT brand narrative. Coordinate Electric Crossover GT social content around race events.' },
    { title: 'Built ACME Tough Series Canadian Tour — Construction & Trades Event Activation',
      tags: ['sponsorships', 'sports'], urgency: 'medium',
      summary: 'The Built ACME Tough Series Canadian tour begins May with stops in 12 cities, including dealer-led construction and trades professional events. Truck Intender and Fleet/Commercial audience activation.',
      whyItMatters: 'Direct dealer-tier activation reaching Fleet/Commercial buyers. Ontario, Alberta dealer campaigns should integrate event-specific creative.' },
    { title: 'ACME Performance Coupe 60th Anniversary Canadian Activation — Toronto and Montreal',
      tags: ['sponsorships', 'sports', 'brand'], urgency: 'low',
      summary: 'Performance Coupe 60th Anniversary Canadian celebration with featured events in Toronto and Montreal. The Electric Crossover GT and the V8 Performance Coupe featured side-by-side at the Edmonton Petrol-Heads Festival.',
      whyItMatters: 'Performance Coupe heritage halo benefits Electric Crossover and Electric Crossover GT premium positioning. Integrate heritage messaging into Electric Crossover launch creative.' },

    // ════════════════════════════════════════════
    // SOCIAL & CULTURAL SIGNALS
    // ════════════════════════════════════════════
    { title: 'Reddit r/electricvehicles "Electric Pickup vs EV Disruptor" Mega-Thread Hits 5K Upvotes',
      tags: ['social', 'ev'], urgency: 'medium',
      summary: 'A comparison mega-thread on r/electricvehicles asking "Electric Pickup vs the EV Disruptor\'s electric pickup — which would you actually buy?" has reached 5K upvotes and 1,400+ comments. Electric Pickup sentiment is broadly favorable on practicality and resale.',
      whyItMatters: 'Strong organic Electric Pickup sentiment is a free amplification asset. Brief social team to monitor and (carefully) engage where appropriate.' },
    { title: 'TikTok #RuggedSUVLife Tag Surpasses 240M Views — Adventure Community Authentic Engagement',
      tags: ['social', 'brand'], urgency: 'low',
      summary: 'The #RuggedSUVLife TikTok tag surpassed 240M cumulative views in Q1 with strong creator-led adventure and overlanding content driving impressions.',
      whyItMatters: 'Rugged SUV TikTok organic momentum is industry-leading. Creator partnership program could amplify with relatively modest investment.' },
    { title: 'ACME Financing Consumer Sentiment Up 12% Quarter-over-Quarter',
      tags: ['social', 'brand'], urgency: 'low',
      summary: 'ACME Financing Canada\'s consumer sentiment tracker shows Q1 lift of 12% versus prior quarter, driven by competitive APR offers and improved digital application UX.',
      whyItMatters: 'Financing sentiment improvements support dealer co-op messaging on close-of-funnel. Consider financing-led creative in Tier 1 conversion campaigns.' },
    { title: 'Reddit r/ACME Electric Pickup Pre-Order Megathread — 12K Comments, Strong Buyer Sentiment',
      tags: ['social', 'ev'], urgency: 'medium',
      summary: 'The r/ACME community pre-order megathread for the Electric Pickup has 12K comments and 18K upvotes. Buyer sentiment strongly positive on towing capability, charging, and ACME Charging Network Plus access.',
      whyItMatters: 'Authentic Electric Pickup buyer enthusiasm. Social team should monitor and (selectively) engage. Use buyer language in Electric Pickup launch creative.' },
    { title: 'TikTok #ElectricPickup Trend Drives 80M Views — Electric Pickup Capability Demos',
      tags: ['social', 'ev'], urgency: 'medium',
      summary: 'TikTok #ElectricPickup trend featuring real Electric Pickup owners demonstrating towing, off-road, and tech capabilities reached 80M cumulative views. Authentic UGC peak in Q2.',
      whyItMatters: 'High-quality organic Electric Pickup content. Coordinate paid amplification of best UGC pieces. Brief Mindshare on creator partner shortlist.' },
    { title: 'Twitter/X EV Disruptor Layoffs Sentiment Shift — Electric Pickup Consideration Up 14%',
      tags: ['social'], urgency: 'medium',
      summary: 'Twitter/X conversations following the EV Disruptor\'s Canadian layoffs show a 14% increase in Electric Pickup consideration mentions in affected geographic clusters (Toronto, Vancouver).',
      whyItMatters: 'Conquest opportunity in EV-Disruptor-disappointed cohorts. Electric Pickup Search and TTD targeting should layer the Conquest — EV Disruptor audience in Toronto and Vancouver markets.' },
    { title: 'Reddit r/electricvehicles Electric Pickup vs EV Disruptor Cost-of-Ownership Analysis Goes Viral — 6K Upvotes',
      tags: ['social', 'ev'], urgency: 'medium',
      summary: 'A detailed cost-of-ownership comparison thread on r/electricvehicles favors the Electric Pickup over the EV Disruptor\'s electric pickup on 5-year TCO due to insurance, maintenance, and resale projections.',
      whyItMatters: 'Authoritative community analysis. Update Electric Pickup Conquest — EV Disruptor creative to lean into the TCO advantage rather than just feature comparison.' },

    // ════════════════════════════════════════════
    // AUTOMOTIVE INDUSTRY & MARKET DATA
    // ════════════════════════════════════════════
    { title: 'AutoTrader Canada Search Trends Q1 — Electric Pickup Searches Up 47%',
      tags: ['automotive', 'ev'], urgency: 'medium',
      summary: 'AutoTrader Canada Q1 search trends report shows Electric Pickup consumer searches up 47% YoY, the largest increase among any EV. The Electric Crossover and Plug-In Hybrid SUV also up 22-31%.',
      whyItMatters: 'Quantified consumer intent data validates Electric Pickup launch timing. Use the AutoTrader data point in Electric Pickup launch press materials and trust-signal creative.' },
    { title: 'Canadian Auto Industry Jobs Report — ACME Oakville and Windsor Stable, Hiring Resumed',
      tags: ['automotive', 'macro'], urgency: 'low',
      summary: 'Canadian Automobile Manufacturers Association Q1 jobs report shows ACME Oakville and Windsor plants stable employment and resuming hiring. Direct contrast with industry layoffs at Domestic Rival A and the EV Disruptor.',
      whyItMatters: 'Local employment positioning advantage in Ontario. Brand campaigns can integrate the "ACME keeps Canadians working" narrative in Q3.' },
    { title: 'JD Power 2026 Initial Quality Study — Full-Size Truck and Performance Coupe Top Their Segments',
      tags: ['automotive', 'brand'], urgency: 'medium',
      summary: 'JD Power 2026 Initial Quality Study results: the Full-Size Truck ranked #1 in the full-size truck segment, the Performance Coupe ranked #1 in the sports car segment, the Electric Crossover top-3 in compact EV. Strong overall ACME lineup performance.',
      whyItMatters: 'Third-party quality validation across multiple nameplates. Integrate JD Power badges across Tier 1 and Tier 2 creative for the Full-Size Truck and Electric Crossover. Trust-signal opportunity.' },
  ];

  // Generate procedural items with dates spread across 90 days before END_DATE
  for (let i = 0; i < templates.length; i++) {
    const tmpl = templates[i];
    const tag = tmpl.tags[0];
    const daysAgo = randInt(0, 89);
    const date = format(subDays(END_DATE, daysAgo), 'yyyy-MM-dd');
    const sources = NEWS_SOURCES_BY_TAG[tag] ?? ['Globe and Mail'];
    const geos = pickN(ALL_GEOS, randInt(1, 3));

    items.push({
      id: `news-${tag}-${i}`,
      title: tmpl.title,
      source: pick(sources),
      date,
      tags: tmpl.tags,
      regions: geos,
      urgency: tmpl.urgency,
      summary: tmpl.summary,
      whyItMatters: tmpl.whyItMatters,
      competitor: tmpl.competitor,
      enterprises: ['ford-canada'],
    });
  }

  // ── LINCOLN-specific hero news ──
  items.push(
    {
      id: 'news-lincoln-bmw-x5-redesign',
      title: 'European Luxury Announces 2027 Sport-Luxury SUV Redesign with Aggressive CAD $74,900 Starting Price — Direct Luxury Three-Row SUV Pressure',
      source: 'Driving.ca Luxury',
      date: '2026-05-07',
      tags: ['competitors', 'launch'],
      urgency: 'high',
      competitor: 'European Luxury',
      regions: ['national'],
      summary: 'A European Luxury marque confirmed its 2027 sport-luxury SUV will launch in September with a starting price of CAD $74,900 — $4,200 below the current Luxury Three-Row SUV Reserve. The reveal also previewed an enhanced ADAS package and new electrification options.',
      whyItMatters: 'The sport-luxury SUV is the single most aggressive cross-shop in the Luxury Three-Row SUV consideration funnel (38% overlap). The pricing move compresses ACME Luxury\'s value position in conquest-from-sport-luxury segments. STRATIS recommends accelerating Luxury Three-Row SUV value-narrative repositioning before the rival launch ramps.',
      enterprises: ['lincoln'],
    },
    {
      id: 'news-lexus-rx-loyalty',
      title: 'Import Luxury Midsize SUV Loyalty Hits Record 91% in Canada — J.D. Power Q1 Study',
      source: 'J.D. Power Canada',
      date: '2026-05-04',
      tags: ['competitors'],
      urgency: 'medium',
      competitor: 'Import Leader',
      regions: ['national'],
      summary: 'J.D. Power\'s Q1 luxury loyalty study shows the Import Luxury midsize SUV at 91% retention — the highest single-nameplate luxury SUV loyalty figure ever recorded in Canada. Conquest from that nameplate into the Luxury Midsize SUV has dropped 4.1pp YoY.',
      whyItMatters: 'Conquest creative against the Import Luxury midsize SUV is no longer producing meaningful flow. ACME Luxury should pivot Luxury Midsize SUV conquest dollars toward European Luxury prestige and progressive segments where loyalty is softer. Estimated efficiency gain: 22% on conquest spend.',
      enterprises: ['lincoln'],
    },
    {
      id: 'news-luxury-tariff-relief',
      title: 'Federal Government Announces Luxury Vehicle Tax Threshold Adjustment — Effective July 1',
      source: 'Department of Finance Canada',
      date: '2026-05-01',
      tags: ['macro'],
      urgency: 'high',
      regions: ['national'],
      summary: 'The federal luxury tax threshold for vehicles will rise from CAD $100,000 to CAD $108,000 effective July 1, 2026. Luxury Full-Size SUV Reserve and Luxury Three-Row SUV Black Label trims previously caught by the tax will now fall below threshold for some configurations.',
      whyItMatters: 'Removes a CAD $4K–$8K friction point on top-trim Luxury Three-Row SUV and Luxury Full-Size SUV configurations. STRATIS projects +280 incremental Q3 dealer leads with creative leading on "no luxury tax" messaging post-July 1.',
      enterprises: ['lincoln'],
    },
    {
      id: 'news-mercedes-gle-refresh',
      title: 'European Luxury Confirms 2027 Prestige Midsize SUV Refresh — Hybrid-First Lineup, Q3 Launch',
      source: 'Automotive News Canada',
      date: '2026-05-06',
      tags: ['competitors', 'launch', 'ev'],
      urgency: 'high',
      competitor: 'European Luxury',
      regions: ['national'],
      summary: 'A European Luxury prestige marque announced its 2027 midsize SUV refresh will arrive in Q3 with a fully hybridized lineup — every trim now mild-hybrid or PHEV. Pricing holds at CAD $84,500 base. Estimated national media weight $9.6M over 8 weeks.',
      whyItMatters: 'The prestige midsize SUV is the #2 cross-shop for the Luxury Three-Row SUV (after the sport-luxury SUV) and the #1 cross-shop for the Luxury Midsize SUV. The hybrid-first message directly counters ACME Luxury\'s mid-cycle positioning. Hudson Rouge should accelerate Luxury Midsize SUV 2026 hybrid messaging in CTV + Spotify before the rival launch grabs the conversation.',
      enterprises: ['lincoln'],
    },
    {
      id: 'news-tiff-sponsorship-window',
      title: 'TIFF Opens Premier Auto Sponsorship Window for 2026 Festival — Luxury Tier Limited to One OEM',
      source: 'Toronto International Film Festival',
      date: '2026-05-05',
      tags: ['sponsorships', 'partnerships', 'brand'],
      urgency: 'medium',
      regions: ['ontario', 'national'],
      summary: 'TIFF is accepting applications for its 2026 premier auto sponsorship tier, which limits the category to a single OEM. The package includes red-carpet vehicle presence, festival-week experiential activations across Toronto, and integrated brand placement. Decision expected late June.',
      whyItMatters: 'TIFF audience demographics overlap 71% with Luxury Three-Row SUV + Luxury Full-Size SUV buyer profiles (HHI $250K+, urban-affluent, cultural sophisticate). The last automaker in the slot (a Value Import luxury sub-brand, 2024) reported a 28% lift in Toronto-DMA brand consideration during festival weeks. Hudson Rouge should fast-track a TIFF integration brief.',
      enterprises: ['lincoln'],
    },
    {
      id: 'news-quebec-luxury-growth',
      title: 'Quebec Luxury Vehicle Sales Up 18% YoY in Q1 — Outpacing National 11% Growth',
      source: 'DesRosiers Automotive Consultants',
      date: '2026-05-03',
      tags: ['macro'],
      urgency: 'medium',
      regions: ['quebec'],
      summary: 'DesRosiers Q1 report shows Quebec luxury vehicle registrations grew 18% YoY — significantly ahead of the 11% national luxury growth rate. Drivers include Montreal urban affluent expansion + Quebec City executive segment recovery. ACME Luxury share in Quebec held flat at 6.1%.',
      whyItMatters: 'Quebec is over-indexing on luxury growth but ACME Luxury isn\'t capturing it — flat share against a +18% market means European Luxury rivals are winning the new buyers. Cossette Luxury should propose a Quebec-specific Luxury Three-Row SUV + Luxury Midsize SUV campaign to capture growth before share calcifies.',
      enterprises: ['lincoln'],
    },
    {
      id: 'news-genesis-dealer-expansion',
      title: 'Value Import Confirms 12 New Luxury Sub-Brand Boutique Dealers in Canada by 2027 — Toronto, Montreal, Vancouver Priority',
      source: 'Globe and Mail Auto',
      date: '2026-04-30',
      tags: ['competitors', 'partnerships'],
      urgency: 'high',
      competitor: 'Value Import',
      regions: ['national'],
      summary: 'A Value Import group confirmed plans to open 12 new luxury sub-brand boutique dealerships across Canada by end of 2027 — concentrated in Toronto (5), Montreal (3), Vancouver (2), Calgary (1), Ottawa (1). The boutique format mirrors a successful US strategy.',
      whyItMatters: 'The Value Import luxury sub-brand is the fastest-growing luxury entrant in Canada (its sedan + SUV took 4.2pp from the Luxury Three-Row SUV over 2 years). The new boutique footprint targets exactly ACME Luxury\'s urban-affluent segment in 5 of the 6 highest-conversion markets. ACME Luxury should pre-empt with conquest creative + dealer-experience differentiation messaging.',
      enterprises: ['lincoln'],
    },
    {
      id: 'news-range-rover-sport',
      title: 'European Luxury Pulls 2026 Full-Size Luxury SUV Marketing After Reliability Recall',
      source: 'Driving.ca Luxury',
      date: '2026-04-29',
      tags: ['competitors'],
      urgency: 'medium',
      competitor: 'European Luxury',
      regions: ['national'],
      summary: 'A European Luxury marque paused all 2026 full-size luxury SUV paid media after a Transport Canada recall covering 8,400 Canadian units for an electrical fault. Marketing pause expected to last 6–10 weeks pending fix verification.',
      whyItMatters: 'That full-size luxury SUV is the #3 cross-shop for the Luxury Full-Size SUV. The rival\'s media silence creates a 6–10 week SOV vacuum in the full-size luxury SUV category. Hudson Rouge should temporarily surge Luxury Full-Size SUV CTV + Spotify weight to capture the rival\'s audience cluster while their consideration is open.',
      enterprises: ['lincoln'],
    },
    {
      id: 'news-lincoln-quiet-flight-spotify',
      title: 'Spotify Canada Reports Audio Ad Engagement +34% in Premium Lifestyle Segment Q1',
      source: 'Spotify Canada',
      date: '2026-04-26',
      tags: ['partnerships'],
      urgency: 'medium',
      regions: ['national'],
      summary: 'Spotify\'s Q1 Canada audio engagement report shows the Premium Lifestyle segment (HHI $200K+, urban) drove a 34% YoY lift in audio ad engagement vs. the broader Spotify base. Listening duration up 22%, podcast attribution up 41%.',
      whyItMatters: 'The Spotify Premium Lifestyle audience matches ACME Luxury\'s buyer profile almost exactly. The "Quiet Flight" Luxury Three-Row SUV audio spots are testing strongly here (12% above benchmark). Hudson Rouge should push 30% more Spotify weight into Luxury Three-Row SUV + Luxury Midsize SUV before Q3 prestige-midsize-SUV + sport-luxury-SUV launches consume the inventory.',
      enterprises: ['lincoln'],
    },
  );

  // ── DEALERSHIP NETWORK-specific hero news ──
  items.push(
    {
      id: 'news-dn-ontario-coop-program-update',
      title: 'ACME Updates Tier 3 Co-op Reimbursement Structure — Effective Q3 2026',
      source: 'ACME Dealer Council Bulletin',
      date: '2026-05-06',
      tags: ['brand'],
      urgency: 'high',
      regions: ['national'],
      summary: 'ACME announced changes to dealer co-op reimbursement: digital media (Search, Meta, programmatic) reimbursement rises from 50% to 65%, while traditional media (radio, print) drops from 65% to 40%. Effective for Q3 spend.',
      whyItMatters: 'Dealers running >40% traditional media will see effective marketing budget compress unless they shift to digital. STRATIS detects 312 of 890 dealers currently above the threshold — proactive outreach can prevent budget surprise and accelerate digital-first transition.',
      enterprises: ['dealership-network'],
    },
    {
      id: 'news-dn-google-vehicle-listing-ads',
      title: 'Google Launches Vehicle Listing Ads in Canada — Available to All Authorized Dealers',
      source: 'Google Ads Canada',
      date: '2026-05-03',
      tags: ['partnerships'],
      urgency: 'high',
      regions: ['national'],
      summary: 'Google rolled out Vehicle Listing Ads (VLAs) to Canadian auto dealers this week. Inventory feeds plug into Google Search and Google Shopping with VIN-level visibility. Early US results show 28% lift in qualified leads at flat CPL.',
      whyItMatters: 'First-mover dealers will capture disproportionate volume. STRATIS recommends a coordinated 60-dealer pilot in Ontario + BC to validate the format before full network rollout. Expected lead-volume lift: 18-24% within 90 days.',
      enterprises: ['dealership-network'],
    },
    {
      id: 'news-dn-quebec-french-creative-mandate',
      title: 'OQLF Tightens French-Language Compliance for Digital Auto Ads — December 2026 Deadline',
      source: 'Office québécois de la langue française',
      date: '2026-04-29',
      tags: ['macro'],
      urgency: 'medium',
      regions: ['quebec'],
      summary: 'The Office québécois de la langue française published updated guidance requiring all digital auto advertising in Quebec to feature primary French copy by December 31, 2026. Bilingual ads with English-first treatment will be non-compliant.',
      whyItMatters: 'Quebec dealer co-op currently runs 38% English-first creative. STRATIS detected 64 dealers at compliance risk. Coordinated French-creative production via Cossette saves dealer-by-dealer scramble and reduces compliance risk to zero.',
      enterprises: ['dealership-network'],
    },
  );

  // Cross-industry agency clients (authored in src/lib/clients/*)
  items.push(...RBC_NEWS, ...MOLSON_COORS_NEWS, ...LULULEMON_NEWS, ...TIM_HORTONS_NEWS);

  // Pinned items always at top — sort by pinned status (id prefix) then date desc
  return items.sort((a, b) => {
    const aPinned = isPinned(a.id);
    const bPinned = isPinned(b.id);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });
}

const PINNED_NEWS_IDS = new Set([
  'news-tesla-cybertruck-cut', 'news-izev-extension', 'news-gm-silverado-fleet',
  'news-lincoln-bmw-x5-redesign', 'news-lexus-rx-loyalty', 'news-luxury-tariff-relief',
  'news-dn-ontario-coop-program-update', 'news-dn-google-vehicle-listing-ads', 'news-dn-quebec-french-creative-mandate',
  ...RBC_RADAR_PINS, ...MOLSON_COORS_RADAR_PINS, ...LULULEMON_RADAR_PINS, ...TIM_HORTONS_RADAR_PINS,
]);
function isPinned(id: string): boolean {
  return PINNED_NEWS_IDS.has(id);
}

// ===== Insights =====
function generateInsights(_anomalies: Anomaly[]): Insight[] {
  const today = format(END_DATE, 'yyyy-MM-dd') + 'T07:00:00Z';
  const at = (daysAgo: number, hhmmss: string) =>
    format(subDays(END_DATE, daysAgo), 'yyyy-MM-dd') + 'T' + hhmmss + 'Z';

  return [
    // ═════════════════════════════════════════════════════════════════
    // MEDIA EFFICIENCY & ALLOCATION — operator-level levers ready to ship;
    // the saturation + mix cards are slider-driven and launch onto platform
    // ═════════════════════════════════════════════════════════════════

    {
      id: 'ins-auto-01-saturation',
      createdAt: today,
      enterprise: 'ford-canada', category: 'tactical-efficiency',
      scope: 'division', division: 'tier-1', productLine: 'f150',
      channels: ['ctv', 'google-search', 'spotify'],
      title: 'Connected TV on the National Full-Size Truck Flight Has Hit Saturation — the Top ~18% of Its Budget Is Driving Almost No New Leads, While the Same Dollars Still Convert in Search and Audio',
      summary: 'Connected TV on the national truck flight is past the point where more money buys more leads. Its response curve has gone flat: the last ~18% of CTV spend is producing almost no incremental dealer leads, because the in-market truck audience that responds to TV has already been reached often enough. Search and audio, by contrast, are still on the steep part of their curves — every added dollar there still converts. A great buyer reads the saturation point off the curve once a quarter; STRATIS watches it continuously and calls it the week CTV flattens. Move the over-saturated tail to the channels that still have room.',
      evidence: [
        'CTV: each extra $100K is now driving ~5 leads, down from ~23 earlier in the flight.',
        'About 18% of CTV budget sits past the point where the response curve goes flat.',
        'Search and audio are still climbing — ~20 and ~14 leads per extra $100K.',
        'CTV frequency on the in-market truck core has pushed well past where TV stops persuading.',
        'STRATIS flags saturation as it happens; a quarterly mix model would book the wasted tail as “working.”',
      ],
      confidence: 0.90,
      impactEstimate: 'Moving the saturated ~18% of CTV (~$3.1M) into search and audio drives roughly the same number of leads for less, or more leads for the same spend — recovered now, not at the next planning cycle.',
      recommendedAction: 'Pull the saturated top slice of CTV budget and redeploy it to search and audio, which still convert at the margin. Adjust the slider to set the step, then push through Mindshare’s buying seats. STRATIS holds each channel against its own saturation point and rebalances as the curves move.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Cap CTV at the point its response curve flattens', subtitle: 'THE LAST 18% BUYS ALMOST NOTHING', type: 'budget', completed: false },
        { id: 's2', title: 'Redeploy the freed ~$3.1M to search + audio', subtitle: 'CHANNELS STILL ON THE STEEP CURVE', type: 'budget', completed: false },
        { id: 's3', title: 'Watch every channel’s saturation point continuously', subtitle: 'REBALANCE AS THE CURVES MOVE', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-auto-02-mix-reallocation',
      createdAt: at(0, '07:03:00'),
      enterprise: 'ford-canada', category: 'tactical-efficiency',
      scope: 'division', division: 'tier-1', productLine: 'f150',
      channels: ['ctv', 'ttd', 'google-search', 'facebook', 'spotify'],
      title: 'Three Channels Are Past Their Efficient Point and Three Have Room to Grow — Rebalancing the National Mix to Where Each Dollar Works Hardest Frees ~$4.0M at the Same Lead Volume',
      summary: 'The national budget isn’t split to get the most leads per dollar. Lined up side by side, three channels are funded past the point where they pay back, while three are underfunded and still hungry — the next dollar would do far more good in the second group than it’s doing in the first. Rebalancing toward that efficiency frontier holds total leads flat while freeing spend, or grows leads at the same budget. This is the mix optimization a strategist does by hand once a quarter; STRATIS holds the frontier live and shows exactly how much to move and where.',
      evidence: [
        'Programmatic display and Meta are funded ~30% past the point where each dollar pays back.',
        'Search, audio, and high-intent social are underfunded with room to grow.',
        'Equalizing the marginal return across channels frees ~$4.0M at today’s lead volume.',
        'No single agency seat sees this — each reports its own efficiency, not the cross-channel frontier.',
        'The recommended mix is shown as concrete dollar moves, not a directional “shift toward video.”',
      ],
      confidence: 0.88,
      impactEstimate: 'Rebalancing to the efficiency frontier frees ~$4.0M at flat lead volume, or drives ~9% more leads at the same total budget — recovered now, not at the next planning cycle.',
      recommendedAction: 'Move budget from the three over-funded channels into the three with headroom until the next dollar is equally productive everywhere. Adjust the slider to set the move size before launching. STRATIS recomputes the frontier as performance shifts.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Pull spend from the three past-efficient channels', subtitle: 'WHERE THE DOLLAR NO LONGER PAYS BACK', type: 'budget', completed: false },
        { id: 's2', title: 'Fund the three channels with headroom', subtitle: 'WHERE THE NEXT DOLLAR WORKS HARDEST', type: 'budget', completed: false },
        { id: 's3', title: 'Hold the mix on the efficiency frontier', subtitle: 'STRATIS RECOMPUTES AS IT MOVES', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-auto-03-audience-efficiency',
      createdAt: at(0, '07:06:00'),
      enterprise: 'ford-canada', category: 'audience-overlap',
      scope: 'division', division: 'tier-1', productLine: 'f150',
      channels: ['ctv', 'ttd', 'google-search', 'facebook'],
      title: 'In-Market Truck Intenders Convert at 2.4× the Return of the Broad Auto Audience — but They Get Only a Third of the Targeting Budget',
      summary: 'Not every audience is worth the same. The in-market truck-intender segment — actively configuring, pricing, and cross-shopping — converts at more than twice the leads-per-dollar of the broad auto-intender audience, because they’re already in motion. But the budget is weighted to the broad audience because it’s bigger and cheaper to reach, so most of the money is chasing the least efficient people. Shifting targeting toward the high-intent segment, and trimming the broad-reach waste, lifts results without spending more.',
      evidence: [
        'In-market truck intenders: ~2.4× the leads per dollar of the broad auto audience.',
        'That high-intent segment receives only ~33% of national targeting budget today.',
        'The broad auto audience absorbs most of the spend at the weakest conversion.',
        'The efficient segment is reachable through search intent, configurator signals, and CRM match.',
        'STRATIS ranks every audience by leads per dollar, not by reach or CPM.',
      ],
      confidence: 0.87,
      impactEstimate: 'Reweighting targeting toward the high-intent segment is projected to lift leads ~13% at the same spend, by moving dollars off the broad audience’s long inefficient tail.',
      recommendedAction: 'Shift targeting budget into the in-market truck-intender segment and trim the broad-reach tail. STRATIS keeps ranking audiences by leads per dollar and reallocates as efficiency shifts.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Raise the high-intent segment’s budget share', subtitle: 'FUND THE 2.4× AUDIENCE', type: 'targeting', completed: false },
        { id: 's2', title: 'Trim the broad auto-audience reach tail', subtitle: 'STOP PAYING FOR THE WEAKEST CONVERTERS', type: 'targeting', completed: false },
        { id: 's3', title: 'Rank every audience by leads per dollar', subtitle: 'NOT BY REACH OR IMPRESSIONS', type: 'targeting', completed: false },
      ],
    },
    {
      id: 'ins-auto-04-acquisition-cost-rising',
      createdAt: at(0, '07:09:00'),
      enterprise: 'ford-canada', category: 'tactical-efficiency',
      scope: 'product', productLine: 'lightning',
      channels: ['google-search', 'ttd'],
      linkedNewsId: 'news-tesla-cybertruck-cut',
      title: 'Cost per Lead Through Search on the Electric Pickup Now Runs ~$118 — Up From ~$96 Two Weeks Ago — Because Rivals Bid Up a Handful of Comparison Terms',
      summary: 'The cost per lead through search on the Electric Pickup has jumped about 23% in two weeks. It isn’t that the ads got worse — conversion is flat. It’s a price war: after the EV-disruptor’s price cut, more advertisers piled onto a small cluster of “[electric pickup] vs [disruptor]” comparison terms and bid the price up. So the fix is surgical — cap the bids on that handful of terms — not a blunt cut to the whole search program. A quarterly mix model would catch this about six weeks from now; STRATIS flagged it the day the cost crossed the line, with the cause attached.',
      evidence: [
        'Cost per lead via search on the Electric Pickup: ~$118, up from ~$96 two weeks ago.',
        'Conversion rate is flat — this is a rising-price problem, not a creative problem.',
        'The increase traces to a small cluster of competitor-comparison terms, not the whole account.',
        'Capping bids on those terms restores the cost without touching the rest of the program.',
        'STRATIS catches it the day the cost crosses the line; a quarterly model lags ~6 weeks.',
      ],
      confidence: 0.86,
      impactEstimate: 'Capping bids on the over-heated terms brings the cost per lead back under ~$96 within days, recovering roughly $0.6M a quarter currently lost to the price war.',
      recommendedAction: 'Cap bids on the small cluster of comparison terms driving the increase, rather than cutting the whole search budget. STRATIS watches the cost per lead continuously and alerts on the next crossing.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Pinpoint the comparison terms driving the spike', subtitle: 'A HANDFUL OF TERMS, NOT THE ACCOUNT', type: 'targeting', completed: false },
        { id: 's2', title: 'Cap their bids to restore the cost per lead', subtitle: 'SURGICAL, NOT A PROGRAM-WIDE CUT', type: 'bidding', completed: false },
        { id: 's3', title: 'Alert the moment cost per lead crosses the line', subtitle: 'DON’T WAIT FOR THE QUARTERLY MODEL', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-auto-05-price-of-reach',
      createdAt: at(0, '07:12:00'),
      enterprise: 'ford-canada', category: 'tactical-efficiency',
      scope: 'division', division: 'tier-1', productLine: 'f150',
      channels: ['ctv', 'spotify', 'google-search', 'facebook'],
      title: 'The Price of Reach on Connected TV Has Climbed Three Weeks Straight While Leads Held Flat — We’re Paying More for the Same Result and the Budget Hasn’t Reacted',
      summary: 'Connected TV is getting more expensive to buy — the price of reaching a thousand people is up about 23% over three weeks — but it isn’t driving any more leads. We’re simply paying more for the same result, and the budget hasn’t moved to reflect it. STRATIS watches cost against result by channel every week, so it caught the gap as it opened rather than at the end of a monthly report. The move is a straightforward, reversible shift away from a channel that quietly got pricier toward channels still beating their benchmark.',
      evidence: [
        'CTV price of reach: up ~23% over three weeks.',
        'CTV leads over the same window: flat — more money, same result.',
        'CTV budget weight: unchanged since the price climb began.',
        'Audio and high-intent search are currently beating their benchmark — reversible targets.',
        'The shift fully reverses the moment CTV pricing normalizes.',
      ],
      confidence: 0.84,
      impactEstimate: 'Trimming the now-overpriced CTV share back to its efficient run-rate and redeploying it stops the climb in cost per lead; fully reversible if CTV pricing comes back down.',
      recommendedAction: 'Trim the overpriced CTV share and redeploy to channels still beating their benchmark; STRATIS reverses the move automatically if CTV pricing normalizes.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Reduce CTV weight to its efficient run-rate', subtitle: 'REVERSIBLE', type: 'budget', completed: false },
        { id: 's2', title: 'Redeploy to channels beating their benchmark', subtitle: 'AUDIO + HIGH-INTENT SEARCH', type: 'budget', completed: false },
        { id: 's3', title: 'Alert when cost and results drift apart', subtitle: 'STRATIS WATCHES WEEKLY', type: 'scheduling', completed: false },
      ],
    },

    // ═════════════════════════════════════════════════════════════════
    // NATIONAL-TO-REGIONAL ORCHESTRATION — national demand vs regional
    // capture across provinces, and the non-media friction dragging it
    // ═════════════════════════════════════════════════════════════════

    {
      id: 'ins-auto-06-geo-efficiency',
      createdAt: at(0, '07:15:00'),
      enterprise: 'ford-canada', category: 'national-regional',
      scope: 'brand',
      channels: ['ctv', 'ttd', 'google-search'],
      title: 'A Quarter of National Spend Is Going to Provinces Converting 30% Below Average — the Media Map and the Demand Map Don’t Match',
      summary: 'Where the money goes and where it works have drifted apart. About a quarter of national spend is landing in provinces that convert roughly 30% below the national average, while several high-converting markets are underfunded. The plan is weighted to population and last year’s buys, not to where media actually converts today. Re-weighting the geographic plan toward the markets that convert — and pulling back from the ones that don’t — lifts results without adding budget.',
      evidence: [
        '~25% of national spend sits in provinces converting ~30% below the national average.',
        'Several high-converting markets are underfunded relative to the demand they show.',
        'Spend tracks population and last year’s plan, not current conversion.',
        'Re-weighting to conversion is a pure reallocation — no new budget required.',
        'STRATIS scores every market on what media actually returns, refreshed continuously.',
      ],
      confidence: 0.85,
      impactEstimate: 'Re-weighting the geo plan toward converting provinces is projected to lift leads ~11% at flat spend by moving money off the weakest markets.',
      recommendedAction: 'Shift national weight out of the low-converting provinces into the high-converting ones the plan currently underfunds. STRATIS re-scores markets continuously and flags drift.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Pull weight from provinces converting below average', subtitle: 'STOP FUNDING POPULATION OVER DEMAND', type: 'budget', completed: false },
        { id: 's2', title: 'Fund the high-converting provinces that are starved', subtitle: 'MATCH SPEND TO WHERE IT WORKS', type: 'budget', completed: false },
        { id: 's3', title: 'Re-score every market continuously', subtitle: 'KEEP THE MAP AND THE PLAN ALIGNED', type: 'targeting', completed: false },
      ],
    },
    {
      id: 'ins-auto-07-access-friction',
      createdAt: at(0, '07:18:00'),
      enterprise: 'ford-canada', category: 'national-regional',
      scope: 'brand',
      channels: ['google-search', 'ttd', 'ooh'],
      title: 'In Provinces Where the Nameplate Is Thinnest on Dealer Lots, the Same Ads Convert 34% Worse — We’re Still Spending Into the Inventory Gap',
      summary: 'Media performance is being dragged down by something that has nothing to do with the media. In provinces where the advertised nameplate is thinnest on dealer lots, the exact same ads convert about 34% worse — the demand is there, but the shopper can’t find the vehicle to buy. Today the plan allocates on reach efficiency alone, pouring budget into markets where the configured truck simply isn’t available. Weighting spend to inventory, and steering shoppers to the trims that are actually on the ground, turns wasted impressions into booked test drives.',
      evidence: [
        'Lowest-availability provinces convert the same creative ~34% worse than well-stocked ones.',
        'Spend tracks reach efficiency, not inventory — so money flows where the vehicle isn’t.',
        '~$2.4M a year is going to the lowest-availability markets.',
        'Well-stocked markets return ~1.5× the result at equal spend.',
        'STRATIS joins dealer-inventory feeds to media performance — a link no media report sees.',
      ],
      confidence: 0.85,
      impactEstimate: 'Weighting the plan to inventory and steering demand to in-stock trims is projected to lift the return on media ~19% at flat spend.',
      recommendedAction: 'Add an inventory-availability weight to the budget model, pull spend from the thinnest-stocked provinces, and steer shoppers to in-stock trims before reinvesting. STRATIS keeps the inventory-to-media link live.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Add a dealer-inventory weight to the budget model', subtitle: 'DON’T ALLOCATE ON REACH ALONE', type: 'bidding', completed: false },
        { id: 's2', title: 'Pull spend from the thinnest-stocked provinces', subtitle: 'WHERE THE VEHICLE ISN’T ON THE GROUND', type: 'budget', completed: false },
        { id: 's3', title: 'Steer demand to in-stock trims before reinvesting', subtitle: 'MATCH THE AD TO THE LOT', type: 'targeting', completed: false },
      ],
    },

    // ═════════════════════════════════════════════════════════════════
    // CREATIVE PERFORMANCE — the winner is starved, and the flagship is worn
    // ═════════════════════════════════════════════════════════════════

    {
      id: 'ins-auto-08-creative-winner',
      createdAt: at(0, '07:21:00'),
      enterprise: 'ford-canada', category: 'creative-performance',
      scope: 'division', division: 'tier-1', productLine: 'mach-e',
      channels: ['ooh', 'google-search', 'facebook', 'ctv'],
      linkedNewsId: 'news-izev-extension',
      title: 'One “What You’ll Actually Pay” Rebate Ad Is Driving Leads at 1.6× the Rate of the Main Brand Spot — but It’s Only Getting 12% of the Views',
      summary: 'Ranked by how many leads each ad actually drove — not by last click — the rebate/affordability execution is the clear winner, converting at about 1.6× the rate of the legacy brand hero it runs beside, strongest at the configurator and dealer-locator step. But it’s starved: it gets only ~12% of views because delivery defaults to the old hero. Since the iZEV rebate that makes it work was just extended, this is a durable win you can capture for free — give the proven ad more of the views, then brief the agency to make more like it.',
      evidence: [
        'The “what you’ll actually pay” rebate ad converts at ~1.6× the rate of the brand hero beside it.',
        'It holds only ~12% of views — delivery defaults to the legacy hero.',
        'It’s strongest at the configurator and dealer-locator step, where cost is the last hurdle.',
        'The edge repeats across independent provinces — not a one-market fluke.',
        'Measured on leads driven, not last click; the rebate extension makes the edge durable.',
      ],
      confidence: 0.88,
      impactEstimate: 'Giving the proven rebate ad more of the views lifts the overall lead rate at no production cost — and tells the creative team exactly what to make more of.',
      recommendedAction: 'Shift views from the legacy hero to the winning rebate ad at the configurator, dealer locator, and in search, and brief the agency to extend the winning idea. STRATIS keeps ranking creative by leads driven.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Rank creative by leads driven', subtitle: 'NOT BY LAST CLICK', type: 'creative', completed: false },
        { id: 's2', title: 'Give the proven rebate ad more of the views', subtitle: 'FREE GAIN — NO NEW PRODUCTION', type: 'creative', completed: false },
        { id: 's3', title: 'Brief the agency to make more like the winner', subtitle: 'PROVEN IDEA → MORE OF IT', type: 'creative', completed: false },
      ],
    },
    {
      id: 'ins-auto-09-creative-fatigue',
      createdAt: at(0, '07:24:00'),
      enterprise: 'ford-canada', category: 'creative-performance',
      scope: 'product', productLine: 'f150',
      channels: ['ctv', 'facebook'],
      title: 'The Flagship Truck Spot Has Lost ~19% of Its Pull in Three Weeks at the Same Spend — That’s Creative Wear-Out, Not a Delivery Problem, So the Fix Is a Refresh',
      summary: 'The flagship truck spot is tiring out. Its pull with the core in-market audience is down about 19% over three weeks even though spend and audience haven’t changed. The instinct is to blame the buy, but the pattern says otherwise: people are simply seeing it too many times — response drops with each extra viewing while a fresher cut running beside it holds steady. That’s creative wear-out, and the fix is a refresh, not a change to the media. Spending the cycle re-tuning delivery would fix nothing. STRATIS calls the cause and flags the refresh window before the decay starts costing real leads.',
      evidence: [
        'Flagship-spot pull is down ~19% over three weeks at flat spend and a steady audience.',
        'Response drops with each additional viewing — the fingerprint of wear-out, not delivery.',
        'A fresher cut running beside it is holding steady, ruling out a market-wide delivery shift.',
        'Two lower-frequency cuts out-perform per viewing but get only ~9% of delivery.',
        'STRATIS separates wear-out from delivery so the team doesn’t fix the wrong thing.',
      ],
      confidence: 0.90,
      impactEstimate: 'Refreshing the worn spot before the decay deepens is projected to improve the cost per lead ~17%, and avoids a wasted delivery change that wouldn’t have fixed wear-out.',
      recommendedAction: 'Treat it as wear-out: cap the tired spot’s delivery, promote the two best fresh cuts, and brief a new execution for the over-exposed audience. STRATIS confirms the cause and flags the refresh window.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Confirm wear-out before changing anything', subtitle: 'IT’S FREQUENCY, NOT THE BUY', type: 'creative', completed: false },
        { id: 's2', title: 'Cap the tired spot, promote the fresh cuts', subtitle: 'REFRESH, DON’T RE-TUNE DELIVERY', type: 'creative', completed: false },
        { id: 's3', title: 'Brief a new execution for the worn-out audience', subtitle: 'BEFORE IT COSTS REAL LEADS', type: 'creative', completed: false },
      ],
    },

    // ═════════════════════════════════════════════════════════════════
    // AUDIENCE & FREQUENCY — shared-audience collisions and portfolio
    // frequency math across the ACME nameplate lineup
    // ═════════════════════════════════════════════════════════════════

    {
      id: 'ins-auto-10-frequency-collision',
      createdAt: at(0, '07:27:00'),
      enterprise: 'ford-canada', category: 'audience-overlap',
      scope: 'brand',
      channels: ['ctv', 'facebook', 'google-search', 'ttd'],
      title: 'The Average In-Market Truck Shopper Is Seeing an ACME Ad 19 Times a Week Across TV, Social, and Display — More Than Double What Actually Moves Them',
      summary: 'Each campaign caps how often it shows an ad, but nobody caps across all of them at once. When you follow a single shopper across TV, social, display, and online video, the average in-market truck shopper is seeing ACME about 19 times a week — more than double the ~8–11 range where extra exposure stops persuading and starts annoying. The over-exposure is invisible to any one team because each only sees its own delivery; it only shows up when every campaign is matched to the same person. One cap across everything pulls exposure back to the effective range and frees the wasted impressions for people the brand isn’t reaching at all.',
      evidence: [
        'Matched to the person across four channels: ~19 ads a week to the average in-market truck shopper.',
        'No single channel goes above ~6 a week — the pile-up only shows up when you combine them.',
        'Extra exposure stops persuading past ~8–11 a week for this audience.',
        'About 22% of national impressions land above that line — roughly $3.6M a year of waste.',
        'The waste is also burning out the flagship spot faster in the over-exposed group.',
      ],
      confidence: 0.92,
      impactEstimate: 'One cap across all campaigns pulls weekly exposure back to the effective range and moves ~$3.6M of wasted impressions to people the brand isn’t reaching — lifting net reach ~14% with no extra spend.',
      recommendedAction: 'Set a single ~11-per-week cap across every ACME campaign and move the recovered budget to under-reached audiences. STRATIS matches audiences across campaigns and enforces the cap continuously.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Set one ~11/week cap across all campaigns', subtitle: 'NOT PER-CAMPAIGN — ACROSS EVERYTHING', type: 'bidding', completed: false },
        { id: 's2', title: 'Move the savings to under-reached audiences', subtitle: 'BUY REACH WE’RE MISSING', type: 'budget', completed: false },
        { id: 's3', title: 'Enforce the combined cap continuously', subtitle: 'STRATIS MATCHES ACROSS CAMPAIGNS', type: 'scheduling', completed: false },
      ],
    },

    // ═════════════════════════════════════════════════════════════════
    // COMPETITIVE & MARKET SIGNALS — external moves triangulated against
    // ACME demand, reported as correlation with a window to act
    // ═════════════════════════════════════════════════════════════════

    {
      id: 'ins-auto-11-conquest-opportunity',
      createdAt: at(0, '07:30:00'),
      enterprise: 'ford-canada', category: 'competitive-macro',
      scope: 'product', productLine: 'lightning',
      channels: ['google-search', 'ttd', 'ctv'],
      linkedNewsId: 'news-tesla-cybertruck-cut',
      title: 'The EV Disruptor Pulled Its Brand-Defense Search ~40% After Its Own Price Cut — the Door to Win Electric-Pickup Switchers Just Opened, and It’s Cheaper Than It’s Been All Year',
      summary: 'Two things happened at once that add up to an opening, not a threat. Right after the EV-disruptor’s price cut, shoppers started searching “[electric pickup] vs [disruptor]” and range-and-capability comparisons about three times as much — ahead of any actual cross-shop swing. At the same time the disruptor pulled its own brand-defense search spend back about 40%, so the cost to show up against those searches has dropped below where it’s been all year. Our conquest campaign is only putting 6% of its budget here and the capability-objection ad isn’t even running in those comparison searches. The lane is open, cheap, and uncontested — but only while interest is running ahead of the cross-shop.',
      evidence: [
        'Comparison searches up ~210% within 72 hours of the cut — ahead of any cross-shop swing.',
        'The disruptor cut its brand-defense search spend ~40% — the auction is the cheapest it’s been all year.',
        'Our conquest campaign holds only 6% of search budget in the affected provinces.',
        'The “towing + range + total cost” capability-objection ad isn’t running in comparison search.',
        'STRATIS reads the retreat and the interest spike together and calls it an opening.',
      ],
      confidence: 0.83,
      impactEstimate: 'Surging the conquest campaign while the lane is cheap and interest is leading is projected to protect ~$4.6M a year of at-risk Electric Pickup demand, at a lower cost to win each switcher than any point last year.',
      recommendedAction: 'Surge conquest search and capability creative in the affected provinces and put the objection ad live now, while the competitor is out and costs are low. STRATIS holds the lane and alerts if the competitor returns.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Raise conquest-search budget from 6% to ~18%', subtitle: 'WHILE THE AUCTION IS CHEAP', type: 'budget', completed: false },
        { id: 's2', title: 'Put the capability-objection ad live in comparison search', subtitle: 'WALK THROUGH THE OPEN DOOR', type: 'creative', completed: false },
        { id: 's3', title: 'Alert if the competitor re-enters the auction', subtitle: 'STRATIS HOLDS THE LANE', type: 'scheduling', completed: false },
      ],
    },

    // ═════════════════════════════════════════════════════════════════
    // TIER CHOREOGRAPHY — Tier 1 → Tier 3 (dealer) handoff timing
    // ═════════════════════════════════════════════════════════════════

    {
      id: 'ins-auto-12-pull-through',
      createdAt: at(0, '07:33:00'),
      enterprise: 'ford-canada', category: 'tier-choreography',
      scope: 'brand',
      channels: ['ctv', 'google-search', 'facebook'],
      title: 'Every Time a National TV Flight Runs, Dealers in That Market Get More “Nameplate Near Me” Searches 9 Days Later — but Tier-3 Dealer Media Isn’t Lined Up to That Window',
      summary: 'The national and local sides of the plan are out of sync. In markets with heavy national TV, dealers see a clear bump in branded “near me” searches and dealer-site visits about nine days later — shoppers are carrying the brand prompt into the buying journey. But Tier-3 dealer media and local retargeting run on a different calendar than the national flights, so the dealer-side spend usually lands outside that nine-day window when the shopper is already deciding. The fix is timing, not more money — fire the dealer-side touch into the window the national flight already created.',
      evidence: [
        'Dealer “nameplate near me” search peaks about nine days after a national TV flight in the same market.',
        'Heavy-TV markets see ~27% more dealer branded search than light-TV markets.',
        'Dealer media and local retargeting aren’t aligned to the national TV calendar — they run in separate systems.',
        'A shopper’s “near me” search converts ~2.1× better when a dealer touch lands inside the window.',
        'Only a view across both tiers sees the nine-day handoff — neither layer sees it alone.',
      ],
      confidence: 0.86,
      impactEstimate: 'Timing the Tier-3 dealer touch to the nine-day window is projected to lift leads ~8–11% in aligned markets — with no extra media spend.',
      recommendedAction: 'Trigger dealer media and local retargeting to fire 7–10 days after each national flight by market. STRATIS pushes the flight calendar into the dealer systems so the window is hit by default.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Feed the national flight calendar into dealer systems', subtitle: 'ONE CALENDAR, NOT TWO', type: 'scheduling', completed: false },
        { id: 's2', title: 'Time the dealer touch to the 7–10 day window', subtitle: 'HIT THE HANDOFF', type: 'scheduling', completed: false },
        { id: 's3', title: 'Compare aligned vs unaligned markets for six weeks', subtitle: 'PROVE THE LIFT', type: 'targeting', completed: false },
      ],
    },

    // ═════════════════════════════════════════════════════════════════
    // MEDIA EFFICIENCY — audience migration, intent discovery, supply path,
    // reach ceilings, and competitive auction pressure
    // ═════════════════════════════════════════════════════════════════

    {
      id: 'ins-auto-13-audience-migration',
      createdAt: at(0, '07:36:00'),
      enterprise: 'ford-canada', category: 'tactical-efficiency',
      scope: 'division', division: 'tier-1', productLine: 'bronco',
      channels: ['facebook', 'tiktok', 'instagram'],
      title: 'Move the Adventure-Lifestyle Budget From Facebook to TikTok — the Younger Buyers Who Made Facebook Efficient Last Year Have Moved There, Where They Now Convert ~40% Cheaper',
      summary: 'The adventure-lifestyle audience that made Facebook pay off last year — younger SUV shoppers researching trail builds and gear — has shifted where it spends its attention. That conversation has largely moved to TikTok (short-form build and off-road creators), and the same people now respond there at a much lower cost, while Facebook’s cost to drive a configured lead has climbed as the active audience thinned out. This is an audience-migration call: follow the people, not the plan. STRATIS tracks where an audience actually converts across platforms week to week, so it catches the shift while it’s happening.',
      evidence: [
        'Cost to drive a configured lead: up ~44% on Facebook over the quarter, while TikTok is ~40% cheaper for the same audience.',
        'The active adventure audience on Facebook has shrunk; the same users now show up and convert on TikTok.',
        'Facebook still works for the older family-SUV audience — this move is the adventure slice only.',
        'TikTok adventure delivery has headroom; it isn’t yet saturated for this audience.',
        'Only a cross-platform view catches this — each platform’s own report looks “fine” in isolation.',
      ],
      confidence: 0.85,
      impactEstimate: 'Moving the adventure slice from Facebook to TikTok is projected to lift adventure-driven leads ~12% at flat spend, by following the audience to where it now converts.',
      recommendedAction: 'Shift the adventure-lifestyle budget from Facebook to TikTok, keep only the Facebook segments still working for family-SUV shoppers, and let STRATIS keep watching where the audience converts.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Move the adventure budget from Facebook to TikTok', subtitle: 'FOLLOW THE AUDIENCE', type: 'budget', completed: false },
        { id: 's2', title: 'Keep only the Facebook segments still converting', subtitle: 'FAMILY-SUV, NOT ADVENTURE', type: 'targeting', completed: false },
        { id: 's3', title: 'Watch where the audience converts week to week', subtitle: 'STRATIS TRACKS THE MIGRATION', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-auto-14-discovery-intent',
      createdAt: at(0, '07:39:00'),
      enterprise: 'ford-canada', category: 'tactical-efficiency',
      scope: 'division', division: 'tier-3', productLine: 'f150',
      channels: ['facebook', 'google-search', 'instagram'],
      title: 'Shift a Slice of Cold Meta Prospecting Into High-Intent Search — Shoppers Configuring and Searching “Near Me” Convert Dealer Visits at About a Third of Meta’s Cost',
      summary: 'Search is where shoppers decide, and a real share of the truck audience is there actively configuring trims, comparing prices, and searching “[nameplate] near me.” Because they arrive with intent, they convert to a qualified dealer visit at roughly a third of the cost of cold prospecting on Meta. Meta is still the right tool for re-engaging people who already know the brand — but the top-of-funnel prospecting dollar works far harder in high-intent search and inventory-aware placements for this audience, and today they get almost none of it.',
      evidence: [
        'Cost per qualified dealer visit: ~$5.20 via high-intent search vs ~$15.40 for cold Meta prospecting.',
        'Shoppers arrive at search already configuring — intent, not interruption.',
        'High-intent search + inventory-aware placements hold a thin share of prospecting budget today despite the efficiency.',
        'Keep Meta for retargeting known visitors — this moves the cold prospecting dollar only.',
        'STRATIS compares cost per qualified visit across platforms, not each platform’s own metric.',
      ],
      confidence: 0.84,
      impactEstimate: 'Moving a slice of cold Meta prospecting to high-intent search is projected to cut the blended cost of a qualified dealer visit ~22% and free spend for retargeting where Meta is strongest.',
      recommendedAction: 'Shift cold prospecting budget from Meta into high-intent search and inventory-aware placements, and keep Meta focused on retargeting known visitors. STRATIS holds the cross-platform efficiency comparison live.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Move cold prospecting budget from Meta to search', subtitle: 'BUY INTENT, NOT INTERRUPTION', type: 'budget', completed: false },
        { id: 's2', title: 'Keep Meta on retargeting known visitors', subtitle: 'WHERE META STILL WINS', type: 'targeting', completed: false },
        { id: 's3', title: 'Compare cost per qualified visit across platforms', subtitle: 'NOT EACH PLATFORM’S OWN METRIC', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-auto-15-supply-path',
      createdAt: at(0, '07:42:00'),
      enterprise: 'ford-canada', category: 'tactical-efficiency',
      scope: 'division', division: 'tier-1', productLine: 'explorer',
      channels: ['ttd'],
      title: 'Pull Mid-Funnel Display Out of the Open Exchange and Into Curated Auto Deals on The Trade Desk — Same Audience, ~28% Less Waste, and Ads Stop Landing Next to the Wrong Content',
      summary: 'A large share of programmatic display is still running through the open exchange, where about 28% of every dollar disappears into low-quality, never-seen, or off-target inventory — and ads sometimes land next to content the brand can’t be near. Moving that money into curated private deals on The Trade Desk — auto-endemic and review/shopping inventory bought directly — reaches the same shoppers with far less waste and clean, on-topic adjacency. Same audience, more of the dollar actually working.',
      evidence: [
        'About 28% of open-exchange spend is lost to unviewable, low-quality, or off-target inventory.',
        'Curated private deals on The Trade Desk reach the same shopper audience with verified placement.',
        'Open-exchange viewability runs well below the curated-deal benchmark.',
        'Private deals also remove the brand-safety risk of unknown adjacency.',
        'STRATIS reads delivered quality, not just the buying platform’s reported impressions.',
      ],
      confidence: 0.87,
      impactEstimate: 'Moving mid-funnel display from the open exchange into curated Trade Desk deals recovers ~28% of that spend into working impressions — roughly $1.3M a year at the same audience and reach.',
      recommendedAction: 'Shift mid-funnel display out of the open exchange into curated auto private deals on The Trade Desk. STRATIS keeps scoring delivered quality and flags waste as it reappears.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Move display from open exchange to curated deals', subtitle: 'SAME AUDIENCE, LESS WASTE', type: 'budget', completed: false },
        { id: 's2', title: 'Hold delivery to verified, on-topic inventory', subtitle: 'BRAND-SAFE ADJACENCY', type: 'targeting', completed: false },
        { id: 's3', title: 'Score delivered quality, not reported impressions', subtitle: 'STRATIS WATCHES THE SUPPLY PATH', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-auto-16-reach-cap',
      createdAt: at(0, '07:45:00'),
      enterprise: 'ford-canada', category: 'tactical-efficiency',
      scope: 'division', division: 'tier-1', productLine: 'f150',
      channels: ['ooh', 'ttd'],
      title: 'Out-of-Home in the Core Metros Has Reached Almost Everyone It Can in This Audience — the Next Reach Dollar Belongs on The Trade Desk, Where There Are Still New People to Find',
      summary: 'Out-of-home has done its job and hit its ceiling in the core metros: it has now delivered to nearly everyone reachable in the in-market truck audience, so each additional OOH dollar just adds repeat exposure to the same people instead of finding new ones. The Trade Desk still has real net-new reach into that same audience at a similar cost. This is different from cutting a channel for being inefficient — OOH is efficient, it’s simply out of new people. Cap it at its reach ceiling and put the next reach dollar where new people still exist to convert.',
      evidence: [
        'OOH unique reach in this audience has flattened — added spend now adds frequency, not new people.',
        'The Trade Desk still reaches net-new people in the same audience at a similar cost.',
        'OOH stays funded up to its ceiling — this caps the overflow, it doesn’t cut the channel.',
        'Extra OOH frequency past the ceiling is the same diminishing-returns trap as any saturated channel.',
        'STRATIS separates “out of new people” from “inefficient” — they call for different moves.',
      ],
      confidence: 0.85,
      impactEstimate: 'Capping OOH at its reach ceiling and moving the overflow to The Trade Desk converts wasted repeat exposure into net-new reach — lifting unique audience reached ~9% at the same spend.',
      recommendedAction: 'Cap OOH at the point its unique reach flattens and move the overflow to The Trade Desk for net-new reach. STRATIS watches each channel’s reach ceiling and redirects the overflow.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Cap OOH where its unique reach flattens', subtitle: 'EFFICIENT, BUT OUT OF NEW PEOPLE', type: 'budget', completed: false },
        { id: 's2', title: 'Move the overflow to The Trade Desk for net-new reach', subtitle: 'FIND PEOPLE, NOT FREQUENCY', type: 'budget', completed: false },
        { id: 's3', title: 'Watch each channel’s reach ceiling', subtitle: 'REDIRECT THE OVERFLOW', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-auto-17-auction-pressure',
      createdAt: at(0, '07:48:00'),
      enterprise: 'ford-canada', category: 'tactical-efficiency',
      scope: 'division', division: 'tier-1', productLine: 'f150',
      channels: ['facebook', 'instagram', 'tiktok', 'spotify'],
      title: 'A Domestic Rival’s Spring Push Crowded the Meta Auction — Our Cost to Reach the Truck Audience There Jumped ~30%; TikTok and Audio Are Uncontested and Cheaper Right Now',
      summary: 'Nothing changed on our side, but reaching the truck audience on Meta suddenly costs about 30% more — a domestic rival’s spring campaign flooded the same audience and bid the auction up. TikTok and audio, where that rival isn’t active, are reaching the same kinds of people at last quarter’s prices. The smart move is temporary and reversible: shift a portion of Meta reach to the uncontested channels while the auction is hot, and shift it back when the rival’s flight ends. Paying the inflated Meta price for reach we can get cheaper elsewhere is the avoidable cost.',
      evidence: [
        'Meta cost to reach the truck audience is up ~30% with no change in our targeting or creative.',
        'The increase lines up exactly with a domestic rival’s spring flight on the same audience.',
        'TikTok and audio, where the rival isn’t bidding, are still at last quarter’s cost.',
        'The shift is temporary and reversible — move it back when the rival’s flight ends.',
        'STRATIS ties the cost spike to the rival’s entry, so the cause is clear, not guessed.',
      ],
      confidence: 0.83,
      impactEstimate: 'Temporarily moving the inflated share of Meta reach to TikTok and audio avoids the ~30% auction premium — protecting reach efficiency until the rival’s flight ends, then reversing.',
      recommendedAction: 'Shift a portion of Meta reach to TikTok and audio while the rival has the Meta auction crowded, and move it back when their flight ends. STRATIS alerts when the auction normalizes.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Move the inflated Meta reach to TikTok + audio', subtitle: 'DON’T PAY THE AUCTION PREMIUM', type: 'budget', completed: false },
        { id: 's2', title: 'Keep the shift temporary and reversible', subtitle: 'MOVE BACK WHEN THEY STOP', type: 'budget', completed: false },
        { id: 's3', title: 'Alert when the Meta auction normalizes', subtitle: 'STRATIS WATCHES THE COMPETITOR', type: 'scheduling', completed: false },
      ],
    },

    // ═════════════════════════════════════════════════════════════════
    // CROSS-REGION INTELLIGENCE — a play proven in one province ported to
    // another before it has to be rediscovered there
    // ═════════════════════════════════════════════════════════════════

    {
      id: 'ins-auto-xr1-creative-transfer',
      createdAt: at(0, '07:51:00'),
      enterprise: 'ford-canada', category: 'cross-region',
      scope: 'brand', productLine: 'mach-e',
      channels: ['ctv', 'google-search', 'facebook', 'ooh'],
      linkedNewsId: 'news-izev-extension',
      title: 'The “What You’ll Actually Pay” Rebate Creative Is Converting 1.5× the National Brand Hero — in Quebec — and the Other Provinces Now Have the Same iZEV Tailwind Sitting Untapped',
      summary: 'The same affordability idea wins in two places, but it’s only deployed in one. In Quebec, the cost-clarity execution — “here’s exactly what you’ll pay after the rebate” — is converting at about 1.5× the national brand hero on the identical metric, where rebate clarity is the last hurdle before a configured lead. The rest of the country now has the same story to tell: the iZEV rebate was just extended, so the message is true everywhere, yet national delivery still leads with the legacy brand hero and the affordability message holds a thin share of views. This is the cleanest cross-region transfer STRATIS sees — a creative proven on the same conversion metric in one province, with a tailwind that just made it true in the others. Port the asset, don’t re-test it from zero.',
      evidence: [
        'Quebec: the affordability/rebate creative converts ~1.5× the national brand hero on the same metric.',
        'The edge holds across Quebec DMAs — not a single-market fluke.',
        'iZEV was just extended — the rebate story is now accurate in every province, not only Quebec.',
        'National delivery still defaults to the legacy brand hero; the rebate message holds a thin share of views.',
        'STRATIS correlates creative performance on a common metric across provinces — no single market’s report sees the other.',
      ],
      confidence: 0.88,
      impactEstimate: 'Porting the proven Quebec rebate creative nationally — where the extended iZEV makes the message accurate — is projected to lift national EV-nameplate lead rate ~14% at no incremental production cost, capturing a win already validated in-market.',
      recommendedAction: 'Adapt and ship the Quebec rebate creative into the national mix under the extended-iZEV messaging, give it real share of views against the legacy hero, and let STRATIS keep matching creative performance across provinces to surface the next portable asset.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Port the Quebec rebate creative nationally', subtitle: 'PROVEN IN QC, NOW TRUE EVERYWHERE POST-iZEV', type: 'creative', completed: false },
        { id: 's2', title: 'Give it real share of views vs the legacy hero', subtitle: 'DON’T LET DELIVERY DEFAULT BACK', type: 'creative', completed: false },
        { id: 's3', title: 'Match creative performance across provinces continuously', subtitle: 'STRATIS SURFACES THE NEXT PORTABLE WIN', type: 'creative', completed: false },
      ],
    },
    {
      id: 'ins-auto-xr2-leading-indicator',
      createdAt: at(0, '07:54:00'),
      enterprise: 'ford-canada', category: 'cross-region',
      scope: 'brand', productLine: 'f150',
      channels: ['ctv', 'google-search', 'spotify'],
      title: 'Ontario’s CTV Curve Is Tracing the Exact Alberta Marginal-Lead Decay From Six Weeks Ago — Cap Ontario Connected TV Now, Before the Same ~$1.8M of Waste Lands',
      summary: 'One province is now a six-week early warning for another. The Alberta CTV response curve flattened earlier this quarter — marginal leads decayed into the floor as the audience hit saturation. STRATIS has now detected the identical decay shape forming in Ontario, running about six weeks behind Alberta, week-for-week. This isn’t a vague “watch Ontario” note: it’s the same marginal-lead curve, same inflection, same audience-saturation fingerprint, on a lag. Because Alberta already showed where this ends, Ontario doesn’t have to spend its way to the same dead weight — cap Ontario CTV at the inflection the Alberta curve already mapped, before the waste arrives rather than after.',
      evidence: [
        'Alberta CTV marginal leads decayed to the floor ~6 weeks ago as the audience saturated.',
        'Ontario CTV is now tracing the identical decay shape, lagging Alberta by ~6 weeks week-for-week.',
        'The curves overlay almost exactly once shifted by six weeks — same inflection, same fingerprint.',
        'Ontario budget hasn’t reacted — it’s funded toward the same flat tail Alberta already proved is dead weight.',
        'STRATIS aligns marginal-lead curves across provinces on a lag, turning one market into a leading indicator for the next.',
      ],
      confidence: 0.86,
      impactEstimate: 'Capping Ontario CTV at the inflection the Alberta curve already mapped avoids an estimated ~$1.8M of saturated Ontario spend before it lands — pre-empting the waste rather than booking it and reallocating after the fact.',
      recommendedAction: 'Treat the Alberta CTV decay as Ontario’s forward map: cap Ontario CTV at the Alberta-proven inflection now and redeploy the freed budget into Ontario search and audio, which still convert at the margin. STRATIS keeps the lagged cross-province curve live and alerts as Ontario approaches the line.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Cap Ontario CTV at the Alberta-proven inflection point', subtitle: 'SIX WEEKS AHEAD OF THE WASTE', type: 'budget', completed: false },
        { id: 's2', title: 'Redeploy freed Ontario budget to search + audio', subtitle: 'STILL ON THE STEEP CURVE THERE', type: 'budget', completed: false },
        { id: 's3', title: 'Hold the lagged cross-province curve live', subtitle: 'ALBERTA PREDICTS ONTARIO BY ~6 WEEKS', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-auto-xr3-demand-correlation',
      createdAt: at(0, '07:57:00'),
      enterprise: 'ford-canada', category: 'cross-region',
      scope: 'product', productLine: 'escape-phev',
      channels: ['google-search', 'ctv', 'ooh'],
      title: 'The Gas-Price → Plug-In-Hybrid Search Surge That Led BC Leads by Eight Weeks Is Now Climbing the Same Curve in the Prairies — Fund Efficiency Messaging There Ahead of the Proven Demand',
      summary: 'A demand signal that already paid out in one region is now repeating in another, early enough to get ahead of. In BC, a sustained rise in gas prices drove a climb in plug-in-hybrid and fuel-economy search that reliably led the lead lift by about eight weeks; the search curve was the tell, and the budget that funded efficiency messaging into it captured the demand. STRATIS now sees that same share-of-search curve climbing in the Prairies, currently at the point BC sat roughly eight weeks before its lead inflection. The correlation is the same shape on the same trigger; the only difference is timing. Fund Plug-In Hybrid SUV efficiency messaging and fuel-cost search coverage in the Prairies now, ahead of the proven curve — not after the lead lift shows up in a report.',
      evidence: [
        'BC: gas-driven plug-in-hybrid search led the lead lift by ~8 weeks — search was the leading indicator.',
        'Prairies: the same share-of-search curve is now climbing, at the point BC sat ~8 weeks pre-inflection.',
        'The two curves overlay on the same fuel-cost terms once aligned by the lag — same shape, different clock.',
        'Prairies efficiency messaging and fuel-cost search coverage are currently underfunded relative to the rising demand.',
        'STRATIS correlates share-of-search to downstream leads across provinces, surfacing demand before the lead data confirms it.',
      ],
      confidence: 0.84,
      impactEstimate: 'Funding Prairies efficiency messaging ahead of the BC-proven ~8-week search-to-lead curve is projected to capture the demand at materially lower cost-per-lead than entering after the lift appears — getting in front of the curve BC already validated.',
      recommendedAction: 'Stand up Plug-In Hybrid SUV efficiency messaging and fuel-cost search coverage in the Prairies now, sized to the rising search curve, using the BC search-to-lead lag as the forecast. STRATIS keeps correlating share-of-search to leads across provinces and flags the inflection as the Prairies approach it.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Fund Prairies efficiency messaging ahead of the curve', subtitle: 'BC SEARCH LED LEADS BY ~8 WEEKS', type: 'budget', completed: false },
        { id: 's2', title: 'Take fuel-cost search coverage before demand peaks', subtitle: 'BUY THE LANE BEFORE IT GETS CONTESTED', type: 'targeting', completed: false },
        { id: 's3', title: 'Correlate share-of-search to leads across provinces', subtitle: 'STRATIS FLAGS THE PRAIRIES INFLECTION', type: 'scheduling', completed: false },
      ],
    },

    // ═════════════════════════════════════════════════════════════════
    // ACME LUXURY — CMO-level insights for the ACME Luxury division
    // ═════════════════════════════════════════════════════════════════

    {
      id: 'ins-lincoln-001-nautilus-rx-pivot',
      enterprise: 'lincoln',
      createdAt: today,
      category: 'portfolio-dynamics',
      scope: 'product',
      productLine: 'lincoln-nautilus',
      channels: ['ctv', 'ttd', 'google-search'],
      title: 'Conquest spend against the Import Luxury midsize SUV no longer converting — pivot Luxury Midsize SUV dollars to European Luxury prestige and progressive segments',
      summary: 'The Import Luxury midsize SUV\'s loyalty hit a record 91% in Canada (J.D. Power Q1 study, May 4). Luxury Midsize SUV conquest flow from it has dropped 4.1pp YoY. Continuing to spend against an audience that won\'t switch is value-destructive. STRATIS recommends reallocating Luxury Midsize SUV conquest spend to the European Luxury prestige and progressive midsize SUVs where loyalty is softer (78% and 74% respectively).',
      evidence: [
        'Import Luxury midsize SUV loyalty Q1 2026: 91% (record high, J.D. Power)',
        'Luxury Midsize SUV conquest flow from it: −4.1pp YoY',
        'European Luxury prestige SUV loyalty: 78% / progressive SUV loyalty: 74%',
        'Current Luxury Midsize SUV conquest spend: $720K against the import luxury SUV, $310K against the prestige/progressive pair combined',
        'Conquest CPL — import luxury: $612 / prestige: $384 / progressive: $358',
      ],
      confidence: 0.86,
      impactEstimate: 'Reallocating $580K from import-luxury-conquest to prestige+progressive-conquest projects +260 incremental Luxury Midsize SUV dealer leads at $372 blended CPL — 22% efficiency gain on conquest spend.',
      recommendedAction: 'Sunset import-luxury-conquest creative immediately. Hudson Rouge produces new prestige and progressive comparative cuts within 3 weeks. Maintain Import Luxury midsize SUV presence at $140K residual for any high-intent late-funnel signals.',
      status: 'new',
      linkedNewsId: 'news-lexus-rx-loyalty',
      actionSteps: [
        { id: 's1', title: 'Sunset Luxury Midsize SUV vs import-luxury conquest', subtitle: 'PAUSE ACTIVE CREATIVE', type: 'creative', completed: false },
        { id: 's2', title: 'Brief Hudson Rouge on prestige + progressive cuts', subtitle: '3-WEEK PRODUCTION TIMELINE', type: 'creative', completed: false },
        { id: 's3', title: 'Reallocate $580K to prestige/progressive audiences', subtitle: 'TTD + GOOGLE SEARCH', type: 'budget', completed: false },
      ],
    },
    {
      id: 'ins-lincoln-002-aviator-x5-pricing',
      enterprise: 'lincoln',
      createdAt: at(0, '09:20:00'),
      category: 'macro-convergence',
      scope: 'product',
      productLine: 'lincoln-aviator',
      channels: ['ctv', 'google-search', 'ooh', 'spotify'],
      title: 'European Luxury sport-luxury SUV 2027 redesign opens at CAD $74,900 — $4,200 below Luxury Three-Row SUV Reserve, compressing ACME Luxury\'s premium positioning',
      summary: 'A European Luxury marque announced its 2027 sport-luxury SUV at $74,900 base — below the current Luxury Three-Row SUV Reserve ($79,100). 38% of the Luxury Three-Row SUV consideration funnel cross-shops with it. The pricing move re-frames the Luxury Three-Row SUV as the "premium" choice in price-conscious luxury — the opposite of how ACME Luxury has positioned the nameplate. STRATIS recommends accelerated value-narrative repositioning before the rival launch ramps in September.',
      evidence: [
        'European Luxury sport-luxury SUV 2027 base price: CAD $74,900 (announced May 7)',
        'Luxury Three-Row SUV Reserve base price: CAD $79,100 (current)',
        'Luxury Three-Row SUV ↔ sport-luxury SUV consideration overlap: 38%',
        'Rival launch ramp: September 2026 (~120 days)',
        'Current Luxury Three-Row SUV creative emphasizes performance + quietness — does not address pricing perception',
      ],
      confidence: 0.83,
      impactEstimate: 'Value-narrative repositioning (lead with "every feature standard that\'s a $5K option on the rival") projects +320 Luxury Three-Row SUV leads in conquest segments over the rival launch window.',
      recommendedAction: 'Brief Hudson Rouge on revised Luxury Three-Row SUV value narrative: standard-equipment story vs. the rival\'s a-la-carte trim ladder. Activate within 5 weeks (before the rival launch ramp). CTV + Search + OOH coordinated.',
      status: 'new',
      linkedNewsId: 'news-lincoln-bmw-x5-redesign',
      actionSteps: [
        { id: 's1', title: 'Brief Hudson Rouge on value-narrative shift', subtitle: 'STANDARD-EQUIPMENT POSITIONING', type: 'creative', completed: false },
        { id: 's2', title: 'Activate value creative across CTV + Search + OOH', subtitle: 'BEFORE SEPT SPORT-LUXURY SUV LAUNCH', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-lincoln-003-corsair-quebec-french',
      enterprise: 'lincoln',
      createdAt: at(2, '14:10:00'),
      category: 'agency-arbitrage',
      scope: 'product',
      productLine: 'lincoln-corsair',
      channels: ['instagram', 'facebook', 'spotify'],
      title: 'Cossette Luxury\'s Quebec French-language Luxury Compact SUV creative outperforms Hudson Rouge\'s adapted version by 2.3x ThruPlay',
      summary: 'The Luxury Compact SUV runs two French-Quebec creative tracks: Cossette Luxury\'s original-French cut and Hudson Rouge\'s translated-from-English cut. Cossette\'s version delivers 2.3x the ThruPlay completion rate and 1.8x the qualified site sessions, but only receives 22% of Quebec Luxury Compact SUV impression weight because budgets default to AOR ownership.',
      evidence: [
        'Cossette Luxury Quebec Luxury Compact SUV — ThruPlay rate: 41.8%',
        'Hudson Rouge translated cut — ThruPlay rate: 17.9%',
        'Cossette qualified-session lift: 1.8x',
        'Current Quebec impression weight: 22% Cossette / 78% Hudson Rouge',
        'Quebec is the Luxury Compact SUV\'s second-strongest market (after Ontario)',
      ],
      confidence: 0.81,
      impactEstimate: 'Reweighting Quebec Luxury Compact SUV to 75% Cossette / 25% Hudson Rouge captures +14K additional ThruPlays and +280 qualified sessions at flat $1.8M Quebec spend.',
      recommendedAction: 'Reweight Quebec Luxury Compact SUV impression share to performance-based (75/25 Cossette/Hudson Rouge). Codify that Cossette Luxury owns Quebec French-creative production for ACME Luxury, with Hudson Rouge retaining English-Canada national lead.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Reweight Quebec Luxury Compact SUV to 75/25 Cossette/Hudson Rouge', subtitle: 'INSTAGRAM + FACEBOOK + SPOTIFY', type: 'creative', completed: false },
        { id: 's2', title: 'Codify Cossette as ACME Luxury QC French AOR', subtitle: 'POLICY CHANGE Q3', type: 'creative', completed: false },
      ],
    },
    {
      id: 'ins-lincoln-004-luxury-tax-window',
      enterprise: 'lincoln',
      createdAt: at(1, '11:00:00'),
      category: 'macro-convergence',
      scope: 'brand',
      channels: ['google-search', 'instagram', 'spotify', 'ctv'],
      title: 'Federal luxury tax threshold rises CAD $108K on July 1 — Luxury Three-Row SUV Black Label and Luxury Full-Size SUV Reserve trims gain a $4K–$8K friction removal',
      summary: 'Federal luxury vehicle tax threshold rises from $100K to $108K effective July 1, 2026 (announced May 1). Several top-trim Luxury Three-Row SUV Black Label and Luxury Full-Size SUV Reserve configurations that previously cleared the threshold by $2K–$8K will no longer be taxable. STRATIS recommends a focused 90-day creative push leading with "no luxury tax" positioning for affected trims.',
      evidence: [
        'Luxury tax threshold change: $100K → $108K effective July 1, 2026',
        'Luxury Three-Row SUV Black Label most-popular configurations: $102K–$106K (now untaxed)',
        'Luxury Full-Size SUV Reserve configurations: $104K–$112K (mixed effect)',
        'Average tax saved on Luxury Three-Row SUV Black Label: $4.2K–$6.8K',
        'Window before tax framing becomes normalized: 60-90 days',
      ],
      confidence: 0.84,
      impactEstimate: 'Activating a 90-day "no luxury tax" creative push projects +280 incremental Q3 Luxury Three-Row SUV Black Label dealer leads, with avg consideration-to-lead conversion lifting from 8.1% to 11.4% on affected trims.',
      recommendedAction: 'Brief Hudson Rouge on a 90-day creative push leading with the tax-removal framing. Activate July 1 across Search, Instagram, Spotify, CTV. Coordinate dealer co-op with VIN-level eligibility messaging.',
      status: 'new',
      linkedNewsId: 'news-luxury-tariff-relief',
      actionSteps: [
        { id: 's1', title: 'Brief Hudson Rouge on tax-removal creative', subtitle: 'LUXURY THREE-ROW SUV BLACK LABEL + LUXURY FULL-SIZE SUV RESERVE', type: 'creative', completed: false },
        { id: 's2', title: 'Activate July 1 across CTV + Search + Spotify', subtitle: '90-DAY FLIGHT', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-lincoln-005-navigator-conquest-bmw',
      enterprise: 'lincoln',
      createdAt: at(3, '15:30:00'),
      category: 'portfolio-dynamics',
      scope: 'product',
      productLine: 'lincoln-navigator',
      channels: ['ctv', 'ooh', 'linkedin'],
      title: 'Luxury Full-Size SUV and Luxury Three-Row SUV are both targeting the Conquest — Sport Luxury audience — Luxury Full-Size SUV should own this segment outright',
      summary: 'Both the Luxury Full-Size SUV and the Luxury Three-Row SUV are simultaneously active against the Conquest — Sport Luxury audience in Tier 1 CTV. Audience overlap is 84% — these are the same buyers. The Luxury Full-Size SUV\'s aggregate frequency on this audience is 12x/week, the Luxury Three-Row SUV\'s is 9x/week — combined 21x, well above the 8x luxury cap. Brand-recall testing shows aggregated frequency dilutes both nameplates\' positioning.',
      evidence: [
        'Conquest — Sport Luxury audience size: 47K Canadian profiles',
        'Luxury Full-Size SUV frequency: 12x/wk · Luxury Three-Row SUV frequency: 9x/wk · combined: 21x/wk',
        'Luxury-segment optimal cap: 8x/wk (Hudson Rouge benchmark)',
        'Brand recall in dual-targeted cohort: −18% vs single-nameplate cohort',
        'ACME Luxury nameplate substitution math: Luxury Full-Size SUV wins on Conquest — Sport Luxury (higher consideration), Luxury Three-Row SUV wins on Conquest — Progressive Luxury',
      ],
      confidence: 0.85,
      impactEstimate: 'Designating the Luxury Full-Size SUV as exclusive nameplate for Conquest — Sport Luxury (Luxury Three-Row SUV suppresses) cuts frequency to 12x and projects +14pp brand recall, plus $410K in recovered impression spend.',
      recommendedAction: 'Implement nameplate-exclusive audience policy at ACME Luxury: Luxury Full-Size SUV → Conquest Sport Luxury; Luxury Three-Row SUV → Conquest Progressive Luxury; Luxury Midsize SUV → Conquest Prestige/Import Luxury; Luxury Compact SUV → Conquest Progressive/Import entry-luxury. Configure via TTD audience-suppression API.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Implement ACME Luxury nameplate-exclusive audience policy', subtitle: 'PORTFOLIO POLICY CHANGE', type: 'targeting', completed: false },
        { id: 's2', title: 'Configure TTD audience suppression', subtitle: 'LUXURY FULL-SIZE / THREE-ROW / MIDSIZE / COMPACT SUV', type: 'targeting', completed: false },
      ],
    },
    {
      id: 'ins-lincoln-006-aviator-launch-q3-prep',
      enterprise: 'lincoln',
      createdAt: at(4, '10:45:00'),
      category: 'launch-calendar',
      scope: 'product',
      productLine: 'lincoln-aviator',
      channels: ['ctv', 'ooh', 'spotify', 'google-search'],
      title: 'Luxury Three-Row SUV 2027 refresh launches in 84 days — current Tier 1 weight is 0.7x of competitive set average',
      summary: 'The Luxury Three-Row SUV 2027 refresh launches August 1. STRATIS rolled up the confirmed European Luxury sport-luxury SUV launch ($14.2M Tier 1 weight), a European Luxury progressive three-row SUV refresh ($9.8M), and an Import Luxury midsize SUV hybrid push ($11.6M) for the same window. The Luxury Three-Row SUV\'s current planned weight is $7.8M — 0.7x the average competitive launch weight. Without a surge, the launch will be SOV-disadvantaged in CTV.',
      evidence: [
        'Luxury Three-Row SUV 2027 launch: August 1, 2026 (84 days out)',
        'Sport-luxury SUV launch weight: $14.2M / progressive three-row SUV refresh: $9.8M / import luxury hybrid: $11.6M',
        'Luxury Three-Row SUV current planned weight: $7.8M Tier 1 (under-weighted)',
        'Luxury CTV CPM in launch windows: $76 (1.8x normal)',
        'Available surge sources: Luxury Compact SUV always-on ($1.4M slack), Luxury Midsize SUV mid-funnel ($800K slack)',
      ],
      confidence: 0.82,
      impactEstimate: 'A $2.6M Luxury Three-Row SUV surge (pulled from Luxury Compact SUV always-on + Luxury Midsize SUV mid-funnel slack) brings the launch to 1:1 SOV vs competitive avg and lifts launch probability +19pp.',
      recommendedAction: 'Reallocate $2.6M from Luxury Compact SUV always-on + Luxury Midsize SUV mid-funnel into the Luxury Three-Row SUV launch CTV + OOH for the 60-day launch window. Hudson Rouge executes. Brief the Luxury Compact SUV team that always-on resumes in October.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Reallocate $2.6M to Luxury Three-Row SUV launch', subtitle: 'FROM LUXURY COMPACT + MIDSIZE SUV SLACK', type: 'budget', completed: false },
        { id: 's2', title: 'Brief Hudson Rouge on launch SOV plan', subtitle: '1:1 vs COMPETITIVE AVG', type: 'scheduling', completed: false },
      ],
    },

    // ═════════════════════════════════════════════════════════════════
    // DEALERSHIP NETWORK — Corporate-admin "wow" insights derived from
    // cross-dealer pattern recognition across all 890 dealers. The CMO of
    // the network reads these to make holistic strategic decisions.
    // ═════════════════════════════════════════════════════════════════

    {
      id: 'ins-dn-01-saturation',
      enterprise: 'dealership-network',
      createdAt: today,
      category: 'tactical-efficiency',
      scope: 'brand',
      division: 'tier-3',
      channels: ['ctv', 'google-search', 'ooh'],
      title: 'Local Connected TV Across the Network Has Hit Saturation — the Top ~17% of Co-Op CTV Spend Is Driving Almost No Showroom Visits, While the Same Dollars Still Convert in Local Search and OOH',
      summary: 'Pooled across all 890 dealers, local Connected TV is past the point where more money buys more showroom visits. The network’s CTV response curve has gone flat: the last ~17% of co-op CTV spend is producing almost no additional visits, because the in-market shoppers who respond to local TV have already been reached often enough. Local Search and local OOH are still on the steep part of their curves — every added dollar there still converts. A sharp regional buyer reads the saturation point off the curve once a quarter; STRATIS watches all 890 dealers’ curves continuously and calls it the week network CTV flattens. Move the over-saturated tail to the local channels that still have room.',
      evidence: [
        'Network CTV: each extra $100K is now driving ~5 showroom visits, down from ~24 earlier in the co-op flight.',
        'About 17% of pooled co-op CTV spend sits past the point where the response curve goes flat.',
        'Local Search and local OOH are still climbing — ~20 and ~13 visits per extra $100K.',
        'CTV frequency on the local in-market audience has pushed well past the level where TV stops persuading.',
        'No single dealer sees this — only pooling the network’s curves reveals the flat tail; STRATIS flags it as it happens.',
      ],
      confidence: 0.90,
      impactEstimate: 'Moving the saturated ~17% of network CTV (~$3.1M of co-op) into local Search and OOH drives roughly the same number of showroom visits for less, or more visits for the same spend — recovered now, not at the next co-op planning cycle.',
      recommendedAction: 'Cap network co-op CTV at the point its response curve flattens and redeploy the freed weight to local Search and OOH, which still convert at the margin. STRATIS holds each channel against its own saturation point and rebalances as the curves move.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Cap co-op CTV where its response curve flattens', subtitle: 'THE LAST ~17% BUYS ALMOST NOTHING', type: 'budget', completed: false },
        { id: 's2', title: 'Redeploy the freed ~$3.1M to local Search + OOH', subtitle: 'CHANNELS STILL ON THE STEEP CURVE', type: 'budget', completed: false },
        { id: 's3', title: 'Watch every dealer’s saturation point continuously', subtitle: 'REBALANCE AS THE CURVES MOVE', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-02-mix-reallocation',
      enterprise: 'dealership-network',
      createdAt: at(0, '07:03:00'),
      category: 'tactical-efficiency',
      scope: 'brand',
      division: 'tier-3',
      channels: ['ctv', 'ttd', 'google-search', 'facebook', 'ooh'],
      title: 'Three Co-Op Channels Are Past Their Efficient Point and Three Have Room to Grow — Rebalancing the Network Mix to Where Each Dollar Works Hardest Frees ~$5.6M at the Same Lead Volume',
      summary: 'The pooled co-op budget isn’t split to get the most dealer leads per dollar. Lined up side by side across the network, three channels are funded past the point where they pay back, while three are underfunded and still hungry — the next dollar would do far more good in the second group than it’s doing in the first. Rebalancing toward that efficiency frontier holds total leads flat while freeing spend, or grows leads at the same budget. This is the mix optimization a regional manager does by hand once a quarter for one dealer; STRATIS holds the frontier live across all 890 and shows exactly how much to move and where.',
      evidence: [
        'Local programmatic display and Facebook are funded ~30% past the point where each co-op dollar pays back.',
        'Local Search, CTV (pre-saturation), and OOH are underfunded with room to grow.',
        'Equalizing the marginal return across channels frees ~$5.6M at today’s network lead volume.',
        'No single dealer sees this — each reports its own mix, not the pooled cross-channel frontier.',
        'The recommended mix is shown as concrete dollar moves per region, not a directional “shift toward video.”',
      ],
      confidence: 0.88,
      impactEstimate: 'Rebalancing the co-op mix to the efficiency frontier frees ~$5.6M at flat lead volume, or drives ~10% more dealer leads at the same total budget.',
      recommendedAction: 'Move co-op budget from the three over-funded channels into the three with headroom until the next dollar is equally productive everywhere. STRATIS recomputes the frontier as performance shifts and pushes per-region moves to the portal.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Pull spend from the three past-efficient channels', subtitle: 'WHERE THE CO-OP DOLLAR NO LONGER PAYS BACK', type: 'budget', completed: false },
        { id: 's2', title: 'Fund the three channels with headroom', subtitle: 'WHERE THE NEXT DOLLAR WORKS HARDEST', type: 'budget', completed: false },
        { id: 's3', title: 'Hold the network mix on the efficiency frontier', subtitle: 'STRATIS RECOMPUTES AS IT MOVES', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-03-audience-efficiency',
      enterprise: 'dealership-network',
      createdAt: at(0, '07:06:00'),
      category: 'audience-overlap',
      scope: 'brand',
      division: 'tier-3',
      channels: ['google-search', 'ttd', 'facebook', 'instagram'],
      title: 'Finance & Deal Seekers Within a Dealer’s Trade Area Convert to a Test Drive at 2.3× the Rate of the Broad Local-Radius Audience — but They Get Only a Third of the Targeting Budget',
      summary: 'Not every local audience is worth the same. Across the network, the active Finance & Deal Seeker segment — shoppers already pricing payments and trade-ins — converts to a test drive at more than twice the rate of the broad “everyone in a 40km radius” audience that most dealers buy by default. But co-op targeting is weighted to that broad radius because it’s bigger and cheaper to reach, so most of the money chases the least efficient shoppers. Shifting targeting toward the high-intent segment, and trimming the broad-radius waste, lifts results without spending more.',
      evidence: [
        'Finance & Deal Seekers: ~2.3× the test-drive conversions per dollar of the broad local-radius audience.',
        'That high-intent segment receives only ~33% of network targeting budget today.',
        'The broad radius audience absorbs most of the spend at the weakest conversion.',
        'The efficient segment is reachable through Search intent, payment-shopper signals, and CRM match.',
        'STRATIS ranks every local audience by test drives per dollar, not by reach or impressions.',
      ],
      confidence: 0.87,
      impactEstimate: 'Reweighting network targeting toward the high-intent segment is projected to lift test drives ~12% at the same spend, by moving dollars off the broad radius’ long inefficient tail.',
      recommendedAction: 'Shift co-op targeting budget into the Finance & Deal Seeker / high-intent segment and trim the broad-radius tail. STRATIS keeps ranking audiences by test drives per dollar and reallocates as efficiency shifts.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Raise the high-intent segment’s budget share', subtitle: 'FUND THE 2.3× AUDIENCE', type: 'targeting', completed: false },
        { id: 's2', title: 'Trim the broad local-radius tail', subtitle: 'STOP PAYING FOR THE WEAKEST CONVERTERS', type: 'targeting', completed: false },
        { id: 's3', title: 'Rank every local audience by test drives per dollar', subtitle: 'NOT BY REACH OR IMPRESSIONS', type: 'targeting', completed: false },
      ],
    },
    {
      id: 'ins-dn-04-acquisition-cost-rising',
      enterprise: 'dealership-network',
      createdAt: at(1, '08:09:00'),
      category: 'tactical-efficiency',
      scope: 'division',
      division: 'tier-3',
      productLine: 'dn-ontario-rollup',
      channels: ['google-search', 'ttd'],
      title: 'Cost per Lead Through Search in the Toronto DMA Now Runs ~$58 — Up From ~$47 Two Weeks Ago — Because Nearby ACME Dealers Are Bidding Each Other Up on the Same Brand Terms',
      summary: 'The cost per lead through Search in the Toronto trade area has jumped about 23% in two weeks. It isn’t that the ads got worse — conversion is flat. It’s a self-inflicted price war: several ACME dealers piled onto the same cluster of brand-term and “near me” keywords and bid the price up against each other. So the fix is surgical — a coordinated negative-keyword and trade-area map for that handful of contested terms — not a blunt cut to every dealer’s search budget. A dealer-by-dealer audit would catch this weeks from now; STRATIS flagged it the day the cost crossed the line, with the contested terms attached.',
      evidence: [
        'Cost per lead via Search in the Toronto DMA: ~$58, up from ~$47 two weeks ago.',
        'Conversion rate is flat — this is a rising-price problem, not a creative problem.',
        'The increase traces to a small cluster of brand-term + “near me” keywords multiple dealers contest.',
        'A coordinated negative-keyword + trade-area map restores the cost without touching the rest of the program.',
        'STRATIS reconstructs the cross-dealer auction; no single dealer’s account shows the collision.',
      ],
      confidence: 0.86,
      impactEstimate: 'Coordinating the contested terms across the DMA brings cost per lead back under ~$47 within days, recovering roughly $1.1M a year currently lost to the intra-network bidding war.',
      recommendedAction: 'Apply a STRATIS-managed negative-keyword + trade-area map to the contested terms rather than cutting dealer search budgets. STRATIS watches cost per lead continuously and alerts on the next crossing.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Pinpoint the contested terms driving the spike', subtitle: 'A HANDFUL OF KEYWORDS, NOT THE ACCOUNT', type: 'targeting', completed: false },
        { id: 's2', title: 'Apply the trade-area negative-keyword map', subtitle: 'SURGICAL, NOT A PROGRAM-WIDE CUT', type: 'bidding', completed: false },
        { id: 's3', title: 'Alert the moment cost per lead crosses the line', subtitle: 'DON’T WAIT FOR A DEALER AUDIT', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-05-price-of-reach',
      enterprise: 'dealership-network',
      createdAt: at(1, '08:12:00'),
      category: 'tactical-efficiency',
      scope: 'brand',
      division: 'tier-3',
      channels: ['ooh', 'ctv', 'google-search', 'facebook'],
      title: 'The Price of Local OOH Has Climbed Three Weeks Straight Across the Network While Showroom Visits Held Flat — We’re Paying More for the Same Result and the Co-Op Budget Hasn’t Reacted',
      summary: 'Local out-of-home is getting more expensive to buy — the price of reaching a thousand people is up about 22% over three weeks — but it isn’t driving any more showroom visits. The network is simply paying more for the same result, and the co-op budget hasn’t moved to reflect it. STRATIS watches cost against result by channel every week across all 890 dealers, so it caught the gap as it opened rather than at the end of a quarterly co-op report. The move is a straightforward, reversible shift away from a channel that quietly got pricier toward channels still beating their benchmark.',
      evidence: [
        'Local OOH price of reach: up ~22% over three weeks.',
        'OOH-attributed showroom visits over the same window: flat — more money, same result.',
        'OOH co-op weight: unchanged since the price climb began.',
        'Local Search and CTV are currently beating their benchmark — reversible targets.',
        'The shift fully reverses the moment OOH pricing normalizes; STRATIS reverses it automatically.',
      ],
      confidence: 0.84,
      impactEstimate: 'Trimming the now-overpriced OOH share back to its efficient run-rate and redeploying it stops the climb in cost per visit; fully reversible if OOH pricing comes back down.',
      recommendedAction: 'Trim the overpriced OOH share and redeploy to channels still beating their benchmark; STRATIS reverses the move automatically if OOH pricing normalizes.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Reduce OOH weight to its efficient run-rate', subtitle: 'REVERSIBLE', type: 'budget', completed: false },
        { id: 's2', title: 'Redeploy to channels beating their benchmark', subtitle: 'LOCAL SEARCH + CTV', type: 'budget', completed: false },
        { id: 's3', title: 'Alert when cost and visits drift apart', subtitle: 'STRATIS WATCHES WEEKLY', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-06-geo-efficiency',
      enterprise: 'dealership-network',
      createdAt: at(1, '08:15:00'),
      category: 'national-regional',
      scope: 'brand',
      channels: ['ctv', 'ttd', 'google-search'],
      title: 'A Quarter of Co-Op Spend Is Going to Regional Rollups Converting ~30% Below the Network Average — the Spend Map and the Demand Map Don’t Match',
      summary: 'Where the co-op money goes and where it works have drifted apart across the six regional rollups. About a quarter of pooled spend is landing in rollups that convert roughly 30% below the network average, while several high-converting rollups are underfunded. The co-op plan is weighted to dealer count and last year’s allocation, not to where media actually converts today. Re-weighting the regional plan toward the rollups that convert — and pulling back from the ones that don’t — lifts network results without adding budget.',
      evidence: [
        '~25% of co-op spend sits in rollups converting ~30% below the network average.',
        'Ontario and BC rollups are underfunded relative to the demand they show; Atlantic and Prairies are over-weighted.',
        'Spend tracks dealer count and last year’s plan, not current conversion.',
        'Re-weighting to conversion is a pure reallocation — no new budget required.',
        'STRATIS scores every rollup on what media actually returns, refreshed continuously.',
      ],
      confidence: 0.85,
      impactEstimate: 'Re-weighting the regional co-op plan toward converting rollups is projected to lift network leads ~11% at flat spend by moving money off the weakest rollups.',
      recommendedAction: 'Shift co-op weight out of the low-converting rollups into the high-converting ones the plan currently underfunds. STRATIS re-scores rollups continuously and flags drift.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Pull weight from rollups converting below average', subtitle: 'STOP FUNDING DEALER COUNT OVER DEMAND', type: 'budget', completed: false },
        { id: 's2', title: 'Fund the high-converting rollups that are starved', subtitle: 'MATCH SPEND TO WHERE IT WORKS', type: 'budget', completed: false },
        { id: 's3', title: 'Re-score every rollup continuously', subtitle: 'KEEP THE MAP AND THE PLAN ALIGNED', type: 'targeting', completed: false },
      ],
    },
    {
      id: 'ins-dn-07-access-friction',
      enterprise: 'dealership-network',
      createdAt: at(2, '07:18:00'),
      category: 'national-regional',
      scope: 'brand',
      division: 'tier-3',
      channels: ['google-search', 'ttd', 'ooh'],
      linkedNewsId: 'news-dn-quebec-french-creative-mandate',
      title: 'In Regions With the Heaviest Provincial Creative-Compliance Burden, the Same Ads Convert 31% Worse — We’re Still Spending Into the Friction Instead of Clearing It First',
      summary: 'Network performance is being dragged down by something that has nothing to do with the media. In rollups where provincial rules demand the most compliance steps before a local ad can run — French-first creative obligations and registration disclosures chief among them — the exact same campaigns convert about 31% worse, because dealers ship rushed, non-localized creative or go dark waiting on approvals. Today the co-op allocates on reach efficiency alone, pouring budget into regions where the creative stalls. Weighting spend to compliance-readiness, and clearing the template hurdle first, turns wasted impressions into showroom visits.',
      evidence: [
        'Heaviest-compliance rollups convert the same campaigns ~31% worse than low-friction rollups.',
        'Co-op spend tracks reach efficiency, not compliance-readiness — so money flows where creative stalls.',
        '~$2.9M a year is going to the highest-friction rollups at the weakest conversion.',
        'Low-friction rollups return ~1.5× the result at equal spend.',
        'STRATIS joins provincial-compliance status to media performance — a link no dealer report sees.',
      ],
      confidence: 0.85,
      impactEstimate: 'Weighting the co-op plan to compliance-readiness and clearing a coordinated creative template before reinvesting is projected to lift return on co-op media ~18% at flat spend.',
      recommendedAction: 'Add a compliance-readiness weight to the co-op model, pull spend from the highest-friction rollups, and ship a coordinated localized template before reinvesting. STRATIS keeps the compliance-to-media link live.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Add a compliance-readiness weight to the co-op model', subtitle: 'DON’T ALLOCATE ON REACH ALONE', type: 'bidding', completed: false },
        { id: 's2', title: 'Pull spend from the highest-friction rollups', subtitle: 'WHERE THE CREATIVE STALLS', type: 'budget', completed: false },
        { id: 's3', title: 'Ship the coordinated template before reinvesting', subtitle: 'CLEAR THE HURDLE FIRST', type: 'creative', completed: false },
      ],
    },
    {
      id: 'ins-dn-08-creative-winner',
      enterprise: 'dealership-network',
      createdAt: at(2, '07:21:00'),
      category: 'creative-performance',
      scope: 'brand',
      division: 'tier-3',
      channels: ['instagram', 'tiktok', 'facebook', 'ctv'],
      title: 'One Vertical-Video “Walkaround” Format Is Driving Test Drives at 1.6× the Rate of the Standard Inventory Ad — but It’s Only Getting 12% of the Network’s Views',
      summary: 'Ranked by how many test drives each format actually drove — not by last click — the dealer-shot vertical “walkaround” execution is the clear winner across the network, converting at about 1.6× the rate of the standard static inventory ad it runs beside. But it’s starved: it gets only ~12% of views because delivery defaults to the old static format. A handful of dealers stumbled onto it independently; the rest of the network has never been shown it works. This is a durable win you can capture for free — give the proven format more of the views, then template it so every dealer can make more like it.',
      evidence: [
        'The vertical “walkaround” format converts at ~1.6× the rate of the standard inventory ad beside it.',
        'It holds only ~12% of network views — delivery defaults to the static format.',
        'It’s strongest on Instagram, TikTok and CTV, where shoppers browse inventory casually.',
        'The edge repeats across independent dealers and regions — not a one-market fluke.',
        'Measured on test drives driven, not last click; STRATIS ranks every format this way.',
      ],
      confidence: 0.88,
      impactEstimate: 'Giving the proven format more of the views lifts the network conversion rate at no production cost — and a Cossette template tells every dealer exactly what to make more of.',
      recommendedAction: 'Shift views from the static inventory ad to the winning walkaround format, and brief Cossette to template it for the network. STRATIS keeps ranking creative by test drives driven.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Rank creative by test drives driven', subtitle: 'NOT BY LAST CLICK', type: 'creative', completed: false },
        { id: 's2', title: 'Give the proven walkaround format more views', subtitle: 'FREE GAIN — NO NEW PRODUCTION', type: 'creative', completed: false },
        { id: 's3', title: 'Template the winner for all 890 dealers', subtitle: 'PROVEN IDEA → MORE OF IT', type: 'creative', completed: false },
      ],
    },
    {
      id: 'ins-dn-09-creative-fatigue',
      enterprise: 'dealership-network',
      createdAt: at(2, '07:24:00'),
      category: 'creative-performance',
      scope: 'brand',
      division: 'tier-3',
      channels: ['ctv', 'facebook'],
      title: 'The Network’s Always-On “Event Sales” Spot Has Lost ~18% of Its Pull in Three Weeks at the Same Spend — That’s Creative Wear-Out, Not a Delivery Problem, So the Fix Is a Refresh',
      summary: 'The shared always-on “event sales” spot is tiring out across the network. Its pull with local in-market shoppers is down about 18% over three weeks even though spend and audience haven’t changed. The instinct is to blame the buy, but the pattern says otherwise: people are simply seeing it too many times — response drops with each extra viewing while a fresher cut running beside it holds steady. That’s creative wear-out, and the fix is a refresh, not a change to the media. Spending the cycle re-tuning delivery would fix nothing. STRATIS calls the cause and flags the refresh window before the decay starts costing real showroom visits.',
      evidence: [
        '“Event Sales” pull is down ~18% over three weeks at flat spend and a steady audience.',
        'Response drops with each additional viewing — the fingerprint of wear-out, not delivery.',
        'A fresher cut running beside it is holding steady, ruling out a market-wide delivery shift.',
        'Two lower-frequency cuts out-perform per viewing but get only ~10% of delivery.',
        'STRATIS separates wear-out from delivery so the network doesn’t fix the wrong thing.',
      ],
      confidence: 0.90,
      impactEstimate: 'Refreshing the worn network spot before the decay deepens is projected to improve cost per showroom visit ~16%, and avoids a wasted delivery change that wouldn’t have fixed wear-out.',
      recommendedAction: 'Treat it as wear-out: cap the tired spot’s delivery, promote the two best fresh cuts, and brief a new execution for the over-exposed audience. STRATIS confirms the cause and flags the refresh window.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Confirm wear-out before changing anything', subtitle: 'IT’S FREQUENCY, NOT THE BUY', type: 'creative', completed: false },
        { id: 's2', title: 'Cap the tired spot, promote the fresh cuts', subtitle: 'REFRESH, DON’T RE-TUNE DELIVERY', type: 'creative', completed: false },
        { id: 's3', title: 'Brief a new execution for the worn-out audience', subtitle: 'BEFORE IT COSTS REAL VISITS', type: 'creative', completed: false },
      ],
    },
    {
      id: 'ins-dn-10-frequency-collision',
      enterprise: 'dealership-network',
      createdAt: at(2, '07:27:00'),
      category: 'audience-overlap',
      scope: 'brand',
      division: 'tier-3',
      productLine: 'dn-ontario-rollup',
      channels: ['ctv', 'facebook', 'google-search', 'ttd'],
      title: 'The Average In-Market Shopper in a Dense Metro Is Seeing ACME Dealer Ads 18 Times a Week Across Five Nearby Dealers — More Than Double What Actually Moves Them',
      summary: 'Each dealer caps how often it shows an ad, but nobody caps across all the dealers a single shopper lives near. When you follow one in-market shopper in a dense metro across TV, social, display and search, they’re seeing ACME dealer ads about 18 times a week — more than double the ~8 range where extra exposure stops persuading and starts annoying. The over-exposure is invisible to any one dealer because each only sees its own delivery; it only shows up when every nearby dealer is matched to the same person. One network-level cap pulls exposure back to the effective range and frees the wasted impressions for shoppers no dealer is reaching at all.',
      evidence: [
        'Matched to the person across five nearby dealers: ~18 ads a week to the average metro shopper.',
        'No single dealer goes above ~5 a week — the pile-up only shows up when you combine them.',
        'Extra exposure stops persuading past ~8 a week for local in-market shoppers.',
        'About 22% of metro impressions land above that line — roughly $3.4M a year of network waste.',
        'STRATIS matches shoppers across nearby dealers — a collision no single dealer can see.',
      ],
      confidence: 0.92,
      impactEstimate: 'One network-level cap pulls weekly exposure back to the effective range and moves ~$3.4M of wasted impressions to shoppers no dealer is reaching — lifting net reach ~14% with no extra spend.',
      recommendedAction: 'Set a single ~8-per-week network cap across nearby dealers in dense metros and move the recovered budget to under-reached trade areas. STRATIS matches shoppers across dealers and enforces the cap continuously.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Set one ~8/week cap across nearby dealers', subtitle: 'NOT PER-DEALER — ACROSS THE METRO', type: 'bidding', completed: false },
        { id: 's2', title: 'Move the savings to under-reached trade areas', subtitle: 'BUY REACH THE NETWORK MISSES', type: 'budget', completed: false },
        { id: 's3', title: 'Enforce the combined cap continuously', subtitle: 'STRATIS MATCHES ACROSS DEALERS', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-11-conquest-opportunity',
      enterprise: 'dealership-network',
      createdAt: at(3, '07:30:00'),
      category: 'competitive-macro',
      scope: 'brand',
      division: 'tier-3',
      productLine: 'dn-ontario-rollup',
      channels: ['google-search', 'ttd', 'facebook'],
      title: 'An Import-Leader Rival Pulled Its Local Search Spending Back ~35% Along a Key Metro Corridor — the Door to Win Cross-Shoppers Just Opened, and It’s Cheaper Than It’s Been All Year',
      summary: 'Two things happened at once along a dense metro corridor that add up to an opening, not a threat. Shoppers there started running “ACME vs the import leader” comparison searches about three times as much, ahead of any change in registrations. At the same time the import-leader rival pulled its own local search spending back about 35%, so the cost to show up against those searches has dropped below where it’s been all year. The corridor’s dealers are putting almost nothing into coordinated comparison search, and the comparison creative isn’t even running. The lane is open, cheap, and uncontested — but only while interest is running ahead of purchase.',
      evidence: [
        'Comparison searches up ~205% along the corridor within days — ahead of any registration change.',
        'The import-leader rival cut its local search spend ~35% — the auction is the cheapest it’s been all year.',
        'Corridor dealers hold only ~6% of search budget in coordinated comparison terms.',
        'The “why switch” comparison creative isn’t running in the corridor’s search at all.',
        'STRATIS reads the rival’s retreat and the interest spike together and calls it an opening.',
      ],
      confidence: 0.83,
      impactEstimate: 'Surging coordinated comparison search and creative while the lane is cheap and interest is leading is projected to capture ~$2.6M a year of corridor cross-shop conquest, at a lower cost to win each shopper than any point last year.',
      recommendedAction: 'Coordinate the corridor dealers onto comparison search and put the “why switch” creative live now, while the rival is out and costs are low. STRATIS holds the lane and alerts if the rival re-enters the auction.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Raise corridor comparison-search budget to ~18%', subtitle: 'WHILE THE AUCTION IS CHEAP', type: 'budget', completed: false },
        { id: 's2', title: 'Put the “why switch” creative live in the corridor', subtitle: 'WALK THROUGH THE OPEN DOOR', type: 'creative', completed: false },
        { id: 's3', title: 'Alert if the rival re-enters the auction', subtitle: 'STRATIS HOLDS THE LANE', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-12-pull-through',
      enterprise: 'dealership-network',
      createdAt: at(3, '07:33:00'),
      category: 'tier-choreography',
      scope: 'brand',
      channels: ['ctv', 'ooh', 'google-search'],
      title: 'Every Time a Metro-Flagship Dealer Runs a CTV + OOH Flight, Satellite Dealers Within 50km Get a Local-Search Bump 7 Days Later — but the Satellites’ Spend Isn’t Lined Up to That Window',
      summary: 'The flagship and satellite sides of the network are out of sync. In metros with a heavy flagship CTV + OOH flight, satellite dealers within 50km see a clear bump in local branded searches and showroom visits about seven days later — the flagship’s brand weight spills into the whole trade area. But the satellites’ own media runs on a different calendar than the flagship flights, so their local search and inventory pushes usually land outside that seven-day window when shoppers are already looking. The fix is timing, not more money — fire the satellite touch into the window the flagship already created.',
      evidence: [
        'Satellite branded searches peak about seven days after a flagship CTV + OOH flight in the same metro.',
        'Heavy-flagship metros see ~14% more satellite organic traffic than light-flagship metros.',
        'Satellite media and flagship flights aren’t aligned — they run on separate co-op calendars.',
        'A satellite’s local search converts ~2.0× better when it lands inside the halo window.',
        'Only a view across the flagship-satellite hierarchy sees the seven-day handoff — neither sees it alone.',
      ],
      confidence: 0.86,
      impactEstimate: 'Timing satellite local search and inventory pushes to the seven-day flagship-halo window is projected to lift showroom visits ~8–11% in aligned metros — with no extra media spend.',
      recommendedAction: 'Trigger satellite local Search and inventory pushes to fire 5–8 days after each flagship flight by metro. STRATIS pushes the flagship flight calendar into the satellites’ portal so the window is hit by default.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Feed the flagship flight calendar into the satellite portal', subtitle: 'ONE CALENDAR, NOT TWO', type: 'scheduling', completed: false },
        { id: 's2', title: 'Time the satellite touch to the 5–8 day window', subtitle: 'HIT THE HALO HANDOFF', type: 'scheduling', completed: false },
        { id: 's3', title: 'Compare aligned vs unaligned metros for six weeks', subtitle: 'PROVE THE LIFT', type: 'targeting', completed: false },
      ],
    },
    {
      id: 'ins-dn-13-audience-migration',
      enterprise: 'dealership-network',
      createdAt: at(3, '07:36:00'),
      category: 'tactical-efficiency',
      scope: 'brand',
      division: 'tier-3',
      channels: ['facebook', 'tiktok', 'instagram'],
      title: 'Move the Younger First-Vehicle Budget From Facebook to TikTok — the Under-30 Shoppers Who Made Facebook Efficient Last Year Have Moved to TikTok, Where They Now Convert ~38% Cheaper',
      summary: 'The younger first-vehicle audience that made Facebook pay off last year has shifted where it spends its attention. That browsing has largely moved to TikTok (short-form auto creators and inventory walkarounds), and the same shoppers now respond there at a much lower cost, while Facebook’s cost to drive a younger shopper to a dealer site has climbed as the active audience thinned out. This is an audience-migration call: follow the people, not the plan. STRATIS tracks where an audience actually converts across platforms week to week, so it catches the shift while it’s happening.',
      evidence: [
        'Cost to drive a younger shopper to a dealer site: up ~44% on Facebook over the quarter, while TikTok is ~38% cheaper for the same audience.',
        'The active under-30 audience on Facebook has shrunk; the same users now show up and convert on TikTok.',
        'Facebook still works for the 35+ family-shopper audience — this move is the younger slice only.',
        'TikTok delivery for this audience has headroom; it isn’t yet saturated.',
        'Only a cross-platform view catches this — each platform’s own report looks “fine” in isolation.',
      ],
      confidence: 0.85,
      impactEstimate: 'Moving the younger first-vehicle slice from Facebook to TikTok is projected to lift younger-shopper conversions ~12% at flat spend, by following the audience to where it now converts.',
      recommendedAction: 'Shift the younger first-vehicle budget from Facebook to TikTok, keep Facebook on the 35+ family-shopper audience, and let STRATIS keep watching where the audience converts.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Move the younger budget from Facebook to TikTok', subtitle: 'FOLLOW THE AUDIENCE', type: 'budget', completed: false },
        { id: 's2', title: 'Keep Facebook on the 35+ family shoppers', subtitle: 'WHERE IT STILL CONVERTS', type: 'targeting', completed: false },
        { id: 's3', title: 'Watch where the audience converts week to week', subtitle: 'STRATIS TRACKS THE MIGRATION', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-14-discovery-intent',
      enterprise: 'dealership-network',
      createdAt: at(4, '07:39:00'),
      category: 'tactical-efficiency',
      scope: 'brand',
      division: 'tier-3',
      channels: ['facebook', 'google-search', 'instagram'],
      linkedNewsId: 'news-dn-google-vehicle-listing-ads',
      title: 'Shift a Slice of Cold Social Prospecting Into Vehicle Listing Ads on Search — Shoppers Arrive Already Pricing Inventory and Convert to a Lead at About a Third of Social’s Cost',
      summary: 'Search is where local shoppers arrive with intent, and a real share of the network’s prospects are there actively searching “SUV near me,” trims, and payments — surfacing through Vehicle Listing Ads tied to each dealer’s live inventory. Because they arrive ready to price a specific vehicle, they convert to a qualified lead at roughly a third of the cost of cold prospecting on social. Social is still the right tool for re-engaging shoppers who already know a dealer — but the top-of-funnel prospecting dollar works far harder on inventory-fed Search, and today it gets almost none of it.',
      evidence: [
        'Cost per qualified lead: ~$22 on Vehicle Listing Ads vs ~$63 for cold social prospecting.',
        'Shoppers reach Search already pricing inventory — intent, not interruption.',
        'Inventory-fed Search holds only ~4% of network prospecting budget today despite the efficiency.',
        'Keep social for retargeting known dealer-site visitors — this moves the cold prospecting dollar only.',
        'STRATIS compares cost per qualified lead across platforms, not each platform’s own metric.',
      ],
      confidence: 0.84,
      impactEstimate: 'Moving a slice of cold social prospecting into inventory-fed Search is projected to cut the blended cost of a qualified lead ~22% and free spend for retargeting where social is strongest.',
      recommendedAction: 'Shift cold prospecting budget from social into Vehicle Listing Ads, and keep social focused on retargeting known visitors. STRATIS holds the cross-platform efficiency comparison live.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Move cold prospecting from social to Vehicle Listing Ads', subtitle: 'BUY INTENT, NOT INTERRUPTION', type: 'budget', completed: false },
        { id: 's2', title: 'Keep social on retargeting known visitors', subtitle: 'WHERE SOCIAL STILL WINS', type: 'targeting', completed: false },
        { id: 's3', title: 'Compare cost per qualified lead across platforms', subtitle: 'NOT EACH PLATFORM’S OWN METRIC', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-15-supply-path',
      enterprise: 'dealership-network',
      createdAt: at(4, '07:42:00'),
      category: 'tactical-efficiency',
      scope: 'brand',
      division: 'tier-3',
      channels: ['ttd'],
      title: 'Pull Network Display Out of the Open Exchange and Into Curated Local Deals on The Trade Desk — Same Shoppers, ~27% Less Waste, and Ads Stop Landing Next to the Wrong Content',
      summary: 'A large share of the network’s programmatic display is still running through the open exchange, where about 27% of every co-op dollar disappears into low-quality, never-seen, or off-target inventory — and ads sometimes land next to content a national brand can’t be near. Moving that money into curated private deals on The Trade Desk — local news, auto, and lifestyle inventory bought directly — reaches the same in-market shoppers with far less waste and clean, on-topic adjacency. Same shoppers, more of the co-op dollar actually working.',
      evidence: [
        'About 27% of open-exchange spend is lost to unviewable, low-quality, or off-target inventory.',
        'Curated private deals on The Trade Desk reach the same local shopper audience with verified placement.',
        'Open-exchange viewability runs well below the curated-deal benchmark.',
        'Private deals also remove the brand-safety risk of unknown adjacency for a national brand.',
        'STRATIS reads delivered quality, not just the buying platform’s reported impressions.',
      ],
      confidence: 0.87,
      impactEstimate: 'Moving network display from the open exchange into curated Trade Desk deals recovers ~27% of that spend into working impressions — roughly $2.2M a year at the same audience and reach.',
      recommendedAction: 'Shift network display out of the open exchange into curated local private deals on The Trade Desk. STRATIS keeps scoring delivered quality and flags waste as it reappears.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Move display from open exchange to curated deals', subtitle: 'SAME SHOPPERS, LESS WASTE', type: 'budget', completed: false },
        { id: 's2', title: 'Hold delivery to verified, on-topic inventory', subtitle: 'BRAND-SAFE ADJACENCY', type: 'targeting', completed: false },
        { id: 's3', title: 'Score delivered quality, not reported impressions', subtitle: 'STRATIS WATCHES THE SUPPLY PATH', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-16-reach-cap',
      enterprise: 'dealership-network',
      createdAt: at(4, '07:45:00'),
      category: 'tactical-efficiency',
      scope: 'brand',
      division: 'tier-3',
      channels: ['facebook', 'ttd'],
      title: 'Local Facebook Has Reached Almost Every In-Market Shopper It Can in a Trade Area — the Next Reach Dollar Belongs on The Trade Desk, Where There Are Still New People to Find',
      summary: 'In a typical trade area, local Facebook has done its job and hit its ceiling: it has now delivered to nearly every reachable in-market shopper, so each additional Facebook dollar just adds repeat views to the same people instead of finding new ones. The Trade Desk still has real net-new reach into that same local audience at a similar cost. This is different from cutting a channel for being inefficient — Facebook is efficient, it’s simply out of new people in that trade area. Cap it at its reach ceiling and put the next reach dollar where new shoppers still exist to convert.',
      evidence: [
        'Local Facebook’s unique reach in a trade area has flattened — added spend now adds frequency, not new people.',
        'The Trade Desk still reaches net-new local shoppers in the same trade area at a similar cost.',
        'Facebook stays funded up to its ceiling — this caps the overflow, it doesn’t cut the channel.',
        'Extra Facebook frequency past the ceiling is the same diminishing-returns trap as any saturated channel.',
        'STRATIS separates “out of new people” from “inefficient” — they call for different moves.',
      ],
      confidence: 0.85,
      impactEstimate: 'Capping local Facebook at its reach ceiling and moving the overflow to The Trade Desk converts wasted repeat views into net-new reach — lifting unique shoppers reached ~9% at the same spend.',
      recommendedAction: 'Cap local Facebook at the point its unique reach flattens and move the overflow to The Trade Desk for net-new reach. STRATIS watches each channel’s reach ceiling by trade area and redirects the overflow.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Cap Facebook where its unique reach flattens', subtitle: 'EFFICIENT, BUT OUT OF NEW PEOPLE', type: 'budget', completed: false },
        { id: 's2', title: 'Move the overflow to The Trade Desk', subtitle: 'FIND PEOPLE, NOT FREQUENCY', type: 'budget', completed: false },
        { id: 's3', title: 'Watch each channel’s reach ceiling by trade area', subtitle: 'REDIRECT THE OVERFLOW', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-17-auction-pressure',
      enterprise: 'dealership-network',
      createdAt: at(5, '07:48:00'),
      category: 'tactical-efficiency',
      scope: 'division',
      division: 'tier-3',
      productLine: 'dn-alberta-rollup',
      channels: ['google-search', 'ctv', 'facebook'],
      title: 'An Import-Leader Rival’s Regional Push Crowded the Search Auction Across the Alberta Rollup — Our Cost to Reach Local Shoppers There Jumped ~30%; CTV and Social Are Uncontested and Cheaper Right Now',
      summary: 'Nothing changed on the network’s side, but reaching local shoppers on Search across the Alberta rollup suddenly costs about 30% more — a rival’s regional campaign flooded the same shoppers and bid the auction up. CTV and local social, where that rival isn’t active, are reaching the same kinds of shoppers at last quarter’s prices. The smart move is temporary and reversible: shift a portion of Search reach to the uncontested channels while the auction is hot, and shift it back when the rival’s flight ends. Paying the inflated Search price for reach the network can get cheaper elsewhere is the avoidable cost.',
      evidence: [
        'Search cost to reach Alberta-rollup shoppers is up ~30% with no change in our targeting or creative.',
        'The increase lines up exactly with a rival’s regional flight on the same shoppers.',
        'CTV and local social, where the rival isn’t bidding, are still at last quarter’s cost.',
        'The shift is temporary and reversible — move it back when the rival’s flight ends.',
        'STRATIS ties the cost spike to the rival’s entry, so the cause is clear, not guessed.',
      ],
      confidence: 0.83,
      impactEstimate: 'Temporarily moving the inflated share of Search reach to CTV and social avoids the ~30% auction premium — protecting reach efficiency across the rollup until the rival’s flight ends, then reversing.',
      recommendedAction: 'Shift a portion of Search reach to CTV and local social while the rival has the auction crowded, and move it back when their flight ends. STRATIS alerts when the auction normalizes.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Move the inflated Search reach to CTV + social', subtitle: 'DON’T PAY THE AUCTION PREMIUM', type: 'budget', completed: false },
        { id: 's2', title: 'Keep the shift temporary and reversible', subtitle: 'MOVE BACK WHEN THEY STOP', type: 'budget', completed: false },
        { id: 's3', title: 'Alert when the Search auction normalizes', subtitle: 'STRATIS WATCHES THE RIVAL', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-xr1-creative-transfer',
      enterprise: 'dealership-network',
      createdAt: at(5, '07:51:00'),
      category: 'cross-region',
      scope: 'brand',
      channels: ['instagram', 'tiktok', 'facebook', 'ctv'],
      title: 'The Vertical “Walkaround” Format Is Converting 1.5× the Standard Inventory Ad — in the BC Rollup — and the Ontario Rollup Has the Same Inventory-Browsing Shopper Sitting Untapped',
      summary: 'The same creative idea wins in two rollups, but it’s only deployed in one. In the BC rollup, the dealer-shot vertical “walkaround” execution is converting at about 1.5× the standard inventory ad on the identical test-drive metric, where casual inventory browsing is the moment before a visit. The Ontario rollup has the same shopper behaviour and the same browsing-heavy mix, yet Ontario delivery still leads with the static inventory ad and the walkaround holds a thin share of views. This is the cleanest cross-region transfer STRATIS sees — a format proven on the same conversion metric in one rollup, ready to port to another that already has the audience for it. Port the asset, don’t re-test it from zero.',
      evidence: [
        'BC rollup: the walkaround format converts ~1.5× the standard inventory ad on the same test-drive metric.',
        'The edge holds across BC dealers — not a single-dealer fluke.',
        'Ontario rollup shows the same inventory-browsing shopper mix the format is built for.',
        'Ontario delivery still defaults to the static inventory ad; the walkaround holds a thin share of views.',
        'STRATIS correlates creative performance on a common metric across rollups — no single rollup’s report sees the other.',
      ],
      confidence: 0.88,
      impactEstimate: 'Porting the proven BC walkaround format into Ontario — where the browsing shopper already exists — is projected to lift Ontario-rollup conversion ~13% at no incremental production cost, capturing a win already validated in another rollup.',
      recommendedAction: 'Adapt and ship the BC walkaround format into the Ontario rollup, give it real share of views against the static ad, and let STRATIS keep matching creative performance across rollups to surface the next portable asset.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Port the BC walkaround format into Ontario', subtitle: 'PROVEN IN ANOTHER ROLLUP', type: 'creative', completed: false },
        { id: 's2', title: 'Give it real share of views vs the static ad', subtitle: 'DON’T LET DELIVERY DEFAULT BACK', type: 'creative', completed: false },
        { id: 's3', title: 'Match creative performance across rollups continuously', subtitle: 'STRATIS SURFACES THE NEXT PORTABLE WIN', type: 'creative', completed: false },
      ],
    },
    {
      id: 'ins-dn-xr2-leading-indicator',
      enterprise: 'dealership-network',
      createdAt: at(6, '07:54:00'),
      category: 'cross-region',
      scope: 'brand',
      channels: ['ctv', 'google-search', 'ooh'],
      title: 'The Prairies Rollup’s Local-Demand Curve Is Tracing the Exact Alberta-Rollup Slowdown From Five Weeks Ago — Pull Prairies Co-Op Weight Now, Before the Same ~$1.6M of Waste Lands',
      summary: 'One rollup is now a five-week early warning for another. The Alberta rollup’s local-demand curve rolled over earlier this quarter — cost per showroom visit climbed as in-market shoppers thinned out after a heavy spring push. STRATIS has now detected the identical curve forming in the Prairies rollup, running about five weeks behind Alberta, week-for-week. This isn’t a vague “watch the Prairies” note: it’s the same demand-decay shape, same inflection, same post-push fingerprint, on a lag. Because Alberta already showed where this ends, the Prairies don’t have to spend their way to the same dead weight — pull co-op weight at the inflection Alberta already mapped, before the waste arrives rather than after.',
      evidence: [
        'Alberta-rollup cost per visit climbed to its ceiling ~5 weeks ago as shoppers thinned post-push.',
        'The Prairies rollup is now tracing the identical decay shape, lagging Alberta by ~5 weeks week-for-week.',
        'The curves overlay almost exactly once shifted by five weeks — same inflection, same post-push fingerprint.',
        'Prairies co-op weight hasn’t reacted — it’s funded toward the same flat tail Alberta already proved is dead weight.',
        'STRATIS aligns demand curves across rollups on a lag, turning one region into a leading indicator for the next.',
      ],
      confidence: 0.86,
      impactEstimate: 'Pulling Prairies co-op weight at the inflection the Alberta curve already mapped avoids an estimated ~$1.6M of wasted spend before it lands — pre-empting the waste rather than booking it and reallocating after the fact.',
      recommendedAction: 'Treat the Alberta slowdown as the Prairies’ forward map: pull co-op weight at the Alberta-proven inflection now and hold it for re-entry when demand returns. STRATIS keeps the lagged cross-region curve live and alerts as the Prairies approach the line.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Pull Prairies co-op weight at the Alberta-proven inflection', subtitle: 'FIVE WEEKS AHEAD OF THE WASTE', type: 'budget', completed: false },
        { id: 's2', title: 'Hold the freed weight for demand re-entry', subtitle: 'RE-FUND WHEN SHOPPERS RETURN', type: 'budget', completed: false },
        { id: 's3', title: 'Hold the lagged cross-region curve live', subtitle: 'ALBERTA PREDICTS THE PRAIRIES BY ~5 WEEKS', type: 'scheduling', completed: false },
      ],
    },
    {
      id: 'ins-dn-xr3-demand-correlation',
      enterprise: 'dealership-network',
      createdAt: at(6, '07:57:00'),
      category: 'cross-region',
      scope: 'brand',
      channels: ['google-search', 'ctv', 'ttd'],
      title: 'The “SUV vs the Import Leader” Comparison-Search Surge That Led Conquest Sales in the Ontario Corridor by Six Weeks Is Now Climbing the Same Curve in BC — Fund Comparison Coverage There Ahead of the Proven Demand',
      summary: 'A demand signal that already paid out in one region is now repeating in another, early enough to get ahead of. In the Ontario corridor, a rise in “SUV vs the import leader” comparison search reliably led the conquest-sales lift by about six weeks; the search curve was the tell, and the dealers that funded comparison coverage into it captured the demand. STRATIS now sees that same comparison-search curve climbing in the BC rollup, currently at the point Ontario sat roughly six weeks before its conquest inflection. The correlation is the same shape on the same cross-shop battle; the only difference is timing. Fund comparison search and creative in BC now, ahead of the proven curve — not after the conquest lift shows up in a report.',
      evidence: [
        'Ontario corridor: “SUV vs the import leader” comparison search led the conquest-sales lift by ~6 weeks.',
        'BC rollup: the same comparison-search curve is now climbing, at the point Ontario sat ~6 weeks pre-inflection.',
        'The two curves overlay on the same comparison terms once aligned by the lag — same shape, different clock.',
        'BC comparison-search and creative coverage is currently underfunded relative to the rising demand.',
        'STRATIS correlates comparison-search to downstream conquest sales across rollups, surfacing demand before the sales data confirms it.',
      ],
      confidence: 0.84,
      impactEstimate: 'Funding BC comparison coverage ahead of the Ontario-proven ~6-week search-to-conquest curve is projected to capture the demand at materially lower cost-per-conquest than entering after the lift appears — getting in front of the curve Ontario already validated.',
      recommendedAction: 'Stand up comparison search and creative coverage in the BC rollup now, sized to the rising comparison-search curve, using the Ontario search-to-conquest lag as the forecast. STRATIS keeps correlating comparison-search to conquest across rollups and flags the inflection as BC approaches it.',
      status: 'new',
      actionSteps: [
        { id: 's1', title: 'Fund BC comparison coverage ahead of the curve', subtitle: 'ONTARIO SEARCH LED CONQUEST BY ~6 WEEKS', type: 'budget', completed: false },
        { id: 's2', title: 'Take comparison-search coverage before demand peaks', subtitle: 'BUY THE LANE BEFORE IT GETS CONTESTED', type: 'targeting', completed: false },
        { id: 's3', title: 'Correlate comparison-search to conquest across rollups', subtitle: 'STRATIS FLAGS BC’S INFLECTION', type: 'scheduling', completed: false },
      ],
    },

    // ── ACME Automotive filter-specific signals (brand view hides these until a filter is selected) ──
    ...AUTO_CAMPAIGN_INSIGHTS,
    ...AUTO_CONTEXT_INSIGHTS,
    // ── Cross-industry agency clients (authored in src/lib/clients/*) ──
    ...RBC_INSIGHTS,
    ...MOLSON_COORS_INSIGHTS,
    ...LULULEMON_INSIGHTS,
    ...TIM_HORTONS_INSIGHTS,
  ];
}

// ===== Main Data Store =====
export interface MockDataStore {
  campaigns: Campaign[];
  dailyData: Record<string, Record<string, DailyMetrics[]>>;
  newsItems: NewsItem[];
  insights: Insight[];
  anomalies: Anomaly[];
}

const cachedStores: Partial<Record<EnterpriseId, MockDataStore>> = {};

export function generateAllData(enterpriseId: EnterpriseId = 'ford-canada'): MockDataStore {
  const cached = cachedStores[enterpriseId];
  if (cached) return cached;

  const enterpriseCampaignDefs = CAMPAIGN_DEFS.filter((def) => def.enterprise === enterpriseId);

  const campaigns: Campaign[] = enterpriseCampaignDefs.map(def => ({
    id: def.id,
    name: def.name,
    enterprise: def.enterprise,
    division: def.division,
    agency: def.agency,
    productLine: def.productLine,
    audiences: def.audiences,
    objective: def.objective,
    status: def.status,
    channels: def.channels,
    geos: def.geos,
    startDate: format(START_DATE, 'yyyy-MM-dd'),
    plannedBudget: def.plannedBudget,
  }));

  const dailyData = generateDailyData(enterpriseCampaignDefs);
  const anomalies = detectAnomalies(dailyData, enterpriseCampaignDefs);
  const allNews = generateNews();
  const newsItems = allNews.filter((n) => n.enterprises.includes(enterpriseId));
  const allInsights = generateInsights(anomalies);
  const baseInsights = allInsights.filter((i) => i.enterprise === enterpriseId);
  const radarInsights = generateMarketRadarInsights(newsItems, baseInsights, enterpriseId);
  const insights = [...radarInsights, ...baseInsights];

  const store: MockDataStore = { campaigns, dailyData, newsItems, insights, anomalies };
  cachedStores[enterpriseId] = store;
  return store;
}

// ===== Market Radar — top 3 most impactful news items, surfaced as insight cards =====
const RADAR_PINNED_BY_ENTERPRISE: Record<EnterpriseId, string[]> = {
  'ford-canada': ['news-tesla-cybertruck-cut', 'news-izev-extension', 'news-gm-silverado-fleet'],
  'lincoln': ['news-lincoln-bmw-x5-redesign', 'news-luxury-tariff-relief', 'news-lexus-rx-loyalty'],
  'dealership-network': ['news-dn-ontario-coop-program-update', 'news-dn-google-vehicle-listing-ads', 'news-dn-quebec-french-creative-mandate'],
  'rbc': RBC_RADAR_PINS,
  'molson-coors': MOLSON_COORS_RADAR_PINS,
  'lululemon': LULULEMON_RADAR_PINS,
  'tim-hortons': TIM_HORTONS_RADAR_PINS,
};

function generateMarketRadarInsights(news: NewsItem[], existingInsights: Insight[], enterpriseId: EnterpriseId): Insight[] {
  const pinnedIds = RADAR_PINNED_BY_ENTERPRISE[enterpriseId] ?? [];
  const pinned = pinnedIds
    .map((id) => news.find((n) => n.id === id))
    .filter((n): n is NewsItem => Boolean(n));

  return pinned.map((item, idx) => {
    const linkedInsight = existingInsights.find((i) => i.linkedNewsId === item.id);
    const channelHint: ChannelId[] =
      item.tags.includes('ev') ? ['ctv', 'google-search', 'ttd'] :
      item.tags.includes('izev') ? ['google-search', 'facebook', 'instagram'] :
      ['ctv', 'google-search'];

    const radarSubtitle = linkedInsight
      ? `STRATIS is monitoring — linked active recommendation: ${linkedInsight.title.split('—')[0].trim()}.`
      : `STRATIS is monitoring — no active recommendation required yet, but downstream signals are being correlated against this event.`;

    return {
      id: `radar-${item.id}`,
      enterprise: enterpriseId,
      createdAt: item.date + 'T07:0' + idx + ':00Z',
      category: 'market-radar',
      scope: 'brand',
      channels: channelHint,
      linkedNewsId: item.id,
      title: item.title,
      summary: item.whyItMatters,
      evidence: [
        `Source: ${item.source}`,
        `Detected: ${item.date}`,
        `Urgency: ${item.urgency.toUpperCase()}`,
        ...(item.competitor ? [`Competitor: ${item.competitor}`] : []),
        item.summary,
      ],
      confidence: item.urgency === 'high' ? 0.95 : item.urgency === 'medium' ? 0.80 : 0.65,
      impactEstimate: linkedInsight
        ? `Triggered downstream recommendation worth ${linkedInsight.impactEstimate.split('.')[0]}.`
        : `Tracked at the enterprise level. STRATIS is correlating against active campaigns; no action required at this time.`,
      recommendedAction: radarSubtitle,
      status: 'new',
      actionSteps: linkedInsight
        ? [
            { id: 's1', title: 'Review linked STRATIS recommendation', subtitle: linkedInsight.id.toUpperCase(), type: 'targeting', completed: false },
            { id: 's2', title: 'Brief lead AOR on event', subtitle: 'CONFIRM RESPONSE PLAN', type: 'scheduling', completed: false },
          ]
        : [
            { id: 's1', title: 'Acknowledge — STRATIS continues monitoring', subtitle: 'NO ACTION REQUIRED', type: 'targeting', completed: false },
          ],
    };
  });
}
