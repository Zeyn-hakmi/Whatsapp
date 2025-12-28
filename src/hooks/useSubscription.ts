import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  message_limit: number | null;
  messages_used: number | null;
  bot_limit: number | null;
  ai_enabled: boolean;
  seat_limit: number | null;
  seats_used: number | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!user,
  });

  const getUsagePercentage = () => {
    if (!subscription?.message_limit || !subscription?.messages_used) return 0;
    return Math.min(100, (subscription.messages_used / subscription.message_limit) * 100);
  };

  const isNearLimit = () => {
    return getUsagePercentage() >= 80;
  };

  const getSeatUsagePercentage = () => {
    if (!subscription?.seat_limit || !subscription?.seats_used) return 0;
    return Math.min(100, (subscription.seats_used / subscription.seat_limit) * 100);
  };

  const hasAvailableSeats = () => {
    if (!subscription) return false;
    return (subscription.seats_used || 1) < (subscription.seat_limit || 1);
  };

  return {
    subscription,
    isLoading,
    error,
    refetch,
    getUsagePercentage,
    isNearLimit,
    getSeatUsagePercentage,
    hasAvailableSeats,
  };
}
