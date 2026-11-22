-- WADIE INDUSTRIELLE — Neon PostgreSQL Schema Migration
-- Migration 001: Initial Tables & Indexes

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_reference VARCHAR(32) NOT NULL UNIQUE,
  customer_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(160),
  service VARCHAR(160) NOT NULL,
  equipment VARCHAR(160),
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20) NOT NULL,
  project_location VARCHAR(240) NOT NULL,
  message TEXT,
  status VARCHAR(24) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name_ar VARCHAR(180) NOT NULL,
  name_fr VARCHAR(180) NOT NULL,
  description_ar TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  name_ar VARCHAR(180) NOT NULL,
  name_fr VARCHAR(180) NOT NULL,
  description_ar TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  specs_ar TEXT,
  specs_fr TEXT,
  image TEXT NOT NULL,
  category VARCHAR(24) NOT NULL DEFAULT 'rental'
    CHECK (category IN ('rental', 'sales')),
  availability VARCHAR(24) NOT NULL DEFAULT 'available'
    CHECK (availability IN ('available', 'limited', 'unavailable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title_ar VARCHAR(180) NOT NULL,
  title_fr VARCHAR(180) NOT NULL,
  description_ar TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  category_ar VARCHAR(100),
  category_fr VARCHAR(100),
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
