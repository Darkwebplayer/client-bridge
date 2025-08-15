-- Enable RLS for all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Freelancers can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can view projects they are a member of" ON public.projects;
DROP POLICY IF EXISTS "Clients can view their own project links" ON public.project_clients;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Policies for 'projects' table
CREATE POLICY "Freelancers can view their own projects"
ON public.projects FOR SELECT
USING (auth.uid() = freelancer_id);

CREATE POLICY "Clients can view projects they are a member of"
ON public.projects FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM project_clients
    WHERE project_clients.project_id = projects.id
    AND project_clients.client_id = auth.uid()
  )
);

-- Policies for 'project_clients' table
CREATE POLICY "Clients can view their own project links"
ON public.project_clients FOR SELECT
USING (auth.uid() = client_id);

-- Policies for 'profiles' table
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Note: For a full application, you would need more policies for insert, update, delete
-- and for all other tables (documents, threads, etc.). These are the minimum required
-- to fix the client dashboard view.
