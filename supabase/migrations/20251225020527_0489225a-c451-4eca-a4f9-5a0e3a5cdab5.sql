-- Create a function to get the owner_id for a team member (or return user's own id if not a team member)
CREATE OR REPLACE FUNCTION public.get_effective_user_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT owner_id FROM public.team_members 
     WHERE member_user_id = _user_id 
     AND status = 'active' 
     LIMIT 1),
    _user_id
  )
$$;

-- Create a function to check if user can access owner's data
CREATE OR REPLACE FUNCTION public.can_access_user_data(_user_id uuid, _owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    _user_id = _owner_id  -- User is the owner
    OR EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE member_user_id = _user_id 
      AND owner_id = _owner_id 
      AND status = 'active'
    )
$$;

-- Update RLS policies for contacts to allow team member access
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
CREATE POLICY "Users can view accessible contacts" ON public.contacts
FOR SELECT USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own contacts" ON public.contacts;
CREATE POLICY "Users can create contacts" ON public.contacts
FOR INSERT WITH CHECK (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
CREATE POLICY "Users can update accessible contacts" ON public.contacts
FOR UPDATE USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
CREATE POLICY "Users can delete accessible contacts" ON public.contacts
FOR DELETE USING (can_access_user_data(auth.uid(), user_id));

-- Update RLS policies for bots
DROP POLICY IF EXISTS "Users can view their own bots" ON public.bots;
CREATE POLICY "Users can view accessible bots" ON public.bots
FOR SELECT USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own bots" ON public.bots;
CREATE POLICY "Users can create bots" ON public.bots
FOR INSERT WITH CHECK (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can update their own bots" ON public.bots;
CREATE POLICY "Users can update accessible bots" ON public.bots
FOR UPDATE USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can delete their own bots" ON public.bots;
CREATE POLICY "Users can delete accessible bots" ON public.bots
FOR DELETE USING (can_access_user_data(auth.uid(), user_id));

-- Update RLS policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view accessible conversations" ON public.conversations
FOR SELECT USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update accessible conversations" ON public.conversations
FOR UPDATE USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
CREATE POLICY "Users can delete accessible conversations" ON public.conversations
FOR DELETE USING (can_access_user_data(auth.uid(), user_id));

-- Update RLS policies for messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view accessible messages" ON public.messages
FOR SELECT USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own messages" ON public.messages;
CREATE POLICY "Users can create messages" ON public.messages
FOR INSERT WITH CHECK (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update accessible messages" ON public.messages
FOR UPDATE USING (can_access_user_data(auth.uid(), user_id));

-- Update RLS policies for templates
DROP POLICY IF EXISTS "Users can view their own templates" ON public.message_templates;
CREATE POLICY "Users can view accessible templates" ON public.message_templates
FOR SELECT USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own templates" ON public.message_templates;
CREATE POLICY "Users can create templates" ON public.message_templates
FOR INSERT WITH CHECK (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can update their own templates" ON public.message_templates;
CREATE POLICY "Users can update accessible templates" ON public.message_templates
FOR UPDATE USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.message_templates;
CREATE POLICY "Users can delete accessible templates" ON public.message_templates
FOR DELETE USING (can_access_user_data(auth.uid(), user_id));

-- Update RLS policies for phone_numbers
DROP POLICY IF EXISTS "Users can view their own phone numbers" ON public.phone_numbers;
CREATE POLICY "Users can view accessible phone numbers" ON public.phone_numbers
FOR SELECT USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own phone numbers" ON public.phone_numbers;
CREATE POLICY "Users can create phone numbers" ON public.phone_numbers
FOR INSERT WITH CHECK (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can update their own phone numbers" ON public.phone_numbers;
CREATE POLICY "Users can update accessible phone numbers" ON public.phone_numbers
FOR UPDATE USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can delete their own phone numbers" ON public.phone_numbers;
CREATE POLICY "Users can delete accessible phone numbers" ON public.phone_numbers
FOR DELETE USING (can_access_user_data(auth.uid(), user_id));

-- Update RLS policies for ai_agents
DROP POLICY IF EXISTS "Users can view their own AI agents" ON public.ai_agents;
CREATE POLICY "Users can view accessible AI agents" ON public.ai_agents
FOR SELECT USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own AI agents" ON public.ai_agents;
CREATE POLICY "Users can create AI agents" ON public.ai_agents
FOR INSERT WITH CHECK (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can update their own AI agents" ON public.ai_agents;
CREATE POLICY "Users can update accessible AI agents" ON public.ai_agents
FOR UPDATE USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can delete their own AI agents" ON public.ai_agents;
CREATE POLICY "Users can delete accessible AI agents" ON public.ai_agents
FOR DELETE USING (can_access_user_data(auth.uid(), user_id));

-- Update RLS policies for bot_sessions
DROP POLICY IF EXISTS "Users can view their own bot sessions" ON public.bot_sessions;
CREATE POLICY "Users can view accessible bot sessions" ON public.bot_sessions
FOR SELECT USING (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own bot sessions" ON public.bot_sessions;
CREATE POLICY "Users can create bot sessions" ON public.bot_sessions
FOR INSERT WITH CHECK (can_access_user_data(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can update their own bot sessions" ON public.bot_sessions;
CREATE POLICY "Users can update accessible bot sessions" ON public.bot_sessions
FOR UPDATE USING (can_access_user_data(auth.uid(), user_id));