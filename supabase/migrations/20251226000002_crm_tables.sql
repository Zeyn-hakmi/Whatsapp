-- CRM Tables for Segments, Campaigns, and Lead Scoring

-- Contact Segments
CREATE TABLE public.contact_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_dynamic BOOLEAN DEFAULT false,
  contact_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Segment Rules (for dynamic segments)
CREATE TABLE public.segment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID REFERENCES public.contact_segments(id) ON DELETE CASCADE NOT NULL,
  field TEXT NOT NULL, -- e.g., 'tags', 'opt_in_status', 'custom_fields.industry'
  operator TEXT NOT NULL CHECK (operator IN ('equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty', 'in_list')),
  value TEXT,
  value_list TEXT[], -- For 'in_list' operator
  logic TEXT DEFAULT 'AND' CHECK (logic IN ('AND', 'OR')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact-Segment mapping (for static segments)
CREATE TABLE public.contact_segment_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID REFERENCES public.contact_segments(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(segment_id, contact_id)
);

-- Broadcast Campaigns
CREATE TABLE public.broadcast_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  template_variables JSONB DEFAULT '{}',
  segment_ids UUID[] DEFAULT '{}',
  phone_number_id UUID REFERENCES public.phone_numbers(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campaign Recipients (individual delivery tracking)
CREATE TABLE public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.broadcast_campaigns(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'skipped')),
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead Scores
CREATE TABLE public.lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score INTEGER DEFAULT 0,
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  last_activity_at TIMESTAMPTZ,
  engagement_score INTEGER DEFAULT 0,
  response_score INTEGER DEFAULT 0,
  conversion_score INTEGER DEFAULT 0,
  score_history JSONB DEFAULT '[]', -- Array of {score, date, reason}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead Scoring Rules
CREATE TABLE public.lead_scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  event_type TEXT NOT NULL CHECK (event_type IN ('message_received', 'message_sent', 'link_clicked', 'form_submitted', 'bot_completed', 'tag_added', 'custom')),
  conditions JSONB DEFAULT '{}',
  score_change INTEGER NOT NULL, -- Can be positive or negative
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scoring_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_segments
CREATE POLICY "Users can view their own segments"
  ON public.contact_segments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own segments"
  ON public.contact_segments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own segments"
  ON public.contact_segments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own segments"
  ON public.contact_segments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for segment_rules
CREATE POLICY "Users can view rules for their segments"
  ON public.segment_rules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.contact_segments cs 
    WHERE cs.id = segment_id AND cs.user_id = auth.uid()
  ));

CREATE POLICY "Users can create rules for their segments"
  ON public.segment_rules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contact_segments cs 
    WHERE cs.id = segment_id AND cs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update rules for their segments"
  ON public.segment_rules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.contact_segments cs 
    WHERE cs.id = segment_id AND cs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete rules for their segments"
  ON public.segment_rules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.contact_segments cs 
    WHERE cs.id = segment_id AND cs.user_id = auth.uid()
  ));

-- RLS Policies for contact_segment_members
CREATE POLICY "Users can view members of their segments"
  ON public.contact_segment_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.contact_segments cs 
    WHERE cs.id = segment_id AND cs.user_id = auth.uid()
  ));

CREATE POLICY "Users can add members to their segments"
  ON public.contact_segment_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.contact_segments cs 
    WHERE cs.id = segment_id AND cs.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove members from their segments"
  ON public.contact_segment_members FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.contact_segments cs 
    WHERE cs.id = segment_id AND cs.user_id = auth.uid()
  ));

-- RLS Policies for broadcast_campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.broadcast_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
  ON public.broadcast_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.broadcast_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.broadcast_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for campaign_recipients
CREATE POLICY "Users can view recipients of their campaigns"
  ON public.campaign_recipients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.broadcast_campaigns bc 
    WHERE bc.id = campaign_id AND bc.user_id = auth.uid()
  ));

CREATE POLICY "Users can add recipients to their campaigns"
  ON public.campaign_recipients FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.broadcast_campaigns bc 
    WHERE bc.id = campaign_id AND bc.user_id = auth.uid()
  ));

CREATE POLICY "Users can update recipients in their campaigns"
  ON public.campaign_recipients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.broadcast_campaigns bc 
    WHERE bc.id = campaign_id AND bc.user_id = auth.uid()
  ));

-- RLS Policies for lead_scores
CREATE POLICY "Users can view their lead scores"
  ON public.lead_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create lead scores"
  ON public.lead_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their lead scores"
  ON public.lead_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for lead_scoring_rules
CREATE POLICY "Users can view their scoring rules"
  ON public.lead_scoring_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create scoring rules"
  ON public.lead_scoring_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their scoring rules"
  ON public.lead_scoring_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their scoring rules"
  ON public.lead_scoring_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_contact_segments_user ON public.contact_segments(user_id);
CREATE INDEX idx_segment_rules_segment ON public.segment_rules(segment_id);
CREATE INDEX idx_segment_members_segment ON public.contact_segment_members(segment_id);
CREATE INDEX idx_segment_members_contact ON public.contact_segment_members(contact_id);
CREATE INDEX idx_campaigns_user ON public.broadcast_campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.broadcast_campaigns(status);
CREATE INDEX idx_campaign_recipients_campaign ON public.campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_contact ON public.campaign_recipients(contact_id);
CREATE INDEX idx_lead_scores_user ON public.lead_scores(user_id);
CREATE INDEX idx_lead_scores_contact ON public.lead_scores(contact_id);
CREATE INDEX idx_lead_scores_score ON public.lead_scores(score DESC);

-- Triggers
CREATE TRIGGER update_contact_segments_updated_at
  BEFORE UPDATE ON public.contact_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broadcast_campaigns_updated_at
  BEFORE UPDATE ON public.broadcast_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_scores_updated_at
  BEFORE UPDATE ON public.lead_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
