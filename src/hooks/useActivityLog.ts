import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export type ActivityAction = 
  | "login"
  | "logout"
  | "signup"
  | "profile_update"
  | "message_sent"
  | "message_received"
  | "bot_created"
  | "bot_updated"
  | "bot_deleted"
  | "template_created"
  | "template_updated"
  | "template_deleted"
  | "contact_created"
  | "contact_updated"
  | "contact_deleted"
  | "phone_number_added"
  | "settings_updated"
  | "subscription_changed";

export type ResourceType = 
  | "auth"
  | "profile"
  | "message"
  | "bot"
  | "template"
  | "contact"
  | "phone_number"
  | "settings"
  | "subscription";

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export function useActivityLog() {
  const { user } = useAuth();

  const logActivity = useMutation({
    mutationFn: async ({
      action,
      resourceType,
      resourceId,
      details = {},
    }: {
      action: ActivityAction;
      resourceType: ResourceType;
      resourceId?: string;
      details?: Record<string, unknown>;
    }) => {
      if (!user) return null;

      const { error } = await supabase.from("compliance_logs").insert([{
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        details: details as Json,
        user_agent: navigator.userAgent,
      }]);

      if (error) {
        console.error("Failed to log activity:", error);
        throw error;
      }
    },
  });

  const { data: activityLogs, isLoading, refetch } = useQuery({
    queryKey: ["activity-logs", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("compliance_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ActivityLogEntry[];
    },
    enabled: !!user,
  });

  return {
    logActivity,
    activityLogs,
    isLoading,
    refetch,
  };
}

// Hook for admin to view all activity logs
export function useAdminActivityLogs(filters?: {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["admin-activity-logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("compliance_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters?.action) {
        query = query.eq("action", filters.action);
      }
      if (filters?.resourceType) {
        query = query.eq("resource_type", filters.resourceType);
      }
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityLogEntry[];
    },
  });
}
