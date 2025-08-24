-- Remove client restrictions for testing purposes
-- This will allow anyone with the invite link to join any project

DROP FUNCTION IF EXISTS get_project_by_invite_token(text);

CREATE OR REPLACE FUNCTION get_project_by_invite_token(p_invite_token text)
RETURNS table(id uuid, name text, description text, freelancer_name text, client_allowed boolean)
language plpgsql security definer
as $$
begin
  return query
  select
    p.id,
    p.name,
    p.description,
    pr.name as freelancer_name,
    -- Allow anyone with the link to join (for testing purposes)
    true as client_allowed
  from
    projects p
    join profiles pr on p.freelancer_id = pr.id
  where
    p.invite_token = p_invite_token;
end;
$$;