/*
  # Initial Schema for ClientBridge

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `role` (enum: freelancer, client)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `timeline` (text)
      - `progress` (integer, 0-100)
      - `status` (enum: active, completed, on-hold)
      - `freelancer_id` (uuid, references profiles)
      - `invite_token` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `project_clients`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `client_id` (uuid, references profiles)
      - `joined_at` (timestamp)
    - `todos`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `title` (text)
      - `description` (text, optional)
      - `completed` (boolean, default false)
      - `category` (enum: feature, bug, design, content)
      - `priority` (enum: low, medium, high)
      - `created_at` (timestamp)
      - `completed_at` (timestamp, optional)
    - `threads`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `title` (text)
      - `category` (enum: general, bug, feature, feedback)
      - `creator_id` (uuid, references profiles)
      - `is_resolved` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `thread_replies`
      - `id` (uuid, primary key)
      - `thread_id` (uuid, references threads)
      - `author_id` (uuid, references profiles)
      - `content` (text)
      - `is_edited` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `documents`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `title` (text)
      - `type` (enum: invoice, contract, proposal)
      - `link` (text)
      - `amount` (decimal, optional)
      - `status` (enum: pending, paid, overdue, draft)
      - `due_date` (date, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on project access
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('freelancer', 'client');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'on-hold');
CREATE TYPE todo_category AS ENUM ('feature', 'bug', 'design', 'content');
CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE thread_category AS ENUM ('general', 'bug', 'feature', 'feedback');
CREATE TYPE document_type AS ENUM ('invoice', 'contract', 'proposal');
CREATE TYPE document_status AS ENUM ('pending', 'paid', 'overdue', 'draft');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role user_role NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  timeline text NOT NULL,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status project_status DEFAULT 'active',
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project clients junction table
CREATE TABLE IF NOT EXISTS project_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(project_id, client_id)
);

-- Todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed boolean DEFAULT false,
  category todo_category NOT NULL,
  priority todo_priority DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Threads table
CREATE TABLE IF NOT EXISTS threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  category thread_category DEFAULT 'general',
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Thread replies table
CREATE TABLE IF NOT EXISTS thread_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  type document_type NOT NULL,
  link text NOT NULL,
  amount decimal(10,2),
  status document_status DEFAULT 'draft',
  due_date date,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Freelancers can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    freelancer_id = auth.uid() OR
    id IN (SELECT project_id FROM project_clients WHERE client_id = auth.uid())
  );

CREATE POLICY "Freelancers can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "Freelancers can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (freelancer_id = auth.uid());

-- Project clients policies
CREATE POLICY "Users can read project clients for accessible projects"
  ON project_clients
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE freelancer_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_clients WHERE client_id = auth.uid())
    )
  );

CREATE POLICY "Clients can join projects via invite"
  ON project_clients
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Todos policies
CREATE POLICY "Users can read todos for accessible projects"
  ON todos
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE freelancer_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_clients WHERE client_id = auth.uid())
    )
  );

CREATE POLICY "Freelancers can manage todos for own projects"
  ON todos
  FOR ALL
  TO authenticated
  USING (
    project_id IN (SELECT id FROM projects WHERE freelancer_id = auth.uid())
  )
  WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE freelancer_id = auth.uid())
  );

-- Threads policies
CREATE POLICY "Users can read threads for accessible projects"
  ON threads
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE freelancer_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_clients WHERE client_id = auth.uid())
    )
  );

CREATE POLICY "Users can create threads for accessible projects"
  ON threads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_id = auth.uid() AND
    project_id IN (
      SELECT id FROM projects 
      WHERE freelancer_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_clients WHERE client_id = auth.uid())
    )
  );

CREATE POLICY "Freelancers can update threads for own projects"
  ON threads
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (SELECT id FROM projects WHERE freelancer_id = auth.uid())
  );

-- Thread replies policies
CREATE POLICY "Users can read replies for accessible threads"
  ON thread_replies
  FOR SELECT
  TO authenticated
  USING (
    thread_id IN (
      SELECT t.id FROM threads t
      JOIN projects p ON t.project_id = p.id
      WHERE p.freelancer_id = auth.uid() OR 
      p.id IN (SELECT project_id FROM project_clients WHERE client_id = auth.uid())
    )
  );

CREATE POLICY "Users can create replies for accessible threads"
  ON thread_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    thread_id IN (
      SELECT t.id FROM threads t
      JOIN projects p ON t.project_id = p.id
      WHERE p.freelancer_id = auth.uid() OR 
      p.id IN (SELECT project_id FROM project_clients WHERE client_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own replies"
  ON thread_replies
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can read documents for accessible projects"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE freelancer_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_clients WHERE client_id = auth.uid())
    )
  );

CREATE POLICY "Freelancers can manage documents for own projects"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    project_id IN (SELECT id FROM projects WHERE freelancer_id = auth.uid())
  )
  WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE freelancer_id = auth.uid())
  );

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at
  BEFORE UPDATE ON threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thread_replies_updated_at
  BEFORE UPDATE ON thread_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();