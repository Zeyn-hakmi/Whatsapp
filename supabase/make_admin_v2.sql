DO $$
DECLARE
  target_email TEXT := 'zhakmi@gmail.com';
  target_user_id UUID;
BEGIN
  -- 1. Get the User ID
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found. Please Sign Up first!', target_email;
  END IF;

  RAISE NOTICE 'Found User ID: %', target_user_id;

  -- 2. Update User Role (Cleaner than Insert)
  -- Since every user gets a default 'user' role on signup, we just upgrade it.
  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = target_user_id;
  
  -- Fallback: If for some reason they have no role (rare), insert one.
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (target_user_id, 'admin');
  END IF;

  -- 3. Update Subscription (The table lacks a unique constraint on user_id, so UPDATE is safer)
  UPDATE public.subscriptions
  SET 
    plan_name = 'Pro',
    status = 'active',
    message_limit = 1000000,
    bot_limit = 100,
    seat_limit = 20,
    ai_enabled = true,
    current_period_end = now() + interval '99 years'
  WHERE user_id = target_user_id;

  -- Fallback: If they have no subscription
  IF NOT FOUND THEN
     INSERT INTO public.subscriptions (
      user_id, plan_name, status, message_limit, bot_limit, seat_limit, ai_enabled, current_period_end
    ) VALUES (
      target_user_id, 'Pro', 'active', 1000000, 100, 20, true, now() + interval '99 years'
    );
  END IF;

  RAISE NOTICE 'Success! User % is now Admin and Pro.', target_email;

END $$;
