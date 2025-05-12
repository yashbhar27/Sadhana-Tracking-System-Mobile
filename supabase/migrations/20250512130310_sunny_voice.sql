/*
  # Add master_key column to systems table

  1. Changes
    - Add master_key column to systems table
    - Make it required (NOT NULL)
    - Add default value for existing rows
*/

ALTER TABLE systems 
ADD COLUMN IF NOT EXISTS master_key text NOT NULL DEFAULT gen_random_uuid();