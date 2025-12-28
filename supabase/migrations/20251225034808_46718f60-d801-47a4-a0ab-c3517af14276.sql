-- Create social_connections table for storing user's social media accounts
CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  platform_user_id TEXT,
  platform_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_platform UNIQUE (user_id, platform)
);

-- Add source/platform field to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'whatsapp';

-- Add social_connection_id to bots for bot-to-platform assignment
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS social_connection_id UUID REFERENCES public.social_connections(id) ON DELETE SET NULL;

-- Enable RLS on social_connections
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for social_connections
CREATE POLICY "Users can view their own social connections"
  ON public.social_connections FOR SELECT
  USING (can_access_user_data(auth.uid(), user_id));

CREATE POLICY "Users can create their own social connections"
  ON public.social_connections FOR INSERT
  WITH CHECK (can_access_user_data(auth.uid(), user_id));

CREATE POLICY "Users can update their own social connections"
  ON public.social_connections FOR UPDATE
  USING (can_access_user_data(auth.uid(), user_id));

CREATE POLICY "Users can delete their own social connections"
  ON public.social_connections FOR DELETE
  USING (can_access_user_data(auth.uid(), user_id));

-- Add trigger for updated_at
CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON public.social_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_social_connections_user_platform ON public.social_connections(user_id, platform);
CREATE INDEX idx_messages_source ON public.messages(source);