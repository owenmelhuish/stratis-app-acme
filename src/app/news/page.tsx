"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { generateAllData } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, X, Sparkles, AlertTriangle, TrendingUp, Shield, Target, ArrowRight, ExternalLink, Bookmark, Share2 } from 'lucide-react';
import { type NewsItem, type NewsTag } from '@/types';
import { cn } from '@/lib/utils';

// ─── Section definitions ────────────────────────────────────────────────────

interface FeedSection {
  id: string;
  title: string;
  sources: string[];
  filterFn: (item: { tags: NewsTag[]; competitor?: string }) => boolean;
}

// Section order matters: items go to first matching section (dedupe via used.add).
// Ford-first display: Ford EV & Nameplate Launch leads; competitor watches sit at
// the bottom. Every non-competitor section excludes competitor-tagged items, so
// competitor stories always fall through to their own watch at the end.
const FEED_SECTIONS: FeedSection[] = [
  {
    id: "ev",
    title: "Ford EV & Nameplate Launch",
    sources: ["Electrek", "InsideEVs", "Driving.ca EV", "Automotive News Canada"],
    filterFn: (item) =>
      (item.tags.includes("ev") || item.tags.includes("launch")) &&
      !(item as { competitor?: string }).competitor &&
      !item.tags.includes("partnerships"),
  },
  {
    id: "izev",
    title: "iZEV & Federal / Provincial Policy",
    sources: ["Transport Canada", "BNN Bloomberg", "Globe and Mail", "CBC News"],
    filterFn: (item) =>
      item.tags.includes("izev") &&
      !(item as { competitor?: string }).competitor,
  },
  {
    id: "partnerships",
    title: "Corporate Partnerships & Strategic Alliances",
    sources: ["Reuters", "Bloomberg", "TechCrunch", "Globe and Mail"],
    filterFn: (item) =>
      item.tags.includes("partnerships") &&
      !(item as { competitor?: string }).competitor,
  },
  {
    id: "sports",
    title: "Sports, Events & Sponsorships",
    sources: ["TSN", "Sportsnet", "AdAge", "Marketing Magazine"],
    filterFn: (item) =>
      (item.tags.includes("sports") || item.tags.includes("sponsorships")) &&
      !item.tags.includes("partnerships") &&
      !(item as { competitor?: string }).competitor,
  },
  {
    id: "brand",
    title: "Brand & Corporate Narrative",
    sources: ["AdAge", "Marketing Magazine", "Strategy Online", "Globe and Mail"],
    filterFn: (item) =>
      item.tags.includes("brand") &&
      !(item as { competitor?: string }).competitor &&
      !item.tags.includes("partnerships"),
  },
  {
    id: "social",
    title: "Social & Cultural Signals",
    sources: ["Reddit r/cars", "Reddit r/electricvehicles", "TikTok #CarTok", "Reddit r/Ford"],
    filterFn: (item) =>
      item.tags.includes("social") &&
      !(item as { competitor?: string }).competitor,
  },
  {
    id: "automotive",
    title: "Automotive Industry & Market Data",
    sources: ["Automotive News Canada", "Driving.ca", "AutoTrader Insights", "MotorTrend"],
    filterFn: (item) =>
      item.tags.includes("automotive") &&
      !(item as { competitor?: string }).competitor,
  },
  {
    id: "macro",
    title: "Macro Consumer & Economic Environment",
    sources: ["Statistics Canada", "Bank of Canada", "Globe and Mail", "BNN Bloomberg"],
    filterFn: (item) =>
      item.tags.includes("macro") &&
      !(item as { competitor?: string }).competitor,
  },
  // ── Competitor watches (moved to the bottom) ──
  {
    id: "tesla",
    title: "Tesla Watch — Cybertruck, Model Y, Charging Network",
    sources: ["Reuters Canada", "Electrek", "Bloomberg", "Driving.ca"],
    filterFn: (item) => (item as { competitor?: string }).competitor === "Tesla",
  },
  {
    id: "gm",
    title: "GM Watch — Silverado EV, Equinox, Cadillac Lyriq",
    sources: ["Automotive News Canada", "Reuters", "Bloomberg", "Driving.ca"],
    filterFn: (item) => ["GM", "Chevrolet", "Cadillac"].includes((item as { competitor?: string }).competitor ?? ""),
  },
  {
    id: "stellantis",
    title: "Stellantis Watch — Ram, Jeep, Dodge, Chrysler",
    sources: ["Automotive News Canada", "Driving.ca", "Bloomberg", "Reuters"],
    filterFn: (item) => ["Stellantis", "Ram", "Jeep", "Dodge", "Chrysler"].includes((item as { competitor?: string }).competitor ?? ""),
  },
  {
    id: "toyota",
    title: "Toyota Watch — RAV4 Prime, Tacoma, Crown",
    sources: ["Driving.ca", "Automotive News Canada", "Reuters", "Globe and Mail"],
    filterFn: (item) => ["Toyota", "Lexus"].includes((item as { competitor?: string }).competitor ?? ""),
  },
  {
    id: "hyundai-kia",
    title: "Hyundai/Kia Watch — Ioniq, EV6/EV9, Genesis",
    sources: ["Driving.ca", "Automotive News Canada", "Electrek", "InsideEVs"],
    filterFn: (item) => ["Hyundai", "Kia", "Genesis"].includes((item as { competitor?: string }).competitor ?? ""),
  },
  {
    id: "honda",
    title: "Honda Watch — CR-V, Prologue, Alliston Plant",
    sources: ["Driving.ca", "Automotive News Canada", "Reuters", "Globe and Mail"],
    filterFn: (item) => ["Honda", "Acura"].includes((item as { competitor?: string }).competitor ?? ""),
  },
  {
    id: "european-luxury",
    title: "European Luxury Watch — BMW, Mercedes-Benz, Audi, Land Rover",
    sources: ["Automotive News Canada", "Driving.ca Luxury", "Globe and Mail Auto", "Bloomberg"],
    filterFn: (item) => ["BMW", "Mercedes-Benz", "Audi", "Land Rover", "Porsche", "Volvo", "Jaguar"].includes((item as { competitor?: string }).competitor ?? ""),
  },
];

