import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ActivityLogEntry } from "./useActivityLog";

export function useTeamActivityLogs(filters?: {
  memberId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["team-activity-logs", user?.id, filters],
    queryFn: async () => {
      if (!user) return [];

      // First get team member user IDs for this owner
      const { data: teamMembers, error: teamError } = await supabase
        .from("team_members")
        .select("member_user_id, member_email, role")
        .eq("owner_id", user.id)
        .eq("status", "active");

      if (teamError) throw teamError;

      const memberUserIds = teamMembers
        ?.filter(m => m.member_user_id)
        .map(m => m.member_user_id) || [];

      if (memberUserIds.length === 0) {
        return [];
      }

      // Get logs for team members
      let query = supabase
        .from("compliance_logs")
        .select("*")
        .in("user_id", memberUserIds)
        .order("created_at", { ascending: false })
        .limit(500);

      if (filters?.memberId) {
        query = query.eq("user_id", filters.memberId);
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

      // Enrich logs with team member info
      const enrichedLogs = (data || []).map(log => {
        const member = teamMembers?.find(m => m.member_user_id === log.user_id);
        return {
          ...log,
          member_email: member?.member_email || "Unknown",
          member_role: member?.role || "member",
        };
      });

      return enrichedLogs as (ActivityLogEntry & { member_email: string; member_role: string })[];
    },
    enabled: !!user,
  });
}
