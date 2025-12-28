import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamAccess } from "@/hooks/useTeamAccess";
import { useEffect } from "react";

export interface PlatformUnreadCounts {
  whatsapp: number;
  instagram: number;
  facebook: number;
  telegram: number;
  twitter: number;
  total: number;
}

export function usePlatformUnreadCounts() {
  const { user } = useAuth();
  const { getEffectiveUserId } = useTeamAccess();
  const effectiveUserId = getEffectiveUserId();

  const { data: counts = { whatsapp: 0, instagram: 0, facebook: 0, telegram: 0, twitter: 0, total: 0 }, refetch } = useQuery({
    queryKey: ["platform-unread-counts", effectiveUserId],
    queryFn: async (): Promise<PlatformUnreadCounts> => {
      if (!effectiveUserId) return { whatsapp: 0, instagram: 0, facebook: 0, telegram: 0, twitter: 0, total: 0 };

      // Fetch conversations with unread counts
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("unread_count, source")
        .eq("user_id", effectiveUserId)
        .gt("unread_count", 0);

      if (error) throw error;

      const platformCounts: PlatformUnreadCounts = {
        whatsapp: 0,
        instagram: 0,
        facebook: 0,
        telegram: 0,
        twitter: 0,
        total: 0,
      };

      (conversations || []).forEach((conv) => {
        const source = (conv.source || "whatsapp").toLowerCase() as keyof Omit<PlatformUnreadCounts, "total">;
        const count = conv.unread_count || 0;
        if (platformCounts[source] !== undefined) {
          platformCounts[source] += count;
        }
        platformCounts.total += count;
      });

      return platformCounts;
    },
    enabled: !!effectiveUserId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!effectiveUserId) return;

    const channel = supabase
      .channel("unread-counts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `user_id=eq.${effectiveUserId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveUserId, refetch]);

  return counts;
}
