-- Developer Experience Tables

-- API Keys
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars for display (e.g., "wba_live_")
  key_hash TEXT NOT NULL, -- SHA256 hash of full key
  last_four TEXT NOT NULL, -- Last 4 chars for identification
  scopes TEXT[] DEFAULT '{}', -- e.g., ['messages:read', 'messages:write', 'bots:read']
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  last_used_ip TEXT,
  request_count INTEGER DEFAULT 0,
  rate_limit_per_minute INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API Request Logs
CREATE TABLE public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  request_body JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhooks
CREATE TABLE public.user_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL, -- For signature verification
  events TEXT[] NOT NULL, -- e.g., ['message.received', 'message.sent', 'bot.triggered']
  is_active BOOLEAN DEFAULT true,
  headers JSONB DEFAULT '{}', -- Custom headers to send
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook Delivery Logs
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.user_webhooks(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  status_code INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  attempt_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sandbox Environments
CREATE TABLE public.sandbox_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_sandbox_mode BOOLEAN DEFAULT false,
  sandbox_phone_number TEXT,
  mock_responses JSONB DEFAULT '{}',
  test_contacts JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sandbox_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view their own API keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON public.api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for api_request_logs
CREATE POLICY "Users can view their own API logs"
  ON public.api_request_logs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for user_webhooks
CREATE POLICY "Users can view their own webhooks"
  ON public.user_webhooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhooks"
  ON public.user_webhooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks"
  ON public.user_webhooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks"
  ON public.user_webhooks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for webhook_logs
CREATE POLICY "Users can view logs for their webhooks"
  ON public.webhook_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_webhooks w 
    WHERE w.id = webhook_id AND w.user_id = auth.uid()
  ));

-- RLS Policies for sandbox_configs
CREATE POLICY "Users can view their sandbox config"
  ON public.sandbox_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their sandbox config"
  ON public.sandbox_configs FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active);
CREATE INDEX idx_api_request_logs_user ON public.api_request_logs(user_id);
CREATE INDEX idx_api_request_logs_key ON public.api_request_logs(api_key_id);
CREATE INDEX idx_api_request_logs_created ON public.api_request_logs(created_at DESC);
CREATE INDEX idx_user_webhooks_user ON public.user_webhooks(user_id);
CREATE INDEX idx_user_webhooks_active ON public.user_webhooks(is_active);
CREATE INDEX idx_webhook_logs_webhook ON public.webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_webhook_logs_retry ON public.webhook_logs(next_retry_at) WHERE status = 'retrying';

-- Triggers
CREATE TRIGGER update_user_webhooks_updated_at
  BEFORE UPDATE ON public.user_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sandbox_configs_updated_at
  BEFORE UPDATE ON public.sandbox_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate API key hash and metadata
CREATE OR REPLACE FUNCTION public.generate_api_key_metadata(full_key TEXT)
RETURNS TABLE(key_prefix TEXT, key_hash TEXT, last_four TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT
    LEFT(full_key, 12)::TEXT,
    encode(sha256(full_key::bytea), 'hex')::TEXT,
    RIGHT(full_key, 4)::TEXT;
END;
$$;
