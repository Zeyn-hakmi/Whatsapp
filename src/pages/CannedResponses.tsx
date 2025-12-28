import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCannedResponses, CannedResponseInput } from "@/hooks/useCannedResponses";
import {
    MessageSquareQuote,
    Plus,
    Trash2,
    Edit,
    Search,
    Copy,
    Loader2,
    Zap
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_CATEGORIES = [
    { value: 'general', label: 'General' },
    { value: 'greeting', label: 'Greetings' },
    { value: 'support', label: 'Support' },
    { value: 'sales', label: 'Sales' },
    { value: 'closing', label: 'Closing' },
    { value: 'faq', label: 'FAQ' },
];

export default function CannedResponses() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [newResponse, setNewResponse] = useState<Partial<CannedResponseInput>>({
        title: '',
        shortcut: '',
        content: '',
        category: 'general',
        is_shared: false,
    });

    const { responses, categories, isLoading, createResponse, deleteResponse, updateResponse } = useCannedResponses();

    // Combine default and custom categories
    const allCategories = [
        ...DEFAULT_CATEGORIES,
        ...categories.filter(c => !DEFAULT_CATEGORIES.some(dc => dc.value === c.name)).map(c => ({ value: c.name, label: c.name })),
    ];

    const filteredResponses = responses.filter(response => {
        const matchesSearch =
            response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            response.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            response.shortcut?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || response.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleCreate = () => {
        if (!newResponse.title || !newResponse.content) {
            toast.error("Please fill in title and content");
            return;
        }

        createResponse.mutate(newResponse as CannedResponseInput);
        setIsAddDialogOpen(false);
        setNewResponse({ title: '', shortcut: '', content: '', category: 'general', is_shared: false });
    };

    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard");
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
                            <MessageSquareQuote className="w-8 h-8 text-primary" />
                            Canned Responses
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Quick replies for faster conversations
                        </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Response
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Add Canned Response</DialogTitle>
                                <DialogDescription>
                                    Create a quick reply template
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        placeholder="E.g., Greeting"
                                        value={newResponse.title}
                                        onChange={(e) => setNewResponse({ ...newResponse, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Shortcut (Optional)</Label>
                                        <Input
                                            placeholder="E.g., /hi"
                                            value={newResponse.shortcut || ''}
                                            onChange={(e) => setNewResponse({ ...newResponse, shortcut: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Type this in the message box to insert
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select
                                            value={newResponse.category}
                                            onValueChange={(v) => setNewResponse({ ...newResponse, category: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allCategories.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Content</Label>
                                    <Textarea
                                        placeholder="Enter the response content..."
                                        rows={4}
                                        value={newResponse.content}
                                        onChange={(e) => setNewResponse({ ...newResponse, content: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Use {'{{name}}'} for contact name, {'{{company}}'} for company
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="is_shared"
                                        checked={newResponse.is_shared}
                                        onChange={(e) => setNewResponse({ ...newResponse, is_shared: e.target.checked })}
                                        className="rounded"
                                    />
                                    <label htmlFor="is_shared" className="text-sm">
                                        Share with team members
                                    </label>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreate} disabled={createResponse.isPending}>
                                        {createResponse.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Save Response
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Info Banner */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Pro Tip: Use Shortcuts</p>
                            <p className="text-sm text-muted-foreground">
                                Type your shortcut (e.g., /hi) in the message box to quickly insert a canned response.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search responses..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {allCategories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Responses List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredResponses.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <MessageSquareQuote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">No Canned Responses</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Create quick replies to speed up your conversations.
                            </p>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Response
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredResponses.map((response) => (
                            <Card key={response.id} className="group hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base">{response.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                {response.shortcut && (
                                                    <Badge variant="secondary" className="font-mono text-xs">
                                                        {response.shortcut}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs">
                                                    {allCategories.find(c => c.value === response.category)?.label || response.category}
                                                </Badge>
                                                {response.is_shared && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Shared
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => copyToClipboard(response.content)}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                        {response.content}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            Used {response.use_count} times
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => deleteResponse.mutate(response.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
