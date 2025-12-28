import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, CreditCard, MessageSquare, TrendingUp, Shield, Crown, User, 
  Bell, UserX, UserCheck, Ban, CheckCircle, AlertTriangle, X, Check
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserRole } from "@/hooks/useUserRole";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useUserSuspension } from "@/hooks/useUserSuspension";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isModerator, isLoading: roleLoading } = useUserRole();
  const { users, stats, isLoading, canAccess, refetchUsers } = useAdminData();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();
  const { suspendUser, activateUser } = useUserSuspension();
  
  const [suspendDialog, setSuspendDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!roleLoading && !canAccess) {
      navigate("/dashboard");
    }
  }, [roleLoading, canAccess, navigate]);

  if (roleLoading || isLoading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!canAccess) {
    return null;
  }

  const handleSuspend = async () => {
    if (!suspendDialog) return;
    await suspendUser.mutateAsync({ userId: suspendDialog.userId, reason: suspendReason });
    setSuspendDialog(null);
    setSuspendReason("");
  };

  const handleActivate = async (userId: string) => {
    await activateUser.mutateAsync(userId);
  };

  const suspendedUsers = users?.filter(u => u.is_suspended).length || 0;

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Messages Used",
      value: stats.totalMessagesUsed.toLocaleString(),
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Suspended Users",
      value: suspendedUsers,
      icon: UserX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      case "moderator":
        return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"><Shield className="h-3 w-3 mr-1" />Moderator</Badge>;
      default:
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />User</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-500">Active</Badge>;
      case "canceled":
        return <Badge className="bg-red-500/20 text-red-500">Canceled</Badge>;
      case "past_due":
        return <Badge className="bg-amber-500/20 text-amber-500">Past Due</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_user":
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case "subscription_expiring":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Manage users and subscriptions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and subscriptions</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAllAsRead.mutate()}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications?.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications?.slice(0, 10).map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                            !notification.is_read ? "bg-primary/5" : ""
                          }`}
                          onClick={() => {
                            if (!notification.is_read) {
                              markAsRead.mutate(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground">{notification.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            
            <Badge className="bg-primary/20 text-primary text-lg px-4 py-2">
              {isAdmin ? "Admin" : "Moderator"}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="suspended">Suspended ({suspendedUsers})</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>List of all registered users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.filter(u => !u.is_suspended).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || ""} />
                              <AvatarFallback>
                                {user.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.full_name || "No Name"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.company_name || "-"}</TableCell>
                        <TableCell>{getRoleBadge(user.role || "user")}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.subscription?.plan_name || "Free"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isAdmin && user.role !== "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => setSuspendDialog({
                                open: true,
                                userId: user.user_id,
                                userName: user.full_name || "User"
                              })}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>Monitor message usage and subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.filter(u => u.subscription).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || ""} />
                              <AvatarFallback>
                                {user.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.full_name || "No Name"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.subscription?.plan_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.subscription?.status || "")}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 min-w-[150px]">
                            <div className="flex justify-between text-sm">
                              <span>{user.subscription?.messages_used || 0}</span>
                              <span className="text-muted-foreground">
                                / {user.subscription?.message_limit || 0}
                              </span>
                            </div>
                            <Progress 
                              value={
                                ((user.subscription?.messages_used || 0) / 
                                (user.subscription?.message_limit || 1)) * 100
                              } 
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.subscription?.current_period_end 
                            ? format(new Date(user.subscription.current_period_end), "dd MMM yyyy")
                            : "-"
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suspended">
            <Card>
              <CardHeader>
                <CardTitle>Suspended Users</CardTitle>
                <CardDescription>Users who have been suspended from the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {suspendedUsers === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No suspended users
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Suspended At</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.filter(u => u.is_suspended).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 opacity-50">
                                <AvatarImage src={user.avatar_url || ""} />
                                <AvatarFallback>
                                  {user.full_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-muted-foreground">{user.full_name || "No Name"}</span>
                                <Badge variant="destructive" className="ml-2">Suspended</Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.suspended_at 
                              ? format(new Date(user.suspended_at), "dd MMM yyyy HH:mm")
                              : "-"
                            }
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {user.suspended_reason || "No reason provided"}
                          </TableCell>
                          <TableCell>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                onClick={() => handleActivate(user.user_id)}
                                disabled={activateUser.isPending}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Activate
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Suspend Dialog */}
        <Dialog open={suspendDialog?.open} onOpenChange={(open) => !open && setSuspendDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User</DialogTitle>
              <DialogDescription>
                Are you sure you want to suspend {suspendDialog?.userName}? They will not be able to access the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                placeholder="Enter reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSuspendDialog(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleSuspend}
                disabled={suspendUser.isPending}
              >
                {suspendUser.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Ban className="h-4 w-4 mr-2" />
                )}
                Suspend User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
