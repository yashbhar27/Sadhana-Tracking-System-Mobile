/*
  # Initial Schema Setup

  1. New Tables
    - `systems`: Stores tracking system configurations
    - `devotees`: Stores devotee information
    - `entries`: Stores daily activity records

  2. Security
    - Enable RLS on all tables
    - Add policies for public access
    - Add constraints for valid scores

  3. Performance
    - Add indices for foreign keys and frequently queried columns
*/

-- Create systems table for storing tracking system configurations
CREATE TABLE IF NOT EXISTS systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  auth_code text UNIQUE NOT NULL,
  admin_password text NOT NULL DEFAULT '9090',
  security_question text,
  security_answer text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for systems
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;

-- Create systems policies
CREATE POLICY "Enable system insert"
  ON systems
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable system read"
  ON systems
  FOR SELECT
  TO public
  USING (true);

-- Create devotees table for storing devotee information
CREATE TABLE IF NOT EXISTS devotees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_resident boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now(),
  tracking_system_id uuid REFERENCES systems(id) ON DELETE CASCADE
);

-- Enable RLS for devotees
ALTER TABLE devotees ENABLE ROW LEVEL SECURITY;

-- Create devotees policies
CREATE POLICY "Enable devotee delete"
  ON devotees
  FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Enable devotee insert"
  ON devotees
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable devotee read"
  ON devotees
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable devotee update"
  ON devotees
  FOR UPDATE
  TO public
  USING (true);

-- Create entries table for storing daily activity records
CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  devotee_id uuid REFERENCES devotees(id) ON DELETE CASCADE,
  mangla numeric DEFAULT 0,
  japa numeric DEFAULT 0,
  lecture numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  tracking_system_id uuid REFERENCES systems(id) ON DELETE CASCADE,
  UNIQUE(devotee_id, date)
);

-- Add check constraints for valid scores
ALTER TABLE entries ADD CONSTRAINT entries_mangla_check 
  CHECK (mangla = ANY (ARRAY[0, 0.5, 1]::numeric[]));
ALTER TABLE entries ADD CONSTRAINT entries_japa_check 
  CHECK (japa = ANY (ARRAY[0, 0.5, 1]::numeric[]));
ALTER TABLE entries ADD CONSTRAINT entries_lecture_check 
  CHECK (lecture = ANY (ARRAY[0, 0.5, 1]::numeric[]));

-- Enable RLS for entries
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create entries policies
CREATE POLICY "Enable entry delete"
  ON entries
  FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Enable entry insert"
  ON entries
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable entry read"
  ON entries
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable entry update"
  ON entries
  FOR UPDATE
  TO public
  USING (true);

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_devotees_tracking_system_id 
  ON devotees(tracking_system_id);
CREATE INDEX IF NOT EXISTS idx_entries_devotee_id 
  ON entries(devotee_id);
CREATE INDEX IF NOT EXISTS idx_entries_tracking_system_id 
  ON entries(tracking_system_id);
CREATE INDEX IF NOT EXISTS idx_entries_date 
  ON entries(date);