/**
 * Halal Restaurant Scraper
 * Usage: node main.js [--cities=chicago,newyork] [--queries=halal restaurant]
 *
 * Requires SERPAPI_KEY in server/.env or as environment variable
 */
require('dotenv').config({ path: '../server/.env' });
const { getJson } = require('serpapi');
const fs = require('fs');
const path = require('path');

if (!process.env.SERPAPI_KEY) {
  console.error('ERROR: SERPAPI_KEY not found. Add SERPAPI_KEY=your_key to server/.env');
  process.exit(1);
}

// US cities with significant Muslim populations
const CITY_TARGETS = [
  { name: 'chicago',      ll: '@41.8781136,-87.6297982,12z' },
  { name: 'newyork',      ll: '@40.7127753,-74.0059731,12z' },
  { name: 'detroit',      ll: '@42.331427,-83.0457538,12z'  },
  { name: 'losangeles',   ll: '@34.0522342,-118.2436849,12z'},
  { name: 'houston',      ll: '@29.7604267,-95.3698028,12z' },
  { name: 'dearborn',     ll: '@42.3222599,-83.1763145,13z' },
  { name: 'paterson',     ll: '@40.9168504,-74.1718026,13z' },
  { name: 'philadelphia', ll: '@39.9525839,-75.1652215,12z' },
  { name: 'dallas',       ll: '@32.7766642,-96.7969879,12z' },
  { name: 'atlanta',      ll: '@33.748997,-84.3879824,12z'  },
];

const DEFAULT_QUERIES = ['halal restaurant', 'zabiha halal', 'halal food'];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function scrapeCity(cityConfig, query) {
  return new Promise((resolve, reject) => {
    getJson({
      engine: 'google_maps',
      q: query,
      ll: cityConfig.ll,
      api_key: process.env.SERPAPI_KEY,
      hl: 'en',
    }, (json) => {
      if (json.error) return reject(new Error(json.error));
      const results = (json.local_results || []).map(r => ({
        ...r,
        _city: cityConfig.name,
        _query: query,
        _scraped_at: new Date().toISOString(),
      }));
      resolve(results);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  const cityArg = args.find(a => a.startsWith('--cities='));
  const cityFilter = cityArg ? cityArg.split('=')[1].split(',') : null;
  const cities = cityFilter
    ? CITY_TARGETS.filter(c => cityFilter.includes(c.name))
    : CITY_TARGETS;

  const queryArg = args.find(a => a.startsWith('--queries='));
  const queries = queryArg ? [queryArg.split('=')[1]] : DEFAULT_QUERIES;

  console.log(`Scraping ${cities.length} cities with ${queries.length} query/queries each...`);

  const allResults = [];
  const seenPlaceIds = new Set();

  for (const city of cities) {
    for (const query of queries) {
      console.log(`  [${city.name}] "${query}" ...`);
      try {
        const results = await scrapeCity(city, query);
        let newCount = 0;
        for (const r of results) {
          const key = r.place_id || `${r.title}_${r.address}`;
          if (!seenPlaceIds.has(key)) {
            seenPlaceIds.add(key);
            allResults.push(r);
            newCount++;
          }
        }
        console.log(`    -> ${results.length} results, ${newCount} new (${allResults.length} total unique)`);
        await sleep(1200);
      } catch (err) {
        console.error(`  ERROR for ${city.name}/"${query}":`, err.message);
      }
    }
  }

  const timestamp = Date.now();
  const outputPath = path.join(__dirname, 'restaurants_' + timestamp + '.json');
  fs.writeFileSync(outputPath, JSON.stringify({ local_results: allResults }, null, 2));
  console.log('\nSaved ' + allResults.length + ' unique restaurants to ' + outputPath);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
