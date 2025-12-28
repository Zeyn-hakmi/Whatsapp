import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAdminActivityLogs } from "@/hooks/useActivityLog";
import { useUserRole } from "@/hooks/useUserRole";
import { format, startOfDay, endOfDay } from "date-fns";
import { Activity, CalendarIcon, Download, Filter, RefreshCw, Search, Shield } from "lucide-react";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const actionColors: Record<string, string> = {
  login: "bg-green-500/10 text-green-500",
  logout: "bg-gray-500/10 text-gray-500",
  signup: "bg-blue-500/10 text-blue-500",
  profile_update: "bg-purple-500/10 text-purple-500",
  message_sent: "bg-cyan-500/10 text-cyan-500",
  message_received: "bg-teal-500/10 text-teal-500",
  bot_created: "bg-orange-500/10 text-orange-500",
  bot_updated: "bg-amber-500/10 text-amber-500",
  bot_deleted: "bg-red-500/10 text-red-500",
  template_created: "bg-indigo-500/10 text-indigo-500",
  contact_created: "bg-pink-500/10 text-pink-500",
  settings_updated: "bg-slate-500/10 text-slate-500",
  subscription_changed: "bg-yellow-500/10 text-yellow-500",
};

export default function AdminActivityLogs() {
  const { isAdmin, isModerator, isLoading: roleLoading } = useUserRole();
  const [searchUserId, setSearchUserId] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data: logs, isLoading, refetch } = useAdminActivityLogs({
    userId: searchUserId || undefined,
    action: selectedAction === "all" ? undefined : selectedAction,
    resourceType: selectedResourceType === "all" ? undefined : selectedResourceType,
    startDate: startDate ? startOfDay(startDate).toISOString() : undefined,
    endDate: endDate ? endOfDay(endDate).toISOString() : undefined,
  });

  if (roleLoading) {
    return (
      <DashboardLayout title="Activity Logs">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin && !isModerator) {
    return <Navigate to="/dashboard" replace />;
  }

  const exportLogs = () => {
    if (!logs) return;
    
    const csvContent = [
      ["Timestamp", "User ID", "Action", "Resource Type", "Resource ID", "Details", "User Agent"].join(","),
      ...logs.map(log => [
        log.created_at,
        log.user_id,
        log.action,
        log.resource_type,
        log.resource_id || "",
        JSON.stringify(log.details).replace(/,/g, ";"),
        (log.user_agent || "").replace(/,/g, ";"),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchUserId("");
    setSelectedAction("all");
    setSelectedResourceType("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <DashboardLayout title="Activity Logs" subtitle="Track and monitor all user activities for compliance">
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
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by User ID..."
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="signup">Signup</SelectItem>
                  <SelectItem value="profile_update">Profile Update</SelectItem>
                  <SelectItem value="message_sent">Message Sent</SelectItem>
                  <SelectItem value="bot_created">Bot Created</SelectItem>
                  <SelectItem value="bot_updated">Bot Updated</SelectItem>
                  <SelectItem value="template_created">Template Created</SelectItem>
                  <SelectItem value="contact_created">Contact Created</SelectItem>
                  <SelectItem value="settings_updated">Settings Updated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="bot">Bot</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="phone_number">Phone Number</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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
              <CardDescription>Total Logs</CardDescription>
              <CardTitle className="text-2xl">{logs?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Login Events</CardDescription>
              <CardTitle className="text-2xl">
                {logs?.filter(l => l.action === "login").length || 0}
              </CardTitle>
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
              <CardDescription>Profile Updates</CardDescription>
              <CardTitle className="text-2xl">
                {logs?.filter(l => l.action === "profile_update").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <CardDescription>
              Detailed record of all user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !logs?.length ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Shield className="h-8 w-8 mb-2" />
                <p>No activity logs found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.user_id.slice(0, 8)}...
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
