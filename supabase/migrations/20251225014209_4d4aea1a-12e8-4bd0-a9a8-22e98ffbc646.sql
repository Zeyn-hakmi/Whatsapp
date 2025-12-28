-- Add seats columns to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS seat_limit integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS seats_used integer DEFAULT 1;

-- Create team_members table to track employees under each subscription
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  member_email text NOT NULL,
  member_user_id uuid,
  role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'pending',
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  joined_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(owner_id, member_email)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Owners can view their team members
CREATE POLICY "Owners can view their team members"
ON public.team_members
FOR SELECT
USING (auth.uid() = owner_id);

-- Owners can invite team members
CREATE POLICY "Owners can invite team members"
ON public.team_members
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their team members
CREATE POLICY "Owners can update their team members"
ON public.team_members
FOR UPDATE
USING (auth.uid() = owner_id);

-- Owners can remove team members
CREATE POLICY "Owners can remove team members"
ON public.team_members
FOR DELETE
USING (auth.uid() = owner_id);

-- Members can view their own membership
CREATE POLICY "Members can view their own membership"
ON public.team_members
FOR SELECT
USING (auth.uid() = member_user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check seat availability
CREATE OR REPLACE FUNCTION public.check_seat_availability(owner_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT seat_limit > seats_used 
     FROM subscriptions 
     WHERE user_id = owner_uuid 
     LIMIT 1),
    false
  )
$$;

-- Create function to increment seats used
CREATE OR REPLACE FUNCTION public.increment_seats_used()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE subscriptions 
  SET seats_used = seats_used + 1 
  WHERE user_id = NEW.owner_id;
  RETURN NEW;
END;
$$;

-- Create function to decrement seats used
CREATE OR REPLACE FUNCTION public.decrement_seats_used()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE subscriptions 
  SET seats_used = GREATEST(1, seats_used - 1)
  WHERE user_id = OLD.owner_id;
  RETURN OLD;
END;
$$;

-- Trigger to auto-increment seats on new member
CREATE TRIGGER on_team_member_added
  AFTER INSERT ON public.team_members
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION public.increment_seats_used();

-- Trigger to auto-decrement seats on member removal
CREATE TRIGGER on_team_member_removed
  AFTER DELETE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_seats_used();