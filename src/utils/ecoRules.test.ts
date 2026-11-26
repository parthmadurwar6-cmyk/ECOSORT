import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateActivityPoints,
  computeDashboardStats,
  filterRecyclingCentres,
  getTierForScore,
  normalizeProbabilityBreakdown,
} from './ecoRules';
import { INITIAL_ACTIVITIES, INITIAL_CHALLENGES, PUNE_RECYCLING_CENTRES } from '../data/wasteData';

test('calculateActivityPoints matches Weighted Eco Score Reward Model', () => {
  assert.equal(calculateActivityPoints('dry', 'Recycled', 1), 15);
  assert.equal(calculateActivityPoints('dry', 'Recycled', 3), 23);
  assert.equal(calculateActivityPoints('wet', 'Composted', 1), 12);
  assert.equal(calculateActivityPoints('ewaste', 'E-Waste Disposal', 1), 35);
  assert.equal(calculateActivityPoints('dry', 'Reused', 1), 30);
  assert.equal(calculateActivityPoints('hazardous', 'Hazardous Drop-Off', 1), 30);
});

test('initial Aarav Sharma dashboard state equals 149 pts, 1 pt from Green Guardian', () => {
  const stats = computeDashboardStats(INITIAL_ACTIVITIES, INITIAL_CHALLENGES);
  assert.equal(stats.ecoScore, 149);
  assert.equal(stats.tierName, 'Eco Explorer');
  assert.equal(stats.nextTierName, 'Green Guardian');
  assert.equal(stats.pointsToNextTier, 1);
  assert.equal(stats.recyclableCount, 8);
  assert.equal(stats.ewasteCount, 1);
  assert.equal(stats.organicCount, 1);
  assert.equal(stats.totalItems, 10);
  assert.equal(stats.totalEntries, 7);
});

test('tier advances to Green Guardian at 150 pts and awards completed challenge bonuses', () => {
  assert.equal(getTierForScore(150).tierName, 'Green Guardian');
  assert.equal(getTierForScore(300).tierName, 'Circular Champion');

  const completedChallenges = INITIAL_CHALLENGES.map((c) =>
    c.id === 'chal-7day-segregation' ? { ...c, progress: 7 } : c
  );
  const stats = computeDashboardStats(INITIAL_ACTIVITIES, completedChallenges);
  assert.equal(stats.challengeBonusPoints, 70);
  assert.equal(stats.ecoScore, 219);
  assert.equal(stats.tierName, 'Green Guardian');
});

test('normalizeProbabilityBreakdown always sums to 100 and keeps primary category highest', () => {
  const result = normalizeProbabilityBreakdown(
    { dry: 94, wet: 1, ewaste: 3, hazardous: 1 },
    'dry'
  );
  const sum =
    result.breakdown.dry +
    result.breakdown.wet +
    result.breakdown.ewaste +
    result.breakdown.hazardous;
  assert.equal(sum, 100);
  assert.equal(result.confidence, result.breakdown.dry);

  const fallback = normalizeProbabilityBreakdown(undefined, 'ewaste');
  const fallbackSum =
    fallback.breakdown.dry +
    fallback.breakdown.wet +
    fallback.breakdown.ewaste +
    fallback.breakdown.hazardous;
  assert.equal(fallbackSum, 100);
  assert.ok(fallback.breakdown.ewaste > fallback.breakdown.dry);
});

test('filterRecyclingCentres filters by locality, search query, and stream', () => {
  const ewasteCentres = filterRecyclingCentres(PUNE_RECYCLING_CENTRES, '', 'E-waste');
  assert.ok(ewasteCentres.length >= 2);
  assert.ok(ewasteCentres.every((c) => c.materials.includes('E-waste')));

  const deccan = filterRecyclingCentres(PUNE_RECYCLING_CENTRES, 'Deccan', 'All Centres');
  assert.equal(deccan.length, 1);
  assert.equal(deccan[0].id, 'ecospark-deccan');
});
