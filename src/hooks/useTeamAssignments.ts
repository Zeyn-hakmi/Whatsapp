import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BotAssignment {
  id: string;
  team_member_id: string;
  bot_id: string;
  assigned_by: string;
  created_at: string;
}

interface ContactAssignment {
  id: string;
  team_member_id: string;
  contact_id: string;
  assigned_by: string;
  created_at: string;
}

async function sendAssignmentNotification(params: {
  memberEmail: string;
  ownerName: string;
  assignmentType: "bot" | "contact";
  itemName: string;
  action: "assigned" | "unassigned";
}) {
  try {
    const { error } = await supabase.functions.invoke("notify-assignment", {
      body: params,
    });
    if (error) {
      console.error("Failed to send assignment notification:", error);
    }
  } catch (err) {
    console.error("Error sending assignment notification:", err);
  }
}

export function useTeamAssignments(teamMemberId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get bot assignments
  const { data: botAssignments, isLoading: botsLoading } = useQuery({
    queryKey: ["team-bot-assignments", teamMemberId],
    queryFn: async () => {
      let query = supabase
        .from("team_member_bot_assignments")
        .select("*");
      
      if (teamMemberId) {
        query = query.eq("team_member_id", teamMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BotAssignment[];
    },
    enabled: !!user,
  });

  // Get contact assignments
  const { data: contactAssignments, isLoading: contactsLoading } = useQuery({
    queryKey: ["team-contact-assignments", teamMemberId],
    queryFn: async () => {
      let query = supabase
        .from("team_member_contact_assignments")
        .select("*");
      
      if (teamMemberId) {
        query = query.eq("team_member_id", teamMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContactAssignment[];
    },
    enabled: !!user,
  });

  // Assign bot to team member
  const assignBot = useMutation({
    mutationFn: async ({ 
      teamMemberId, 
      botId, 
      memberEmail, 
      ownerName, 
      botName 
    }: { 
      teamMemberId: string; 
      botId: string; 
      memberEmail?: string;
      ownerName?: string;
      botName?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("team_member_bot_assignments")
        .insert({
          team_member_id: teamMemberId,
          bot_id: botId,
          assigned_by: user.id,
        });

      if (error) throw error;

      // Send notification email if we have the member's email
      if (memberEmail && ownerName && botName) {
        await sendAssignmentNotification({
          memberEmail,
          ownerName,
          assignmentType: "bot",
          itemName: botName,
          action: "assigned",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-bot-assignments"] });
      toast.success("Bot assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Unassign bot from team member
  const unassignBot = useMutation({
    mutationFn: async ({ 
      teamMemberId, 
      botId,
      memberEmail,
      ownerName,
      botName,
    }: { 
      teamMemberId: string; 
      botId: string;
      memberEmail?: string;
      ownerName?: string;
      botName?: string;
    }) => {
      const { error } = await supabase
        .from("team_member_bot_assignments")
        .delete()
        .eq("team_member_id", teamMemberId)
        .eq("bot_id", botId);

      if (error) throw error;

      // Send notification email
      if (memberEmail && ownerName && botName) {
        await sendAssignmentNotification({
          memberEmail,
          ownerName,
          assignmentType: "bot",
          itemName: botName,
          action: "unassigned",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-bot-assignments"] });
      toast.success("Bot unassigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Assign contact to team member
  const assignContact = useMutation({
    mutationFn: async ({ 
      teamMemberId, 
      contactId,
      memberEmail,
      ownerName,
      contactName,
    }: { 
      teamMemberId: string; 
      contactId: string;
      memberEmail?: string;
      ownerName?: string;
      contactName?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("team_member_contact_assignments")
        .insert({
          team_member_id: teamMemberId,
          contact_id: contactId,
          assigned_by: user.id,
        });

      if (error) throw error;

      // Send notification email
      if (memberEmail && ownerName && contactName) {
        await sendAssignmentNotification({
          memberEmail,
          ownerName,
          assignmentType: "contact",
          itemName: contactName,
          action: "assigned",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-contact-assignments"] });
      toast.success("Contact assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Unassign contact from team member
  const unassignContact = useMutation({
    mutationFn: async ({ 
      teamMemberId, 
      contactId,
      memberEmail,
      ownerName,
      contactName,
    }: { 
      teamMemberId: string; 
      contactId: string;
      memberEmail?: string;
      ownerName?: string;
      contactName?: string;
    }) => {
      const { error } = await supabase
        .from("team_member_contact_assignments")
        .delete()
        .eq("team_member_id", teamMemberId)
        .eq("contact_id", contactId);

      if (error) throw error;

      // Send notification email
      if (memberEmail && ownerName && contactName) {
        await sendAssignmentNotification({
          memberEmail,
          ownerName,
          assignmentType: "contact",
          itemName: contactName,
          action: "unassigned",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-contact-assignments"] });
      toast.success("Contact unassigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    botAssignments,
    contactAssignments,
    isLoading: botsLoading || contactsLoading,
    assignBot,
    unassignBot,
    assignContact,
    unassignContact,
  };
}
