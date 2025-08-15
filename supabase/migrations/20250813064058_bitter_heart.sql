/*
  # Add document CRUD functionality

  1. Security
    - Enable RLS on documents table (already enabled)
    - Add policies for clients to read documents
    - Update freelancer policies for full CRUD access

  2. Changes
    - Add client read access to documents
    - Ensure freelancers have full CRUD access
*/

-- Add policy for clients to read documents in their projects
CREATE POLICY "documents_client_read" ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_clients pc
      JOIN projects p ON pc.project_id = p.id
      WHERE p.id = documents.project_id 
      AND pc.client_id = auth.uid()
    )
  );

-- Update freelancer policy to ensure full CRUD access
DROP POLICY IF EXISTS "documents_freelancer_only" ON documents;

CREATE POLICY "documents_freelancer_full_access" ON documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  );