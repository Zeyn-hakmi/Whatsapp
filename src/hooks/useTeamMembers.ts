import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity-logger";

export interface TeamMember {
  id: string;
  owner_id: string;
  member_email: string;
  member_user_id: string | null;
  role: string;
  status: "pending" | "active" | "inactive";
  invited_at: string;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InviteInput {
  email: string;
  role?: string;
}

export function useTeamMembers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading, error } = useQuery({
    queryKey: ["team-members", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!user,
  });

  const inviteMember = useMutation({
    mutationFn: async (input: InviteInput & { ownerName?: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Check seat availability first
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("seat_limit, seats_used")
        .eq("user_id", user.id)
        .single();

      if (!subscription) {
        throw new Error("No subscription found");
      }

      if (subscription.seats_used >= subscription.seat_limit) {
        throw new Error(`You've reached your seat limit (${subscription.seat_limit}). Upgrade your plan to add more team members.`);
      }

      const { data, error } = await supabase
        .from("team_members")
        .insert({
          owner_id: user.id,
          member_email: input.email.toLowerCase(),
          role: input.role || "member",
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("This email has already been invited");
        }
        throw error;
      }

      // Send invite email
      try {
        await supabase.functions.invoke("send-team-invite", {
          body: {
            inviteId: data.id,
            email: input.email.toLowerCase(),
            ownerName: input.ownerName || "Team Owner",
            role: input.role || "member",
          },
        });
      } catch (emailError) {
        console.error("Failed to send invite email:", emailError);
        // Don't fail the invite if email fails
      }

      await logActivity(user.id, "team_member_invited", "team", data.id, { email: input.email });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Invitation sent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; role?: string; status?: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Get current member data for logging
      const { data: currentMember } = await supabase
        .from("team_members")
        .select("role, status, member_email")
        .eq("id", id)
        .single();

      const updateData: Record<string, unknown> = {};
      if (updates.role) updateData.role = updates.role;
      if (updates.status) updateData.status = updates.status;

      // If activating a member, increment seats
      if (updates.status === "active") {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("seat_limit, seats_used")
          .eq("user_id", user.id)
          .single();

        if (subscription && subscription.seats_used >= subscription.seat_limit) {
          throw new Error("No available seats. Upgrade your plan to activate this member.");
        }

        // Increment seats_used
        await supabase
          .from("subscriptions")
          .update({ seats_used: (subscription?.seats_used || 0) + 1 })
          .eq("user_id", user.id);

        updateData.joined_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("team_members")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Enhanced audit logging
      await logActivity(user.id, "team_member_updated", "team", id, { 
        changes: Object.keys(updates),
        member_email: currentMember?.member_email,
        previous_role: currentMember?.role,
        new_role: updates.role,
        previous_status: currentMember?.status,
        new_status: updates.status,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      
      if (variables.role) {
        toast.success(`Team member role updated to ${variables.role}`);
      } else {
        toast.success("Team member updated");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await logActivity(user.id, "team_member_removed", "team", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Team member removed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resendInvite = useMutation({
    mutationFn: async ({ id, ownerName }: { id: string; ownerName?: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Get the team member details
      const { data: member, error: memberError } = await supabase
        .from("team_members")
        .select("member_email, role")
        .eq("id", id)
        .single();

      if (memberError || !member) throw new Error("Team member not found");

      // Update the invited_at timestamp
      const { error } = await supabase
        .from("team_members")
        .update({ invited_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Send the invite email again
      try {
        await supabase.functions.invoke("send-team-invite", {
          body: {
            inviteId: id,
            email: member.member_email,
            ownerName: ownerName || "Team Owner",
            role: member.role,
          },
        });
      } catch (emailError) {
        console.error("Failed to resend invite email:", emailError);
        // Don't fail if email fails
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Invitation resent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const activeMembers = teamMembers.filter(m => m.status === "active").length;
  const pendingMembers = teamMembers.filter(m => m.status === "pending").length;

  return {
    teamMembers,
    isLoading,
    error,
    inviteMember,
    updateMember,
    removeMember,
    resendInvite,
    activeMembers,
    pendingMembers,
  };
}
