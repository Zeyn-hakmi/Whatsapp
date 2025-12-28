-- Team Collaboration Tables

-- Canned Responses (Quick Replies Library)
CREATE TABLE public.canned_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  shortcut TEXT, -- e.g., "/greeting" to quickly insert
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_shared BOOLEAN DEFAULT false, -- Shared with team
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Canned Response Categories
CREATE TABLE public.canned_response_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversation Internal Notes
CREATE TABLE public.conversation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Routing Rules
CREATE TABLE public.routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('round_robin', 'skills_based', 'availability', 'load_balancing', 'random')),
  conditions JSONB DEFAULT '{}', -- e.g., {tag: "vip", language: "es"}
  target_team_members UUID[] DEFAULT '{}',
  max_conversations_per_agent INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent Skills (for skills-based routing)
CREATE TABLE public.agent_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL, -- References team_members
  skill_name TEXT NOT NULL,
  proficiency INTEGER DEFAULT 1 CHECK (proficiency BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_member_id, skill_name)
);

-- Agent Availability
CREATE TABLE public.agent_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_member_id UUID, -- For team members
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  custom_status TEXT,
  auto_away_enabled BOOLEAN DEFAULT true,
  auto_away_minutes INTEGER DEFAULT 15,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  shift_start TIME,
  shift_end TIME,
  working_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- 0=Sunday, 6=Saturday
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SLA Configurations
CREATE TABLE public.sla_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  first_response_target_seconds INTEGER DEFAULT 300, -- 5 minutes default
  resolution_target_seconds INTEGER DEFAULT 86400, -- 24 hours default
  business_hours_only BOOLEAN DEFAULT true,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  conditions JSONB DEFAULT '{}', -- When to apply this SLA
  escalation_rules JSONB DEFAULT '[]', -- Array of {after_seconds, action, target}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SLA Tracking (per conversation)
CREATE TABLE public.sla_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  sla_config_id UUID REFERENCES public.sla_configs(id) ON DELETE SET NULL,
  first_response_at TIMESTAMPTZ,
  first_response_breached BOOLEAN DEFAULT false,
  resolution_at TIMESTAMPTZ,
  resolution_breached BOOLEAN DEFAULT false,
  next_breach_at TIMESTAMPTZ,
  current_status TEXT DEFAULT 'pending' CHECK (current_status IN ('pending', 'in_progress', 'breached', 'met', 'paused')),
  pause_started_at TIMESTAMPTZ,
  total_pause_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canned_response_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for canned_responses
CREATE POLICY "Users can view their own or shared canned responses"
  ON public.canned_responses FOR SELECT
  USING (auth.uid() = user_id OR is_shared = true);

CREATE POLICY "Users can create canned responses"
  ON public.canned_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canned responses"
  ON public.canned_responses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own canned responses"
  ON public.canned_responses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for canned_response_categories
CREATE POLICY "Users can view their own categories"
  ON public.canned_response_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own categories"
  ON public.canned_response_categories FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for conversation_notes (uses can_access_user_data function)
CREATE POLICY "Users can view notes on accessible conversations"
  ON public.conversation_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id AND public.can_access_user_data(auth.uid(), c.user_id)
  ));

CREATE POLICY "Users can create notes on accessible conversations"
  ON public.conversation_notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id AND public.can_access_user_data(auth.uid(), c.user_id)
  ));

CREATE POLICY "Users can update their own notes"
  ON public.conversation_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.conversation_notes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for routing_rules
CREATE POLICY "Users can view their routing rules"
  ON public.routing_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their routing rules"
  ON public.routing_rules FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for agent_availability
CREATE POLICY "Users can view their availability"
  ON public.agent_availability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their availability"
  ON public.agent_availability FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for sla_configs
CREATE POLICY "Users can view their SLA configs"
  ON public.sla_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their SLA configs"
  ON public.sla_configs FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for sla_tracking
CREATE POLICY "Users can view SLA tracking for their conversations"
  ON public.sla_tracking FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id AND public.can_access_user_data(auth.uid(), c.user_id)
  ));

CREATE POLICY "Users can manage SLA tracking for their conversations"
  ON public.sla_tracking FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id AND public.can_access_user_data(auth.uid(), c.user_id)
  ));

-- Indexes
CREATE INDEX idx_canned_responses_user ON public.canned_responses(user_id);
CREATE INDEX idx_canned_responses_category ON public.canned_responses(category);
CREATE INDEX idx_canned_responses_shortcut ON public.canned_responses(shortcut);
CREATE INDEX idx_conversation_notes_conversation ON public.conversation_notes(conversation_id);
CREATE INDEX idx_routing_rules_user ON public.routing_rules(user_id);
CREATE INDEX idx_routing_rules_active ON public.routing_rules(is_active, priority);
CREATE INDEX idx_agent_availability_user ON public.agent_availability(user_id);
CREATE INDEX idx_sla_configs_user ON public.sla_configs(user_id);
CREATE INDEX idx_sla_tracking_conversation ON public.sla_tracking(conversation_id);
CREATE INDEX idx_sla_tracking_breach ON public.sla_tracking(next_breach_at) WHERE current_status IN ('pending', 'in_progress');

-- Triggers
CREATE TRIGGER update_canned_responses_updated_at
  BEFORE UPDATE ON public.canned_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_notes_updated_at
  BEFORE UPDATE ON public.conversation_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routing_rules_updated_at
  BEFORE UPDATE ON public.routing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_availability_updated_at
  BEFORE UPDATE ON public.agent_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sla_configs_updated_at
  BEFORE UPDATE ON public.sla_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sla_tracking_updated_at
  BEFORE UPDATE ON public.sla_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
