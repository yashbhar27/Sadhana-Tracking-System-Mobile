/*
  # Add temple visit tracking fields

  1. Changes
    - Add temple_visit_type column to entries table to track the type of temple visit
    - Add check constraint to ensure valid temple_visit_type values
    - Update existing entries to set temple_visit_type to 'none' by default

  2. Notes
    - temple_visit_type can be: 'none', 'normal', 'mangla', 'japa', 'lecture'
    - 'none': No temple visit
    - 'normal': Regular temple visit without special activity
    - 'mangla', 'japa', 'lecture': Temple visit with specific activity
*/

-- Add temple_visit_type column
ALTER TABLE entries ADD COLUMN IF NOT EXISTS temple_visit_type text DEFAULT 'none';

-- Add check constraint for valid temple_visit_type values
ALTER TABLE entries ADD CONSTRAINT entries_temple_visit_type_check 
  CHECK (temple_visit_type IN ('none', 'normal', 'mangla', 'japa', 'lecture'));

-- Update existing entries to set temple_visit_type
UPDATE entries SET temple_visit_type = 
  CASE 
    WHEN temple_visit THEN 'normal'
    ELSE 'none'
  END
WHERE temple_visit_type IS NULL;