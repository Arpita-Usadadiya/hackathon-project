-- Migration: Add vendor_ratings table
-- Run this once against your existing vendorbridge database
-- Safe to run multiple times (uses IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS vendor_ratings (
  id           SERIAL PRIMARY KEY,
  vendor_id    INT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name    VARCHAR(255) NOT NULL,
  user_role    VARCHAR(50) NOT NULL,
  rating       INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review       TEXT DEFAULT '',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (vendor_id, user_id)   -- one rating per user per vendor
);

-- Index for fast lookups by vendor
CREATE INDEX IF NOT EXISTS idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);
