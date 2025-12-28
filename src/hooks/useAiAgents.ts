import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AiAgent {
  id: string;
  user_id: string;
  bot_id: string | null;
  name: string;
  description: string | null;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiAgentInput {
  name: string;
  description?: string;
  system_prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  is_active?: boolean;
  bot_id?: string | null;
}

export function useAiAgents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading, error } = useQuery({
    queryKey: ["ai-agents", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AiAgent[];
    },
    enabled: !!user,
  });

  const createAgent = useMutation({
    mutationFn: async (input: AiAgentInput) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("ai_agents")
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          system_prompt: input.system_prompt,
          model: input.model || "gpt-4o-mini",
          temperature: input.temperature ?? 0.7,
          max_tokens: input.max_tokens ?? 1000,
          is_active: input.is_active ?? true,
          bot_id: input.bot_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
      toast.success("AI Agent created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateAgent = useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<AiAgentInput>) => {
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description || null;
      if (input.system_prompt !== undefined) updateData.system_prompt = input.system_prompt;
      if (input.model !== undefined) updateData.model = input.model;
      if (input.temperature !== undefined) updateData.temperature = input.temperature;
      if (input.max_tokens !== undefined) updateData.max_tokens = input.max_tokens;
      if (input.is_active !== undefined) updateData.is_active = input.is_active;
      if (input.bot_id !== undefined) updateData.bot_id = input.bot_id || null;

      const { data, error } = await supabase
        .from("ai_agents")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
      toast.success("AI Agent updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_agents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
      toast.success("AI Agent deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    agents,
    isLoading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
  };
}
