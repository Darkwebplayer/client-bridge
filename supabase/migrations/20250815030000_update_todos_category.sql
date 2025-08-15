/*
  # Update todos table to use category IDs instead of enum values

  1. Table Changes
    - Change the category column to reference category IDs
    - Update existing todos to use the new category format
*/

-- First, let's add a new column for the category ID
ALTER TABLE todos ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);

-- Update existing todos with 'feature' category
UPDATE todos 
SET category_id = (
  SELECT c.id 
  FROM categories c 
  WHERE c.project_id = todos.project_id 
  AND c.name = 'Feature'
  LIMIT 1
)
WHERE category = 'feature';

-- Update existing todos with 'bug' category
UPDATE todos 
SET category_id = (
  SELECT c.id 
  FROM categories c 
  WHERE c.project_id = todos.project_id 
  AND c.name = 'Bug'
  LIMIT 1
)
WHERE category = 'bug';

-- Update existing todos with 'design' category
UPDATE todos 
SET category_id = (
  SELECT c.id 
  FROM categories c 
  WHERE c.project_id = todos.project_id 
  AND c.name = 'Design'
  LIMIT 1
)
WHERE category = 'design';

-- Update existing todos with 'content' category
UPDATE todos 
SET category_id = (
  SELECT c.id 
  FROM categories c 
  WHERE c.project_id = todos.project_id 
  AND c.name = 'Content'
  LIMIT 1
)
WHERE category = 'content';

-- For any todos that still don't have a category_id, assign them to the first category of their project
UPDATE todos 
SET category_id = (
  SELECT id 
  FROM categories 
  WHERE categories.project_id = todos.project_id 
  LIMIT 1
)
WHERE category_id IS NULL AND category IS NOT NULL;

-- Make the category_id column NOT NULL
ALTER TABLE todos ALTER COLUMN category_id SET NOT NULL;

-- Drop the old category column and rename the new one
ALTER TABLE todos DROP COLUMN category;
ALTER TABLE todos RENAME COLUMN category_id TO category;