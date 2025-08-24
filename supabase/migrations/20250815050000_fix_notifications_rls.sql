-- Add INSERT policy for notifications table
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
