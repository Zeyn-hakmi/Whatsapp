import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useBotAnalytics } from '@/hooks/useBotAnalytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export function BotPerformanceAnalytics() {
  const [selectedBotId, setSelectedBotId] = useState<string>('all');
  const { botMetrics, totalSessions, completedSessions, droppedSessions, overallCompletionRate, isLoading } =
    useBotAnalytics(30);

  const selectedBot = selectedBotId === 'all' ? null : botMetrics.find((b) => b.botId === selectedBotId);

  const sessionDistribution = [
    { name: 'Completed', value: selectedBot?.completedSessions ?? completedSessions },
    { name: 'Dropped', value: selectedBot?.droppedSessions ?? droppedSessions },
    { name: 'Active', value: selectedBot?.activeSessions ?? (totalSessions - completedSessions - droppedSessions) },
  ];

  const dropOffData = selectedBot?.dropOffPoints.slice(0, 5) || [];
  const engagementData = selectedBot?.nodeEngagement.slice(0, 8) || [];
  const sessionTrend = selectedBot?.sessionsByDay || [];

  // Aggregate session trend for all bots
  const aggregatedTrend = selectedBotId === 'all'
    ? botMetrics.reduce((acc, bot) => {
        bot.sessionsByDay.forEach((day) => {
          const existing = acc.find((d) => d.date === day.date);
          if (existing) {
            existing.sessions += day.sessions;
            existing.completed += day.completed;
            existing.dropped += day.dropped;
          } else {
            acc.push({ ...day });
          }
        });
        return acc;
      }, [] as { date: string; sessions: number; completed: number; dropped: number }[])
    : sessionTrend;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with bot selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bot Performance</h2>
          <p className="text-muted-foreground">Track conversation completion rates and identify drop-off points</p>
        </div>
        <Select value={selectedBotId} onValueChange={setSelectedBotId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select bot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bots</SelectItem>
            {botMetrics.map((bot) => (
              <SelectItem key={bot.botId} value={bot.botId}>
                {bot.botName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-3xl font-bold text-foreground">
                    {selectedBot?.totalSessions ?? totalSessions}
                  </p>
                </div>
                <Users className="w-10 h-10 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold text-foreground">
                    {(selectedBot?.completionRate ?? overallCompletionRate).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary/50" />
              </div>
              <Progress
                value={selectedBot?.completionRate ?? overallCompletionRate}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-primary">
                    {selectedBot?.completedSessions ?? completedSessions}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dropped Off</p>
                  <p className="text-3xl font-bold text-destructive">
                    {selectedBot?.droppedSessions ?? droppedSessions}
                  </p>
                </div>
                <TrendingDown className="w-10 h-10 text-destructive/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Session Trend</CardTitle>
              <CardDescription>Daily sessions over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {aggregatedTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={aggregatedTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="dropped"
                      name="Dropped"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No session data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Session Distribution</CardTitle>
              <CardDescription>Breakdown by status</CardDescription>
            </CardHeader>
            <CardContent>
              {totalSessions > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sessionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sessionDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No session data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Drop-off Points and Node Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drop-off Points */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <CardTitle className="text-lg">Top Drop-off Points</CardTitle>
              </div>
              <CardDescription>Nodes where users leave the conversation most often</CardDescription>
            </CardHeader>
            <CardContent>
              {dropOffData.length > 0 ? (
                <div className="space-y-3">
                  {dropOffData.map((point, index) => (
                    <div key={point.nodeId} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{point.nodeLabel}</span>
                          <Badge variant="outline" className="text-xs">
                            {point.nodeType}
                          </Badge>
                        </div>
                        <Progress
                          value={(point.dropCount / (dropOffData[0]?.dropCount || 1)) * 100}
                          className="h-2 mt-1"
                        />
                      </div>
                      <span className="text-sm font-bold text-destructive">{point.dropCount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  No drop-off data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Node Engagement */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Node Engagement</CardTitle>
              <CardDescription>Most interacted nodes in the flow</CardDescription>
            </CardHeader>
            <CardContent>
              {engagementData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={engagementData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="nodeLabel"
                      width={100}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="interactions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground">
                  No engagement data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bot Comparison (only when "all" is selected) */}
      {selectedBotId === 'all' && botMetrics.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Bot Comparison</CardTitle>
              </div>
              <CardDescription>Performance comparison across all bots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {botMetrics.map((bot) => (
                  <div key={bot.botId} className="flex items-center gap-4">
                    <div className="w-32 truncate">
                      <span className="text-sm font-medium text-foreground">{bot.botName}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {bot.totalSessions} sessions • {bot.completionRate.toFixed(1)}% completion
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-primary rounded-full"
                          style={{ width: `${(bot.completedSessions / Math.max(bot.totalSessions, 1)) * 100}%` }}
                        />
                        <div
                          className="absolute top-0 h-full bg-destructive rounded-full"
                          style={{
                            left: `${(bot.completedSessions / Math.max(bot.totalSessions, 1)) * 100}%`,
                            width: `${(bot.droppedSessions / Math.max(bot.totalSessions, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-primary">{bot.completedSessions} ✓</span>
                      <span className="text-destructive">{bot.droppedSessions} ✗</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
