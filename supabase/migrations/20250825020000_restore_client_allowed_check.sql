-- This migration restores the security check for project invitations.
-- It replaces a testing function that allowed any user to join a project.
-- The new function correctly checks if a logged-in user's email is in the
-- `allowed_clients` table for the project.
-- It also allows new/unauthenticated users to view the invite page so they can sign up,
-- with the check being enforced after they log in.
-- It also ensures that the project owner (freelancer) can always access the invite page.

DROP FUNCTION IF EXISTS get_project_by_invite_token(text);

CREATE OR REPLACE FUNCTION get_project_by_invite_token(p_invite_token text)
RETURNS table(id uuid, name text, description text, freelancer_name text, client_allowed boolean)
language plpgsql security definer
as $$
declare
  jwt_claims json;
  user_email text;
begin
  -- Try to get JWT claims, but don't fail if they don't exist (for anonymous users)
  begin
    jwt_claims := current_setting('request.jwt.claims', true)::json;
    user_email := jwt_claims->>'email';
  exception
    when others then
      jwt_claims := null;
      user_email := null;
  end;

  return query
  select
    p.id,
    p.name,
    p.description,
    pr.name as freelancer_name,
    -- Logic for client_allowed:
    (
      p.freelancer_id = auth.uid() OR -- Check if the current user is the project owner
      user_email IS NULL OR -- Allow anonymous users to see the signup form
      NOT EXISTS (SELECT 1 FROM public.allowed_clients WHERE project_id = p.id) OR -- Allow if no clients are specified
      EXISTS ( -- Allow if the user's email is in the allowed list
        SELECT 1
        FROM public.allowed_clients
        WHERE project_id = p.id
        AND lower(trim(email)) = lower(trim(user_email))
      )
    ) as client_allowed
  from
    public.projects p
    join public.profiles pr on p.freelancer_id = pr.id
  where
    p.invite_token = p_invite_token;
end;
$$;
