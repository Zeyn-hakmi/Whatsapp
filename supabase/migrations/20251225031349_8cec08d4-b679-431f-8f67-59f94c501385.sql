-- Create team member assignments table for bots
CREATE TABLE public.team_member_bot_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (team_member_id, bot_id)
);

-- Create team member assignments table for contacts
CREATE TABLE public.team_member_contact_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (team_member_id, contact_id)
);

-- Enable RLS
ALTER TABLE public.team_member_bot_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_contact_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for bot assignments - owners can manage
CREATE POLICY "Owners can view bot assignments" 
ON public.team_member_bot_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_member_bot_assignments.team_member_id
    AND tm.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can create bot assignments" 
ON public.team_member_bot_assignments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_member_bot_assignments.team_member_id
    AND tm.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete bot assignments" 
ON public.team_member_bot_assignments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_member_bot_assignments.team_member_id
    AND tm.owner_id = auth.uid()
  )
);

-- Team members can view their own assignments
CREATE POLICY "Members can view their own bot assignments" 
ON public.team_member_bot_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_member_bot_assignments.team_member_id
    AND tm.member_user_id = auth.uid()
  )
);

-- RLS policies for contact assignments - owners can manage
CREATE POLICY "Owners can view contact assignments" 
ON public.team_member_contact_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_member_contact_assignments.team_member_id
    AND tm.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can create contact assignments" 
ON public.team_member_contact_assignments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_member_contact_assignments.team_member_id
    AND tm.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete contact assignments" 
ON public.team_member_contact_assignments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_member_contact_assignments.team_member_id
    AND tm.owner_id = auth.uid()
  )
);

-- Team members can view their own assignments
CREATE POLICY "Members can view their own contact assignments" 
ON public.team_member_contact_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.id = team_member_contact_assignments.team_member_id
    AND tm.member_user_id = auth.uid()
  )
);