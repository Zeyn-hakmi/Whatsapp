import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Users, 
  Bot, 
  FileText, 
  Clock,
  Activity,
  Shield,
  Loader2
} from "lucide-react";
import { useTeamAccess, ROLE_PERMISSIONS, type Permission } from "@/hooks/useTeamAccess";
import { useContacts } from "@/hooks/useContacts";
import { useBots } from "@/hooks/useBots";
import { useTemplates } from "@/hooks/useTemplates";
import { useConversations } from "@/hooks/useConversations";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function TeamDashboard() {
  const navigate = useNavigate();
  const { teamAccess, isLoading: teamLoading, hasPermission, getRole } = useTeamAccess();
  const { contacts, isLoading: contactsLoading } = useContacts();
  const { bots, isLoading: botsLoading } = useBots();
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { activityLogs, isLoading: activityLoading } = useActivityLog();

  const isLoading = teamLoading || contactsLoading || botsLoading || templatesLoading || conversationsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Team Dashboard" subtitle="Your team workspace overview">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const role = getRole();
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const getRoleBadgeVariant = () => {
    switch (role) {
      case "admin": return "default";
      case "editor": return "secondary";
      case "member": return "outline";
      default: return "default";
    }
  };

  const stats = [
    {
      label: "Total Contacts",
      value: contacts.length,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      permission: "canViewContacts" as Permission,
      path: "/contacts",
    },
    {
      label: "Active Bots",
      value: bots.filter(b => b.is_active).length,
      icon: Bot,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      permission: "canViewBots" as Permission,
      path: "/bots",
    },
    {
      label: "Templates",
      value: templates.length,
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      permission: "canViewTemplates" as Permission,
      path: "/templates",
    },
    {
      label: "Conversations",
      value: conversations.length,
      icon: MessageSquare,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      permission: "canViewMessages" as Permission,
      path: "/messages",
    },
  ];

  const recentActivity = activityLogs?.slice(0, 5) || [];

  const getPermissionsList = () => {
    const permissions = ROLE_PERMISSIONS[role];
    return Object.entries(permissions)
      .filter(([_, value]) => value)
      .map(([key]) => key.replace(/^can/, "").replace(/([A-Z])/g, " $1").trim());
  };

  return (
    <DashboardLayout 
      title="Team Dashboard" 
      subtitle={teamAccess?.ownerProfile?.company_name || teamAccess?.ownerProfile?.full_name || "Team Workspace"}
    >
      <div className="space-y-8">
        {/* Role Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Your Role</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getRoleBadgeVariant()}>{roleLabel}</Badge>
                    <span className="text-sm text-muted-foreground">
                      on {teamAccess?.ownerProfile?.company_name || "this team"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Your permissions:</p>
              <div className="flex flex-wrap gap-2">
                {getPermissionsList().map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.filter(stat => hasPermission(stat.permission)).map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                className="p-4 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(stat.path)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              {hasPermission("canViewMessages") && (
                <Button variant="outline" onClick={() => navigate("/messages")}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Messages
                </Button>
              )}
              {hasPermission("canEditContacts") && (
                <Button variant="outline" onClick={() => navigate("/contacts")}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Contacts
                </Button>
              )}
              {hasPermission("canEditBots") && (
                <Button variant="outline" onClick={() => navigate("/bots")}>
                  <Bot className="w-4 h-4 mr-2" />
                  Edit Bots
                </Button>
              )}
              {hasPermission("canViewTemplates") && (
                <Button variant="outline" onClick={() => navigate("/templates")}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Templates
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        {!activityLoading && recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Your Recent Activity</h3>
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {recentActivity.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">
                          {log.action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.resource_type}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
