-- Helper function to check if a user is a member of a project (either freelancer or client)
CREATE OR REPLACE FUNCTION is_project_member(p_project_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Run with the permissions of the function owner, bypassing RLS for the check
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id
    AND (
      -- User is the freelancer who owns the project
      freelancer_id = auth.uid()
      OR
      -- User is a client on the project
      EXISTS (
        SELECT 1 FROM project_clients
        WHERE project_id = p_project_id AND client_id = auth.uid()
      )
    )
  );
$$;

-- Drop old policies if they exist, for idempotency
DROP POLICY IF EXISTS "Users can manage todos for projects they are members of" ON public.todos;
DROP POLICY IF EXISTS "Users can view todos for accessible projects" ON public.todos;
DROP POLICY IF EXISTS "Freelancers can create todos for their projects" ON public.todos;

DROP POLICY IF EXISTS "Users can manage documents for projects they are members of" ON public.documents;
DROP POLICY IF EXISTS "Users can view documents for accessible projects" ON public.documents;
DROP POLICY IF EXISTS "Project members can create documents" ON public.documents;

DROP POLICY IF EXISTS "Users can manage threads for projects they are members of" ON public.threads;
DROP POLICY IF EXISTS "Users can view threads for accessible projects" ON public.threads;
DROP POLICY IF EXISTS "Project members can create threads" ON public.threads;

DROP POLICY IF EXISTS "Users can manage replies for threads they have access to" ON public.thread_replies;
DROP POLICY IF EXISTS "Users can view replies for accessible threads" ON public.thread_replies;
DROP POLICY IF EXISTS "Project members can create replies in accessible threads" ON public.thread_replies;


-- === Policies for 'todos' table ===
CREATE POLICY "Users can view todos for accessible projects"
ON public.todos FOR SELECT
USING ( is_project_member(project_id) );

CREATE POLICY "Freelancers can create todos for their projects"
ON public.todos FOR INSERT
WITH CHECK ( (SELECT p.freelancer_id FROM projects p WHERE p.id = todos.project_id) = auth.uid() );


-- === Policies for 'documents' table ===
CREATE POLICY "Users can view documents for accessible projects"
ON public.documents FOR SELECT
USING ( is_project_member(project_id) );

CREATE POLICY "Project members can create documents"
ON public.documents FOR INSERT
WITH CHECK ( is_project_member(project_id) );


-- === Policies for 'threads' table ===
CREATE POLICY "Users can view threads for accessible projects"
ON public.threads FOR SELECT
USING ( is_project_member(project_id) );

CREATE POLICY "Project members can create threads"
ON public.threads FOR INSERT
WITH CHECK ( is_project_member(project_id) );


-- === Policies for 'thread_replies' table ===
CREATE POLICY "Users can view replies for accessible threads"
ON public.thread_replies FOR SELECT
USING ( EXISTS (SELECT 1 FROM threads WHERE threads.id = thread_replies.thread_id AND is_project_member(threads.project_id)) );

CREATE POLICY "Project members can create replies in accessible threads"
ON public.thread_replies FOR INSERT
WITH CHECK ( EXISTS (SELECT 1 FROM threads WHERE threads.id = thread_replies.thread_id AND is_project_member(threads.project_id)) );

-- Note: More policies for UPDATE and DELETE would be needed for full functionality.
