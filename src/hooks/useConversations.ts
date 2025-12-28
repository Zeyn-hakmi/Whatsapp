import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useTeamAccess } from "@/hooks/useTeamAccess";

export interface Conversation {
  id: string;
  contact_phone: string;
  contact_name: string | null;
  contact_id: string | null;
  phone_number_id: string | null;
  status: string | null;
  unread_count: number | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  source: string | null;
}

export interface ConversationInput {
  contact_phone: string;
  contact_name?: string | null;
  contact_id?: string | null;
  phone_number_id?: string | null;
}

export function useConversations() {
  const { user } = useAuth();
  const { getEffectiveUserId } = useTeamAccess();
  const queryClient = useQueryClient();
  
  const effectiveUserId = getEffectiveUserId();

  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ["conversations", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!effectiveUserId,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!effectiveUserId) return;

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `user_id=eq.${effectiveUserId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["conversations", effectiveUserId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveUserId, queryClient]);

  const createConversation = useMutation({
    mutationFn: async (input: ConversationInput) => {
      if (!effectiveUserId) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("conversations")
        .insert({ ...input, user_id: effectiveUserId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", effectiveUserId] });
    },
  });

  const updateConversation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Conversation> & { id: string }) => {
      const { data, error } = await supabase
        .from("conversations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", effectiveUserId] });
    },
  });

  return {
    conversations,
    isLoading,
    error,
    createConversation,
    updateConversation,
  };
}
