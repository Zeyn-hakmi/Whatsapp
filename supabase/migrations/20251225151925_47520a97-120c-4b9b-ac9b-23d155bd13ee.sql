-- Add assigned_to column for team member assignment
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'whatsapp';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON public.conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_source ON public.conversations(source);
CREATE INDEX IF NOT EXISTS idx_messages_source ON public.messages(source);

-- Update RLS to allow team members to see assigned conversations
CREATE POLICY "Team members can view assigned conversations"
ON public.conversations
FOR SELECT
USING (
  assigned_to IN (
    SELECT id FROM public.team_members 
    WHERE member_user_id = auth.uid() AND status = 'active'
  )
);

-- Allow owners to assign conversations
CREATE POLICY "Owners can assign conversations"
ON public.conversations
FOR UPDATE
USING (can_access_user_data(auth.uid(), user_id));