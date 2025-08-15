/*
  # Add image_url columns to threads and thread_replies

  1. Changes
    - Add `image_url` column to `threads` table for thread image attachments
    - Add `image_url` column to `thread_replies` table for reply image attachments
    - Both columns are optional text fields to store image URLs

  2. Security
    - No RLS changes needed as existing policies cover these columns
*/

-- Add image_url column to threads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'threads' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE threads ADD COLUMN image_url text;
  END IF;
END $$;

-- Add image_url column to thread_replies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thread_replies' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE thread_replies ADD COLUMN image_url text;
  END IF;
END $$;