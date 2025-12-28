-- Add webhook configuration fields to social_connections
ALTER TABLE public.social_connections 
  ADD COLUMN IF NOT EXISTS webhook_url TEXT,
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT,
  ADD COLUMN IF NOT EXISTS webhook_verified BOOLEAN DEFAULT false;

-- Add platform_formats to message_templates for platform-specific content
ALTER TABLE public.message_templates 
  ADD COLUMN IF NOT EXISTS platform_formats JSONB DEFAULT '{}'::jsonb;

-- Create table to track platform-specific message capabilities
CREATE TABLE IF NOT EXISTS public.platform_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  supports_buttons BOOLEAN DEFAULT false,
  supports_quick_replies BOOLEAN DEFAULT false,
  supports_images BOOLEAN DEFAULT true,
  supports_videos BOOLEAN DEFAULT true,
  supports_documents BOOLEAN DEFAULT true,
  supports_audio BOOLEAN DEFAULT true,
  supports_location BOOLEAN DEFAULT false,
  supports_contacts BOOLEAN DEFAULT false,
  max_text_length INTEGER DEFAULT 4096,
  max_buttons INTEGER DEFAULT 3,
  max_quick_replies INTEGER DEFAULT 10,
  button_types JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_capabilities ENABLE ROW LEVEL SECURITY;

-- Everyone can read platform capabilities
CREATE POLICY "Anyone can view platform capabilities"
  ON public.platform_capabilities FOR SELECT
  USING (true);

-- Insert platform capabilities
INSERT INTO public.platform_capabilities (platform, supports_buttons, supports_quick_replies, max_text_length, max_buttons, max_quick_replies, button_types) VALUES
  ('whatsapp', true, true, 4096, 3, 10, '["reply", "url", "call"]'::jsonb),
  ('instagram', true, true, 1000, 3, 13, '["quick_reply", "url"]'::jsonb),
  ('facebook', true, true, 2000, 3, 13, '["postback", "url", "call"]'::jsonb),
  ('telegram', true, false, 4096, 8, 0, '["inline", "reply_keyboard"]'::jsonb),
  ('twitter', false, false, 280, 0, 0, '[]'::jsonb)
ON CONFLICT (platform) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_connections_webhook ON public.social_connections(user_id, platform) WHERE webhook_url IS NOT NULL;