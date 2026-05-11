// ===== Molecular Graph Data Structure =====
// Defines nodes, bonds, ring config, and lineage tracing for the 3D molecular filter.

export interface MolecularNode {
  id: string;
  label: string;
  ring: number;
  angle: number;
  color: string;
  radius: number;
  description: string;
  filterType?: 'division' | 'agency' | 'productLine' | 'audience' | 'campaign' | 'channel' | 'funnel' | 'geo';
  filterValue?: string;
}

export interface MolecularBond {
  source: string;
  target: string;
}

export const RING_COLORS = {
  nucleus: '#1B4DA0',   // Ford blue
  org: '#7F77DD',
  product: '#1D9E75',
  audience: '#D85A30',
  campaign: '#5DCAA5',
  exec: '#378ADD',
};

export const RING_RADII = [0, 8, 14, 20, 27, 34];

// Visual sphere radii per ring (how big the node orb appears)
export const RING_NODE_RADII = [2.0, 1.3, 1.0, 0.9, 0.7, 0.6];

// Fibonacci sphere distribution for even spacing on a sphere surface
function fibonacciSphere(numPoints: number, radius: number): [number, number, number][] {
  if (numPoints === 1) return [[0, 0, 0]];
  const points: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < numPoints; i++) {
    const y = 1 - (i / (numPoints - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push([
      radius * radiusAtY * Math.cos(theta),
      radius * y * 0.7, // oblate spheroid
      radius * radiusAtY * Math.sin(theta),
    ]);
  }
  return points;
}

const _nodeBasePositions = new Map<string, [number, number, number]>();

function computeBasePositions(nodes: MolecularNode[]) {
  const byRing = new Map<number, MolecularNode[]>();
  for (const n of nodes) {
    if (!byRing.has(n.ring)) byRing.set(n.ring, []);
    byRing.get(n.ring)!.push(n);
  }
  for (const [ring, ringNodes] of byRing) {
    const radius = RING_RADII[ring];
    if (ring === 0) {
      _nodeBasePositions.set(ringNodes[0].id, [0, 0, 0]);
      continue;
    }
    const positions = fibonacciSphere(ringNodes.length, radius);
    for (let i = 0; i < ringNodes.length; i++) {
      _nodeBasePositions.set(ringNodes[i].id, positions[i]);
    }
  }
}

export function getBasePosition(id: string): [number, number, number] {
  return _nodeBasePositions.get(id) ?? [0, 0, 0];
}

// ===== Node Definitions =====

const CAMPAIGN_IDS = [
  // Tier 1
  'ford-lightning-launch-hero',
  'ford-f150-built-tough',
  'ford-mach-e-defense',
  'ford-bronco-adventure-national',
  'ford-explorer-family',
  'ford-escape-phev-izev',
  'ford-transit-fleet',
  'ford-edge-mature',
  'ford-brand-q2',
  // Tier 2
  'ford-lightning-bc-regional',
  'ford-bronco-bc-regional',
  'ford-f150-bc-regional',
  'ford-lightning-on-regional',
  'ford-f150-on-regional',
  'ford-explorer-on-regional',
  'ford-f150-ab-regional',
  'ford-bronco-ab-regional',
  'ford-f150-qc-cossette',
  'ford-escape-qc-cossette',
  'ford-f150-at-regional',
  // Tier 3
  'ford-dealer-spring-sales',
  'ford-dealer-lightning-leads',
  'ford-dealer-suv-shoppers',
] as const;

const CAMPAIGN_LABELS: Record<string, string> = {
  'ford-lightning-launch-hero': 'Lightning Launch',
  'ford-f150-built-tough': 'F-150 Built Tough',
  'ford-mach-e-defense': 'Mach-E Defense',
  'ford-bronco-adventure-national': 'Bronco Nat\'l',
  'ford-explorer-family': 'Explorer Family',
  'ford-escape-phev-izev': 'Escape PHEV',
  'ford-transit-fleet': 'Transit Fleet',
  'ford-edge-mature': 'Edge',
  'ford-brand-q2': 'Brand Q2',
  'ford-lightning-bc-regional': 'Lightning BC',
  'ford-bronco-bc-regional': 'Bronco BC',
  'ford-f150-bc-regional': 'F-150 BC',
  'ford-lightning-on-regional': 'Lightning ON',
  'ford-f150-on-regional': 'F-150 ON',
  'ford-explorer-on-regional': 'Explorer ON',
  'ford-f150-ab-regional': 'F-150 AB',
  'ford-bronco-ab-regional': 'Bronco AB',
  'ford-f150-qc-cossette': 'F-150 QC',
  'ford-escape-qc-cossette': 'Escape QC',
  'ford-f150-at-regional': 'F-150 AT',
  'ford-dealer-spring-sales': 'Dealer Spring',
  'ford-dealer-lightning-leads': 'Dealer Lightning',
  'ford-dealer-suv-shoppers': 'Dealer SUV',
};

// Campaign → primary nameplate mapping (used for Ring 2→4 bonds)
const CAMPAIGN_TO_NAMEPLATE: Record<string, string> = {
  'ford-lightning-launch-hero': 'lightning',
  'ford-f150-built-tough': 'f150',
  'ford-mach-e-defense': 'mach-e',
  'ford-bronco-adventure-national': 'bronco',
  'ford-explorer-family': 'explorer',
  'ford-escape-phev-izev': 'escape-phev',
  'ford-transit-fleet': 'transit',
  'ford-edge-mature': 'edge',
  'ford-brand-q2': 'f150',
  'ford-lightning-bc-regional': 'lightning',
  'ford-bronco-bc-regional': 'bronco',
  'ford-f150-bc-regional': 'f150',
  'ford-lightning-on-regional': 'lightning',
  'ford-f150-on-regional': 'f150',
  'ford-explorer-on-regional': 'explorer',
  'ford-f150-ab-regional': 'f150',
  'ford-bronco-ab-regional': 'bronco',
  'ford-f150-qc-cossette': 'f150',
  'ford-escape-qc-cossette': 'escape-phev',
  'ford-f150-at-regional': 'f150',
  'ford-dealer-spring-sales': 'f150',
  'ford-dealer-lightning-leads': 'lightning',
  'ford-dealer-suv-shoppers': 'explorer',
};

// Campaign → audiences (mirrors mock-data.ts)
const CAMPAIGN_TO_AUDIENCES: Record<string, string[]> = {
  'ford-lightning-launch-hero': ['truck-intenders', 'ev-considerers', 'conquest-tesla'],
  'ford-f150-built-tough': ['truck-intenders', 'fleet-commercial'],
  'ford-mach-e-defense': ['ev-considerers', 'conquest-gm', 'conquest-hyundai-kia'],
  'ford-bronco-adventure-national': ['adventure-lifestyle'],
  'ford-explorer-family': ['family-suv-shoppers', 'conquest-toyota'],
  'ford-escape-phev-izev': ['phev-shoppers', 'family-suv-shoppers', 'conquest-toyota'],
  'ford-transit-fleet': ['fleet-commercial'],
  'ford-edge-mature': ['family-suv-shoppers'],
  'ford-brand-q2': ['truck-intenders'],
  'ford-lightning-bc-regional': ['truck-intenders', 'ev-considerers'],
  'ford-bronco-bc-regional': ['adventure-lifestyle'],
  'ford-f150-bc-regional': ['truck-intenders'],
  'ford-lightning-on-regional': ['truck-intenders', 'ev-considerers'],
  'ford-f150-on-regional': ['truck-intenders'],
  'ford-explorer-on-regional': ['family-suv-shoppers'],
  'ford-f150-ab-regional': ['truck-intenders', 'fleet-commercial'],
  'ford-bronco-ab-regional': ['adventure-lifestyle'],
  'ford-f150-qc-cossette': ['truck-intenders'],
  'ford-escape-qc-cossette': ['phev-shoppers'],
  'ford-f150-at-regional': ['truck-intenders'],
  'ford-dealer-spring-sales': ['truck-intenders'],
  'ford-dealer-lightning-leads': ['ev-considerers', 'truck-intenders'],
  'ford-dealer-suv-shoppers': ['family-suv-shoppers'],
};

// Campaign → channels
const CAMPAIGN_TO_CHANNELS: Record<string, string[]> = {
  'ford-lightning-launch-hero': ['ctv', 'ttd', 'google-search', 'instagram', 'ooh'],
  'ford-f150-built-tough': ['ctv', 'ttd', 'google-search', 'ooh'],
  'ford-mach-e-defense': ['google-search', 'instagram', 'tiktok', 'ttd'],
  'ford-bronco-adventure-national': ['ctv', 'instagram', 'tiktok', 'ttd'],
  'ford-explorer-family': ['ctv', 'google-search', 'instagram', 'facebook'],
  'ford-escape-phev-izev': ['google-search', 'instagram', 'facebook', 'ttd'],
  'ford-transit-fleet': ['linkedin', 'google-search', 'ttd'],
  'ford-edge-mature': ['google-search', 'facebook', 'ttd'],
  'ford-brand-q2': ['ctv', 'ooh', 'spotify'],
  'ford-lightning-bc-regional': ['google-search', 'instagram', 'facebook'],
  'ford-bronco-bc-regional': ['instagram', 'tiktok', 'google-search'],
  'ford-f150-bc-regional': ['google-search', 'facebook', 'instagram'],
  'ford-lightning-on-regional': ['google-search', 'instagram', 'facebook', 'spotify'],
  'ford-f150-on-regional': ['google-search', 'facebook', 'instagram', 'ttd'],
  'ford-explorer-on-regional': ['google-search', 'facebook', 'instagram'],
  'ford-f150-ab-regional': ['google-search', 'facebook', 'instagram'],
  'ford-bronco-ab-regional': ['instagram', 'tiktok', 'facebook'],
  'ford-f150-qc-cossette': ['google-search', 'facebook', 'instagram', 'spotify'],
  'ford-escape-qc-cossette': ['google-search', 'facebook', 'instagram'],
  'ford-f150-at-regional': ['google-search', 'facebook', 'instagram'],
  'ford-dealer-spring-sales': ['facebook', 'instagram', 'google-search'],
  'ford-dealer-lightning-leads': ['facebook', 'instagram', 'google-search'],
  'ford-dealer-suv-shoppers': ['facebook', 'instagram', 'google-search'],
};

// Campaign → objective (funnel)
const CAMPAIGN_TO_OBJECTIVE: Record<string, string> = {
  'ford-lightning-launch-hero': 'awareness',
  'ford-f150-built-tough': 'awareness',
  'ford-mach-e-defense': 'consideration',
  'ford-bronco-adventure-national': 'awareness',
  'ford-explorer-family': 'consideration',
  'ford-escape-phev-izev': 'consideration',
  'ford-transit-fleet': 'conversion',
  'ford-edge-mature': 'awareness',
  'ford-brand-q2': 'awareness',
  'ford-lightning-bc-regional': 'conversion',
  'ford-bronco-bc-regional': 'consideration',
  'ford-f150-bc-regional': 'conversion',
  'ford-lightning-on-regional': 'conversion',
  'ford-f150-on-regional': 'conversion',
  'ford-explorer-on-regional': 'consideration',
  'ford-f150-ab-regional': 'conversion',
  'ford-bronco-ab-regional': 'consideration',
  'ford-f150-qc-cossette': 'conversion',
  'ford-escape-qc-cossette': 'consideration',
  'ford-f150-at-regional': 'conversion',
  'ford-dealer-spring-sales': 'conversion',
  'ford-dealer-lightning-leads': 'conversion',
  'ford-dealer-suv-shoppers': 'conversion',
};

// Campaign → geos
const CAMPAIGN_TO_GEOS: Record<string, string[]> = {
  'ford-lightning-launch-hero': ['national'],
  'ford-f150-built-tough': ['national'],
  'ford-mach-e-defense': ['national'],
  'ford-bronco-adventure-national': ['national'],
  'ford-explorer-family': ['national'],
  'ford-escape-phev-izev': ['national'],
  'ford-transit-fleet': ['national'],
  'ford-edge-mature': ['national'],
  'ford-brand-q2': ['national'],
  'ford-lightning-bc-regional': ['bc'],
  'ford-bronco-bc-regional': ['bc'],
  'ford-f150-bc-regional': ['bc'],
  'ford-lightning-on-regional': ['ontario'],
  'ford-f150-on-regional': ['ontario'],
  'ford-explorer-on-regional': ['ontario'],
  'ford-f150-ab-regional': ['alberta'],
  'ford-bronco-ab-regional': ['alberta'],
  'ford-f150-qc-cossette': ['quebec'],
  'ford-escape-qc-cossette': ['quebec'],
  'ford-f150-at-regional': ['atlantic'],
  'ford-dealer-spring-sales': ['ontario', 'alberta', 'bc', 'quebec', 'atlantic'],
  'ford-dealer-lightning-leads': ['ontario', 'alberta', 'bc', 'quebec'],
  'ford-dealer-suv-shoppers': ['ontario', 'alberta', 'bc'],
};

// Campaign → agency
const CAMPAIGN_TO_AGENCY: Record<string, string> = {
  'ford-lightning-launch-hero': 'mindshare',
  'ford-f150-built-tough': 'mindshare',
  'ford-mach-e-defense': 'mindshare',
  'ford-bronco-adventure-national': 'mindshare',
  'ford-explorer-family': 'mindshare',
  'ford-escape-phev-izev': 'mindshare',
  'ford-transit-fleet': 'mindshare',
  'ford-edge-mature': 'mindshare',
  'ford-brand-q2': 'mindshare',
  'ford-lightning-bc-regional': 'bc-regional',
  'ford-bronco-bc-regional': 'bc-regional',
  'ford-f150-bc-regional': 'bc-regional',
  'ford-lightning-on-regional': 'ontario-regional',
  'ford-f150-on-regional': 'ontario-regional',
  'ford-explorer-on-regional': 'ontario-regional',
  'ford-f150-ab-regional': 'alberta-regional',
  'ford-bronco-ab-regional': 'alberta-regional',
  'ford-f150-qc-cossette': 'cossette',
  'ford-escape-qc-cossette': 'cossette',
  'ford-f150-at-regional': 'atlantic-regional',
  'ford-dealer-spring-sales': 'dealer-network',
  'ford-dealer-lightning-leads': 'dealer-network',
  'ford-dealer-suv-shoppers': 'dealer-network',
};

const NODES: MolecularNode[] = [
  // Ring 0 — Nucleus
  { id: 'ford', label: 'FORD', ring: 0, angle: 0, color: RING_COLORS.nucleus, radius: 2.5, description: 'Ford Canada' },

  // Ring 1 — 3 tiers + 7 agencies = 10 nodes
  { id: 'tier-1', label: 'Tier 1', ring: 1, angle: 0,   color: RING_COLORS.org, radius: 1.4, description: 'Tier 1 — National / Brand', filterType: 'division', filterValue: 'tier-1' },
  { id: 'tier-2', label: 'Tier 2', ring: 1, angle: 120, color: RING_COLORS.org, radius: 1.4, description: 'Tier 2 — Regional / Dealer Associations', filterType: 'division', filterValue: 'tier-2' },
  { id: 'tier-3', label: 'Tier 3', ring: 1, angle: 240, color: RING_COLORS.org, radius: 1.4, description: 'Tier 3 — Local / Dealer', filterType: 'division', filterValue: 'tier-3' },
  { id: 'mindshare',         label: 'Mindshare',  ring: 1, angle: 36,  color: RING_COLORS.org, radius: 1.1, description: 'Mindshare / Initiative AOR (T1)', filterType: 'agency', filterValue: 'mindshare' },
  { id: 'cossette',          label: 'Cossette',   ring: 1, angle: 72,  color: RING_COLORS.org, radius: 1.1, description: 'Cossette — Quebec (T2)', filterType: 'agency', filterValue: 'cossette' },
  { id: 'bc-regional',       label: 'BC Reg.',    ring: 1, angle: 144, color: RING_COLORS.org, radius: 1.1, description: 'BC Regional (T2)', filterType: 'agency', filterValue: 'bc-regional' },
  { id: 'ontario-regional',  label: 'ON Reg.',    ring: 1, angle: 180, color: RING_COLORS.org, radius: 1.1, description: 'Ontario Regional (T2)', filterType: 'agency', filterValue: 'ontario-regional' },
  { id: 'alberta-regional',  label: 'AB Reg.',    ring: 1, angle: 216, color: RING_COLORS.org, radius: 1.1, description: 'Alberta Regional (T2)', filterType: 'agency', filterValue: 'alberta-regional' },
  { id: 'atlantic-regional', label: 'AT Reg.',    ring: 1, angle: 288, color: RING_COLORS.org, radius: 1.1, description: 'Atlantic Regional (T2)', filterType: 'agency', filterValue: 'atlantic-regional' },
  { id: 'dealer-network',    label: 'Dealer Net.',ring: 1, angle: 324, color: RING_COLORS.org, radius: 1.1, description: 'Dealer Network — aggregate (T3)', filterType: 'agency', filterValue: 'dealer-network' },

  // Ring 2 — 8 nameplates at 45° intervals
  { id: 'f150',        label: 'F-150',       ring: 2, angle: 0,   color: RING_COLORS.product, radius: 1.2, description: 'F-150 — flagship truck', filterType: 'productLine', filterValue: 'f150' },
  { id: 'lightning',   label: 'Lightning',   ring: 2, angle: 45,  color: RING_COLORS.product, radius: 1.2, description: 'F-150 Lightning — EV truck, active launch', filterType: 'productLine', filterValue: 'lightning' },
  { id: 'bronco',      label: 'Bronco',      ring: 2, angle: 90,  color: RING_COLORS.product, radius: 1.2, description: 'Bronco — lifestyle SUV', filterType: 'productLine', filterValue: 'bronco' },
  { id: 'explorer',    label: 'Explorer',    ring: 2, angle: 135, color: RING_COLORS.product, radius: 1.2, description: 'Explorer — family SUV', filterType: 'productLine', filterValue: 'explorer' },
  { id: 'mach-e',      label: 'Mach-E',      ring: 2, angle: 180, color: RING_COLORS.product, radius: 1.2, description: 'Mustang Mach-E — EV crossover', filterType: 'productLine', filterValue: 'mach-e' },
  { id: 'escape-phev', label: 'Escape PHEV', ring: 2, angle: 225, color: RING_COLORS.product, radius: 1.2, description: 'Escape PHEV — iZEV eligible', filterType: 'productLine', filterValue: 'escape-phev' },
  { id: 'transit',     label: 'Transit',     ring: 2, angle: 270, color: RING_COLORS.product, radius: 1.2, description: 'Transit — fleet/commercial', filterType: 'productLine', filterValue: 'transit' },
  { id: 'edge',        label: 'Edge',        ring: 2, angle: 315, color: RING_COLORS.product, radius: 1.2, description: 'Edge — mature crossover', filterType: 'productLine', filterValue: 'edge' },

  // Ring 3 — 10 audiences at 36° intervals
  { id: 'truck-intenders',      label: 'Truck Intend.', ring: 3, angle: 0,   color: RING_COLORS.audience, radius: 1.0, description: 'Truck Intenders', filterType: 'audience', filterValue: 'truck-intenders' },
  { id: 'ev-considerers',       label: 'EV Consid.',    ring: 3, angle: 36,  color: RING_COLORS.audience, radius: 1.0, description: 'EV Considerers', filterType: 'audience', filterValue: 'ev-considerers' },
  { id: 'phev-shoppers',        label: 'PHEV Shop.',    ring: 3, angle: 72,  color: RING_COLORS.audience, radius: 1.0, description: 'PHEV Shoppers', filterType: 'audience', filterValue: 'phev-shoppers' },
  { id: 'fleet-commercial',     label: 'Fleet/Comm.',   ring: 3, angle: 108, color: RING_COLORS.audience, radius: 1.0, description: 'Fleet & Commercial', filterType: 'audience', filterValue: 'fleet-commercial' },
  { id: 'adventure-lifestyle',  label: 'Adventure',     ring: 3, angle: 144, color: RING_COLORS.audience, radius: 1.0, description: 'Adventure Lifestyle', filterType: 'audience', filterValue: 'adventure-lifestyle' },
  { id: 'family-suv-shoppers',  label: 'Family SUV',    ring: 3, angle: 180, color: RING_COLORS.audience, radius: 1.0, description: 'Family SUV Cross-Shoppers', filterType: 'audience', filterValue: 'family-suv-shoppers' },
  { id: 'conquest-tesla',       label: 'Conq. Tesla',   ring: 3, angle: 216, color: RING_COLORS.audience, radius: 1.0, description: 'Conquest — Tesla', filterType: 'audience', filterValue: 'conquest-tesla' },
  { id: 'conquest-gm',          label: 'Conq. GM',      ring: 3, angle: 252, color: RING_COLORS.audience, radius: 1.0, description: 'Conquest — GM', filterType: 'audience', filterValue: 'conquest-gm' },
  { id: 'conquest-toyota',      label: 'Conq. Toyota',  ring: 3, angle: 288, color: RING_COLORS.audience, radius: 1.0, description: 'Conquest — Toyota', filterType: 'audience', filterValue: 'conquest-toyota' },
  { id: 'conquest-hyundai-kia', label: 'Conq. HK',      ring: 3, angle: 324, color: RING_COLORS.audience, radius: 1.0, description: 'Conquest — Hyundai/Kia', filterType: 'audience', filterValue: 'conquest-hyundai-kia' },

  // Ring 4 — 23 campaigns spread evenly
  ...CAMPAIGN_IDS.map((id, i) => ({
    id,
    label: CAMPAIGN_LABELS[id],
    ring: 4,
    angle: (360 / CAMPAIGN_IDS.length) * i,
    color: RING_COLORS.campaign,
    radius: 0.8,
    description: CAMPAIGN_LABELS[id],
    filterType: 'campaign' as const,
    filterValue: id,
  })),

  // Ring 5 — 9 channels + 3 funnel + 6 geos = 18 nodes
  { id: 'ch-instagram',     label: 'Instagram',     ring: 5, angle: 0,   color: RING_COLORS.exec, radius: 0.9, description: 'Instagram', filterType: 'channel', filterValue: 'instagram' },
  { id: 'ch-facebook',      label: 'Facebook',      ring: 5, angle: 20,  color: RING_COLORS.exec, radius: 0.9, description: 'Facebook', filterType: 'channel', filterValue: 'facebook' },
  { id: 'ch-tiktok',        label: 'TikTok',        ring: 5, angle: 40,  color: RING_COLORS.exec, radius: 0.9, description: 'TikTok', filterType: 'channel', filterValue: 'tiktok' },
  { id: 'ch-google-search', label: 'Google Search', ring: 5, angle: 60,  color: RING_COLORS.exec, radius: 0.9, description: 'Google Search', filterType: 'channel', filterValue: 'google-search' },
  { id: 'ch-ttd',           label: 'Trade Desk',    ring: 5, angle: 80,  color: RING_COLORS.exec, radius: 0.9, description: 'The Trade Desk', filterType: 'channel', filterValue: 'ttd' },
  { id: 'ch-ctv',           label: 'CTV',           ring: 5, angle: 100, color: RING_COLORS.exec, radius: 0.9, description: 'Connected TV', filterType: 'channel', filterValue: 'ctv' },
  { id: 'ch-spotify',       label: 'Spotify',       ring: 5, angle: 120, color: RING_COLORS.exec, radius: 0.9, description: 'Spotify', filterType: 'channel', filterValue: 'spotify' },
  { id: 'ch-linkedin',      label: 'LinkedIn',      ring: 5, angle: 140, color: RING_COLORS.exec, radius: 0.9, description: 'LinkedIn', filterType: 'channel', filterValue: 'linkedin' },
  { id: 'ch-ooh',           label: 'OOH',           ring: 5, angle: 160, color: RING_COLORS.exec, radius: 0.9, description: 'Out-of-Home', filterType: 'channel', filterValue: 'ooh' },
  { id: 'fn-awareness',     label: 'Awareness',     ring: 5, angle: 195, color: RING_COLORS.exec, radius: 0.9, description: 'Awareness Objective', filterType: 'funnel', filterValue: 'awareness' },
  { id: 'fn-consideration', label: 'Consideration', ring: 5, angle: 220, color: RING_COLORS.exec, radius: 0.9, description: 'Consideration Objective', filterType: 'funnel', filterValue: 'consideration' },
  { id: 'fn-conversion',    label: 'Conversion',    ring: 5, angle: 245, color: RING_COLORS.exec, radius: 0.9, description: 'Conversion Objective', filterType: 'funnel', filterValue: 'conversion' },
  { id: 'geo-national',     label: 'National',      ring: 5, angle: 275, color: RING_COLORS.exec, radius: 0.9, description: 'National', filterType: 'geo', filterValue: 'national' },
  { id: 'geo-bc',           label: 'BC',            ring: 5, angle: 290, color: RING_COLORS.exec, radius: 0.9, description: 'British Columbia', filterType: 'geo', filterValue: 'bc' },
  { id: 'geo-alberta',      label: 'Alberta',       ring: 5, angle: 305, color: RING_COLORS.exec, radius: 0.9, description: 'Alberta', filterType: 'geo', filterValue: 'alberta' },
  { id: 'geo-ontario',      label: 'Ontario',       ring: 5, angle: 320, color: RING_COLORS.exec, radius: 0.9, description: 'Ontario', filterType: 'geo', filterValue: 'ontario' },
  { id: 'geo-quebec',       label: 'Quebec',        ring: 5, angle: 335, color: RING_COLORS.exec, radius: 0.9, description: 'Quebec', filterType: 'geo', filterValue: 'quebec' },
  { id: 'geo-atlantic',     label: 'Atlantic',      ring: 5, angle: 350, color: RING_COLORS.exec, radius: 0.9, description: 'Atlantic', filterType: 'geo', filterValue: 'atlantic' },
];

// ===== Bond Definitions =====

const TIER_AGENCIES: Record<string, string[]> = {
  'tier-1': ['mindshare'],
  'tier-2': ['cossette', 'bc-regional', 'ontario-regional', 'alberta-regional', 'atlantic-regional'],
  'tier-3': ['dealer-network'],
};

// Channel id → ring 5 node id
const CHANNEL_NODE = (c: string) => `ch-${c}`;
const FUNNEL_NODE = (f: string) => `fn-${f}`;
const GEO_NODE = (g: string) => `geo-${g}`;

const BONDS: MolecularBond[] = [
  // Ring 0 → Ring 1: Ford to all tiers + agencies
  ...['tier-1', 'tier-2', 'tier-3', 'mindshare', 'cossette', 'bc-regional', 'ontario-regional', 'alberta-regional', 'atlantic-regional', 'dealer-network'].map(t => ({ source: 'ford', target: t })),

  // Ring 1 (Tier) → Ring 1 (Agency)
  ...Object.entries(TIER_AGENCIES).flatMap(([tier, agencies]) => agencies.map(a => ({ source: tier, target: a }))),

  // Ring 1 (Agency) → Ring 2 (Nameplate) — derived from campaigns
  ...(() => {
    const seen = new Set<string>();
    const out: MolecularBond[] = [];
    for (const cid of CAMPAIGN_IDS) {
      const agency = CAMPAIGN_TO_AGENCY[cid];
      const nameplate = CAMPAIGN_TO_NAMEPLATE[cid];
      const key = `${agency}|${nameplate}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ source: agency, target: nameplate });
    }
    return out;
  })(),

  // Ring 2 (Nameplate) → Ring 3 (Audience) — derived from campaigns
  ...(() => {
    const seen = new Set<string>();
    const out: MolecularBond[] = [];
    for (const cid of CAMPAIGN_IDS) {
      const nameplate = CAMPAIGN_TO_NAMEPLATE[cid];
      for (const aud of CAMPAIGN_TO_AUDIENCES[cid]) {
        const key = `${nameplate}|${aud}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ source: nameplate, target: aud });
      }
    }
    return out;
  })(),

  // Ring 3 (Audience) → Ring 4 (Campaign)
  ...CAMPAIGN_IDS.flatMap(cid =>
    CAMPAIGN_TO_AUDIENCES[cid].map(aud => ({ source: aud, target: cid }))
  ),

  // Ring 4 (Campaign) → Ring 5 (Channel)
  ...CAMPAIGN_IDS.flatMap(cid =>
    CAMPAIGN_TO_CHANNELS[cid].map(ch => ({ source: cid, target: CHANNEL_NODE(ch) }))
  ),

  // Ring 4 (Campaign) → Ring 5 (Funnel objective)
  ...CAMPAIGN_IDS.map(cid => ({ source: cid, target: FUNNEL_NODE(CAMPAIGN_TO_OBJECTIVE[cid]) })),

  // Ring 4 (Campaign) → Ring 5 (Geo)
  ...CAMPAIGN_IDS.flatMap(cid =>
    CAMPAIGN_TO_GEOS[cid].map(g => ({ source: cid, target: GEO_NODE(g) }))
  ),
];

