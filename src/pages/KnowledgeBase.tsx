import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useKnowledgeBase, KnowledgeBaseInput } from "@/hooks/useKnowledgeBase";
import { useAiAgents } from "@/hooks/useAiAgents";
import {
    Brain,
    FileText,
    MessageSquare,
    Link as LinkIcon,
    Type,
    Upload,
    Plus,
    Trash2,
    RefreshCw,
    Search,
    Loader2,
    CheckCircle,
    AlertCircle,
    Clock
} from "lucide-react";
import { toast } from "sonner";

const STATUS_ICONS = {
    pending: Clock,
    processing: Loader2,
    ready: CheckCircle,
    failed: AlertCircle,
};

const STATUS_COLORS = {
    pending: "bg-yellow-500/10 text-yellow-500",
    processing: "bg-blue-500/10 text-blue-500",
    ready: "bg-green-500/10 text-green-500",
    failed: "bg-red-500/10 text-red-500",
};

export default function KnowledgeBase() {
    const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newItem, setNewItem] = useState<Partial<KnowledgeBaseInput>>({
        type: 'text',
        title: '',
        content: '',
    });

    const { items, isLoading, stats, createItem, deleteItem, reprocessItem } = useKnowledgeBase(selectedAgentId);
    const { aiAgents } = useAiAgents();

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        if (!newItem.title || !newItem.content) {
            toast.error("Please fill in all required fields");
            return;
        }

        createItem.mutate(newItem as KnowledgeBaseInput);
        setIsAddDialogOpen(false);
        setNewItem({ type: 'text', title: '', content: '' });
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pb-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Brain className="w-8 h-8 text-primary" />
                            Knowledge Base
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Train your AI agents with documents, Q&A pairs, and content
                        </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Knowledge
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add Knowledge</DialogTitle>
                                <DialogDescription>
                                    Add content to train your AI agents
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <Tabs defaultValue={newItem.type} onValueChange={(v) => setNewItem({ ...newItem, type: v as any })}>
                                    <TabsList className="grid grid-cols-4 w-full">
                                        <TabsTrigger value="text" className="gap-2">
                                            <Type className="w-4 h-4" /> Text
                                        </TabsTrigger>
                                        <TabsTrigger value="qa" className="gap-2">
                                            <MessageSquare className="w-4 h-4" /> Q&A
                                        </TabsTrigger>
                                        <TabsTrigger value="url" className="gap-2">
                                            <LinkIcon className="w-4 h-4" /> URL
                                        </TabsTrigger>
                                        <TabsTrigger value="document" className="gap-2">
                                            <FileText className="w-4 h-4" /> Document
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="text" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input
                                                placeholder="E.g., Product Information"
                                                value={newItem.title}
                                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Content</Label>
                                            <Textarea
                                                placeholder="Enter the knowledge content..."
                                                rows={6}
                                                value={newItem.content}
                                                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="qa" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label>Question</Label>
                                            <Input
                                                placeholder="E.g., What are your business hours?"
                                                value={newItem.title}
                                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Answer</Label>
                                            <Textarea
                                                placeholder="Enter the answer..."
                                                rows={4}
                                                value={newItem.content}
                                                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="url" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input
                                                placeholder="E.g., Company FAQ Page"
                                                value={newItem.title}
                                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>URL</Label>
                                            <Input
                                                placeholder="https://example.com/faq"
                                                value={newItem.source_url || ''}
                                                onChange={(e) => setNewItem({ ...newItem, source_url: e.target.value, content: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            We'll automatically fetch and process the content from this URL.
                                        </p>
                                    </TabsContent>

                                    <TabsContent value="document" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input
                                                placeholder="E.g., Product Manual"
                                                value={newItem.title}
                                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                                            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground mb-2">
                                                Drag and drop your file here, or click to browse
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Supports PDF, DOCX, TXT (Max 10MB)
                                            </p>
                                            <Input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.docx,.txt"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setNewItem({
                                                            ...newItem,
                                                            file_name: file.name,
                                                            file_type: file.type,
                                                            file_size: file.size,
                                                            content: `Document: ${file.name}`,
                                                        });
                                                    }
                                                }}
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="space-y-2">
                                    <Label>Associate with AI Agent (Optional)</Label>
                                    <Select
                                        value={newItem.ai_agent_id || 'none'}
                                        onValueChange={(v) => setNewItem({ ...newItem, ai_agent_id: v === 'none' ? null : v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an agent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">All Agents (Global)</SelectItem>
                                            {aiAgents.map((agent) => (
                                                <SelectItem key={agent.id} value={agent.id}>
                                                    {agent.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreate} disabled={createItem.isPending}>
                                        {createItem.isPending ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : null}
                                        Add Knowledge
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                            <div className="text-sm text-muted-foreground">Total Items</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-500">{stats.ready}</div>
                            <div className="text-sm text-muted-foreground">Ready</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                            <div className="text-sm text-muted-foreground">Processing</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
                            <div className="text-sm text-muted-foreground">Failed</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search knowledge base..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedAgentId || 'all'} onValueChange={(v) => setSelectedAgentId(v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by agent" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Agents</SelectItem>
                            {aiAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                    {agent.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Knowledge Items */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">No Knowledge Items</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Start training your AI by adding documents, Q&A pairs, or other content.
                            </p>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Item
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredItems.map((item) => {
                            const StatusIcon = STATUS_ICONS[item.status];
                            return (
                                <Card key={item.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    {item.type === 'document' && <FileText className="w-5 h-5 text-primary" />}
                                                    {item.type === 'qa' && <MessageSquare className="w-5 h-5 text-primary" />}
                                                    {item.type === 'url' && <LinkIcon className="w-5 h-5 text-primary" />}
                                                    {item.type === 'text' && <Type className="w-5 h-5 text-primary" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                                                        <Badge variant="secondary" className={STATUS_COLORS[item.status]}>
                                                            <StatusIcon className={`w-3 h-3 mr-1 ${item.status === 'processing' ? 'animate-spin' : ''}`} />
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                        {item.content.substring(0, 200)}...
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <span>Type: {item.type}</span>
                                                        {item.file_size && <span>Size: {(item.file_size / 1024).toFixed(1)}KB</span>}
                                                        <span>Added: {new Date(item.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.status === 'failed' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => reprocessItem.mutate(item.id)}
                                                        disabled={reprocessItem.isPending}
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => deleteItem.mutate(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
