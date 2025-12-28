import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Play,
  Pause,
  MessageSquare,
  Users,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useBots, Bot as BotType } from "@/hooks/useBots";

export default function Bots() {
  const navigate = useNavigate();
  const { bots, isLoading, updateBot, deleteBot, duplicateBot } = useBots();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null);

  const handleDelete = (bot: BotType) => {
    setSelectedBot(bot);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBot) {
      deleteBot.mutate(selectedBot.id);
      setDeleteDialogOpen(false);
      setSelectedBot(null);
    }
  };

  const toggleBotStatus = (bot: BotType) => {
    updateBot.mutate({ id: bot.id, is_active: !bot.is_active });
  };

  const handleDuplicate = (bot: BotType) => {
    duplicateBot.mutate(bot);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Bot Builder" subtitle="Create and manage your automated bots">
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Loading bots...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bot Builder" subtitle="Create and manage your automated bots">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {bots.length} Bots
          </Badge>
          <Badge variant="outline" className="text-sm text-success border-success/30">
            {bots.filter((b) => b.is_active).length} Active
          </Badge>
        </div>
        <Button onClick={() => navigate("/bots/builder")} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Bot
        </Button>
      </div>

      {/* Bots Grid */}
      {bots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No bots yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Create your first bot to automate conversations and engage with your customers 24/7.
          </p>
          <Button onClick={() => navigate("/bots/builder")} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Bot
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot, index) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300 group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {bot.name}
                      </h3>
                      <Badge
                        variant={bot.is_active ? "default" : "secondary"}
                        className={`text-xs mt-1 ${
                          bot.is_active
                            ? "bg-success/20 text-success border-success/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {bot.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate(`/bots/builder?id=${bot.id}`)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Bot
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(bot)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleBotStatus(bot)}>
                        {bot.is_active ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause Bot
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Activate Bot
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(bot)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Bot
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {bot.description || "No description"}
                </p>

                {/* Triggers */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {bot.trigger_keywords.slice(0, 3).map((trigger) => (
                    <Badge key={trigger} variant="outline" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                  {bot.trigger_keywords.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{bot.trigger_keywords.length - 3}
                    </Badge>
                  )}
                  {bot.trigger_keywords.length === 0 && (
                    <span className="text-xs text-muted-foreground">No triggers set</span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <MessageSquare className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {bot.trigger_keywords.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Triggers</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Clock className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {new Date(bot.updated_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground">Updated</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/bots/builder?id=${bot.id}`)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant={bot.is_active ? "secondary" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleBotStatus(bot)}
                  >
                    {bot.is_active ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedBot?.name}"? This action cannot be undone and all bot data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
