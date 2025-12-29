-- 1. Declare the target email
DO $$
DECLARE
  target_email TEXT := 'zhakmi@gmail.com';
  target_user_id UUID;
BEGIN
  -- Get the User ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found', target_email;
  END IF;

  -- 2. Grant ADMIN Role
  -- Upsert into user_roles (insert if not exists, update if exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'admin';

  RAISE NOTICE 'Granted Admin role to %', target_email;

  -- 3. Grant Pro Subscription
  -- Upsert into subscriptions
  INSERT INTO public.subscriptions (
    user_id,
    plan_name,
    status,
    message_limit,
    bot_limit,
    ai_enabled,
    seat_limit,
    current_period_start,
    current_period_end
  )
  VALUES (
    target_user_id,
    'Pro',
    'active',
    100000, -- High limit for admin
    50,     -- Many bots
    true,   -- AI enabled
    10,     -- Team seats
    now(),
    now() + interval '100 years' -- Lifetime access
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    plan_name = 'Pro',
    status = 'active',
    ai_enabled = true,
    message_limit = 100000,
    bot_limit = 50,
    seat_limit = 10,
    current_period_end = now() + interval '100 years';

  RAISE NOTICE 'Granted Pro subscription to %', target_email;

END $$;