// ─── Article image picker (verified real Unsplash photos) ─────────────────────
//
// All photo IDs in this list have been individually verified to depict their
// claimed subject. The verification process: fetch the image, view it, confirm
// the contents match the category before adding the ID here.

// Verified Unsplash photo IDs by category.
// Each ID was fetched and visually confirmed to depict its subject.
const PHOTOS = {
  // Ford F-150 / pickup trucks
  f150Raptor:    "photo-1605893477799-b99e3b8b93fe", // gray Ford F-150 Raptor
  f150Blue:      "photo-1551830820-330a71b99659",   // blue Ford F-150 at sunset
  // F-150 Lightning / EV pickup
  evTruckForest: "photo-1772631086016-f56e1dde7380", // green EV pickup in forest
  // Tesla Cybertruck
  cybertruckBlack: "photo-1727994527246-68e26082d0fd", // matte black Cybertruck
  cybertruckSilver:"photo-1716304960614-67625112f271", // silver Cybertruck
  // Mustang / performance
  mustangClassic: "photo-1591293835940-934a7c4f2d9b", // white classic Ford Mustang
  raceCar:        "photo-1555532686-d0fccaccadcf",   // race car (McLaren-style) at night
  // EV crossover (works for Mach-E, generic EV crossover)
  evCrossover:    "photo-1707341597123-c53bbb7e7f93", // orange Nissan Ariya at EVgo charger
  // Honda / family SUV
  hondaCrv:       "photo-1681697390363-1142eb46b76d", // Honda CR-V rear at sunset
  // Off-road / Bronco / Wrangler
  offroadJeep:    "photo-1671967664667-5c21b344dec4", // blue Jeep CJ off-road in forest
  toyotaTruckClassic: "photo-1666846865666-d2d2525c3613", // classic Toyota truck grille
  // Commercial / fleet
  deliveryVan:    "premium_photo-1661907153090-93759d68acb1", // delivery van w/ boxes
  // Charging
  chargingPort:   "photo-1593941707874-ef25b8b4a92b", // EV charging port close-up
  // Industrial / plant
  factoryFloor:   "photo-1567789884554-0b844b597180", // car factory w/ robotic arms
  batteryCells:   "photo-1619641805634-b867f535071c", // colorful battery cells
  // Corporate / business
  officeRoom:     "photo-1497366811353-6870744d04b2", // modern office workspace
  driverView:     "photo-1484373030460-8de45ac8796d", // driver POV from inside car
  // Financial
  financialChart: "photo-1611974789855-9c2a0a7236a3", // candlestick chart red/green
  // Sports / awards
  trophy:         "photo-1578269174936-2709b6aeb913", // golden trophy
  stadium:        "photo-1522778119026-d647f0596c20", // soccer stadium with crowd
  // Policy / government
  govBuilding:    "photo-1591348207848-ac4ee215a0c4", // government building w/ clock tower
  // Macro
  fuelPump:       "photo-1644246905181-c3753e9a82bd", // hand at fuel pump
} as const;

function unsplashUrl(photoId: string, w: number, h: number): string {
  const base = photoId.startsWith("premium_photo-")
    ? "https://plus.unsplash.com/"
    : "https://images.unsplash.com/";
  return `${base}${photoId}?w=${w}&h=${h}&fit=crop&auto=format&q=70`;
}

