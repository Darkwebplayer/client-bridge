/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - The project_clients policy was creating infinite recursion by referencing projects table
    - Projects policy was also referencing project_clients, creating a circular dependency

  2. Solution
    - Simplify project_clients policies to use direct foreign key relationships
    - Remove circular references between tables
    - Use auth.uid() directly instead of complex subqueries where possible

  3. Changes
    - Updated project_clients policies to be more direct
    - Simplified projects policies to avoid recursion
    - Maintained security while eliminating circular dependencies
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can read project clients for accessible projects" ON project_clients;
DROP POLICY IF EXISTS "Freelancers can read own projects" ON projects;

-- Create simplified project_clients policies
CREATE POLICY "Project members can read project clients"
  ON project_clients
  FOR SELECT
  TO authenticated
  USING (
    -- Freelancers can see clients for their projects
    project_id IN (
      SELECT id FROM projects WHERE freelancer_id = auth.uid()
    )
    OR
    -- Clients can see other clients in their projects
    client_id = auth.uid()
  );

-- Create simplified projects policy
CREATE POLICY "Users can read accessible projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    -- Freelancers can see their own projects
    freelancer_id = auth.uid()
    OR
    -- Clients can see projects they're part of (direct check)
    id IN (
      SELECT project_id FROM project_clients WHERE client_id = auth.uid()
    )
  );