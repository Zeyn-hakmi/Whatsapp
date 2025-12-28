-- Knowledge Base tables for AI RAG system

-- Knowledge base items (documents, Q&A, URLs, text snippets)
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ai_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('document', 'qa', 'url', 'text')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge embeddings for vector search (simulated - in production use pgvector)
CREATE TABLE public.knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id UUID REFERENCES public.knowledge_base(id) ON DELETE CASCADE NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chunk_text TEXT NOT NULL,
  embedding_model TEXT DEFAULT 'text-embedding-ada-002',
  -- In production, use pgvector: embedding vector(1536)
  -- For now, store as JSON array
  embedding JSONB,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS policies for knowledge_base
CREATE POLICY "Users can view their own knowledge base items"
  ON public.knowledge_base FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge base items"
  ON public.knowledge_base FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge base items"
  ON public.knowledge_base FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge base items"
  ON public.knowledge_base FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for embeddings (access through knowledge_base)
CREATE POLICY "Users can view embeddings for their knowledge"
  ON public.knowledge_embeddings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_base kb 
    WHERE kb.id = knowledge_id AND kb.user_id = auth.uid()
  ));

CREATE POLICY "Users can create embeddings for their knowledge"
  ON public.knowledge_embeddings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.knowledge_base kb 
    WHERE kb.id = knowledge_id AND kb.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete embeddings for their knowledge"
  ON public.knowledge_embeddings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_base kb 
    WHERE kb.id = knowledge_id AND kb.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_knowledge_base_user ON public.knowledge_base(user_id);
CREATE INDEX idx_knowledge_base_agent ON public.knowledge_base(ai_agent_id);
CREATE INDEX idx_knowledge_base_status ON public.knowledge_base(status);
CREATE INDEX idx_knowledge_embeddings_knowledge ON public.knowledge_embeddings(knowledge_id);

-- Triggers
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
