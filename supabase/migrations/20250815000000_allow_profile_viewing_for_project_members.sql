-- Drop the old policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy that allows users to view profiles of other project members
CREATE POLICY "Users can view profiles of project members"
ON public.profiles FOR SELECT
USING (
  -- Users can always view their own profile
  auth.uid() = id
  OR
  -- Users can view profiles of other members of their projects
  EXISTS (
    SELECT 1
    FROM project_clients pc1
    JOIN project_clients pc2 ON pc1.project_id = pc2.project_id
    WHERE pc1.client_id = auth.uid() AND pc2.client_id = profiles.id
  )
  OR
  -- Freelancers can view profiles of their clients
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN project_clients pc ON p.id = pc.project_id
    WHERE p.freelancer_id = auth.uid() AND pc.client_id = profiles.id
  )
  OR
  -- Clients can view profiles of their freelancers
  EXISTS (
    SELECT 1
    FROM project_clients pc
    JOIN projects p ON pc.project_id = p.id
    WHERE pc.client_id = auth.uid() AND p.freelancer_id = profiles.id
  )
);