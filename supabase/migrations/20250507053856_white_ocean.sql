/*
  # System Updates Migration

  1. Changes
    - Add admin_name column to systems table
    - Add temple_visit column to entries table
    - Update RLS policies
*/

-- Add admin_name column to systems table
ALTER TABLE systems ADD COLUMN IF NOT EXISTS admin_name text;

-- Add temple_visit column to entries table
ALTER TABLE entries ADD COLUMN IF NOT EXISTS temple_visit boolean DEFAULT false;