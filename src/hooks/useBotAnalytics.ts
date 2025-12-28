import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BotSession {
  id: string;
  bot_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  trigger_keyword: string | null;
}

export interface NodeInteraction {
  id: string;
  session_id: string;
  node_id: string;
  node_type: string;
  node_label: string | null;
  interacted_at: string;
  is_drop_off: boolean;
}

export interface BotPerformanceMetrics {
  botId: string;
  botName: string;
  totalSessions: number;
  completedSessions: number;
  droppedSessions: number;
  activeSessions: number;
  completionRate: number;
  dropOffPoints: { nodeId: string; nodeLabel: string; nodeType: string; dropCount: number }[];
  nodeEngagement: { nodeId: string; nodeLabel: string; nodeType: string; interactions: number }[];
  sessionsByDay: { date: string; sessions: number; completed: number; dropped: number }[];
}

export function useBotAnalytics(days: number = 30) {
  const { user } = useAuth();

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['bot-sessions', user?.id, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('bot_sessions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BotSession[];
    },
    enabled: !!user,
  });

  const { data: nodeInteractions, isLoading: interactionsLoading } = useQuery({
    queryKey: ['bot-node-interactions', user?.id, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('bot_node_interactions')
        .select('*')
        .gte('interacted_at', startDate.toISOString())
        .order('interacted_at', { ascending: true });

      if (error) throw error;
      return data as NodeInteraction[];
    },
    enabled: !!user,
  });

  const { data: bots } = useQuery({
    queryKey: ['bots-for-analytics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bots')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate metrics per bot
  const botMetrics: BotPerformanceMetrics[] = (bots || []).map((bot) => {
    const botSessions = (sessions || []).filter((s) => s.bot_id === bot.id);
    const botInteractions = (nodeInteractions || []).filter((ni) =>
      botSessions.some((s) => s.id === ni.session_id)
    );

    const completed = botSessions.filter((s) => s.status === 'completed').length;
    const dropped = botSessions.filter((s) => s.status === 'dropped').length;
    const active = botSessions.filter((s) => s.status === 'active').length;
    const total = botSessions.length;

    // Calculate drop-off points
    const dropOffs = botInteractions.filter((ni) => ni.is_drop_off);
    const dropOffCounts: Record<string, { nodeLabel: string; nodeType: string; count: number }> = {};
    dropOffs.forEach((d) => {
      if (!dropOffCounts[d.node_id]) {
        dropOffCounts[d.node_id] = { nodeLabel: d.node_label || d.node_id, nodeType: d.node_type, count: 0 };
      }
      dropOffCounts[d.node_id].count++;
    });

    // Calculate node engagement
    const nodeEngagementMap: Record<string, { nodeLabel: string; nodeType: string; count: number }> = {};
    botInteractions.forEach((ni) => {
      if (!nodeEngagementMap[ni.node_id]) {
        nodeEngagementMap[ni.node_id] = { nodeLabel: ni.node_label || ni.node_id, nodeType: ni.node_type, count: 0 };
      }
      nodeEngagementMap[ni.node_id].count++;
    });

    // Sessions by day
    const sessionsByDayMap: Record<string, { sessions: number; completed: number; dropped: number }> = {};
    botSessions.forEach((s) => {
      const date = s.started_at.split('T')[0];
      if (!sessionsByDayMap[date]) {
        sessionsByDayMap[date] = { sessions: 0, completed: 0, dropped: 0 };
      }
      sessionsByDayMap[date].sessions++;
      if (s.status === 'completed') sessionsByDayMap[date].completed++;
      if (s.status === 'dropped') sessionsByDayMap[date].dropped++;
    });

    return {
      botId: bot.id,
      botName: bot.name,
      totalSessions: total,
      completedSessions: completed,
      droppedSessions: dropped,
      activeSessions: active,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      dropOffPoints: Object.entries(dropOffCounts)
        .map(([nodeId, data]) => ({
          nodeId,
          nodeLabel: data.nodeLabel,
          nodeType: data.nodeType,
          dropCount: data.count,
        }))
        .sort((a, b) => b.dropCount - a.dropCount),
      nodeEngagement: Object.entries(nodeEngagementMap)
        .map(([nodeId, data]) => ({
          nodeId,
          nodeLabel: data.nodeLabel,
          nodeType: data.nodeType,
          interactions: data.count,
        }))
        .sort((a, b) => b.interactions - a.interactions),
      sessionsByDay: Object.entries(sessionsByDayMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  });

  // Aggregate metrics
  const totalSessions = (sessions || []).length;
  const completedSessions = (sessions || []).filter((s) => s.status === 'completed').length;
  const droppedSessions = (sessions || []).filter((s) => s.status === 'dropped').length;
  const overallCompletionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return {
    botMetrics,
    totalSessions,
    completedSessions,
    droppedSessions,
    overallCompletionRate,
    isLoading: sessionsLoading || interactionsLoading,
  };
}
