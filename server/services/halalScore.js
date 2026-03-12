// Halal Confidence Score Algorithm
// Produces a score 0-100 based on six signal categories.
// Baseline: 30 points (neutral/unknown).

const HALAL_NAME_KEYWORDS = ['halal', 'zabiha', 'zabihah', 'حلال'];
const HARAM_NAME_KEYWORDS = ['pork', 'bacon', 'ham bbq', 'chorizo'];

const HALAL_TYPE_KEYWORDS = [
  'pakistani', 'afghan', 'somali', 'turkish', 'persian', 'moroccan',
  'egyptian', 'lebanese', 'bangladeshi', 'indonesian', 'malaysian',
  'middle eastern', 'arab', 'eritrean', 'ethiopian', 'mediterranean',
  'yemeni', 'iraqi', 'syrian', 'libyan', 'halal', 'kebab', 'shawarma',
  'falafel', 'biryani', 'indian muslim',
];
const LIKELY_HARAM_TYPE_KEYWORDS = [
  'bar', 'brewery', 'pub', 'taproom', 'pork bbq',
];

const HALAL_REVIEW_KEYWORDS = [
  'halal certified', 'zabiha', 'halal meat', 'no pork', 'pork free',
  'alcohol free', 'no alcohol', 'muslim owned', 'certified halal',
  'hand slaughtered', 'zabihah', 'halal option',
];
const HARAM_REVIEW_KEYWORDS = [
  'serves pork', 'pork dishes', 'bacon menu', 'serves alcohol',
  'wine list', 'beer menu', 'cocktails available', 'not halal',
  'found pork', 'alcohol available', 'lard',
];

/**
 * Calculate halal confidence score for a restaurant.
 * @param {Object} restaurant - Restaurant row from DB
 * @param {Array} reviews - Review rows for this restaurant
 * @param {Array} reports - Halal report rows for this restaurant
 * @returns {{ score: number, breakdown: Object }}
 */
function calculateHalalScore(restaurant, reviews = [], reports = []) {
  const breakdown = {
    baseline: 30,
    serviceOptions: 0,
    restaurantType: 0,
    nameKeywords: 0,
    reviewAnalysis: 0,
    userReports: 0,
    certificationBonus: 0,
  };

  // ── 1. Service Options (alcohol = strong negative) ──────────────────
  const opts = restaurant.service_options || {};
  const optsStr = JSON.stringify(opts).toLowerCase();
  if (
    opts.serves_alcohol === true ||
    opts.alcohol === true ||
    optsStr.includes('"alcohol":true') ||
    optsStr.includes('serves_alcohol":true')
  ) {
    breakdown.serviceOptions = -30;
  } else if (
    opts.serves_alcohol === false ||
    opts.alcohol === false ||
    optsStr.includes('"alcohol":false') ||
    optsStr.includes('serves_alcohol":false')
  ) {
    breakdown.serviceOptions = 15;
  }

  // ── 2. Restaurant Type / Cuisine ────────────────────────────────────
  const typeStr = (restaurant.type || '').toLowerCase();
  const hasHaramType = LIKELY_HARAM_TYPE_KEYWORDS.some(k => typeStr.includes(k));
  const hasHalalType = HALAL_TYPE_KEYWORDS.some(k => typeStr.includes(k));

  if (hasHaramType) {
    breakdown.restaurantType = -20;
  } else if (hasHalalType) {
    breakdown.restaurantType = 20;
  }

  // ── 3. Name Keywords ────────────────────────────────────────────────
  const nameStr = (restaurant.name || '').toLowerCase();
  const hasHalalName = HALAL_NAME_KEYWORDS.some(k => nameStr.includes(k));
  const hasHaramName = HARAM_NAME_KEYWORDS.some(k => nameStr.includes(k));

  if (hasHalalName) {
    breakdown.nameKeywords = 20;
  } else if (hasHaramName) {
    breakdown.nameKeywords = -10;
  }

  // ── 4. Review Keyword Analysis ──────────────────────────────────────
  const allReviewText = reviews
    .map(r => (r.review || '').toLowerCase())
    .join(' ');

  let reviewHalalHits = 0;
  let reviewHaramHits = 0;

  HALAL_REVIEW_KEYWORDS.forEach(k => { if (allReviewText.includes(k)) reviewHalalHits++; });
  HARAM_REVIEW_KEYWORDS.forEach(k => { if (allReviewText.includes(k)) reviewHaramHits++; });

  if (reviewHaramHits > 0) {
    breakdown.reviewAnalysis = -Math.min(10, reviewHaramHits * 5);
  } else if (reviewHalalHits > 0) {
    breakdown.reviewAnalysis = Math.min(5, reviewHalalHits * 2);
  }

  // ── 5. User Halal Reports ────────────────────────────────────────────
  const confirmCount = reports.filter(r =>
    ['confirm_halal', 'zabiha_confirmed'].includes(r.report_type)
  ).length;
  const denyCount = reports.filter(r =>
    ['deny_halal', 'pork_found', 'alcohol_served'].includes(r.report_type)
  ).length;

  if (denyCount > confirmCount) {
    breakdown.userReports = -Math.min(20, denyCount * 5);
  } else if (confirmCount > 0) {
    breakdown.userReports = Math.min(10, confirmCount * 3);
  }

  // ── 6. Certification Bonus ───────────────────────────────────────────
  if (restaurant.halal_verified === true) {
    breakdown.certificationBonus = 15;
  }

  const raw =
    breakdown.baseline +
    breakdown.serviceOptions +
    breakdown.restaurantType +
    breakdown.nameKeywords +
    breakdown.reviewAnalysis +
    breakdown.userReports +
    breakdown.certificationBonus;

  return {
    score: Math.max(0, Math.min(100, raw)),
    breakdown,
  };
}

/**
 * Score tier metadata for UI display.
 */
function getScoreTier(score) {
  if (score >= 85) return { label: 'Highly Halal', color: '#02733E', tier: 'high' };
  if (score >= 65) return { label: 'Likely Halal', color: '#5B9E3A', tier: 'likely' };
  if (score >= 45) return { label: 'Uncertain', color: '#D97706', tier: 'uncertain' };
  if (score >= 25) return { label: 'Low Confidence', color: '#EA580C', tier: 'low' };
  return { label: 'Not Recommended', color: '#DC2626', tier: 'poor' };
}

/**
 * Persist the halal score back to the database for a single restaurant.
 */
async function updateRestaurantHalalScore(db, restaurantId) {
  const [restaurantResult, reviewsResult, reportsResult] = await Promise.all([
    db.query('SELECT * FROM restaurants WHERE id = $1', [restaurantId]),
    db.query('SELECT * FROM reviews WHERE restaurant_id = $1', [restaurantId]),
    db.query('SELECT * FROM halal_reports WHERE restaurant_id = $1', [restaurantId]),
  ]);

  if (!restaurantResult.rows[0]) return null;

  const { score, breakdown } = calculateHalalScore(
    restaurantResult.rows[0],
    reviewsResult.rows,
    reportsResult.rows
  );

  await db.query(
    `UPDATE restaurants
     SET halal_score = $1, halal_score_breakdown = $2, updated_at = NOW()
     WHERE id = $3`,
    [score, JSON.stringify(breakdown), restaurantId]
  );

  return { score, breakdown };
}

module.exports = { calculateHalalScore, updateRestaurantHalalScore, getScoreTier };
