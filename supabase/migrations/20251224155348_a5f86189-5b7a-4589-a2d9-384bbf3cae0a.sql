-- Create table to track bot conversation sessions
CREATE TABLE public.bot_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'dropped'
  trigger_keyword TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track node interactions within sessions
CREATE TABLE public.bot_node_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.bot_sessions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  node_label TEXT,
  interacted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_response TEXT,
  is_drop_off BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_node_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for bot_sessions
CREATE POLICY "Users can view their own bot sessions" 
ON public.bot_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bot sessions" 
ON public.bot_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot sessions" 
ON public.bot_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for bot_node_interactions (through session ownership)
CREATE POLICY "Users can view their own node interactions" 
ON public.bot_node_interactions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.bot_sessions 
  WHERE bot_sessions.id = bot_node_interactions.session_id 
  AND bot_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can create their own node interactions" 
ON public.bot_node_interactions FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.bot_sessions 
  WHERE bot_sessions.id = bot_node_interactions.session_id 
  AND bot_sessions.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_bot_sessions_bot_id ON public.bot_sessions(bot_id);
CREATE INDEX idx_bot_sessions_user_id ON public.bot_sessions(user_id);
CREATE INDEX idx_bot_sessions_status ON public.bot_sessions(status);
CREATE INDEX idx_bot_node_interactions_session_id ON public.bot_node_interactions(session_id);
CREATE INDEX idx_bot_node_interactions_node_id ON public.bot_node_interactions(node_id);