// Map an article to a verified photo. Order matters — most-specific patterns first.
function pickArticlePhoto(item: NewsItem): string {
  const title = item.title;
  const c = item.competitor;

  // ═══ Tesla ═══
  // Context-specific (event-type) matches MUST run before vehicle-name matches
  // so a headline mentioning "Cybertruck" in passing doesn't override an
  // earnings/layoffs/insurance story.
  if (c === "Tesla") {
    if (/Q1 Earnings|Earnings Miss|Q4 Earnings|Quarterly Earnings|Earnings/i.test(title)) return PHOTOS.financialChart;
    if (/Marketing Headcount|Marketing Layoff|Cuts.*Marketing|\bLayoff/i.test(title)) return PHOTOS.officeRoom;
    if (/Insurance/i.test(title)) return PHOTOS.officeRoom;
    if (/Service Center|Wait Time/i.test(title)) return PHOTOS.officeRoom;
    if (/Supercharger|Charging Network/i.test(title)) return PHOTOS.chargingPort;
    if (/Elon Musk|Musk.*Backlash|Sentiment Shift/i.test(title)) return PHOTOS.officeRoom;
    if (/Roadster/i.test(title)) return PHOTOS.raceCar;
    if (/Cybertruck/i.test(title)) return PHOTOS.cybertruckBlack;
    if (/Model Y|Model 3|Model S/i.test(title)) return PHOTOS.cybertruckSilver;
    return PHOTOS.cybertruckBlack;
  }

  // ═══ GM / Chevrolet / Cadillac ═══
  if (c === "GM" || c === "Chevrolet" || c === "Cadillac") {
    if (/Earnings|Quarterly Results/i.test(title)) return PHOTOS.financialChart;
    if (/Cruise.*Layoff|Autonomous.*Investment Pulled|\bLayoff/i.test(title)) return PHOTOS.officeRoom;
    if (/Ultium|Battery Plant|Ingersoll/i.test(title)) return PHOTOS.batteryCells;
    if (/Plant.*Production|Plant.*Transition/i.test(title)) return PHOTOS.factoryFloor;
    if (/Brightdrop|EV600|Fleet Pilot/i.test(title)) return PHOTOS.deliveryVan;
    if (/Bolt EUV|Sub-Compact|Entry-Level/i.test(title)) return PHOTOS.evCrossover;
    if (/Lyriq|Equinox EV/i.test(title)) return PHOTOS.evCrossover;
    if (/Silverado|Sierra/i.test(title)) return PHOTOS.f150Raptor;
    return PHOTOS.f150Blue;
  }

  // ═══ Stellantis / Ram / Jeep / Dodge / Chrysler ═══
  if (c === "Stellantis" || c === "Ram" || c === "Jeep" || c === "Dodge" || c === "Chrysler") {
    if (/Earnings|Quarterly Results/i.test(title)) return PHOTOS.financialChart;
    if (/Windsor.*Plant|Plant.*Transition|Plant.*EV|Halcyon|Recon EV/i.test(title)) return PHOTOS.factoryFloor;
    if (/ProMaster|Cargo Van/i.test(title)) return PHOTOS.deliveryVan;
    if (/Charger.*Daytona|Daytona EV/i.test(title)) return PHOTOS.raceCar;
    if (/Wrangler|4xe|Off-Road/i.test(title)) return PHOTOS.offroadJeep;
    if (/Ram 1500 REV|Ram REV/i.test(title)) return PHOTOS.evTruckForest;
    return PHOTOS.offroadJeep;
  }

  // ═══ Toyota / Lexus ═══
  if (c === "Toyota" || c === "Lexus") {
    if (/Earnings|Quarterly Results/i.test(title)) return PHOTOS.financialChart;
    if (/Cambridge.*Plant|Plant.*Production|Production Reaches/i.test(title)) return PHOTOS.factoryFloor;
    if (/Wins.*Best|Award|Best.*PHEV/i.test(title)) return PHOTOS.trophy;
    if (/Tacoma/i.test(title)) return PHOTOS.toyotaTruckClassic;
    if (/Crown Signia|Crown/i.test(title)) return PHOTOS.hondaCrv;
    if (/bZ4X/i.test(title)) return PHOTOS.evCrossover;
    if (/RAV4 Prime|RAV4/i.test(title)) return PHOTOS.hondaCrv;
    return PHOTOS.toyotaTruckClassic;
  }

  // ═══ Hyundai / Kia / Genesis ═══
  if (c === "Hyundai" || c === "Kia" || c === "Genesis") {
    if (/Earnings|Quarterly Results/i.test(title)) return PHOTOS.financialChart;
    if (/Pricing Drop|Price Reduction|Aggressive.*Move/i.test(title)) return PHOTOS.financialChart;
    if (/Santa Cruz|Crossover Pickup/i.test(title)) return PHOTOS.f150Blue;
    if (/EV9|7-Seat/i.test(title)) return PHOTOS.evCrossover;
    if (/EV6 GT|EV6/i.test(title)) return PHOTOS.evCrossover;
    if (/Genesis GV60|GV60/i.test(title)) return PHOTOS.evCrossover;
    if (/Ioniq/i.test(title)) return PHOTOS.evCrossover;
    return PHOTOS.evCrossover;
  }

  // ═══ Honda / Acura ═══
  if (c === "Honda" || c === "Acura") {
    if (/Earnings|Quarterly Results/i.test(title)) return PHOTOS.financialChart;
    if (/Alliston.*Plant|Plant.*Transition|Plant.*EV/i.test(title)) return PHOTOS.factoryFloor;
    if (/Loyalty Numbers|Q1 Sales/i.test(title)) return PHOTOS.financialChart;
    if (/Prologue/i.test(title)) return PHOTOS.evCrossover;
    if (/CR-V|Hybrid/i.test(title)) return PHOTOS.hondaCrv;
    return PHOTOS.hondaCrv;
  }

  // ═══ Ford EV / Lightning ═══
  if (/Lightning.*Launch|Lightning Pre.Order|Lightning Wins|Lightning.*Test|Lightning.*Pro|Lightning Towing|F-150 Lightning|Black Book Truck/i.test(title)) {
    return PHOTOS.evTruckForest;
  }

  // ═══ Ford F-150 (Built Tough, master brand, etc.) ═══
  if (/Built Ford Tough|F-150 Built|F-150.*Sales Leader|F-150 Anniversary|F-150 Surpasses|F-150 Series|F-150 Master/i.test(title)) {
    return PHOTOS.f150Raptor;
  }

  // ═══ Mach-E ═══
  if (/Mach-?E|Mustang Mach/i.test(title)) {
    return PHOTOS.evCrossover;
  }

  // ═══ Mustang (heritage) ═══
  if (/Mustang.*Heritage|Mustang.*Anniversary|Mustang 60th|Mustang Coyote/i.test(title)) {
    return PHOTOS.mustangClassic;
  }

  // ═══ Bronco ═══
  if (/Bronco|BroncoLife|Adventure Lifestyle|Off.Road Series/i.test(title)) {
    return PHOTOS.offroadJeep;
  }

  // ═══ Escape PHEV ═══
  if (/Escape PHEV|PHEV.*Sales|PHEV.*Interest|Escape.*iZEV/i.test(title)) {
    return PHOTOS.hondaCrv;
  }

  // ═══ Explorer ═══
  if (/Explorer|Family SUV|Cross.Shopper/i.test(title)) {
    return PHOTOS.hondaCrv;
  }

  // ═══ Transit / Ford Pro / Fleet ═══
  if (/Transit|Ford Pro|Commercial Van|Fleet.*Lead/i.test(title)) {
    return PHOTOS.deliveryVan;
  }

  // ═══ Edge ═══
  if (/\bEdge\b/i.test(title)) {
    return PHOTOS.hondaCrv;
  }

  // ═══ Partnerships ═══
  if (/BlueOval|SK On|Battery Plant|Critical Minerals/i.test(title)) return PHOTOS.batteryCells;
  if (/Suncor|Petro-Canada|Charging.*Station|Ford Pro Charging/i.test(title)) return PHOTOS.chargingPort;
  if (/CarPlay|Sync 4|Google Cloud|Microsoft.*AI|Ford Pro Telematics/i.test(title)) return PHOTOS.officeRoom;
  if (/ADT|Theft Prevention/i.test(title)) return PHOTOS.officeRoom;

  // ═══ Policy ═══
  if (/iZEV|Roulez Vert|ZEV Mandate|Transport Canada|Provincial.*Subsidy|Ontario.*EV.*Subsidy/i.test(title)) {
    return PHOTOS.govBuilding;
  }

  // ═══ Awards ═══
  if (/Truck of the Year|JD Power|Initial Quality Study|Black Book|Marketing.*Award|TV Spot Wins|Award/i.test(title)) {
    return PHOTOS.trophy;
  }

  // ═══ Financials ═══
  if (/Q1 Financial Results|Record Revenue|Q1 Earnings|Earnings|Financial Results|Auto Loan|Delinquency|Wholesale Index|Bank of Canada|Rate.*Hold/i.test(title)) {
    return PHOTOS.financialChart;
  }

  // ═══ Gas / fuel ═══
  if (/Gas.*Price|Gasoline|Fuel.*Price|\$1\.65/i.test(title)) {
    return PHOTOS.fuelPump;
  }

  // ═══ Sports / sponsorship ═══
  if (/CFL|Football|Stadium|Game.Day/i.test(title)) {
    return PHOTOS.stadium;
  }
  if (/Motorsport|Performance Cup|Race Series|Endurance Race|Canadian Tire Motorsport/i.test(title)) {
    return PHOTOS.raceCar;
  }
  if (/Built Ford Tough Series|Construction.*Trades/i.test(title)) {
    return PHOTOS.factoryFloor;
  }

  // ═══ Brand / corporate ═══
  if (/Ford CEO|CEO.*Visit|Dealer Council/i.test(title)) return PHOTOS.officeRoom;
  if (/Oakville|Windsor Plant|Jobs Report|Stable Employment|Plant.*Hiring/i.test(title)) return PHOTOS.factoryFloor;
  if (/Ford Pro.*Brand|Ford Pro Commercial Brand/i.test(title)) return PHOTOS.deliveryVan;

  // ═══ Social ═══
  if (/Reddit|r\/Ford|r\/electricvehicles|Mega.?Thread/i.test(title)) return PHOTOS.officeRoom;
  if (/TikTok|#Lightning|#Bronco|240M Views|80M Views/i.test(title)) return PHOTOS.driverView;
  if (/Twitter|X.*Sentiment|Twitter\/X/i.test(title)) return PHOTOS.officeRoom;

  // ═══ Theft / security ═══
  if (/Vehicle Theft|F-Series.*Theft|Theft Crisis/i.test(title)) {
    return PHOTOS.f150Raptor;
  }

  // ═══ AutoTrader / market data ═══
  if (/AutoTrader|Search Trends|Consumer Searches/i.test(title)) {
    return PHOTOS.financialChart;
  }

  // ═══ Ford Motor Credit ═══
  if (/Ford Motor Credit|Financing/i.test(title)) {
    return PHOTOS.financialChart;
  }

  // ═══ Fallback by primary tag ═══
  const tag = item.tags[0];
  if (tag === "ev" || tag === "launch") return PHOTOS.evTruckForest;
  if (tag === "izev") return PHOTOS.govBuilding;
  if (tag === "partnerships") return PHOTOS.batteryCells;
  if (tag === "sports" || tag === "sponsorships") return PHOTOS.stadium;
  if (tag === "macro") return PHOTOS.financialChart;
  if (tag === "social") return PHOTOS.officeRoom;
  if (tag === "automotive") return PHOTOS.factoryFloor;
  if (tag === "brand") return PHOTOS.officeRoom;
  if (tag === "competitors") return PHOTOS.cybertruckBlack;

  return PHOTOS.driverView; // ultimate fallback — neutral driving view
}

// Relevance-ranked candidate photos for an article. [0] is the best match (same
// as pickArticlePhoto); the rest are progressively-broader still-relevant options
// followed by a variety tail spanning the whole library — so the render-time
// de-dupe can fall back to the next-most-relevant photo when the best one is
// already used by another article in the feed.
function candidatePhotos(item: NewsItem): string[] {
  const P = PHOTOS;
  const t = item.title;
  const out: string[] = [pickArticlePhoto(item)];
  const add = (...ids: string[]) => out.push(...ids);

  if (/Award|Wins|Truck of the Year|Black Book|JD Power|Initial Quality|Best /i.test(t)) add(P.trophy);
  if (/Charging|Supercharger|Petro-Canada|Suncor|Charge Network/i.test(t)) add(P.chargingPort);
  if (/Battery|BlueOval|SK On|Ultium|Critical Minerals|Cells/i.test(t)) add(P.batteryCells);
  if (/Plant|Factory|Oakville|Windsor|Alliston|Cambridge|Production|Jobs|Hiring|Manufacturing/i.test(t)) add(P.factoryFloor);
  if (/Reddit|TikTok|Twitter|r\/|Megathread|Sentiment|Viral|Views/i.test(t)) add(P.driverView, P.officeRoom);
  if (/CFL|Football|Stadium|Game.?Day/i.test(t)) add(P.stadium);
  if (/Motorsport|Endurance|Performance Cup|Race Series/i.test(t)) add(P.raceCar);
  if (/Earnings|Revenue|Loan|Rate|Credit|Delinquency|Financial|Wholesale|Sales Up/i.test(t)) add(P.financialChart);
  if (/Gas|Fuel|Gasoline|\$1\.65/i.test(t)) add(P.fuelPump);
  if (/iZEV|Policy|ZEV Mandate|Transport Canada|Federal|Provincial|Luxury Tax|Tax Threshold/i.test(t)) add(P.govBuilding);
  if (/Lightning|Electric|\bEV\b/i.test(t)) add(P.evTruckForest, P.chargingPort, P.evCrossover);
  if (/F-150|Pickup|Truck/i.test(t)) add(P.f150Raptor, P.f150Blue);
  if (/Mach-?E|Crossover/i.test(t)) add(P.evCrossover);
  if (/Bronco|Off.Road|Adventure|Wrangler/i.test(t)) add(P.offroadJeep);
  if (/Transit|\bVan\b|Fleet|Commercial|Ford Pro/i.test(t)) add(P.deliveryVan);
  if (/Mustang/i.test(t)) add(P.mustangClassic, P.raceCar);
  if (/CarPlay|Sync 4|Google|Microsoft|\bAI\b|Telematics|ADT|Cloud/i.test(t)) add(P.officeRoom, P.driverView);
  if (/Escape|CR-V|Explorer|\bEdge\b|RAV4|Family SUV/i.test(t)) add(P.hondaCrv, P.evCrossover);

  // variety tail — broad coverage so the list spans the whole photo library
  add(P.driverView, P.officeRoom, P.financialChart, P.factoryFloor, P.evCrossover,
      P.f150Blue, P.chargingPort, P.batteryCells, P.hondaCrv, P.deliveryVan,
      P.govBuilding, P.trophy, P.stadium, P.fuelPump, P.offroadJeep, P.raceCar,
      P.mustangClassic, P.f150Raptor, P.evTruckForest, P.toyotaTruckClassic,
      P.cybertruckSilver, P.cybertruckBlack);

  return Array.from(new Set(out));
}

function articleImageUrl(photoId: string): string {
  return unsplashUrl(photoId, 640, 400);
}

function articleImageUrlLarge(photoId: string): string {
  return unsplashUrl(photoId, 1200, 500);
}
// ─── AI Insight generator (deterministic from article) ──────────────────────

const TAG_LABELS: Record<NewsTag, string> = {
  brand: "Brand & Corporate",
  automotive: "Automotive Industry",
  ev: "EV Market",
  launch: "Nameplate Launch",
  izev: "iZEV / Federal Policy",
  social: "Social & Cultural",
  sports: "Sports & Events",
  sponsorships: "Sponsorships",
  partnerships: "Corporate Partnership",
  competitors: "Competitor Watch",
  macro: "Macro Environment",
};

function generateInsight(item: NewsItem): { impact: string; actions: Array<{ icon: React.ComponentType<{ className?: string }>; title: string; description: string }> } {
  const tag = item.tags[0];

  if (tag === "competitors") {
    return {
      impact: "Competitor activity from Tesla, GM, Stellantis, Toyota, Hyundai/Kia, and Honda directly affects Ford Canada's market position, share-of-voice, and dealer leads. Pricing moves, launches, and creative campaigns from these competitors signal where pressure is intensifying — and where Ford has an opportunity to differentiate, defend, or conquest.",
      actions: [
        { icon: TrendingUp, title: "Assess Competitive Threat Level", description: "Evaluate whether this competitor move targets a nameplate, segment, or region where Ford has meaningful share. Determine if it requires a defensive response, conquest activation, or whether existing positioning is sufficient." },
        { icon: Target, title: "Monitor SOV and Consideration Impact", description: "Track whether this competitor move shifts share-of-voice, branded search volume, or dealer lead pacing in overlapping segments. Digital engagement data shows impact faster than brand tracking studies." },
        { icon: Shield, title: "Activate Conquest Audiences", description: "Where Ford has structural advantages (lounges of the Ford ecosystem, Ford Motor Credit, dealer network density), surface them. Layer Conquest — Tesla / GM / Toyota / Hyundai-Kia audiences in defensive media plans." },
      ],
    };
  }
  if (tag === "ev" || tag === "launch") {
    return {
      impact: "EV adoption and nameplate launches reshape Ford's competitive positioning faster than any other category. Lightning launch pacing, Mach-E refresh moves, Escape PHEV demand, and competitor EV pricing all sit in this stream. Acting within the launch window — not after — is where STRATIS unlocks meaningful upside.",
      actions: [
        { icon: TrendingUp, title: "Align Media Weight to Launch Pacing", description: "If Lightning launch signals are converging positively, surge Tier 1 CTV and Search. If a competitor EV is closing on Mach-E or Escape PHEV, activate defense weight before consideration share erodes." },
        { icon: Target, title: "Surface Conquest Opportunities", description: "EV market moves often expose conquest openings — buyers who would have chosen a competitor are now persuadable. Build creative that names the comparison and lean into Ford's iZEV-eligible value position." },
        { icon: Shield, title: "Coordinate with Dealer Co-op", description: "Launch and EV moments are won at the close-of-funnel. Ensure dealer co-op messaging, financing offers via Ford Motor Credit, and corporate-tier creative are coordinated across the launch window." },
      ],
    };
  }
  if (tag === "izev") {
    return {
      impact: "iZEV federal program changes directly shape EV consideration and the net price math for Lightning, Mach-E, and Escape PHEV. Tier eligibility shifts, rebate amounts, and program extensions all flow through to dealer leads and conquest dynamics within weeks.",
      actions: [
        { icon: TrendingUp, title: "Update iZEV-Aware Creative", description: "Refresh Lightning, Mach-E, and Escape PHEV creative to reflect current iZEV eligibility tier and rebate amount. The math is the marketing — make the net price clear in Search ads and landing pages." },
        { icon: Target, title: "Recalibrate Conquest Math", description: "Where Ford EVs lose or gain iZEV advantage vs Hyundai Ioniq 5, Toyota RAV4 Prime, or Tesla, model the consideration impact and adjust media weight to defend or attack accordingly." },
        { icon: Shield, title: "Brief Dealer Network", description: "Ensure dealer-tier salespeople and dealer-led campaigns reflect current iZEV reality. Stale rebate language hurts close rates and creates trust gaps with informed buyers." },
      ],
    };
  }
  if (tag === "partnerships") {
    return {
      impact: "Ford's strategic partnerships — battery JVs, charging networks, AI/cloud platforms, and security integrations — directly affect Ford's competitive position in EV ecosystem, fleet operations, and dealer/customer experience. These alliances are how Ford accelerates capabilities Tesla and GM are building in-house, and they often unlock material conquest messaging.",
      actions: [
        { icon: TrendingUp, title: "Surface in Launch Creative", description: "Partnership wins (charging access, CarPlay Ultra, BlueOval Battery, Ford Pro Telematics) are concrete trust signals. Update Lightning, Mach-E, and Transit launch creative to lead with the most relevant partnership talking point per audience." },
        { icon: Target, title: "Brief Dealer Network", description: "Dealer-tier sales teams need talking points on what each partnership means for the customer (faster service, integrated billing, theft protection, etc.). Brief dealer councils and update co-op assets." },
        { icon: Shield, title: "Counter Tesla / GM Vertical Integration", description: "Tesla and GM are vertically integrating insurance, charging, and software. Ford's partnership strategy delivers comparable outcomes via best-in-class partners. Use this framing in CMO and CFO trust-building moments." },
      ],
    };
  }
  if (tag === "automotive") {
    return {
      impact: "Industry-level signals — sales rankings, awards, dealer network shifts, and broad consumer data — shape buyer expectation and Ford's competitive baseline. Awards and rankings carry credibility that paid media cannot manufacture.",
      actions: [
        { icon: TrendingUp, title: "Amplify Wins, Defuse Losses", description: "Where Ford nameplates win an award or ranking, build campaigns around the third-party validation. Where competitors win, model the SOV and consideration impact and prepare a response." },
        { icon: Target, title: "Cross-Reference with Internal KPIs", description: "Industry shifts often show up in Ford KPIs (CPL, lead pacing, conversion rate) before they show up in registration data. Use STRATIS visibility to confirm signals against revenue impact." },
        { icon: Shield, title: "Update Competitive Set", description: "Industry data may reveal new competitors gaining share in segments Ford hasn't traditionally tracked. Add to the conquest audience list and competitive monitoring scope." },
      ],
    };
  }
  if (tag === "social") {
    return {
      impact: "Buyer decision-making is increasingly community-driven. Reddit r/cars, r/electricvehicles, r/Ford, and TikTok #CarTok creators surface high-conviction opinions that influence real purchase decisions. These communities represent genuine enthusiasm with detailed context on why a vehicle resonates — Ford marketing can align to that language and framing.",
      actions: [
        { icon: TrendingUp, title: "Align Creative to Community Language", description: "If a Ford nameplate is gaining traction in r/Ford or #BroncoLife, ensure paid creative reflects the framing communities are already using. Community-driven interest is high-conviction." },
        { icon: Target, title: "Monitor Sentiment Velocity", description: "Track which nameplates and competitor models are gaining momentum across key communities. High upvote counts and comment velocity are leading indicators of consideration shift." },
        { icon: Shield, title: "Activate Creator Partnerships Carefully", description: "Adventure / overlanding creators for Bronco, EV creators for Lightning, and fleet-savvy creators for Transit. Authentic partnerships outperform branded content; brief Mindshare on shortlists." },
      ],
    };
  }
  if (tag === "sports" || tag === "sponsorships") {
    return {
      impact: "Ford's sports and sponsorship portfolio (CFL, Canadian Tire Motorsport Park, community sponsorships) creates high-visibility activation windows tied to fan passion. Game-day moments, race wins, and event activations are opportunities to convert investment into brand affinity and dealer leads.",
      actions: [
        { icon: TrendingUp, title: "Activate Around the Moment", description: "Coordinate social content, OOH activation, and dealer co-op around the event window. Brand affinity peaks during and immediately after — speed of activation determines share of attention." },
        { icon: Target, title: "Tie Sponsorship to Nameplate Story", description: "F-150 and Bronco brand-equity stories pair naturally with motorsport and outdoor activations. Connect sponsorship moments to current nameplate narratives rather than running them as standalone brand moments." },
        { icon: Shield, title: "Measure Sponsorship Lift", description: "Track branded search lift, dealer foot-traffic proxies, and social engagement during activation windows. Build a sponsorship performance baseline to optimize future investment." },
      ],
    };
  }
  if (tag === "macro") {
    return {
      impact: "Macro signals — Bank of Canada rate moves, gas price trends, employment data, provincial subsidy debates — directly shape Ford's near-term consideration set: financing affordability, PHEV/EV tailwinds, and budget calibration timing. STRATIS connects these external conditions to internal media response.",
      actions: [
        { icon: TrendingUp, title: "Adjust Messaging to Economic Climate", description: "If gas prices rise, lean into Escape PHEV and Lightning fuel-cost messaging. If financing rates shift, surface Ford Motor Credit positioning more prominently in conversion creative." },
        { icon: Target, title: "Monitor Regional Sensitivity", description: "Macro effects vary by region — Quebec PHEV interest indexes higher with fuel price spikes; Ontario indexes higher to provincial subsidy debate. Calibrate Tier 2 weight accordingly." },
        { icon: Shield, title: "Flag Demand Signals Early", description: "Spring buying season, year-end model clearance, and fiscal year-end fleet purchasing all create predictable demand windows. Pre-position media and dealer co-op messaging." },
      ],
    };
  }
  if (tag === "brand") {
    return {
      impact: "This signals a shift in how the market perceives Ford Canada's brand. Whether it's anniversary milestones, awards, or executive narrative, every public signal shapes consideration and dealer foot traffic. Ford's ability to control its narrative directly affects brand equity across all nameplates and tiers.",
      actions: [
        { icon: TrendingUp, title: "Amplify Positive Signals", description: "If the narrative is favorable, accelerate owned and paid amplification. Push the story across Ford Canada channels and align dealer co-op messaging with the momentum before it fades." },
        { icon: Target, title: "Track Narrative Trajectory", description: "Monitor whether this is being picked up by automotive trade press and how the tone is shifting. Flag any divergence between Ford's intended positioning and how the market is interpreting it." },
        { icon: Shield, title: "Pair with Nameplate Narratives", description: "Brand stories land harder when tied to a specific nameplate moment — F-150 leadership, Lightning launch, Bronco adventure. Avoid pure-brand activations divorced from product." },
      ],
    };
  }
  // default
  return {
    impact: "This development has strategic implications for Ford Canada's positioning. Staying ahead of market shifts, competitor moves, and consumer behavior changes ensures Ford can respond proactively rather than reactively.",
    actions: [
      { icon: TrendingUp, title: "Assess Strategic Impact", description: "Evaluate how this development affects Ford's current nameplate priorities and whether it warrants a change in tier weighting or media approach." },
      { icon: Target, title: "Cross-Reference with Other Signals", description: "Check whether this is being confirmed by other data sources — social conversation, dealer leads, competitor behavior — to determine confidence level before acting." },
      { icon: Shield, title: "Monitor for Escalation", description: "Track whether this signal is intensifying, stabilizing, or fading. Set a review point to reassess impact and determine next steps." },
    ],
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const selectedEnterprise = useAppStore((s) => s.selectedEnterprise);
  const store = useMemo(() => generateAllData(selectedEnterprise ?? 'ford-canada'), [selectedEnterprise]);
  const newsItems = store.newsItems;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedArticle(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const sections = useMemo(() => {
    const used = new Set<string>();
    return FEED_SECTIONS.map((section) => {
      const items = newsItems.filter((item) => {
        if (used.has(item.id)) return false;
        if (section.filterFn(item)) {
          used.add(item.id);
          return true;
        }
        return false;
      });
      return { ...section, items: items.slice(0, 6) };
    }).filter((s) => s.items.length > 0);
  }, [newsItems]);

  // Assign each article a photo in render order, never repeating one while the
  // library still has unused options — each article gets the most relevant photo
  // not already taken by an earlier card.
  const photoById = useMemo(() => {
    const used = new Set<string>();
    const map: Record<string, string> = {};
    for (const section of sections) {
      for (const item of section.items) {
        const cands = candidatePhotos(item);
        const pick = cands.find((p) => !used.has(p)) ?? cands[0];
        used.add(pick);
        map[item.id] = pick;
      }
    }
    return map;
  }, [sections]);

  if (loading) {
    return (
      <div className="space-y-10 px-2">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-3">
                  <Skeleton className="h-44 rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const insight = selectedArticle ? generateInsight(selectedArticle) : null;

  return (
    <>
      <div className="space-y-12 px-2">
        {sections.map((section) => {
          const sourcesDisplay = section.sources.slice(0, 3).join(", ");
          const moreCount = Math.max(0, section.sources.length - 3);
          const unreadCount = section.items.length;

          return (
            <div key={section.id}>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="text-lg font-bold">{section.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Monitoring: {sourcesDisplay}
                    {moreCount > 0 && <>, and {moreCount} more</>}
                    .{" "}
                    <button className="text-foreground underline underline-offset-2 hover:text-teal transition-colors">Edit</button>
                  </p>
                </div>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1">
                  View all ({unreadCount} unread) <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-5 mt-4">
                {section.items.slice(0, 3).map((item) => {
                  const date = new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedArticle(item)}
                      className="group rounded-xl border border-border/40 bg-card overflow-hidden hover:border-border/60 hover:shadow-lg hover:shadow-black/10 transition-all cursor-pointer"
                    >
                      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={articleImageUrl(photoById[item.id] ?? pickArticlePhoto(item))}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-teal transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-4">
                          <span className="font-medium text-muted-foreground/80">{item.source}</span>
                          {" "}• {date} • {item.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Article Detail Modal ─── */}
      {selectedArticle && insight && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border/40 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero image */}
            <div className="relative h-56 shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={articleImageUrlLarge(photoById[selectedArticle.id] ?? pickArticlePhoto(selectedArticle))}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

              {/* Close button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Tags */}
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                {selectedArticle.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold text-white/90 bg-white/15 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full">
                    {TAG_LABELS[tag]}
                  </span>
                ))}
                <span className={cn(
                  "text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm",
                  selectedArticle.urgency === "high" ? "text-red-300 bg-red-500/20 border border-red-500/20" :
                  selectedArticle.urgency === "medium" ? "text-amber-300 bg-amber-500/20 border border-amber-500/20" :
                  "text-white/70 bg-white/10 border border-white/10"
                )}>
                  {selectedArticle.urgency.charAt(0).toUpperCase() + selectedArticle.urgency.slice(1)} Priority
                </span>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-auto px-6 pb-6">
              {/* Article header */}
              <div className="pt-4 pb-5">
                <h2 className="text-xl font-bold leading-tight mb-3">{selectedArticle.title}</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/70">{selectedArticle.source}</span>
                  <span>•</span>
                  <span>{new Date(selectedArticle.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>

              {/* Article body */}
              <div className="space-y-4 mb-6">
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedArticle.summary}</p>
                {selectedArticle.competitor && (
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300/80">
                      <span className="font-semibold text-red-400">Competitor Alert:</span> This article involves <span className="font-semibold">{selectedArticle.competitor}</span>, a competing brand in Ford&apos;s market.
                    </p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border/30 my-6" />

              {/* STRATIS Insight */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal/20 to-emerald-500/10 border border-teal/20 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-teal" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">STRATIS Insight</h3>
                    <p className="text-[10px] text-muted-foreground/60">What this means for Ford Canada</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{insight.impact}</p>

                {/* Why it matters callout */}
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-teal/5 border border-teal/10 mb-6">
                  <TrendingUp className="h-4 w-4 text-teal shrink-0 mt-0.5" />
                  <p className="text-xs text-teal/80">
                    <span className="font-semibold text-teal">Why it matters:</span> {selectedArticle.whyItMatters}
                  </p>
                </div>

                {/* Recommended actions */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/50 mb-3">Recommended Actions</h4>
                <div className="space-y-3">
                  {insight.actions.map((action, i) => (
                    <div key={i} className="group/action flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-teal/20 hover:bg-teal/5 transition-all cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-teal/10 border border-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                        <action.icon className="h-4 w-4 text-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-semibold">{action.title}</h5>
                          <ArrowRight className="h-3 w-3 text-teal opacity-0 group-hover/action:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="shrink-0 border-t border-border/30 px-6 py-3 flex items-center justify-between bg-card">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                  <Bookmark className="h-3.5 w-3.5" /> Save
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> Source
                </button>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition-colors">
                <Sparkles className="h-3.5 w-3.5" /> Generate Insight Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
