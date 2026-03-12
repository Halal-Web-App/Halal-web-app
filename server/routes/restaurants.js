const express = require('express');
const router = express.Router();
const db = require('../db');
const { updateRestaurantHalalScore } = require('../services/halalScore');

// ── GET /api/v1/restaurants/cities ──────────────────────────────────────────
router.get('/cities', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT city FROM restaurants WHERE city IS NOT NULL AND city != '' ORDER BY city`
    );
    res.json({ status: 'success', data: { cities: result.rows.map(r => r.city) } });
  } catch (err) { next(err); }
});

// ── GET /api/v1/restaurants/types ───────────────────────────────────────────
router.get('/types', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT type FROM restaurants WHERE type IS NOT NULL AND type != '' ORDER BY type`
    );
    res.json({ status: 'success', data: { types: result.rows.map(r => r.type) } });
  } catch (err) { next(err); }
});

// ── GET /api/v1/restaurants ─────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      city,
      type,
      price_range,
      min_rating,
      min_halal_score,
      sort = 'halal_score_desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clauses dynamically
    const conditions = [];
    const params = [];

    if (search) {
      params.push(search);
      conditions.push(
        `to_tsvector('english', coalesce(r.name,'') || ' ' || coalesce(r.type,'') || ' ' || coalesce(r.location,'') || ' ' || coalesce(r.city,''))
         @@ plainto_tsquery('english', $${params.length})`
      );
    }

    if (city) {
      params.push(city);
      conditions.push(`LOWER(r.city) = LOWER($${params.length})`);
    }

    if (type) {
      params.push(`%${type}%`);
      conditions.push(`r.type ILIKE $${params.length}`);
    }

    if (price_range) {
      const priceArr = price_range.split(',').map(Number).filter(n => n >= 1 && n <= 5);
      if (priceArr.length) {
        params.push(priceArr);
        conditions.push(`r.price_range = ANY($${params.length})`);
      }
    }

    if (min_rating) {
      params.push(parseFloat(min_rating));
      conditions.push(`rev.average_rating >= $${params.length}`);
    }

    if (min_halal_score) {
      params.push(parseInt(min_halal_score));
      conditions.push(`r.halal_score >= $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sort order
    const sortMap = {
      halal_score_desc: 'r.halal_score DESC NULLS LAST',
      rating_desc:      'rev.average_rating DESC NULLS LAST',
      rating_asc:       'rev.average_rating ASC NULLS LAST',
      name_asc:         'r.name ASC',
      price_asc:        'r.price_range ASC NULLS LAST',
      price_desc:       'r.price_range DESC NULLS LAST',
      newest:           'r.created_at DESC',
    };
    const orderBy = sortMap[sort] || sortMap.halal_score_desc;

    const baseQuery = `
      FROM restaurants r
      LEFT JOIN (
        SELECT restaurant_id,
               COUNT(*) as count,
               TRUNC(AVG(rating), 1) as average_rating
        FROM reviews
        GROUP BY restaurant_id
      ) rev ON r.id = rev.restaurant_id
      ${whereClause}
    `;

    // Count query
    const countResult = await db.query(
      `SELECT COUNT(*) ${baseQuery}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limitNum);

    // Data query
    const dataParams = [...params, limitNum, offset];
    const dataResult = await db.query(
      `SELECT r.*,
              COALESCE(rev.count, 0) as review_count,
              rev.average_rating
       ${baseQuery}
       ORDER BY ${orderBy}, r.id ASC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    res.json({
      status: 'success',
      results: dataResult.rows.length,
      total,
      page: pageNum,
      totalPages,
      data: { restaurants: dataResult.rows },
    });
  } catch (err) { next(err); }
});

// ── GET /api/v1/restaurants/:id ─────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [restaurant, reviews, reports] = await Promise.all([
      db.query(
        `SELECT r.*,
                COALESCE(rev.count, 0) as review_count,
                rev.average_rating
         FROM restaurants r
         LEFT JOIN (
           SELECT restaurant_id, COUNT(*) as count, TRUNC(AVG(rating),1) as average_rating
           FROM reviews GROUP BY restaurant_id
         ) rev ON r.id = rev.restaurant_id
         WHERE r.id = $1`,
        [id]
      ),
      db.query('SELECT * FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC', [id]),
      db.query('SELECT * FROM halal_reports WHERE restaurant_id = $1 ORDER BY created_at DESC', [id]),
    ]);

    if (!restaurant.rows[0]) {
      return res.status(404).json({ status: 'error', message: 'Restaurant not found' });
    }

    res.json({
      status: 'success',
      data: {
        restaurant: restaurant.rows[0],
        reviews: reviews.rows,
        reports: reports.rows,
      },
    });
  } catch (err) { next(err); }
});

// ── POST /api/v1/restaurants ────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { name, location, price_range } = req.body;
    if (!name || !location) {
      return res.status(400).json({ status: 'error', message: 'name and location are required' });
    }
    const result = await db.query(
      'INSERT INTO restaurants (name, location, price_range) VALUES ($1, $2, $3) RETURNING *',
      [name, location, price_range || 2]
    );
    const restaurant = result.rows[0];
    // Calculate initial halal score
    await updateRestaurantHalalScore(db, restaurant.id);
    const updated = await db.query('SELECT * FROM restaurants WHERE id = $1', [restaurant.id]);

    res.status(201).json({ status: 'success', data: { restaurant: updated.rows[0] } });
  } catch (err) { next(err); }
});

// ── PUT /api/v1/restaurants/:id ─────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, price_range } = req.body;
    const result = await db.query(
      'UPDATE restaurants SET name = $1, location = $2, price_range = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, location, price_range, id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ status: 'error', message: 'Restaurant not found' });
    }
    await updateRestaurantHalalScore(db, id);
    const updated = await db.query('SELECT * FROM restaurants WHERE id = $1', [id]);
    res.json({ status: 'success', data: { restaurant: updated.rows[0] } });
  } catch (err) { next(err); }
});

// ── DELETE /api/v1/restaurants/:id ──────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM restaurants WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
});

// ── POST /api/v1/restaurants/:id/addReview ──────────────────────────────────
router.post('/:id/addReview', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, review, rating } = req.body;
    if (!name || !review || !rating) {
      return res.status(400).json({ status: 'error', message: 'name, review, and rating are required' });
    }
    const result = await db.query(
      'INSERT INTO reviews (restaurant_id, name, review, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, review, rating]
    );
    // Recalculate halal score (reviews affect the score)
    await updateRestaurantHalalScore(db, id);
    res.status(201).json({ status: 'success', data: { review: result.rows[0] } });
  } catch (err) { next(err); }
});

module.exports = router;
