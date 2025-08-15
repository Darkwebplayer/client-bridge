/*
  # Fix invite token encoding issue

  1. Changes
    - Update invite_token default value to use 'base64' encoding instead of 'base64url'
    - This resolves the "unrecognized encoding: base64url" error

  2. Notes
    - Uses standard base64 encoding which is widely supported
    - Maintains the same functionality for generating unique invite tokens
*/

-- Update the projects table to use base64 encoding instead of base64url
ALTER TABLE projects 
ALTER COLUMN invite_token 
SET DEFAULT encode(gen_random_bytes(32), 'base64');