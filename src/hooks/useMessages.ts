import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { logActivity } from "@/lib/activity-logger";
import { toast } from "sonner";

export interface Message {
  id: string;
  conversation_id: string;
  content: string | null;
  direction: string;
  status: string | null;
  message_type: string | null;
  media_url: string | null;
  wa_message_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface MessageInput {
  conversation_id: string;
  content: string;
  direction: "outbound" | "inbound";
  message_type?: string;
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async (input: MessageInput) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("messages")
        .insert({
          ...input,
          user_id: user.id,
          status: "sent",
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", input.conversation_id);

      // Log activity
      await logActivity(user.id, "message_sent", "message", data.id, {
        conversation_id: input.conversation_id,
        content_length: input.content.length,
      });

      // ---------------------------------------------------------
      // TRIGGER OUTBOUND SENDING VIA EDGE FUNCTION
      // ---------------------------------------------------------
      if (input.direction === "outbound") {
        // Fetch conversation details to get recipient info
        const { data: conversation } = await supabase
          .from("conversations")
          .select("contact_phone, social_connections(platform)") // Assuming relationship exists or we infer platform
          .eq("id", input.conversation_id)
          .single();

        if (conversation) {
          // We need the platform. If it's not directly linked, we might need to query social_connections separately
          // or assume specific platform based on context. 
          // For now, let's try to get platform from the conversation context or default to 'whatsapp'

          // Note: Ideally conversation table has 'platform' or linked 'connection_id'
          // Let's assume 'whatsapp' for this MVP or fetch connection
          const platform = "whatsapp";

          console.log("Triggering outbound message sending...");
          const { error: sendError } = await supabase.functions.invoke('send-social-message', {
            body: {
              platform: platform,
              recipientId: conversation.contact_phone,
              message: {
                text: input.content
              }
            }
          });

          if (sendError) {
            console.error("Failed to send outbound message:", sendError);
            toast.error("Message saved but failed to send to WhatsApp");
          }
        }
      }
      // ---------------------------------------------------------

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
