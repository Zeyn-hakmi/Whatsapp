import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TeamAccess {
  isTeamMember: boolean;
  isTeamOwner: boolean;
  teamRole: string | null;
  ownerId: string | null;
  ownerProfile: {
    full_name: string | null;
    company_name: string | null;
  } | null;
}

// Define role permissions
export const ROLE_PERMISSIONS = {
  admin: {
    canViewDashboard: true,
    canViewMessages: true,
    canSendMessages: true,
    canViewContacts: true,
    canEditContacts: true,
    canViewBots: true,
    canEditBots: true,
    canViewTemplates: true,
    canEditTemplates: true,
    canViewAnalytics: true,
    canViewBilling: false,
    canManageTeam: true,
    canViewSettings: true,
    canEditSettings: true,
  },
  editor: {
    canViewDashboard: true,
    canViewMessages: true,
    canSendMessages: true,
    canViewContacts: true,
    canEditContacts: true,
    canViewBots: true,
    canEditBots: true,
    canViewTemplates: true,
    canEditTemplates: true,
    canViewAnalytics: true,
    canViewBilling: false,
    canManageTeam: false,
    canViewSettings: true,
    canEditSettings: false,
  },
  member: {
    canViewDashboard: true,
    canViewMessages: true,
    canSendMessages: true,
    canViewContacts: true,
    canEditContacts: false,
    canViewBots: true,
    canEditBots: false,
    canViewTemplates: true,
    canEditTemplates: false,
    canViewAnalytics: false,
    canViewBilling: false,
    canManageTeam: false,
    canViewSettings: false,
    canEditSettings: false,
  },
  owner: {
    canViewDashboard: true,
    canViewMessages: true,
    canSendMessages: true,
    canViewContacts: true,
    canEditContacts: true,
    canViewBots: true,
    canEditBots: true,
    canViewTemplates: true,
    canEditTemplates: true,
    canViewAnalytics: true,
    canViewBilling: true,
    canManageTeam: true,
    canViewSettings: true,
    canEditSettings: true,
  },
} as const;

export type RoleType = keyof typeof ROLE_PERMISSIONS;
export type Permission = keyof typeof ROLE_PERMISSIONS.owner;

export function useTeamAccess() {
  const { user } = useAuth();

  const { data: teamAccess, isLoading } = useQuery({
    queryKey: ["team-access", user?.id],
    queryFn: async (): Promise<TeamAccess> => {
      if (!user) {
        return {
          isTeamMember: false,
          isTeamOwner: true,
          teamRole: null,
          ownerId: null,
          ownerProfile: null,
        };
      }

      // Check if user is a team member (not owner)
      const { data: membership, error } = await supabase
        .from("team_members")
        .select("owner_id, role, status")
        .eq("member_user_id", user.id)
        .eq("status", "active")
        .single();

      if (error || !membership) {
        // User is not a team member, they're an owner of their own account
        return {
          isTeamMember: false,
          isTeamOwner: true,
          teamRole: "owner",
          ownerId: user.id,
          ownerProfile: null,
        };
      }

      // User is a team member, fetch owner profile
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("user_id", membership.owner_id)
        .single();

      return {
        isTeamMember: true,
        isTeamOwner: false,
        teamRole: membership.role,
        ownerId: membership.owner_id,
        ownerProfile: ownerProfile || null,
      };
    },
    enabled: !!user,
  });

  const getEffectiveUserId = (): string | null => {
    if (!user) return null;
    // If user is a team member, use the owner's ID for data access
    return teamAccess?.ownerId || user.id;
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!teamAccess) return false;
    
    const role = teamAccess.teamRole as RoleType;
    if (!role || !ROLE_PERMISSIONS[role]) return false;
    
    return ROLE_PERMISSIONS[role][permission];
  };

  const getRole = (): RoleType => {
    if (!teamAccess?.teamRole) return "owner";
    return teamAccess.teamRole as RoleType;
  };

  return {
    teamAccess,
    isLoading,
    getEffectiveUserId,
    hasPermission,
    getRole,
    isTeamMember: teamAccess?.isTeamMember || false,
    isTeamOwner: teamAccess?.isTeamOwner || true,
  };
}
