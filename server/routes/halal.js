const express = require('express');
const router = express.Router();
const db = require('../db');
const { updateRestaurantHalalScore, getScoreTier } = require('../services/halalScore');

// ── GET /api/v1/halal/:id/score ─────────────────────────────────────────────
router.get('/:id/score', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT halal_score, halal_score_breakdown, halal_verified FROM restaurants WHERE id = $1',
      [id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ status: 'error', message: 'Restaurant not found' });
    }
    const { halal_score, halal_score_breakdown, halal_verified } = result.rows[0];
    res.json({
      status: 'success',
      data: {
        score: halal_score,
        breakdown: halal_score_breakdown,
        tier: halal_score !== null ? getScoreTier(halal_score) : null,
        halal_verified,
      },
    });
  } catch (err) { next(err); }
});

// ── POST /api/v1/halal/:id/report ───────────────────────────────────────────
router.post('/:id/report', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reporter_name, report_type, notes } = req.body;

    const validTypes = ['confirm_halal', 'deny_halal', 'pork_found', 'alcohol_served', 'zabiha_confirmed', 'not_zabiha'];
    if (!report_type || !validTypes.includes(report_type)) {
      return res.status(400).json({
        status: 'error',
        message: `report_type must be one of: ${validTypes.join(', ')}`,
      });
    }

    await db.query(
      'INSERT INTO halal_reports (restaurant_id, reporter_name, report_type, notes) VALUES ($1, $2, $3, $4)',
      [id, reporter_name || 'Anonymous', report_type, notes || null]
    );

    // Recalculate score after new report
    const updated = await updateRestaurantHalalScore(db, id);

    res.status(201).json({
      status: 'success',
      message: 'Report submitted. Thank you for helping the community!',
      data: updated,
    });
  } catch (err) { next(err); }
});

// ── POST /api/v1/halal/batch-recalculate ────────────────────────────────────
router.post('/batch-recalculate', async (req, res, next) => {
  try {
    const allRestaurants = await db.query('SELECT id FROM restaurants');
    const ids = allRestaurants.rows.map(r => r.id);

    let updated = 0;
    let errors = 0;

    for (const id of ids) {
      try {
        await updateRestaurantHalalScore(db, id);
        updated++;
      } catch (e) {
        errors++;
        console.error(`Failed to score restaurant ${id}:`, e.message);
      }
    }

    res.json({
      status: 'success',
      message: `Recalculated scores for ${updated} restaurants (${errors} errors).`,
      data: { updated, errors, total: ids.length },
    });
  } catch (err) { next(err); }
});

module.exports = router;
