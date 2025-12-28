import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface SocialConnection {
  id: string;
  user_id: string;
  platform: string;
  platform_user_id: string | null;
  platform_username: string | null;
  is_active: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface SocialConnectionInput {
  platform: string;
  platform_user_id?: string;
  platform_username?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  is_active?: boolean;
  metadata?: Json;
}

export const SOCIAL_PLATFORMS = [
  { id: "whatsapp", name: "WhatsApp", icon: "MessageCircle", color: "bg-green-500" },
  { id: "instagram", name: "Instagram", icon: "Instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { id: "facebook", name: "Facebook Messenger", icon: "Facebook", color: "bg-blue-600" },
  { id: "telegram", name: "Telegram", icon: "Send", color: "bg-sky-500" },
  { id: "twitter", name: "X (Twitter)", icon: "Twitter", color: "bg-black" },
] as const;

export function useSocialConnections() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: connections, isLoading, error } = useQuery({
    queryKey: ["social-connections", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("social_connections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SocialConnection[];
    },
    enabled: !!user?.id,
  });

  const createConnection = useMutation({
    mutationFn: async (input: SocialConnectionInput) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("social_connections")
        .insert([{
          user_id: user.id,
          platform: input.platform,
          platform_user_id: input.platform_user_id,
          platform_username: input.platform_username,
          access_token: input.access_token,
          refresh_token: input.refresh_token,
          token_expires_at: input.token_expires_at,
          is_active: input.is_active ?? true,
          metadata: input.metadata ?? {},
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-connections"] });
      toast.success("Social media account connected!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to connect account");
    },
  });

  const updateConnection = useMutation({
    mutationFn: async ({ id, is_active, platform_username }: { id: string; is_active?: boolean; platform_username?: string }) => {
      const updates: Record<string, unknown> = {};
      if (is_active !== undefined) updates.is_active = is_active;
      if (platform_username !== undefined) updates.platform_username = platform_username;
      
      const { data, error } = await supabase
        .from("social_connections")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-connections"] });
      toast.success("Connection updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update connection");
    },
  });

  const deleteConnection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("social_connections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-connections"] });
      toast.success("Connection removed!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove connection");
    },
  });

  const toggleConnection = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("social_connections")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["social-connections"] });
      toast.success(data.is_active ? "Connection enabled" : "Connection disabled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to toggle connection");
    },
  });

  return {
    connections: connections ?? [],
    isLoading,
    error,
    createConnection,
    updateConnection,
    deleteConnection,
    toggleConnection,
  };
}
