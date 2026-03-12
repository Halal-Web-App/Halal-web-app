-- for help \?

-- list database \l

-- Create database CREATE DATABASE database_name;

-- list all tables \d

CREATE TABLE IF NOT EXISTS restaurants (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL DEFAULT '',
    price_range INT DEFAULT 2 CHECK (price_range >= 1 and price_range <= 5)
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    review TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5)
);

-- ============================================================
-- Migration 001: Extended restaurant fields + halal scoring
-- ============================================================

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1),
  ADD COLUMN IF NOT EXISTS type VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address VARCHAR(500),
  ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS website VARCHAR(500),
  ADD COLUMN IF NOT EXISTS service_options JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS order_online VARCHAR(255),
  ADD COLUMN IF NOT EXISTS thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS place_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS halal_score INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS halal_score_breakdown JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS halal_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS halal_keywords_found TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Halal community reports
CREATE TABLE IF NOT EXISTS halal_reports (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  reporter_name VARCHAR(100),
  report_type VARCHAR(50) CHECK (report_type IN ('confirm_halal','deny_halal','pork_found','alcohol_served','zabiha_confirmed','not_zabiha')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Halal certifications
CREATE TABLE IF NOT EXISTS halal_certifications (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  certifying_body VARCHAR(255),
  certificate_number VARCHAR(255),
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  expiry_date DATE,
  notes TEXT
);

-- Unique constraint on place_id (for upsert deduplication)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'restaurants_place_id_key'
  ) THEN
    ALTER TABLE restaurants ADD CONSTRAINT restaurants_place_id_key UNIQUE (place_id);
  END IF;
END $$;

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_restaurants_search
  ON restaurants USING gin(
    to_tsvector('english',
      coalesce(name,'') || ' ' ||
      coalesce(type,'') || ' ' ||
      coalesce(location,'') || ' ' ||
      coalesce(city,'')
    )
  );

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_halal_score ON restaurants(halal_score);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);
CREATE INDEX IF NOT EXISTS idx_restaurants_price_range ON restaurants(price_range);
CREATE INDEX IF NOT EXISTS idx_halal_reports_restaurant ON halal_reports(restaurant_id);
