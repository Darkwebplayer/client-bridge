/*
  # Completely Fix RLS Infinite Recursion

  1. Disable RLS temporarily on all tables
  2. Drop all existing policies that cause recursion
  3. Recreate simple, non-recursive policies
  4. Re-enable RLS with safe policies

  This migration completely resolves the infinite recursion issue by:
  - Removing all circular policy references
  - Using only direct auth.uid() comparisons
  - Avoiding complex subqueries that reference the same table
*/

-- Temporarily disable RLS to allow cleanup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE thread_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

DROP POLICY IF EXISTS "projects_client_select" ON projects;
DROP POLICY IF EXISTS "projects_freelancer_all" ON projects;

DROP POLICY IF EXISTS "project_clients_insert" ON project_clients;
DROP POLICY IF EXISTS "project_clients_select" ON project_clients;

DROP POLICY IF EXISTS "Freelancers can manage todos for own projects" ON todos;
DROP POLICY IF EXISTS "Users can read todos for accessible projects" ON todos;

DROP POLICY IF EXISTS "Freelancers can update threads for own projects" ON threads;
DROP POLICY IF EXISTS "Users can create threads for accessible projects" ON threads;
DROP POLICY IF EXISTS "Users can read threads for accessible projects" ON threads;

DROP POLICY IF EXISTS "Users can create replies for accessible threads" ON thread_replies;
DROP POLICY IF EXISTS "Users can read replies for accessible threads" ON thread_replies;
DROP POLICY IF EXISTS "Users can update own replies" ON thread_replies;

DROP POLICY IF EXISTS "Freelancers can manage documents for own projects" ON documents;
DROP POLICY IF EXISTS "Users can read documents for accessible projects" ON documents;

-- Create simple, non-recursive policies

-- Profiles: Direct user access only
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Projects: Simple freelancer ownership
CREATE POLICY "projects_freelancer_all" ON projects
  FOR ALL TO authenticated
  USING (auth.uid() = freelancer_id)
  WITH CHECK (auth.uid() = freelancer_id);

-- Project clients: Simple ownership
CREATE POLICY "project_clients_own" ON project_clients
  FOR ALL TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Todos: Only freelancers can manage (no complex joins)
CREATE POLICY "todos_freelancer_only" ON todos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = todos.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = todos.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  );

-- Threads: Simple policies without recursion
CREATE POLICY "threads_project_access" ON threads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = threads.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  );

CREATE POLICY "threads_create" ON threads
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = threads.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  );

-- Thread replies: Simple policies
CREATE POLICY "thread_replies_read" ON thread_replies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM threads t
      JOIN projects p ON t.project_id = p.id
      WHERE t.id = thread_replies.thread_id 
      AND p.freelancer_id = auth.uid()
    )
  );

CREATE POLICY "thread_replies_create" ON thread_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM threads t
      JOIN projects p ON t.project_id = p.id
      WHERE t.id = thread_replies.thread_id 
      AND p.freelancer_id = auth.uid()
    )
  );

-- Documents: Simple freelancer-only access
CREATE POLICY "documents_freelancer_only" ON documents
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = documents.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = documents.project_id 
      AND projects.freelancer_id = auth.uid()
    )
  );

-- Re-enable RLS with the new safe policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;