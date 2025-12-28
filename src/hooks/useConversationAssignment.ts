import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { TeamMember } from "./useTeamMembers";

export interface TeamMemberWorkload {
  member: TeamMember;
  assignedCount: number;
  activeConversations: number;
}

export function useConversationAssignment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch team members with their workload
  const { data: workloadData = [], isLoading } = useQuery({
    queryKey: ["team-workload", user?.id],
    queryFn: async (): Promise<TeamMemberWorkload[]> => {
      if (!user) return [];

      // Get active team members
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("owner_id", user.id)
        .eq("status", "active");

      if (membersError) throw membersError;

      // Get conversation counts per team member
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("assigned_to, status")
        .eq("user_id", user.id)
        .not("assigned_to", "is", null);

      if (convError) throw convError;

      // Calculate workload for each member
      const workloadMap = new Map<string, { total: number; active: number }>();
      
      (conversations || []).forEach((conv) => {
        if (conv.assigned_to) {
          const current = workloadMap.get(conv.assigned_to) || { total: 0, active: 0 };
          current.total++;
          if (conv.status === "active") {
            current.active++;
          }
          workloadMap.set(conv.assigned_to, current);
        }
      });

      return (members || []).map((member) => ({
        member: member as TeamMember,
        assignedCount: workloadMap.get(member.id)?.total || 0,
        activeConversations: workloadMap.get(member.id)?.active || 0,
      }));
    },
    enabled: !!user,
  });

  // Assign conversation to team member
  const assignConversation = useMutation({
    mutationFn: async ({ conversationId, teamMemberId }: { conversationId: string; teamMemberId: string | null }) => {
      const { error } = await supabase
        .from("conversations")
        .update({ assigned_to: teamMemberId })
        .eq("id", conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["team-workload"] });
      toast.success("Conversation assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Auto-assign based on workload balancing
  const autoAssign = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user || workloadData.length === 0) {
        throw new Error("No team members available");
      }

      // Find member with lowest active workload
      const sortedMembers = [...workloadData].sort(
        (a, b) => a.activeConversations - b.activeConversations
      );
      
      const targetMember = sortedMembers[0];

      const { error } = await supabase
        .from("conversations")
        .update({ assigned_to: targetMember.member.id })
        .eq("id", conversationId);

      if (error) throw error;

      return targetMember.member;
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["team-workload"] });
      toast.success(`Conversation assigned to ${member.member_email}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Bulk auto-assign unassigned conversations
  const bulkAutoAssign = useMutation({
    mutationFn: async () => {
      if (!user || workloadData.length === 0) {
        throw new Error("No team members available");
      }

      // Get unassigned conversations
      const { data: unassigned, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .is("assigned_to", null)
        .eq("status", "active");

      if (fetchError) throw fetchError;
      if (!unassigned || unassigned.length === 0) {
        throw new Error("No unassigned conversations");
      }

      // Round-robin assignment
      const members = workloadData.map((w) => w.member);
      const assignments: { id: string; assigned_to: string }[] = [];

      unassigned.forEach((conv, index) => {
        const memberIndex = index % members.length;
        assignments.push({
          id: conv.id,
          assigned_to: members[memberIndex].id,
        });
      });

      // Update in batches
      for (const assignment of assignments) {
        await supabase
          .from("conversations")
          .update({ assigned_to: assignment.assigned_to })
          .eq("id", assignment.id);
      }

      return assignments.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["team-workload"] });
      toast.success(`${count} conversations assigned automatically`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    workloadData,
    isLoading,
    assignConversation,
    autoAssign,
    bulkAutoAssign,
  };
}
