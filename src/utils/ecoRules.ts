import {
  ActivityEntry,
  ChallengeItem,
  ProbabilityBreakdown,
  RecyclingCentre,
  WasteActionType,
  WasteCategoryId,
} from '../types/ecosort';

export interface DashboardStats {
  ecoScore: number;
  activityPoints: number;
  challengeBonusPoints: number;
  tierName: string;
  nextTierName: string;
  nextTierTarget: number;
  pointsToNextTier: number;
  recyclableCount: number;
  ewasteCount: number;
  organicCount: number;
  hazardousCount: number;
  totalItems: number;
  totalEntries: number;
}

export function calculateActivityPoints(
  category: WasteCategoryId,
  action: WasteActionType,
  quantity: number
): number {
  const safeQty = Math.max(1, Math.min(99, Math.round(quantity || 1)));

  if (category === 'ewaste' || action === 'E-Waste Disposal') {
    return 35 + (safeQty - 1) * 15;
  }

  if (category === 'hazardous' || action === 'Hazardous Drop-Off') {
    return 30 + (safeQty - 1) * 10;
  }

  if (category === 'wet' || action === 'Composted') {
    return 12 + (safeQty - 1) * 4;
  }

  // Dry / Recyclable stream: Reuse (3R Priority #2) earns +15 over standard Recycle
  const baseDry = 15 + (safeQty - 1) * 4;
  if (action === 'Reused') {
    return baseDry + 15;
  }
  return baseDry;
}

export function getTierForScore(score: number): {
  tierName: string;
  nextTierName: string;
  nextTierTarget: number;
  pointsToNextTier: number;
} {
  if (score < 75) {
    return {
      tierName: 'Eco Starter',
      nextTierName: 'Eco Explorer',
      nextTierTarget: 75,
      pointsToNextTier: 75 - score,
    };
  }
  if (score < 150) {
    return {
      tierName: 'Eco Explorer',
      nextTierName: 'Green Guardian',
      nextTierTarget: 150,
      pointsToNextTier: 150 - score,
    };
  }
  if (score < 300) {
    return {
      tierName: 'Green Guardian',
      nextTierName: 'Circular Champion',
      nextTierTarget: 300,
      pointsToNextTier: 300 - score,
    };
  }
  return {
    tierName: 'Circular Champion',
    nextTierName: 'Zero-Waste Leader',
    nextTierTarget: 500,
    pointsToNextTier: Math.max(0, 500 - score),
  };
}

export function computeDashboardStats(
  activities: ActivityEntry[],
  challenges: ChallengeItem[]
): DashboardStats {
  let activityPoints = 0;
  let recyclableCount = 0;
  let ewasteCount = 0;
  let organicCount = 0;
  let hazardousCount = 0;
  let totalItems = 0;

  for (const entry of activities) {
    const qty = Math.max(1, entry.quantity || 1);
    activityPoints += entry.points;
    totalItems += qty;

    if (entry.category === 'dry') recyclableCount += qty;
    else if (entry.category === 'ewaste') ewasteCount += qty;
    else if (entry.category === 'wet') organicCount += qty;
    else if (entry.category === 'hazardous') hazardousCount += qty;
  }

  let challengeBonusPoints = 0;
  for (const ch of challenges) {
    if (ch.progress >= ch.target) {
      challengeBonusPoints += ch.bonusPoints;
    }
  }

  const ecoScore = activityPoints + challengeBonusPoints;
  const tier = getTierForScore(ecoScore);

  return {
    ecoScore,
    activityPoints,
    challengeBonusPoints,
    ...tier,
    recyclableCount,
    ewasteCount,
    organicCount,
    hazardousCount,
    totalItems,
    totalEntries: activities.length,
  };
}

export function normalizeProbabilityBreakdown(
  raw: Partial<ProbabilityBreakdown> | undefined,
  primaryCategory: WasteCategoryId
): { confidence: number; breakdown: ProbabilityBreakdown } {
  const keys: WasteCategoryId[] = ['dry', 'wet', 'ewaste', 'hazardous'];
  const values: ProbabilityBreakdown = {
    dry: Math.max(0, Math.round(Number(raw?.dry ?? 0))),
    wet: Math.max(0, Math.round(Number(raw?.wet ?? 0))),
    ewaste: Math.max(0, Math.round(Number(raw?.ewaste ?? 0))),
    hazardous: Math.max(0, Math.round(Number(raw?.hazardous ?? 0))),
  };

  let sum = values.dry + values.wet + values.ewaste + values.hazardous;
  if (sum <= 0) {
    values.dry = primaryCategory === 'dry' ? 91 : 3;
    values.wet = primaryCategory === 'wet' ? 91 : 3;
    values.ewaste = primaryCategory === 'ewaste' ? 91 : 3;
    values.hazardous = primaryCategory === 'hazardous' ? 91 : 3;
    sum = values.dry + values.wet + values.ewaste + values.hazardous;
  }

  // Normalize to sum to exactly 100
  const scaled: ProbabilityBreakdown = {
    dry: Math.round((values.dry / sum) * 100),
    wet: Math.round((values.wet / sum) * 100),
    ewaste: Math.round((values.ewaste / sum) * 100),
    hazardous: Math.round((values.hazardous / sum) * 100),
  };

  // Ensure primaryCategory is strictly highest
  let maxKey = primaryCategory;
  for (const k of keys) {
    if (scaled[k] > scaled[maxKey]) {
      maxKey = k;
    }
  }
  if (maxKey !== primaryCategory) {
    const temp = scaled[primaryCategory];
    scaled[primaryCategory] = scaled[maxKey];
    scaled[maxKey] = temp;
  }

  // Fix rounding remainder on primaryCategory so sum === 100
  const currentTotal = scaled.dry + scaled.wet + scaled.ewaste + scaled.hazardous;
  scaled[primaryCategory] = Math.max(1, scaled[primaryCategory] + (100 - currentTotal));

  return {
    confidence: scaled[primaryCategory],
    breakdown: scaled,
  };
}

export function filterRecyclingCentres(
  centres: RecyclingCentre[],
  searchQuery: string,
  materialFilter: string
): RecyclingCentre[] {
  const q = searchQuery.trim().toLowerCase();
  return centres.filter((centre) => {
    const matchesMaterial =
      materialFilter === 'All Centres' ||
      centre.materials.some((m) => m.toLowerCase() === materialFilter.toLowerCase());
    if (!matchesMaterial) return false;
    if (!q) return true;
    return (
      centre.name.toLowerCase().includes(q) ||
      centre.address.toLowerCase().includes(q) ||
      centre.locality.toLowerCase().includes(q) ||
      centre.materials.some((m) => m.toLowerCase().includes(q))
    );
  });
}
