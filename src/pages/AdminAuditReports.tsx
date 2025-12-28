import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminActivityLogs } from "@/hooks/useActivityLog";
import { useUserRole } from "@/hooks/useUserRole";
import { format, subDays, startOfDay, endOfDay, parseISO, getHours } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Activity, Clock, TrendingUp, Users, RefreshCw } from "lucide-react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function AdminAuditReports() {
  const { isAdmin, isModerator, isLoading: roleLoading } = useUserRole();
  const [dateRange, setDateRange] = useState("7");

  const startDate = useMemo(() => {
    return startOfDay(subDays(new Date(), parseInt(dateRange))).toISOString();
  }, [dateRange]);

  const endDate = useMemo(() => {
    return endOfDay(new Date()).toISOString();
  }, []);

  const { data: logs, isLoading, refetch } = useAdminActivityLogs({
    startDate,
    endDate,
  });

  if (roleLoading) {
    return (
      <DashboardLayout title="Audit Reports">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin && !isModerator) {
    return <Navigate to="/dashboard" replace />;
  }

  // Process data for charts
  const activityByDay = useMemo(() => {
    if (!logs?.length) return [];
    
    const grouped: Record<string, number> = {};
    for (let i = parseInt(dateRange); i >= 0; i--) {
      const date = format(subDays(new Date(), i), "MMM dd");
      grouped[date] = 0;
    }
    
    logs.forEach(log => {
      const date = format(parseISO(log.created_at), "MMM dd");
      if (grouped[date] !== undefined) {
        grouped[date]++;
      }
    });
    
    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }, [logs, dateRange]);

  const activityByType = useMemo(() => {
    if (!logs?.length) return [];
    
    const grouped: Record<string, number> = {};
    logs.forEach(log => {
      const action = log.action.replace(/_/g, " ");
      grouped[action] = (grouped[action] || 0) + 1;
    });
    
    return Object.entries(grouped)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [logs]);

  const activityByHour = useMemo(() => {
    if (!logs?.length) return [];
    
    const grouped: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      grouped[i] = 0;
    }
    
    logs.forEach(log => {
      const hour = getHours(parseISO(log.created_at));
      grouped[hour]++;
    });
    
    return Object.entries(grouped).map(([hour, count]) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      count,
    }));
  }, [logs]);

  const mostActiveUsers = useMemo(() => {
    if (!logs?.length) return [];
    
    const grouped: Record<string, number> = {};
    logs.forEach(log => {
      grouped[log.user_id] = (grouped[log.user_id] || 0) + 1;
    });
    
    return Object.entries(grouped)
      .map(([userId, count]) => ({ userId: userId.slice(0, 8) + "...", count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [logs]);

  const resourceBreakdown = useMemo(() => {
    if (!logs?.length) return [];
    
    const grouped: Record<string, number> = {};
    logs.forEach(log => {
      grouped[log.resource_type] = (grouped[log.resource_type] || 0) + 1;
    });
    
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  const totalActivities = logs?.length || 0;
  const uniqueUsers = new Set(logs?.map(l => l.user_id) || []).size;
  const avgPerDay = Math.round(totalActivities / parseInt(dateRange)) || 0;
  const peakHour = activityByHour.reduce((max, curr) => curr.count > max.count ? curr : max, { hour: "00:00", count: 0 });

  return (
    <DashboardLayout title="Audit Reports" subtitle="Analyze user activity trends and patterns">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActivities.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">in the last {dateRange} days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">active users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Per Day</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgPerDay}</div>
              <p className="text-xs text-muted-foreground">activities per day</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{peakHour.hour}</div>
              <p className="text-xs text-muted-foreground">{peakHour.count} activities</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Trend</CardTitle>
              <CardDescription>Daily activity count over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityByDay}>
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity by Type</CardTitle>
              <CardDescription>Most common actions performed</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityByType} layout="vertical">
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="action" type="category" fontSize={11} tickLine={false} axisLine={false} width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>Activity distribution by hour</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={activityByHour}>
                    <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Breakdown</CardTitle>
              <CardDescription>Activities by resource type</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={resourceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {resourceBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Active Users</CardTitle>
              <CardDescription>Top users by activity count</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {mostActiveUsers.slice(0, 6).map((user, i) => (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground w-5">{i + 1}.</span>
                        <span className="font-mono text-sm">{user.userId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(user.count / mostActiveUsers[0].count) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{user.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
