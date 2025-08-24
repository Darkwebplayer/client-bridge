-- Fix the client_allowed check to be case-insensitive and trim whitespace
-- Also handle potential null values

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
    -- Check if the project has allowed clients restriction
    -- If no allowed clients exist for the project, anyone with the link can join
    -- If allowed clients exist, only those clients can join
    (NOT EXISTS (SELECT 1 FROM allowed_clients WHERE project_id = p.id) OR
     EXISTS (
       SELECT 1 
       FROM allowed_clients 
       WHERE project_id = p.id 
       AND lower(trim(email)) = lower(trim(current_setting('request.jwt.claims', true)::json->>'email')))
    ) as client_allowed
  from
    projects p
    join profiles pr on p.freelancer_id = pr.id
  where
    p.invite_token = p_invite_token;
end;
$$;