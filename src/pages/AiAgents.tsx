import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Sparkles,
  Zap,
  Bot,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import { useAiAgents, AiAgentInput } from "@/hooks/useAiAgents";
import { useBots } from "@/hooks/useBots";

const AI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o", description: "Most capable model" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", description: "Fast and efficient" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Google's fast model" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "Google's advanced model" },
];

export default function AiAgents() {
  const { agents, isLoading, createAgent, updateAgent, deleteAgent } = useAiAgents();
  const { bots } = useBots();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<AiAgentInput>({
    name: "",
    description: "",
    system_prompt: "",
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 1000,
    is_active: true,
    bot_id: null,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      system_prompt: "",
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1000,
      is_active: true,
      bot_id: null,
    });
    setEditingAgent(null);
  };

  const handleSubmit = async () => {
    if (editingAgent) {
      await updateAgent.mutateAsync({ id: editingAgent, ...formData });
    } else {
      await createAgent.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (agent: any) => {
    setFormData({
      name: agent.name,
      description: agent.description || "",
      system_prompt: agent.system_prompt,
      model: agent.model,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
      is_active: agent.is_active,
      bot_id: agent.bot_id,
    });
    setEditingAgent(agent.id);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="AI Agents" subtitle="Create and manage AI-powered conversation agents">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="AI Agents" subtitle="Create and manage AI-powered conversation agents">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Your AI Agents</h2>
              <p className="text-sm text-muted-foreground">{agents.length} agent{agents.length !== 1 ? 's' : ''} configured</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAgent ? "Edit" : "Create"} AI Agent</DialogTitle>
                <DialogDescription>
                  Configure an AI agent to handle conversations automatically.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agent Name</Label>
                    <Input
                      placeholder="Customer Support Agent"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>AI Model</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(v) => setFormData({ ...formData, model: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_MODELS.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            <div className="flex flex-col">
                              <span>{model.label}</span>
                              <span className="text-xs text-muted-foreground">{model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Brief description of what this agent does"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea
                    placeholder="You are a helpful customer support agent for our company..."
                    rows={6}
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    This defines the AI's personality and behavior.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Temperature: {formData.temperature}</Label>
                    </div>
                    <Slider
                      value={[formData.temperature || 0.7]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={([v]) => setFormData({ ...formData, temperature: v })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower = more focused, Higher = more creative
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Max Tokens: {formData.max_tokens}</Label>
                    </div>
                    <Slider
                      value={[formData.max_tokens || 1000]}
                      min={100}
                      max={4000}
                      step={100}
                      onValueChange={([v]) => setFormData({ ...formData, max_tokens: v })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum response length
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Link to Bot (Optional)</Label>
                  <Select
                    value={formData.bot_id || "none"}
                    onValueChange={(v) => setFormData({ ...formData, bot_id: v === "none" ? null : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No bot linked</SelectItem>
                      {bots.map((bot) => (
                        <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="space-y-0.5">
                    <Label>Active</Label>
                    <p className="text-sm text-muted-foreground">Enable this agent to handle conversations</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!formData.name || !formData.system_prompt}>
                  {editingAgent ? "Update" : "Create"} Agent
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No AI Agents Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first AI agent to automate conversations.</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Agent
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 bg-card border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{agent.name}</h3>
                        <p className="text-sm text-muted-foreground">{agent.model}</p>
                      </div>
                    </div>
                    <Badge variant={agent.is_active ? "default" : "secondary"}>
                      {agent.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {agent.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {agent.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2 rounded bg-secondary/50 text-center">
                      <p className="text-xs text-muted-foreground">Temperature</p>
                      <p className="font-medium text-foreground">{agent.temperature}</p>
                    </div>
                    <div className="p-2 rounded bg-secondary/50 text-center">
                      <p className="text-xs text-muted-foreground">Max Tokens</p>
                      <p className="font-medium text-foreground">{agent.max_tokens}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(agent)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => deleteAgent.mutate(agent.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
