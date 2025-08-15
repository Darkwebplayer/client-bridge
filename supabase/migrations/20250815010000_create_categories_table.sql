/*
  # Create categories table for todos

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `color` (text, CSS color value)
      - `project_id` (uuid, references projects)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on categories table
    - Add policies for authenticated users based on project access
    - Freelancers can manage categories for their projects
    - Clients can view categories for projects they're part of

  3. Default Data
    - Add default categories for new projects
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6B7280', -- Default gray color
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view categories for accessible projects
CREATE POLICY "Users can view categories for accessible projects"
ON categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = categories.project_id 
    AND (
      projects.freelancer_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM project_clients 
        WHERE project_clients.project_id = categories.project_id 
        AND project_clients.client_id = auth.uid()
      )
    )
  )
);

-- Freelancers can manage categories for their projects
CREATE POLICY "Freelancers can manage categories for their projects"
ON categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = categories.project_id 
    AND projects.freelancer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = categories.project_id 
    AND projects.freelancer_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add delivery_date column to todos table
ALTER TABLE todos ADD COLUMN IF NOT EXISTS delivery_date date;

-- Function to create default categories for a new project
CREATE OR REPLACE FUNCTION create_default_categories_for_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (name, color, project_id)
  VALUES 
    ('Feature', '#3B82F6', NEW.id),  -- Blue
    ('Bug', '#EF4444', NEW.id),      -- Red
    ('Design', '#8B5CF6', NEW.id),   -- Purple
    ('Content', '#10B981', NEW.id);  -- Green
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create default categories when a project is created
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories_for_project();

-- Add a comment to the todos table to document the category field
COMMENT ON COLUMN todos.category IS 'References categories.id (not the old enum values)';