-- This policy allows clients to view projects they are a member of.
-- It fixes an issue where clients could not see their projects on the dashboard
-- because the RLS policy was missing.

-- Drop policy if it exists to make the script idempotent
DROP POLICY IF EXISTS "clients_can_view_their_projects" ON public.projects;

-- Create the policy
CREATE POLICY "clients_can_view_their_projects"
ON public.projects FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.project_clients
    WHERE project_clients.project_id = projects.id
    AND project_clients.client_id = auth.uid()
  )
);
