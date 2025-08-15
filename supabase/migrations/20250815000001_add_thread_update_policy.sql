-- Add UPDATE policy for threads table
-- Only freelancers who own the project can update threads
CREATE POLICY "Freelancers can update threads for their projects"
ON public.threads FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = threads.project_id 
    AND projects.freelancer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = threads.project_id 
    AND projects.freelancer_id = auth.uid()
  )
);