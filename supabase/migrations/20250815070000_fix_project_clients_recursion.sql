-- Completely restructure RLS policies to eliminate circular references

-- Drop all policies that could cause recursion
DROP POLICY IF EXISTS "Clients can view projects they are a member of" ON public.projects;
DROP POLICY IF EXISTS "Clients can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can view their own project links" ON public.project_clients;
DROP POLICY IF EXISTS "Freelancers can view clients in their projects" ON public.project_clients;
DROP POLICY IF EXISTS "Freelancers can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can view their own project links" ON public.project_clients;

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

-- Create a new function with SECURITY DEFINER that bypasses RLS entirely
-- This function can be used by freelancers to get client information safely
CREATE OR REPLACE FUNCTION get_project_clients_for_freelancer(project_uuid uuid)
RETURNS TABLE (
    id uuid,
    project_id uuid,
    client_id uuid,
    joined_at timestamptz,
    client_name text,
    client_avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        pc.id,
        pc.project_id,
        pc.client_id,
        pc.joined_at,
        p.name as client_name,
        p.avatar_url as client_avatar_url
    FROM project_clients pc
    JOIN profiles p ON pc.client_id = p.id
    WHERE pc.project_id = project_uuid
    AND EXISTS (
        SELECT 1 FROM projects pr 
        WHERE pr.id = pc.project_id 
        AND pr.freelancer_id = auth.uid()
    )
$$;