// ===== Exports =====

export const MOLECULAR_NODES = NODES;
export const MOLECULAR_BONDS = BONDS;

computeBasePositions(NODES);

// Build adjacency maps for fast lookup.
// Bonds are directional: source = closer to nucleus (parent), target = further (child).
// Same-ring bonds (e.g., tier → agency) are honored via this directional structure
// rather than ring-comparison, so clicking Tier 1 propagates outward through agencies
// to nameplates / audiences / campaigns / channels.
const nodeMap = new Map<string, MolecularNode>();
for (const n of NODES) nodeMap.set(n.id, n);

const childrenMap = new Map<string, Set<string>>();
const parentsMap = new Map<string, Set<string>>();
for (const b of BONDS) {
  if (!childrenMap.has(b.source)) childrenMap.set(b.source, new Set());
  if (!parentsMap.has(b.target)) parentsMap.set(b.target, new Set());
  childrenMap.get(b.source)!.add(b.target);
  parentsMap.get(b.target)!.add(b.source);
}

function bondKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function getNode(id: string): MolecularNode | undefined {
  return nodeMap.get(id);
}

export function traceLineage(
  selectedIds: Set<string>,
  nodes: MolecularNode[] = NODES,
  bonds: MolecularBond[] = BONDS,
): { litNodes: Set<string>; litBonds: Set<string> } {
  if (selectedIds.size === 0) return { litNodes: new Set(), litBonds: new Set() };

  const selectionsByRing = new Map<number, string[]>();
  for (const id of selectedIds) {
    const node = nodeMap.get(id);
    if (!node) continue;
    if (!selectionsByRing.has(node.ring)) selectionsByRing.set(node.ring, []);
    selectionsByRing.get(node.ring)!.push(id);
  }

  function traceDirection(startId: string, direction: 'upstream' | 'downstream'): { nodes: Set<string>; bonds: Set<string> } {
    const visited = new Set<string>();
    const visitedBonds = new Set<string>();
    const queue = [startId];
    visited.add(startId);

    const map = direction === 'downstream' ? childrenMap : parentsMap;

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = map.get(current);
      if (!neighbors) continue;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          visitedBonds.add(bondKey(current, neighbor));
          queue.push(neighbor);
        }
      }
    }
    return { nodes: visited, bonds: visitedBonds };
  }

  const allLitNodes = new Set<string>();
  const allLitBonds = new Set<string>();

  // Upstream: always union
  for (const id of selectedIds) {
    const upstream = traceDirection(id, 'upstream');
    for (const n of upstream.nodes) allLitNodes.add(n);
    for (const b of upstream.bonds) allLitBonds.add(b);
  }

  // Downstream: AND across rings, OR within same ring
  const rings = Array.from(selectionsByRing.keys()).sort((a, b) => a - b);
  let downstreamNodeSets: Set<string>[] | null = null;
  let downstreamBondSets: Set<string>[] | null = null;

  for (const ring of rings) {
    const idsInRing = selectionsByRing.get(ring)!;
    const ringNodes = new Set<string>();
    const ringBonds = new Set<string>();
    for (const id of idsInRing) {
      const downstream = traceDirection(id, 'downstream');
      for (const n of downstream.nodes) ringNodes.add(n);
      for (const b of downstream.bonds) ringBonds.add(b);
    }

    if (downstreamNodeSets === null) {
      downstreamNodeSets = [ringNodes];
      downstreamBondSets = [ringBonds];
    } else {
      downstreamNodeSets.push(ringNodes);
      downstreamBondSets!.push(ringBonds);
    }
  }

  if (downstreamNodeSets && downstreamNodeSets.length > 0) {
    let intersectedNodes = downstreamNodeSets[0];
    for (let i = 1; i < downstreamNodeSets.length; i++) {
      const next = downstreamNodeSets[i];
      intersectedNodes = new Set([...intersectedNodes].filter(n => next.has(n)));
    }
    for (const n of intersectedNodes) allLitNodes.add(n);

    for (const bondSet of downstreamBondSets!) {
      for (const bk of bondSet) {
        const [a, b] = bk.split('|');
        if (allLitNodes.has(a) && allLitNodes.has(b)) {
          allLitBonds.add(bk);
        }
      }
    }
  }

  for (const id of selectedIds) allLitNodes.add(id);

  return { litNodes: allLitNodes, litBonds: allLitBonds };
}
