-- Drop existing policies for idempotency
DROP POLICY IF EXISTS "Project members can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Project members can view files" ON storage.objects;

-- This policy allows a user to INSERT (upload) a file if they are a member of the project
-- whose ID is the first folder in the file path.
-- e.g., for a path like `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6/some-file.png`,
-- it checks if the user is a member of project `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`
-- using the `is_project_member` helper function we created earlier.
CREATE POLICY "Project members can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  is_project_member((storage.foldername(name))[1]::uuid)
);

-- This policy allows a user to SELECT (view/download) a file if they are a member of the project
-- whose ID is the first folder in the file path.
CREATE POLICY "Project members can view files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files' AND
  is_project_member((storage.foldername(name))[1]::uuid)
);
