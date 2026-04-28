-- Migration: Create vehicles and volunteers tables
-- Run with: npx wrangler d1 execute <DB_NAME> --file=./migrations/0002_vehicles_volunteers.sql

-- ============================================================
-- VEHICLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    callsign TEXT,
    type TEXT NOT NULL DEFAULT 'appliance',
    license_required TEXT NOT NULL DEFAULT 'Class 2',
    seat_count INTEGER NOT NULL DEFAULT 6,
    min_crew INTEGER NOT NULL DEFAULT 4,
    notes TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- VOLUNTEERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS volunteers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rank TEXT NOT NULL DEFAULT 'Firefighter',
    license_class TEXT NOT NULL DEFAULT 'Full',
    phone TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Seed default vehicles (adjust to your brigade)
-- ============================================================
INSERT INTO vehicles (name, callsign, type, license_required, seat_count, min_crew, notes) VALUES
    ('Appliance 367', '367', 'appliance', 'Class 2', 6, 4, 'Driver, Officer, FF1-FF4'),
    ('Appliance 361', '361', 'appliance', 'Class 2', 6, 4, 'Driver, Officer, FF1-FF4'),
    ('Tanker', NULL, 'tanker', 'Class 4', 2, 2, 'Driver, Officer/FF'),
    ('Van', NULL, 'van', 'Full', 7, 1, 'Ops support — Driver + up to 6 passengers');