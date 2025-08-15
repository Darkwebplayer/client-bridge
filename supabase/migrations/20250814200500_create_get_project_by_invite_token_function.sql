-- This function is created to work around a URL encoding issue where special characters
-- in the invite_token (like '+') were being misinterpreted by the PostgREST `eq` filter.
-- By using an RPC call, the token is sent in the request body, avoiding URL encoding problems.
--
-- In InvitePage.tsx, the original query was:
-- .select(`
--   id,
--   name,
--   description,
--   profiles!projects_freelancer_id_fkey(name)
-- `)
-- The result object has a shape like: { id: '...', name: '...', description: '...', profiles: { name: '...' } }
--
-- This RPC function flattens the result to avoid the nested object.
-- The returned columns (id, name, description, freelancer_name) are directly accessible.
-- The client-side code in InvitePage.tsx will be updated to use `project.freelancer_name`
-- instead of `project.profiles.name`.

CREATE OR REPLACE FUNCTION get_project_by_invite_token(p_invite_token text)
RETURNS table(id uuid, name text, description text, freelancer_name text)
language plpgsql security definer
as $$
begin
  return query
  select
    p.id,
    p.name,
    p.description,
    pr.name as freelancer_name
  from
    projects p
    join profiles pr on p.freelancer_id = pr.id
  where
    p.invite_token = p_invite_token;
end;
$$;
