-- "Nuclear" Fix for Admin Access
-- This script deletes any existing roles/subscriptions for the user and force-creates new ones.
DO $$
DECLARE
  target_email TEXT := 'zhakmi@gmail.com';
  target_user_id UUID;
BEGIN
  ----------------------------------------------------
  -- 1. Find the User
  ----------------------------------------------------
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION '❌ User % not found! Please create the account first.', target_email;
  END IF;

  RAISE NOTICE 'Found User: % (ID: %)', target_email, target_user_id;

  ----------------------------------------------------
  -- 2. Fix Roles (Delete & Re-create)
  ----------------------------------------------------
  -- Remove ANY existing roles to ensure clean slate
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Insert the single ADMIN role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin');

  ----------------------------------------------------
  -- 3. Fix Subscription (Delete & Re-create)
  ----------------------------------------------------
  -- Remove ANY existing subscription
  DELETE FROM public.subscriptions WHERE user_id = target_user_id;

  -- Insert the PRO subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan_name,
    status,
    message_limit,
    bot_limit,
    seat_limit,
    ai_enabled,
    current_period_start,
    current_period_end
  )
  VALUES (
    target_user_id,
    'Pro',
    'active',
    1000000,
    100,
    20,
    true,
    now(),
    now() + interval '99 years'
  );

  RAISE NOTICE '✅ SUCCESS! User % is strictly set to ADMIN and PRO.', target_email;

END $$;
