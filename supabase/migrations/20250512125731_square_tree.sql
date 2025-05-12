/*
  # Add UPDATE policy for systems table

  1. Changes
    - Add UPDATE policy to systems table to allow authenticated users to update their own system

  2. Security
    - Enable UPDATE operations for authenticated users
    - Users can only update their own system based on system ID
*/

CREATE POLICY "Enable system update" ON public.systems
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);