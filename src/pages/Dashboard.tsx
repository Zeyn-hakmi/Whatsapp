import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Users,
  Bot,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  Send,
  MoreHorizontal,
} from "lucide-react";

const stats = [
  { label: "Total Messages", value: "24,532", change: "+12.5%", up: true, icon: MessageSquare },
  { label: "Active Contacts", value: "1,429", change: "+8.2%", up: true, icon: Users },
  { label: "Bot Sessions", value: "892", change: "-3.1%", up: false, icon: Bot },
  { label: "Conversion Rate", value: "23.4%", change: "+5.7%", up: true, icon: TrendingUp },
];

const recentMessages = [
  { name: "John Smith", message: "Thanks for the quick response!", time: "2m ago", status: "read" },
  { name: "Sarah Johnson", message: "When will my order arrive?", time: "15m ago", status: "delivered" },
  { name: "Mike Wilson", message: "I need help with my account", time: "1h ago", status: "sent" },
  { name: "Emily Davis", message: "Great service!", time: "2h ago", status: "read" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back! Here's your overview.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <span className={`flex items-center gap-1 text-sm font-medium ${stat.up ? "text-success" : "text-destructive"}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Messages</h2>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
            <div className="space-y-4">
              {recentMessages.map((msg, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                    {msg.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{msg.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{msg.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-card border-border">
            <h2 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Phone className="w-5 h-5 text-primary" />
                Add Phone Number
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => navigate('/bots/builder')}>
                <Bot className="w-5 h-5 text-primary" />
                Create New Bot
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Send className="w-5 h-5 text-primary" />
                Send Broadcast
              </Button>
              <Button variant="glow" className="w-full justify-center gap-2 h-12 mt-4">
                <MessageSquare className="w-5 h-5" />
                Open Messages
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
