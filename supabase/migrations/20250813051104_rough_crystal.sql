/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - Current RLS policies on projects table are causing infinite recursion
    - Policies reference project_clients table which creates circular dependencies
    - This prevents any database queries from completing

  2. Solution
    - Drop existing problematic policies
    - Create new simplified policies that avoid circular references
    - Use direct user ID checks instead of subqueries where possible

  3. Security
    - Maintain same security model but with non-recursive policy logic
    - Freelancers can manage their own projects
    - Clients can only read projects they're explicitly added to
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Clients can read joined projects" ON projects;
DROP POLICY IF EXISTS "Users can read accessible projects" ON projects;
DROP POLICY IF EXISTS "Freelancers can create projects" ON projects;
DROP POLICY IF EXISTS "Freelancers can update own projects" ON projects;

-- Create new non-recursive policies for projects table
CREATE POLICY "Freelancers can manage own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (freelancer_id = auth.uid())
  WITH CHECK (freelancer_id = auth.uid());

-- For clients to read projects, we'll use a simpler approach
-- This policy allows reading if the user is in the project_clients table for this project
CREATE POLICY "Clients can read assigned projects"
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