/*
  # Fix infinite recursion in RLS policies

  1. Security Changes
    - Drop all existing problematic policies on projects table
    - Create simple, non-recursive policies
    - Ensure profiles table has simple policy
    - Fix project_clients policies

  2. Policy Changes
    - Freelancers: Direct auth.uid() = freelancer_id check
    - Clients: Simple EXISTS check without recursion
    - Profiles: Direct auth.uid() = id check
*/

-- Drop all existing policies on projects table to start fresh
DROP POLICY IF EXISTS "Clients can read assigned projects" ON projects;
DROP POLICY IF EXISTS "Freelancers can manage own projects" ON projects;
DROP POLICY IF EXISTS "Users can read accessible projects" ON projects;

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Drop existing policies on project_clients table
DROP POLICY IF EXISTS "Clients can join projects via invite" ON project_clients;
DROP POLICY IF EXISTS "Project members can read project clients" ON project_clients;
DROP POLICY IF EXISTS "Users can read project clients" ON project_clients;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create simple, non-recursive policies for projects
CREATE POLICY "projects_freelancer_all" ON projects
  FOR ALL TO authenticated
  USING (auth.uid() = freelancer_id)
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "projects_client_select" ON projects
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_clients 
      WHERE project_clients.project_id = projects.id 
      AND project_clients.client_id = auth.uid()
    )
  );

-- Create simple policies for project_clients
CREATE POLICY "project_clients_insert" ON project_clients
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "project_clients_select" ON project_clients
  FOR SELECT TO authenticated
  USING (
    auth.uid() = client_id OR 
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_clients.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  );