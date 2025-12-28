import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUserSuspension() {
  const queryClient = useQueryClient();

  const suspendUser = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspended_reason: reason || null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      // Send email notification to admins
      try {
        await supabase.functions.invoke("notify-admin", {
          body: {
            type: "user_suspended",
            data: { user_id: userId, reason },
          },
        });
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
      }
    },
    onSuccess: () => {
      toast.success("User suspended successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      console.error("Error suspending user:", error);
      toast.error("Failed to suspend user");
    },
  });

  const activateUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_suspended: false,
          suspended_at: null,
          suspended_reason: null,
        })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User activated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      console.error("Error activating user:", error);
      toast.error("Failed to activate user");
    },
  });

  return {
    suspendUser,
    activateUser,
  };
}
