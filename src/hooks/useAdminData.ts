import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "./useUserRole";

export interface UserWithSubscription {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_suspended?: boolean;
  suspended_at?: string | null;
  suspended_reason?: string | null;
  subscription?: {
    plan_name: string;
    status: string;
    messages_used: number | null;
    message_limit: number | null;
    current_period_end: string | null;
  };
  role?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalMessagesUsed: number;
  monthlyRevenue: number;
}

export function useAdminData() {
  const { isAdmin, isModerator } = useUserRole();

  // Fetch all profiles with subscriptions
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: subscriptions, error: subsError } = await supabase
        .from("subscriptions")
        .select("*");

      if (subsError) throw subsError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithData: UserWithSubscription[] = profiles.map((profile) => {
        const subscription = subscriptions?.find((s) => s.user_id === profile.user_id);
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        
        return {
          ...profile,
          subscription: subscription ? {
            plan_name: subscription.plan_name,
            status: subscription.status,
            messages_used: subscription.messages_used,
            message_limit: subscription.message_limit,
            current_period_end: subscription.current_period_end,
          } : undefined,
          role: userRole?.role || "user",
        };
      });

      return usersWithData;
    },
    enabled: isAdmin || isModerator,
  });

  // Calculate stats
  const stats: AdminStats = {
    totalUsers: users?.length || 0,
    activeSubscriptions: users?.filter((u) => u.subscription?.status === "active").length || 0,
    totalMessagesUsed: users?.reduce((acc, u) => acc + (u.subscription?.messages_used || 0), 0) || 0,
    monthlyRevenue: users?.filter((u) => u.subscription?.plan_name !== "Free").length || 0,
  };

  return {
    users,
    stats,
    isLoading: usersLoading,
    refetchUsers,
    canAccess: isAdmin || isModerator,
  };
}
