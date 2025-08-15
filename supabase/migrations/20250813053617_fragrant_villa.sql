/*
  # Add URL column to threads table

  1. Changes
    - Add optional `url` column to `threads` table for reference links
    - Column allows NULL values for backward compatibility

  2. Security
    - No changes to existing RLS policies needed
    - URL column inherits same access controls as other thread data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'threads' AND column_name = 'url'
  ) THEN
    ALTER TABLE threads ADD COLUMN url text;
  END IF;
END $$;