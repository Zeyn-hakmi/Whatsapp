import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Users,
  Bot,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Inbox,
  Clock,
  CheckCircle2,
  Loader2,
  BarChart3,
  Globe,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { BotPerformanceAnalytics } from "@/components/analytics/BotPerformanceAnalytics";

const COLORS = ["hsl(142, 76%, 36%)", "hsl(217, 91%, 60%)", "hsl(47, 96%, 53%)", "hsl(0, 84%, 60%)", "hsl(280, 65%, 60%)"];

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp: "hsl(142, 70%, 45%)",
  Whatsapp: "hsl(142, 70%, 45%)",
  instagram: "hsl(340, 75%, 55%)",
  Instagram: "hsl(340, 75%, 55%)",
  facebook: "hsl(217, 91%, 60%)",
  Facebook: "hsl(217, 91%, 60%)",
  telegram: "hsl(200, 80%, 50%)",
  Telegram: "hsl(200, 80%, 50%)",
  twitter: "hsl(203, 89%, 53%)",
  Twitter: "hsl(203, 89%, 53%)",
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7");
  const [activeTab, setActiveTab] = useState("messages");
  const { data: analytics, isLoading } = useAnalytics(parseInt(timeRange));

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Monitor your messaging performance and bot metrics">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: "Total Messages",
      value: analytics?.totalMessages.toLocaleString() || "0",
      change: "+12.5%",
      up: true,
      icon: MessageSquare,
    },
    {
      label: "Active Conversations",
      value: analytics?.totalConversations.toLocaleString() || "0",
      change: "+8.2%",
      up: true,
      icon: Users,
    },
    {
      label: "Active Bots",
      value: `${analytics?.activeBots || 0}/${analytics?.totalBots || 0}`,
      change: "+2",
      up: true,
      icon: Bot,
    },
    {
      label: "Avg Response Time",
      value: `${analytics?.responseTimeAvg || 0}s`,
      change: "-15%",
      up: true,
      icon: Clock,
    },
  ];

  return (
    <DashboardLayout title="Analytics" subtitle="Monitor your messaging performance and bot metrics">
      {/* Tabs for different analytics views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="platforms" className="gap-2">
              <Globe className="w-4 h-4" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="bots" className="gap-2">
              <Bot className="w-4 h-4" />
              Bot Performance
            </TabsTrigger>
          </TabsList>
          
          {(activeTab === "messages" || activeTab === "platforms") && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Time Range:</span>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm">
                Export Report
              </Button>
            </div>
          )}
        </div>

        {/* Messages Analytics Tab */}
        <TabsContent value="messages" className="space-y-8 mt-0">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 bg-card border-border hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.up ? "text-success" : "text-destructive"
                  }`}
                >
                  {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">Message Volume</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.messagesByDay || []}>
                  <defs>
                    <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inbound"
                    stroke="hsl(142, 76%, 36%)"
                    fillOpacity={1}
                    fill="url(#colorInbound)"
                    name="Inbound"
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound"
                    stroke="hsl(217, 91%, 60%)"
                    fillOpacity={1}
                    fill="url(#colorOutbound)"
                    name="Outbound"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Inbound vs Outbound */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">Message Direction</h3>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Inbound", value: analytics?.totalInbound || 0 },
                      { name: "Outbound", value: analytics?.totalOutbound || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="hsl(142, 76%, 36%)" />
                    <Cell fill="hsl(217, 91%, 60%)" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">
                  Inbound ({analytics?.totalInbound || 0})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">
                  Outbound ({analytics?.totalOutbound || 0})
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">Message Status</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.messagesByStatus || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    dataKey="status"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 bg-card border-border h-full">
            <h3 className="text-lg font-semibold text-foreground mb-6">Quick Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Inbox className="w-5 h-5 text-success" />
                  <span className="text-foreground">Inbound Messages</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {analytics?.totalInbound || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-blue-500" />
                  <span className="text-foreground">Outbound Messages</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {analytics?.totalOutbound || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className="text-foreground">Total Contacts</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {analytics?.totalContacts || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  <span className="text-foreground">Delivery Rate</span>
                </div>
                <span className="text-2xl font-bold text-foreground">98.5%</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
        </TabsContent>

        {/* Platforms Analytics Tab */}
        <TabsContent value="platforms" className="space-y-8 mt-0">
          {/* Platform Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(analytics?.platformMetrics || []).slice(0, 4).map((platform, i) => (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 bg-card border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${PLATFORM_COLORS[platform.platform]}20` }}
                    >
                      <MessageSquare 
                        className="w-6 h-6" 
                        style={{ color: PLATFORM_COLORS[platform.platform] }}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground capitalize">
                      {platform.platform}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-1">
                    {platform.totalMessages.toLocaleString()}
                  </h3>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                      <p className="text-sm font-semibold text-foreground">
                        {platform.avgResponseTime > 0 ? `${Math.round(platform.avgResponseTime / 60)}m` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="text-sm font-semibold text-foreground">{platform.engagementRate}%</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {(!analytics?.platformMetrics || analytics.platformMetrics.length === 0) && (
              <Card className="p-6 col-span-full bg-card border-border">
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No platform data available yet</p>
                  <p className="text-sm">Connect social platforms to see analytics</p>
                </div>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messages by Platform Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-6">Messages by Platform</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.messagesByPlatform || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="platform"
                      >
                        {(analytics?.messagesByPlatform || []).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PLATFORM_COLORS[entry.platform] || COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Platform Performance Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-6">Platform Comparison</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.platformMetrics || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="platform" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="inbound" fill="hsl(142, 76%, 36%)" name="Inbound" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="outbound" fill="hsl(217, 91%, 60%)" name="Outbound" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Platform Details Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6">Platform Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Platform</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Messages</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Inbound</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Outbound</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Avg Response</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.platformMetrics || []).map((platform) => (
                      <tr key={platform.platform} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: PLATFORM_COLORS[platform.platform] }}
                            />
                            <span className="font-medium text-foreground capitalize">{platform.platform}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-foreground">{platform.totalMessages.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-success">{platform.inbound.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-blue-500">{platform.outbound.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-foreground">
                          {platform.avgResponseTime > 0 ? `${Math.round(platform.avgResponseTime / 60)}m` : "—"}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            platform.engagementRate >= 80 
                              ? "bg-success/10 text-success" 
                              : platform.engagementRate >= 50 
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-muted text-muted-foreground"
                          }`}>
                            {platform.engagementRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!analytics?.platformMetrics || analytics.platformMetrics.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No platform data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Bot Performance Tab */}
        <TabsContent value="bots" className="mt-0">
          <BotPerformanceAnalytics />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
