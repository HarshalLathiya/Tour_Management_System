import pool from "./db";

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'tourist' CHECK (role IN ('admin', 'guide', 'tourist')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tours (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  destination VARCHAR(255),
  price NUMERIC(10, 2),
  status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
  content TEXT,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tour_id INT REFERENCES tours(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_city_state UNIQUE (name, state_id)
);

CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  description TEXT,
  category VARCHAR(20) NOT NULL DEFAULT 'OTHER' CHECK (category IN ('HISTORICAL', 'NATURAL', 'CULTURAL', 'RELIGIOUS', 'ENTERTAINMENT', 'OTHER')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  tour_id INT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_distance NUMERIC(8, 2),
  estimated_duration INT,
  status VARCHAR(20) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id SERIAL PRIMARY KEY,
  route_id INT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  place_id INT REFERENCES places(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_order INT NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  estimated_arrival_time TIME,
  estimated_departure_time TIME,
  actual_arrival_time TIMESTAMP,
  actual_departure_time TIMESTAMP,
  status VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ARRIVED', 'DEPARTED', 'SKIPPED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  tour_id INT REFERENCES tours(id) ON DELETE CASCADE,
  date DATE,
  status VARCHAR(10) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  checkpoint_id INT REFERENCES checkpoints(id) ON DELETE SET NULL,
  verified_by INT REFERENCES users(id) ON DELETE SET NULL,
  verification_time TIMESTAMP,
  location_lat NUMERIC(10, 8),
  location_lng NUMERIC(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  tour_id INT REFERENCES tours(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL,
  spent_amount NUMERIC(10, 2) DEFAULT 0,
  per_participant_fee NUMERIC(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  tour_id INT REFERENCES tours(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'MISC' CHECK (category IN ('TRANSPORT', 'ACCOMMODATION', 'FOOD', 'MISC')),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS safety_protocols (
  id SERIAL PRIMARY KEY,
  tour_id INT REFERENCES tours(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  tour_id INT REFERENCES tours(id) ON DELETE CASCADE,
  reported_by INT REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  severity VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(10) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itineraries (
  id SERIAL PRIMARY KEY,
  tour_id INT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  route_id INT REFERENCES routes(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_files (
  id SERIAL PRIMARY KEY,
  announcement_id INT REFERENCES announcements(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_dates ON tours(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_attendance_tour_user ON attendance(tour_id, user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_checkpoint ON attendance(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_budgets_tour ON budgets(tour_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tour ON expenses(tour_id);
CREATE INDEX IF NOT EXISTS idx_incidents_tour ON incidents(tour_id);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_announcements_tour ON announcements(tour_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_route ON checkpoints(route_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_routes_tour ON routes(tour_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_tour ON itineraries(tour_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
`;

async function initDB() {
  try {
    await pool.query(schema);
    console.warn("Database initialized successfully!");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    await pool.end();
    process.exit(1);
  }
}

initDB();
