/*
  # Populate existing projects with default categories

  1. Data Migration
    - Add default categories to existing projects that don't have any categories yet
*/

-- Function to populate existing projects with default categories
DO $$
DECLARE
  proj RECORD;
BEGIN
  -- Loop through all projects that don't have any categories yet
  FOR proj IN 
    SELECT p.id 
    FROM projects p 
    WHERE NOT EXISTS (
      SELECT 1 FROM categories c WHERE c.project_id = p.id
    )
  LOOP
    -- Insert default categories for each project
    INSERT INTO categories (name, color, project_id)
    VALUES 
      ('Feature', '#3B82F6', proj.id),  -- Blue
      ('Bug', '#EF4444', proj.id),      -- Red
      ('Design', '#8B5CF6', proj.id),   -- Purple
      ('Content', '#10B981', proj.id);  -- Green
  END LOOP;
END;
$$;