import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useRoutingRules, RoutingRule } from "@/hooks/useRoutingRules";
import {
    Route,
    Users,
    Shuffle,
    Star,
    Clock,
    BarChart3,
    Plus,
    Trash2,
    Edit,
    GripVertical,
    ChevronRight
} from "lucide-react";

export default function RoutingRules() {
    const { rules, isLoading, createRule, updateRule, deleteRule } = useRoutingRules();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newRule, setNewRule] = useState({
        name: '',
        description: '',
        type: 'round_robin' as RoutingRule['type'],
        priority: 1,
        conditions: [] as any[],
        target_agents: [] as string[],
        target_skill: '',
        is_active: true,
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'round_robin': return Shuffle;
            case 'skills_based': return Star;
            case 'availability': return Clock;
            case 'load_balanced': return BarChart3;
            default: return Route;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'round_robin': return 'Round Robin';
            case 'skills_based': return 'Skills-Based';
            case 'availability': return 'Availability';
            case 'load_balanced': return 'Load Balanced';
            default: return type;
        }
    };

    const handleCreateRule = async () => {
        if (!newRule.name) return;

        await createRule.mutateAsync(newRule);
        setIsCreateDialogOpen(false);
        setNewRule({
            name: '',
            description: '',
            type: 'round_robin',
            priority: 1,
            conditions: [],
            target_agents: [],
            target_skill: '',
            is_active: true,
        });
    };

    const handleToggleRule = async (rule: RoutingRule) => {
        await updateRule.mutateAsync({
            id: rule.id,
            is_active: !rule.is_active,
        });
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            await deleteRule.mutateAsync(ruleId);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Route className="w-7 h-7 text-primary" />
                            Routing Rules
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Configure how conversations are assigned to agents
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Rule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create Routing Rule</DialogTitle>
                                <DialogDescription>Configure how conversations are assigned</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Rule Name</Label>
                                    <Input
                                        placeholder="E.g., Support Queue"
                                        value={newRule.name}
                                        onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        placeholder="What does this rule do?"
                                        value={newRule.description}
                                        onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Routing Type</Label>
                                        <Select
                                            value={newRule.type}
                                            onValueChange={v => setNewRule({ ...newRule, type: v as any })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="round_robin">Round Robin</SelectItem>
                                                <SelectItem value="skills_based">Skills-Based</SelectItem>
                                                <SelectItem value="availability">Availability</SelectItem>
                                                <SelectItem value="load_balanced">Load Balanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={newRule.priority}
                                            onChange={e => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                {newRule.type === 'skills_based' && (
                                    <div className="space-y-2">
                                        <Label>Required Skill</Label>
                                        <Input
                                            placeholder="E.g., spanish, technical"
                                            value={newRule.target_skill}
                                            onChange={e => setNewRule({ ...newRule, target_skill: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateRule} disabled={createRule.isPending}>
                                        {createRule.isPending ? 'Creating...' : 'Create Rule'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Route className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{rules.length}</p>
                                    <p className="text-xs text-muted-foreground">Total Rules</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Shuffle className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">
                                        {rules.filter(r => r.is_active).length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Active Rules</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">12</p>
                                    <p className="text-xs text-muted-foreground">Agents Online</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">8</p>
                                    <p className="text-xs text-muted-foreground">Unique Skills</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Rules List */}
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                        <p className="text-muted-foreground mt-4">Loading rules...</p>
                    </div>
                ) : rules.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">No Routing Rules</h3>
                            <p className="text-muted-foreground mb-6">Create your first rule to start routing conversations</p>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Rule
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {rules.map((rule, index) => {
                            const TypeIcon = getTypeIcon(rule.type);
                            return (
                                <motion.div
                                    key={rule.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className={`transition-colors ${!rule.is_active && 'opacity-60'}`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />

                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <TypeIcon className="w-5 h-5 text-primary" />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-foreground">{rule.name}</h4>
                                                        <Badge variant="secondary" className="text-xs">
                                                            Priority: {rule.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {rule.description || getTypeLabel(rule.type)}
                                                    </p>
                                                </div>

                                                <Badge variant={rule.is_active ? 'default' : 'outline'}>
                                                    {getTypeLabel(rule.type)}
                                                </Badge>

                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={rule.is_active}
                                                        onCheckedChange={() => handleToggleRule(rule)}
                                                    />
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive"
                                                        onClick={() => handleDeleteRule(rule.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
