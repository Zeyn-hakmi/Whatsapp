import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/activity-logger";
import { useTeamAccess } from "@/hooks/useTeamAccess";

export interface Bot {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_keywords: string[];
  flow_data: Record<string, unknown>;
  phone_number_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BotInput {
  name: string;
  description?: string;
  is_active?: boolean;
  trigger_keywords?: string[];
  flow_data?: Record<string, unknown>;
  phone_number_id?: string | null;
}

export function useBots() {
  const { user } = useAuth();
  const { getEffectiveUserId, hasPermission } = useTeamAccess();
  const queryClient = useQueryClient();
  
  const effectiveUserId = getEffectiveUserId();

  const { data: bots = [], isLoading, error } = useQuery({
    queryKey: ["bots", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from("bots")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((b) => ({
        ...b,
        flow_data: (b.flow_data as Record<string, unknown>) || {},
        trigger_keywords: b.trigger_keywords || [],
        is_active: b.is_active ?? false,
      })) as Bot[];
    },
    enabled: !!effectiveUserId,
  });

  const createBot = useMutation({
    mutationFn: async (input: BotInput) => {
      if (!user || !effectiveUserId) throw new Error("Not authenticated");
      if (!hasPermission("canEditBots")) throw new Error("You don't have permission to create bots");
      
      const { data, error } = await supabase
        .from("bots")
        .insert({
          user_id: effectiveUserId,
          name: input.name,
          description: input.description || null,
          is_active: input.is_active ?? false,
          trigger_keywords: input.trigger_keywords || [],
          flow_data: (input.flow_data || {}) as Json,
          phone_number_id: input.phone_number_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity(user.id, "bot_created", "bot", data.id, { name: input.name });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateBot = useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<BotInput>) => {
      if (!user) throw new Error("Not authenticated");
      if (!hasPermission("canEditBots")) throw new Error("You don't have permission to edit bots");
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description || null;
      if (input.is_active !== undefined) updateData.is_active = input.is_active;
      if (input.trigger_keywords !== undefined) updateData.trigger_keywords = input.trigger_keywords;
      if (input.flow_data !== undefined) updateData.flow_data = input.flow_data as Json;
      if (input.phone_number_id !== undefined) updateData.phone_number_id = input.phone_number_id || null;

      const { data, error } = await supabase
        .from("bots")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await logActivity(user.id, "bot_updated", "bot", id, { changes: Object.keys(updateData) });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteBot = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      if (!hasPermission("canEditBots")) throw new Error("You don't have permission to delete bots");
      const { error } = await supabase
        .from("bots")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await logActivity(user.id, "bot_deleted", "bot", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const duplicateBot = useMutation({
    mutationFn: async (bot: Bot) => {
      if (!user || !effectiveUserId) throw new Error("Not authenticated");
      if (!hasPermission("canEditBots")) throw new Error("You don't have permission to duplicate bots");
      
      const { data, error } = await supabase
        .from("bots")
        .insert({
          user_id: effectiveUserId,
          name: `${bot.name} (Copy)`,
          description: bot.description,
          is_active: false,
          trigger_keywords: bot.trigger_keywords,
          flow_data: bot.flow_data as Json,
          phone_number_id: bot.phone_number_id,
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity(user.id, "bot_created", "bot", data.id, { name: data.name, duplicated_from: bot.id });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot duplicated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    bots,
    isLoading,
    error,
    createBot,
    updateBot,
    deleteBot,
    duplicateBot,
  };
}
