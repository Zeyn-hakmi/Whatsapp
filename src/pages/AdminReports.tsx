import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Calendar,
  Download,
  BarChart3,
  PieChart,
  ArrowUpRight
} from "lucide-react";
import { format } from "date-fns";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useUserRole } from "@/hooks/useUserRole";
import { useAdminData } from "@/hooks/useAdminData";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const AdminReports = () => {
  const navigate = useNavigate();
  const { isLoading: roleLoading } = useUserRole();
  const { users, isLoading, canAccess } = useAdminData();
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    if (!roleLoading && !canAccess) {
      navigate("/dashboard");
    }
  }, [roleLoading, canAccess, navigate]);

  if (roleLoading || isLoading) {
    return (
      <DashboardLayout title="Financial Reports">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!canAccess) {
    return null;
  }

  const planDistribution = [
    { name: "Free", value: users?.filter(u => u.subscription?.plan_name === "Free").length || 0 },
    { name: "Starter", value: users?.filter(u => u.subscription?.plan_name === "Starter").length || 0 },
    { name: "Pro", value: users?.filter(u => u.subscription?.plan_name === "Pro").length || 0 },
    { name: "Enterprise", value: users?.filter(u => u.subscription?.plan_name === "Enterprise").length || 0 },
  ].filter(p => p.value > 0);

  const statusDistribution = [
    { name: "Active", value: users?.filter(u => u.subscription?.status === "active").length || 0, color: "hsl(var(--chart-2))" },
    { name: "Canceled", value: users?.filter(u => u.subscription?.status === "canceled").length || 0, color: "hsl(var(--destructive))" },
    { name: "Past Due", value: users?.filter(u => u.subscription?.status === "past_due").length || 0, color: "hsl(var(--chart-4))" },
  ].filter(s => s.value > 0);

  const usageData = users?.map(u => ({
    name: u.full_name?.split(" ")[0] || "User",
    used: u.subscription?.messages_used || 0,
    limit: u.subscription?.message_limit || 0,
    percentage: u.subscription?.message_limit 
      ? Math.round((u.subscription.messages_used || 0) / u.subscription.message_limit * 100)
      : 0
  })).sort((a, b) => b.used - a.used).slice(0, 10) || [];

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case "Starter": return 29;
      case "Pro": return 99;
      case "Enterprise": return 299;
      default: return 0;
    }
  };

  const estimatedMRR = users?.reduce((acc, u) => {
    if (u.subscription?.status === "active") {
      return acc + getPlanPrice(u.subscription.plan_name);
    }
    return acc;
  }, 0) || 0;

  const paidUsers = users?.filter(u => u.subscription?.plan_name !== "Free" && u.subscription?.status === "active").length || 0;
  const conversionRate = users?.length ? Math.round((paidUsers / users.length) * 100) : 0;

  return (
    <DashboardLayout title="Financial Reports" subtitle="Detailed payment and usage reports">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Revenue Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Recurring Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${estimatedMRR}</div>
                <div className="flex items-center text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Paid Subscribers
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paidUsers}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  out of {users?.length || 0} users
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <Progress value={conversionRate} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Revenue Per User
                </CardTitle>
                <Users className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${users?.length ? Math.round(estimatedMRR / users.length) : 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">ARPU</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Plan Distribution
              </CardTitle>
              <CardDescription>Users by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Subscription Status
              </CardTitle>
              <CardDescription>Distribution of subscription statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={60} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Report */}
        <Card>
          <CardHeader>
            <CardTitle>Top Message Users</CardTitle>
            <CardDescription>Users with highest message consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Usage: {data.used} / {data.limit}
                            </p>
                            <p className="text-sm text-primary">{data.percentage}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="used" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Detailed list of all subscriptions and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.filter(u => u.subscription?.plan_name !== "Free").map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || "No Name"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.subscription?.plan_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          user.subscription?.status === "active" 
                            ? "bg-green-500/20 text-green-500" 
                            : "bg-red-500/20 text-red-500"
                        }
                      >
                        {user.subscription?.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>${getPlanPrice(user.subscription?.plan_name || "")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={
                            ((user.subscription?.messages_used || 0) / 
                            (user.subscription?.message_limit || 1)) * 100
                          } 
                          className="h-2 w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          {Math.round(((user.subscription?.messages_used || 0) / (user.subscription?.message_limit || 1)) * 100)}%
                        </span>
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
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
