import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Phone,
  Bot,
  MessageSquare,
  FileText,
  Users,
  Brain,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  ChevronLeft,
  Menu,
  ShieldCheck,
  Activity,
  PieChart,
  Building2,
  BookOpen,
  Target,
  MessageSquareQuote,
  Share2,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useTeamAccess, Permission } from "@/hooks/useTeamAccess";
import { usePlatformUnreadCounts } from "@/hooks/usePlatformUnreadCounts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  permission?: Permission;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", permission: "canViewDashboard" },
  { icon: Users, label: "Team Dashboard", href: "/team", permission: "canViewDashboard" },
  { icon: Activity, label: "Team Activity", href: "/team/activity", permission: "canViewBilling" },
  { icon: Phone, label: "Phone Numbers", href: "/phone-numbers", permission: "canViewDashboard" },
  { icon: Bot, label: "Bot Builder", href: "/bots", permission: "canViewBots" },
  { icon: MessageSquare, label: "Messages", href: "/messages", permission: "canViewMessages" },
  { icon: FileText, label: "Templates", href: "/templates", permission: "canViewTemplates" },
  { icon: Users, label: "Contacts", href: "/contacts", permission: "canViewContacts" },
  { icon: Brain, label: "AI Agents", href: "/ai-agents", permission: "canViewBots" },
  { icon: BookOpen, label: "Knowledge Base", href: "/knowledge-base", permission: "canViewBots" },
  { icon: BarChart3, label: "Analytics", href: "/analytics", permission: "canViewAnalytics" },
];

const crmItems: NavItem[] = [
  { icon: Target, label: "Segments", href: "/segments", permission: "canViewContacts" },
  { icon: Megaphone, label: "Campaigns", href: "/campaigns", permission: "canViewContacts" },
  { icon: MessageSquareQuote, label: "Canned Responses", href: "/canned-responses", permission: "canViewMessages" },
];

const devItems: NavItem[] = [
  { icon: Share2, label: "Channels", href: "/settings/channels", permission: "canViewSettings" },
  { icon: Key, label: "Developer Tools", href: "/developer", permission: "canViewSettings" },
];

const bottomItems: NavItem[] = [
  { icon: CreditCard, label: "Billing", href: "/billing", permission: "canViewBilling" },
  { icon: Settings, label: "Settings", href: "/settings", permission: "canViewSettings" },
];

const adminItems: NavItem[] = [
  { icon: ShieldCheck, label: "Admin Dashboard", href: "/admin" },
  { icon: Users, label: "Role Management", href: "/admin/roles" },
  { icon: BarChart3, label: "Financial Reports", href: "/admin/reports" },
  { icon: Activity, label: "Activity Logs", href: "/admin/activity-logs" },
  { icon: PieChart, label: "Audit Reports", href: "/admin/audit-reports" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const { hasPermission, isTeamMember, teamAccess, getRole } = useTeamAccess();
  const unreadCounts = usePlatformUnreadCounts();
  const [collapsed, setCollapsed] = useState(false);

  const visibleNavItems = navItems.filter(item => {
    // Team Dashboard only for team members
    if (item.href === "/team" && !isTeamMember) return false;
    // Team Activity only for owners (not team members)
    if (item.href === "/team/activity" && isTeamMember) return false;
    // Hide main Dashboard for team members (they use Team Dashboard)
    if (item.href === "/dashboard" && isTeamMember) return false;
    return !item.permission || hasPermission(item.permission);
  });

  const visibleCrmItems = crmItems.filter(item =>
    !item.permission || hasPermission(item.permission)
  );

  const visibleDevItems = devItems.filter(item =>
    !item.permission || hasPermission(item.permission)
  );

  const visibleBottomItems = bottomItems.filter(item =>
    !item.permission || hasPermission(item.permission)
  );

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">WhatsFlow</span>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:text-foreground"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Team indicator for team members */}
        {isTeamMember && teamAccess?.ownerProfile && !collapsed && (
          <div className="px-3 py-2 border-b border-sidebar-border bg-sidebar-accent/50">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {teamAccess.ownerProfile.company_name || teamAccess.ownerProfile.full_name || "Team"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{getRole()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              const isMessages = item.href === "/messages";
              const messageCount = isMessages ? unreadCounts.total : 0;

              return (
                <li key={item.href}>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                          )}
                        >
                          <div className="relative">
                            <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                            {isMessages && messageCount > 0 && collapsed && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                            )}
                          </div>
                          {!collapsed && (
                            <>
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex-1"
                              >
                                {item.label}
                              </motion.span>
                              {isMessages && messageCount > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="ml-auto h-5 min-w-[20px] px-1.5 text-xs"
                                >
                                  {messageCount > 99 ? "99+" : messageCount}
                                </Badge>
                              )}
                            </>
                          )}
                          {isActive && !collapsed && !isMessages && (
                            <motion.div
                              layoutId="sidebar-indicator"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                            />
                          )}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && isMessages && messageCount > 0 && (
                        <TooltipContent side="right" className="flex flex-col gap-1">
                          <p className="font-medium">{item.label}</p>
                          <div className="text-xs space-y-0.5">
                            {unreadCounts.whatsapp > 0 && (
                              <p className="text-green-500">WhatsApp: {unreadCounts.whatsapp}</p>
                            )}
                            {unreadCounts.instagram > 0 && (
                              <p className="text-pink-500">Instagram: {unreadCounts.instagram}</p>
                            )}
                            {unreadCounts.facebook > 0 && (
                              <p className="text-blue-500">Facebook: {unreadCounts.facebook}</p>
                            )}
                            {unreadCounts.telegram > 0 && (
                              <p className="text-cyan-500">Telegram: {unreadCounts.telegram}</p>
                            )}
                            {unreadCounts.twitter > 0 && (
                              <p className="text-sky-500">Twitter: {unreadCounts.twitter}</p>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </li>
              );
            })}
          </ul>

          {/* CRM Section */}
          {visibleCrmItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              {!collapsed && (
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  CRM
                </p>
              )}
              <ul className="space-y-1">
                {visibleCrmItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Developer Section */}
          {visibleDevItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              {!collapsed && (
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Developer
                </p>
              )}
              <ul className="space-y-1">
                {visibleDevItems.map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Admin Section */}
          {(isAdmin || isModerator) && (
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              {!collapsed && (
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin
                </p>
              )}
              <ul className="space-y-1">
                {adminItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>

        {/* Bottom items */}
        <div className="border-t border-sidebar-border py-4 px-2">
          <ul className="space-y-1">
            {visibleBottomItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </motion.aside>
  );
}
