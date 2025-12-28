-- Add assignment_alerts column to notification_settings
ALTER TABLE public.notification_settings
ADD COLUMN assignment_alerts BOOLEAN DEFAULT true;