import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, startOfDay, format, differenceInSeconds } from "date-fns";

export interface PlatformMetrics {
  platform: string;
  totalMessages: number;
  inbound: number;
  outbound: number;
  avgResponseTime: number;
  engagementRate: number;
}

export interface AnalyticsData {
  messagesByDay: { date: string; inbound: number; outbound: number }[];
  totalMessages: number;
  totalInbound: number;
  totalOutbound: number;
  totalConversations: number;
  totalContacts: number;
  activeBots: number;
  totalBots: number;
  messagesByStatus: { status: string; count: number }[];
  responseTimeAvg: number;
  platformMetrics: PlatformMetrics[];
  messagesByPlatform: { platform: string; count: number }[];
}

export function useAnalytics(days: number = 7) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics", user?.id, days],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user) throw new Error("Not authenticated");

      const startDate = startOfDay(subDays(new Date(), days));

      // Fetch messages with source field
      const { data: messages = [], error: messagesError } = await supabase
        .from("messages")
        .select("id, direction, status, created_at, source, conversation_id")
        .gte("created_at", startDate.toISOString());

      if (messagesError) throw messagesError;

      // Fetch conversations count
      const { count: conversationsCount, error: convError } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true });

      if (convError) throw convError;

      // Fetch contacts count
      const { count: contactsCount, error: contactsError } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true });

      if (contactsError) throw contactsError;

      // Fetch bots
      const { data: bots = [], error: botsError } = await supabase
        .from("bots")
        .select("id, is_active");

      if (botsError) throw botsError;

      // Process messages by day
      const messagesByDayMap: Record<string, { inbound: number; outbound: number }> = {};
      
      // Initialize all days
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        messagesByDayMap[date] = { inbound: 0, outbound: 0 };
      }

      // Count messages
      messages.forEach((msg) => {
        const date = format(new Date(msg.created_at), "yyyy-MM-dd");
        if (messagesByDayMap[date]) {
          if (msg.direction === "inbound") {
            messagesByDayMap[date].inbound++;
          } else {
            messagesByDayMap[date].outbound++;
          }
        }
      });

      const messagesByDay = Object.entries(messagesByDayMap).map(([date, counts]) => ({
        date: format(new Date(date), "MMM dd"),
        ...counts,
      }));

      // Message status counts
      const statusCounts: Record<string, number> = {};
      messages.forEach((msg) => {
        const status = msg.status || "pending";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const messagesByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      }));

      // Calculate totals
      const totalInbound = messages.filter((m) => m.direction === "inbound").length;
      const totalOutbound = messages.filter((m) => m.direction === "outbound").length;

      // Calculate platform metrics
      const platformMap: Record<string, { inbound: number; outbound: number; responseTimes: number[] }> = {};
      const platforms = ["whatsapp", "instagram", "facebook", "telegram", "twitter"];
      
      platforms.forEach(platform => {
        platformMap[platform] = { inbound: 0, outbound: 0, responseTimes: [] };
      });

      // Group messages by conversation for response time calculation
      const conversationMessages: Record<string, typeof messages> = {};
      messages.forEach(msg => {
        const source = msg.source || "whatsapp";
        if (platformMap[source]) {
          if (msg.direction === "inbound") {
            platformMap[source].inbound++;
          } else {
            platformMap[source].outbound++;
          }
        }
        
        // Group by conversation for response time
        if (!conversationMessages[msg.conversation_id]) {
          conversationMessages[msg.conversation_id] = [];
        }
        conversationMessages[msg.conversation_id].push(msg);
      });

      // Calculate response times per conversation
      let totalResponseTime = 0;
      let responseCount = 0;
      
      Object.values(conversationMessages).forEach(convMsgs => {
        const sorted = convMsgs.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i].direction === "outbound" && sorted[i - 1].direction === "inbound") {
            const responseTime = differenceInSeconds(
              new Date(sorted[i].created_at),
              new Date(sorted[i - 1].created_at)
            );
            if (responseTime > 0 && responseTime < 86400) { // Less than 24 hours
              totalResponseTime += responseTime;
              responseCount++;
              const source = sorted[i].source || "whatsapp";
              if (platformMap[source]) {
                platformMap[source].responseTimes.push(responseTime);
              }
            }
          }
        }
      });

      const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

      // Build platform metrics
      const platformMetrics: PlatformMetrics[] = platforms.map(platform => {
        const data = platformMap[platform];
        const total = data.inbound + data.outbound;
        const avgRespTime = data.responseTimes.length > 0
          ? Math.round(data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length)
          : 0;
        const engagementRate = data.inbound > 0 
          ? Math.round((data.outbound / data.inbound) * 100) 
          : 0;

        return {
          platform,
          totalMessages: total,
          inbound: data.inbound,
          outbound: data.outbound,
          avgResponseTime: avgRespTime,
          engagementRate: Math.min(engagementRate, 100),
        };
      }).filter(p => p.totalMessages > 0);

      // Messages by platform for chart
      const messagesByPlatform = platforms
        .map(platform => ({
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          count: platformMap[platform].inbound + platformMap[platform].outbound,
        }))
        .filter(p => p.count > 0);

      return {
        messagesByDay,
        totalMessages: messages.length,
        totalInbound,
        totalOutbound,
        totalConversations: conversationsCount || 0,
        totalContacts: contactsCount || 0,
        activeBots: bots.filter((b) => b.is_active).length,
        totalBots: bots.length,
        messagesByStatus,
        responseTimeAvg: avgResponseTime,
        platformMetrics,
        messagesByPlatform,
      };
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });
}
