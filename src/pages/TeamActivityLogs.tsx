import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTeamActivityLogs } from "@/hooks/useTeamActivityLogs";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { format } from "date-fns";
import { Activity, Download, Filter, RefreshCw, Users } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useTeamAccess } from "@/hooks/useTeamAccess";

const actionColors: Record<string, string> = {
  login: "bg-green-500/10 text-green-500",
  logout: "bg-gray-500/10 text-gray-500",
  message_sent: "bg-cyan-500/10 text-cyan-500",
  bot_created: "bg-orange-500/10 text-orange-500",
  bot_updated: "bg-amber-500/10 text-amber-500",
  bot_deleted: "bg-red-500/10 text-red-500",
  template_created: "bg-indigo-500/10 text-indigo-500",
  template_updated: "bg-indigo-500/10 text-indigo-500",
  contact_created: "bg-pink-500/10 text-pink-500",
  contact_updated: "bg-pink-500/10 text-pink-500",
  contact_deleted: "bg-red-500/10 text-red-500",
  role_changed: "bg-purple-500/10 text-purple-500",
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-500",
  editor: "bg-blue-500/10 text-blue-500",
  member: "bg-gray-500/10 text-gray-500",
};

export default function TeamActivityLogs() {
  const { teamAccess, isLoading: accessLoading } = useTeamAccess();
  const { teamMembers } = useTeamMembers();
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedResourceType, setSelectedResourceType] = useState<string>("");

  const { data: logs, isLoading, refetch } = useTeamActivityLogs({
    memberId: selectedMember || undefined,
    action: selectedAction || undefined,
    resourceType: selectedResourceType || undefined,
  });

  // Only owners can see this page
  if (accessLoading) {
    return (
      <DashboardLayout title="Team Activity Logs">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (teamAccess?.isTeamMember) {
    return <Navigate to="/team" replace />;
  }

  const activeMembers = teamMembers?.filter(m => m.status === "active") || [];

  const exportLogs = () => {
    if (!logs) return;
    
    const csvContent = [
      ["Timestamp", "Member Email", "Role", "Action", "Resource Type", "Resource ID", "Details"].join(","),
      ...logs.map(log => [
        log.created_at,
        log.member_email,
        log.member_role,
        log.action,
        log.resource_type,
        log.resource_id || "",
        JSON.stringify(log.details).replace(/,/g, ";"),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-activity-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSelectedMember("");
    setSelectedAction("");
    setSelectedResourceType("");
  };

  return (
    <DashboardLayout title="Team Activity Logs" subtitle="Track all team member actions">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Select value={selectedMember || "all"} onValueChange={(v) => setSelectedMember(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="All Team Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {activeMembers.map((member) => (
                    <SelectItem key={member.id} value={member.member_user_id || `member-${member.id}`}>
                      {member.member_email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAction || "all"} onValueChange={(v) => setSelectedAction(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="message_sent">Message Sent</SelectItem>
                  <SelectItem value="bot_created">Bot Created</SelectItem>
                  <SelectItem value="bot_updated">Bot Updated</SelectItem>
                  <SelectItem value="bot_deleted">Bot Deleted</SelectItem>
                  <SelectItem value="template_created">Template Created</SelectItem>
                  <SelectItem value="template_updated">Template Updated</SelectItem>
                  <SelectItem value="contact_created">Contact Created</SelectItem>
                  <SelectItem value="contact_updated">Contact Updated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedResourceType || "all"} onValueChange={(v) => setSelectedResourceType(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="bot">Bot</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Actions</CardDescription>
              <CardTitle className="text-2xl">{logs?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Members</CardDescription>
              <CardTitle className="text-2xl">{activeMembers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Messages Sent</CardDescription>
              <CardTitle className="text-2xl">
                {logs?.filter(l => l.action === "message_sent").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Changes Today</CardDescription>
              <CardTitle className="text-2xl">
                {logs?.filter(l => {
                  const today = new Date();
                  const logDate = new Date(l.created_at);
                  return logDate.toDateString() === today.toDateString();
                }).length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Team Activity Log
            </CardTitle>
            <CardDescription>
              Detailed record of all team member actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !logs?.length ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Users className="h-8 w-8 mb-2" />
                <p>No team activity logs found</p>
                <p className="text-sm">Team member actions will appear here</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.member_email}
                        </TableCell>
                        <TableCell>
                          <Badge className={roleColors[log.member_role] || "bg-gray-500/10 text-gray-500"}>
                            {log.member_role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={actionColors[log.action] || "bg-gray-500/10 text-gray-500"}>
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{log.resource_type}</span>
                          {log.resource_id && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({log.resource_id.slice(0, 8)}...)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                          {Object.keys(log.details || {}).length > 0 
                            ? JSON.stringify(log.details)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
