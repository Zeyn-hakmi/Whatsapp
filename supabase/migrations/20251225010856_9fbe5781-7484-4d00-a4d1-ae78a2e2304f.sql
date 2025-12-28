-- Add is_suspended column to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_suspended boolean DEFAULT false,
ADD COLUMN suspended_at timestamp with time zone,
ADD COLUMN suspended_reason text;

-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL, -- 'new_user', 'subscription_expiring', 'subscription_expired'
    title text NOT NULL,
    message text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins and moderators can view notifications
CREATE POLICY "Admins can view all notifications"
ON public.admin_notifications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Only admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications"
ON public.admin_notifications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Only admins can delete notifications
CREATE POLICY "Admins can delete notifications"
ON public.admin_notifications
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert notifications (via trigger)
CREATE POLICY "System can insert notifications"
ON public.admin_notifications
FOR INSERT
WITH CHECK (true);

-- Create function to notify admin on new user signup
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name text;
BEGIN
  -- Get user name from metadata
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User');
  
  -- Insert notification
  INSERT INTO public.admin_notifications (type, title, message, user_id, metadata)
  VALUES (
    'new_user',
    'New User Registered',
    'A new user has registered: ' || user_name,
    NEW.id,
    jsonb_build_object('email', NEW.email, 'full_name', user_name)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user notification
CREATE TRIGGER on_new_user_notify_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_user();

-- Create function to check expiring subscriptions (to be called by cron)
CREATE OR REPLACE FUNCTION public.check_expiring_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub RECORD;
BEGIN
  -- Find subscriptions expiring in next 3 days
  FOR sub IN 
    SELECT s.*, p.full_name 
    FROM subscriptions s
    LEFT JOIN profiles p ON s.user_id = p.user_id
    WHERE s.current_period_end IS NOT NULL
      AND s.current_period_end BETWEEN now() AND now() + interval '3 days'
      AND s.status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM admin_notifications n 
        WHERE n.user_id = s.user_id 
          AND n.type = 'subscription_expiring'
          AND n.created_at > now() - interval '1 day'
      )
  LOOP
    INSERT INTO admin_notifications (type, title, message, user_id, metadata)
    VALUES (
      'subscription_expiring',
      'Subscription Expiring Soon',
      COALESCE(sub.full_name, 'User') || '''s ' || sub.plan_name || ' subscription expires on ' || to_char(sub.current_period_end, 'Mon DD, YYYY'),
      sub.user_id,
      jsonb_build_object('plan_name', sub.plan_name, 'expires_at', sub.current_period_end)
    );
  END LOOP;
END;
$$;

-- Update profiles RLS to allow admins to update suspension status
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));