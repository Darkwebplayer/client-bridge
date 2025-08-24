/*
  # Fix project_clients recursion and add allowed_clients table

  1. Security Changes
    - Fix infinite recursion in project_clients policies
    - Add allowed_clients table for project invitations
*/

-- Drop existing policies that could cause conflicts
DROP POLICY IF EXISTS "Freelancers can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can view their own project links" ON public.project_clients;
DROP POLICY IF EXISTS "Freelancers can view clients in their projects" ON public.project_clients;
DROP POLICY IF EXISTS "freelancers_view_own_projects" ON public.projects;
DROP POLICY IF EXISTS "clients_view_own_links" ON public.project_clients;

-- For projects table, keep it simple - only freelancers can view their own projects
-- Clients will access projects through other means
CREATE POLICY "freelancers_view_own_projects"
ON public.projects FOR SELECT
USING (auth.uid() = freelancer_id);

-- For project_clients table, only allow clients to view their own records
-- Freelancers will need to use a different approach to view clients
CREATE POLICY "clients_view_own_links"
ON public.project_clients FOR SELECT
USING (client_id = auth.uid());

-- Create allowed_clients table
CREATE TABLE IF NOT EXISTS allowed_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  UNIQUE(project_id, email)
);

-- Enable RLS
ALTER TABLE allowed_clients ENABLE ROW LEVEL SECURITY;

-- Create policies for allowed_clients
CREATE POLICY "freelancers_manage_allowed_clients"
  ON allowed_clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = allowed_clients.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = allowed_clients.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  );

CREATE POLICY "users_view_allowed_clients"
  ON allowed_clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = allowed_clients.project_id 
      AND (
        projects.freelancer_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM project_clients 
          WHERE project_clients.project_id = allowed_clients.project_id 
          AND project_clients.client_id = auth.uid()
        )
      )
    )
  );