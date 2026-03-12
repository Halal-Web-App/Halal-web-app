/**
 * Load scraped restaurant JSON into PostgreSQL.
 * Usage: node to_db.js [restaurants_<timestamp>.json]
 * Defaults to restaurants.json if no argument given.
 *
 * Uses ON CONFLICT (place_id) DO UPDATE for idempotent re-runs.
 * Triggers halal score calculation after each upsert.
 */
require('dotenv').config({ path: '../server/.env' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { updateRestaurantHalalScore } = require('../server/services/halalScore');

const pool = new Pool();
const db = { query: (text, params) => pool.query(text, params) };

function extractCityState(address) {
  if (!address) return { city: null, state: null };
  // Address typically ends with "City, ST ZIPCODE, USA"
  const parts = address.split(',').map(s => s.trim());
  if (parts.length >= 3) {
    const city = parts[parts.length - 3] || null;
    const stateZip = parts[parts.length - 2] || '';
    const state = stateZip.split(' ')[0] || null;
    return { city, state };
  }
  if (parts.length === 2) {
    return { city: parts[0], state: null };
  }
  return { city: null, state: null };
}

async function main() {
  const filename = process.argv[2] || 'restaurants.json';
  const filePath = path.isAbsolute(filename)
    ? filename
    : path.join(__dirname, filename);

  console.log('Reading:', filePath);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const restaurants = data.local_results || [];

  console.log('Connecting to database...');
  await pool.connect();
  console.log('Connected. Processing', restaurants.length, 'restaurants...');

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const r of restaurants) {
    const { city, state } = extractCityState(r.address);
    const gps = r.gps_coordinates || {};
    const serviceOptions = r.service_options || {};

    try {
      const result = await db.query(
        `INSERT INTO restaurants (
          name, location, address, city, state,
          rating, phone_number, website, type,
          operating_hours, service_options, order_online, thumbnail,
          place_id, latitude, longitude
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (place_id) DO UPDATE SET
          name = EXCLUDED.name,
          rating = EXCLUDED.rating,
          operating_hours = EXCLUDED.operating_hours,
          service_options = EXCLUDED.service_options,
          thumbnail = EXCLUDED.thumbnail,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          updated_at = NOW()
        RETURNING id, (xmax = 0) as is_insert`,
        [
          r.title || 'Unknown',
          r.address || 'Unknown Location',
          r.address || null,
          city,
          state,
          r.rating || null,
          r.phone || null,
          r.website || null,
          r.type || null,
          JSON.stringify(r.operating_hours || {}),
          JSON.stringify(serviceOptions),
          r.order_online || null,
          r.thumbnail || null,
          r.place_id || null,
          gps.latitude || null,
          gps.longitude || null,
        ]
      );

      const row = result.rows[0];
      if (row.is_insert) {
        inserted++;
      } else {
        updated++;
      }

      // Calculate halal score
      await updateRestaurantHalalScore(db, row.id);
    } catch (err) {
      errors++;
      console.error('Error for', r.title, ':', err.message);
    }
  }

  await pool.end();
  console.log('\nDone!');
  console.log('  Inserted:', inserted);
  console.log('  Updated:', updated);
  console.log('  Errors:', errors);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
