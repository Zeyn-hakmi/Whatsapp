-- Create a function to send new user email notification via edge function
CREATE OR REPLACE FUNCTION public.notify_admin_new_user_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Call the edge function to send email (async via pg_net)
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-admin',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'type', 'new_user',
      'data', jsonb_build_object(
        'email', NEW.email,
        'full_name', COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Not provided'),
        'user_id', NEW.id
      )
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block user creation if email fails
    RAISE LOG 'Failed to send new user email notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for new user email notifications
DROP TRIGGER IF EXISTS on_new_user_email_notify ON auth.users;
CREATE TRIGGER on_new_user_email_notify
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_user_email();