-- Seed Admin User and Subscription
-- This migration runs automatically when you push the DB
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Look up the user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'zhakmi@gmail.com';

  -- Only proceed if user exists
  IF target_user_id IS NOT NULL THEN
    
    -- 1. Grant ADMIN Role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

    -- 2. Grant PRO Subscription
    INSERT INTO public.subscriptions (
      user_id,
      plan_name,
      status,
      message_limit,
      bot_limit,
      seat_limit,
      ai_enabled,
      current_period_end
    )
    VALUES (
      target_user_id,
      'Pro',
      'active',
      1000000, -- 1 Million messages
      100,     -- 100 Bots
      20,      -- 20 Seats
      true,    -- AI Enabled
      now() + interval '99 years' -- Lifetime
    )
    ON CONFLICT (user_id) DO UPDATE SET 
      plan_name = 'Pro',
      status = 'active',
      ai_enabled = true;
      
  END IF;
END $$;
