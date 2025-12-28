-- Allow admins and moderators to view all compliance logs
CREATE POLICY "Admins can view all compliance logs"
ON public.compliance_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));