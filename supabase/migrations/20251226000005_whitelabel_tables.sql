-- White-Label and Agency Features

-- Branding Settings
CREATE TABLE public.branding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Logo & Images
  logo_url TEXT,
  logo_dark_url TEXT, -- For dark mode
  favicon_url TEXT,
  login_background_url TEXT,
  
  -- Colors
  primary_color TEXT DEFAULT '#6366f1',
  primary_foreground TEXT DEFAULT '#ffffff',
  secondary_color TEXT DEFAULT '#f1f5f9',
  accent_color TEXT DEFAULT '#8b5cf6',
  
  -- Branding Text
  platform_name TEXT DEFAULT 'WhatsApp Bot Builder',
  tagline TEXT,
  support_email TEXT,
  support_url TEXT,
  
  -- Custom Domain
  custom_domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  domain_verification_token TEXT,
  ssl_enabled BOOLEAN DEFAULT false,
  
  -- Footer & Legal
  footer_text TEXT,
  privacy_policy_url TEXT,
  terms_url TEXT,
  
  -- Feature Flags
  show_powered_by BOOLEAN DEFAULT true,
  custom_css TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agency Clients (for white-label resellers)
CREATE TABLE public.agency_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- The agency owner
  client_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- The client's user (if registered)
  
  -- Client Info
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'pending')),
  
  -- Billing (agency sets their own pricing)
  monthly_fee DECIMAL(10, 2) DEFAULT 0,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  next_billing_date TIMESTAMPTZ,
  
  -- Usage Limits (set by agency)
  message_limit INTEGER DEFAULT 1000,
  bot_limit INTEGER DEFAULT 5,
  ai_enabled BOOLEAN DEFAULT false,
  
  -- Usage Tracking
  messages_used INTEGER DEFAULT 0,
  bots_used INTEGER DEFAULT 0,
  
  -- Branding (optional client-specific)
  client_branding_id UUID REFERENCES public.branding_settings(id) ON DELETE SET NULL,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agency Billing History
CREATE TABLE public.agency_billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_client_id UUID REFERENCES public.agency_clients(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  billing_period_start TIMESTAMPTZ NOT NULL,
  billing_period_end TIMESTAMPTZ NOT NULL,
  invoice_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CSAT Surveys Configuration
CREATE TABLE public.csat_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  trigger_type TEXT DEFAULT 'conversation_closed' CHECK (trigger_type IN ('conversation_closed', 'after_bot', 'manual', 'timed')),
  delay_seconds INTEGER DEFAULT 0,
  rating_scale INTEGER DEFAULT 5 CHECK (rating_scale IN (3, 5, 10)),
  question_text TEXT DEFAULT 'How satisfied were you with our service?',
  follow_up_question TEXT,
  thank_you_message TEXT DEFAULT 'Thank you for your feedback!',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CSAT Responses
CREATE TABLE public.csat_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  assigned_agent_id UUID,
  bot_id UUID REFERENCES public.bots(id) ON DELETE SET NULL,
  response_time_seconds INTEGER, -- Time to first response
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security Tables

-- Two-Factor Authentication
CREATE TABLE public.two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  secret_encrypted TEXT, -- TOTP secret (encrypted)
  backup_codes_encrypted TEXT, -- JSON array of hashed backup codes
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Sessions (for session management)
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token_hash TEXT NOT NULL,
  device_info JSONB DEFAULT '{}', -- {browser, os, device_type}
  ip_address TEXT,
  location TEXT, -- Derived from IP
  is_current BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- IP Whitelist
CREATE TABLE public.ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ip_address TEXT NOT NULL, -- Can be CIDR notation
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GDPR Data Requests
CREATE TABLE public.gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete', 'rectify')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  requested_data TEXT[], -- Which data types to export/delete
  download_url TEXT,
  download_expires_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csat_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csat_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their branding settings"
  ON public.branding_settings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Agencies can view their clients"
  ON public.agency_clients FOR SELECT
  USING (auth.uid() = agency_user_id OR auth.uid() = client_user_id);

CREATE POLICY "Agencies can manage their clients"
  ON public.agency_clients FOR ALL
  USING (auth.uid() = agency_user_id);

CREATE POLICY "Agencies can view billing history"
  ON public.agency_billing_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agency_clients ac 
    WHERE ac.id = agency_client_id AND ac.agency_user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their CSAT config"
  ON public.csat_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their CSAT responses"
  ON public.csat_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create CSAT responses"
  ON public.csat_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their 2FA settings"
  ON public.two_factor_auth FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their sessions"
  ON public.user_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their IP whitelist"
  ON public.ip_whitelist FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their GDPR requests"
  ON public.gdpr_requests FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_branding_user ON public.branding_settings(user_id);
CREATE INDEX idx_branding_domain ON public.branding_settings(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_agency_clients_agency ON public.agency_clients(agency_user_id);
CREATE INDEX idx_agency_clients_client ON public.agency_clients(client_user_id);
CREATE INDEX idx_agency_clients_status ON public.agency_clients(status);
CREATE INDEX idx_csat_responses_user ON public.csat_responses(user_id);
CREATE INDEX idx_csat_responses_conversation ON public.csat_responses(conversation_id);
CREATE INDEX idx_csat_responses_rating ON public.csat_responses(rating);
CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON public.user_sessions(expires_at);
CREATE INDEX idx_ip_whitelist_user ON public.ip_whitelist(user_id);
CREATE INDEX idx_gdpr_requests_user ON public.gdpr_requests(user_id);
CREATE INDEX idx_gdpr_requests_status ON public.gdpr_requests(status);

-- Triggers
CREATE TRIGGER update_branding_settings_updated_at
  BEFORE UPDATE ON public.branding_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agency_clients_updated_at
  BEFORE UPDATE ON public.agency_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_csat_configs_updated_at
  BEFORE UPDATE ON public.csat_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_two_factor_auth_updated_at
  BEFORE UPDATE ON public.two_factor_auth
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gdpr_requests_updated_at
  BEFORE UPDATE ON public.gdpr_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
