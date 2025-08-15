/*
  # Fix RLS Policy Infinite Recursion

  1. Policy Updates
    - Simplify project policies to avoid circular references
    - Fix project_clients policies to prevent infinite recursion
    - Ensure clean policy logic without self-referencing queries

  2. Security
    - Maintain proper access control
    - Ensure users can only access their own data
    - Prevent unauthorized access while fixing recursion
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Freelancers can read own projects" ON projects;
DROP POLICY IF EXISTS "Users can read project clients for accessible projects" ON project_clients;

-- Create simplified policies for projects
CREATE POLICY "Freelancers can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (freelancer_id = auth.uid());

CREATE POLICY "Clients can read joined projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_clients 
      WHERE project_clients.project_id = projects.id 
      AND project_clients.client_id = auth.uid()
    )
  );

-- Create simplified policies for project_clients
CREATE POLICY "Users can read project clients"
  ON project_clients
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see project clients if they are the freelancer of the project
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_clients.project_id 
      AND projects.freelancer_id = auth.uid()
    )
    OR
    -- Or if they are a client in the same project
    client_id = auth.uid()
  );