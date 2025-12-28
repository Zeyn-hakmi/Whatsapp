import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useApiKeys, useWebhooks, WEBHOOK_EVENTS, API_SCOPES } from "@/hooks/useApiKeys";
import {
    Key,
    Webhook,
    Plus,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle,
    XCircle,
    Play,
    AlertTriangle,
    Clock
} from "lucide-react";
import { toast } from "sonner";

export default function ApiKeys() {
    const [activeTab, setActiveTab] = useState("api-keys");
    const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
    const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
    const [showSecret, setShowSecret] = useState<string | null>(null);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

    const [newKey, setNewKey] = useState({
        name: '',
        scopes: [] as string[],
        expires_at: '',
    });

    const [newWebhook, setNewWebhook] = useState({
        name: '',
        url: '',
        events: [] as string[],
    });

    const { apiKeys, isLoading: keysLoading, createApiKey, revokeApiKey, deleteApiKey } = useApiKeys();
    const { webhooks, isLoading: webhooksLoading, createWebhook, toggleWebhook, deleteWebhook, testWebhook } = useWebhooks();

    const handleCreateKey = async () => {
        if (!newKey.name) {
            toast.error("Please enter a name for the API key");
            return;
        }

        const result = await createApiKey.mutateAsync(newKey);
        if (result.fullKey) {
            setNewlyCreatedKey(result.fullKey);
        }
    };

    const handleCreateWebhook = () => {
        if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
            toast.error("Please fill in all required fields");
            return;
        }

        createWebhook.mutate(newWebhook);
        setIsWebhookDialogOpen(false);
        setNewWebhook({ name: '', url: '', events: [] });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
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
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Key className="w-8 h-8 text-primary" />
                        Developer Tools
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage API keys and webhooks for integrations
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="api-keys" className="gap-2">
                            <Key className="w-4 h-4" />
                            API Keys
                        </TabsTrigger>
                        <TabsTrigger value="webhooks" className="gap-2">
                            <Webhook className="w-4 h-4" />
                            Webhooks
                        </TabsTrigger>
                    </TabsList>

                    {/* API Keys Tab */}
                    <TabsContent value="api-keys" className="space-y-4 mt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold">API Keys</h2>
                                <p className="text-sm text-muted-foreground">
                                    Use API keys to authenticate requests
                                </p>
                            </div>
                            <Dialog open={isKeyDialogOpen} onOpenChange={(open) => {
                                setIsKeyDialogOpen(open);
                                if (!open) setNewlyCreatedKey(null);
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Create API Key
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create API Key</DialogTitle>
                                        <DialogDescription>
                                            Generate a new API key for your application
                                        </DialogDescription>
                                    </DialogHeader>

                                    {newlyCreatedKey ? (
                                        <div className="space-y-4 py-4">
                                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                    <span className="font-medium text-green-500">API Key Created!</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Copy this key now. You won't be able to see it again.
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={newlyCreatedKey}
                                                        readOnly
                                                        className="font-mono text-sm"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => copyToClipboard(newlyCreatedKey)}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={() => {
                                                    setIsKeyDialogOpen(false);
                                                    setNewlyCreatedKey(null);
                                                    setNewKey({ name: '', scopes: [], expires_at: '' });
                                                }}
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Key Name</Label>
                                                <Input
                                                    placeholder="E.g., Production API"
                                                    value={newKey.name}
                                                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Permissions</Label>
                                                <div className="border border-border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                                                    {API_SCOPES.map((scope) => (
                                                        <label key={scope.value} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={newKey.scopes.includes(scope.value)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setNewKey({ ...newKey, scopes: [...newKey.scopes, scope.value] });
                                                                    } else {
                                                                        setNewKey({ ...newKey, scopes: newKey.scopes.filter(s => s !== scope.value) });
                                                                    }
                                                                }}
                                                                className="rounded"
                                                            />
                                                            <span>{scope.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Expiration (Optional)</Label>
                                                <Input
                                                    type="date"
                                                    value={newKey.expires_at}
                                                    onChange={(e) => setNewKey({ ...newKey, expires_at: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button variant="outline" onClick={() => setIsKeyDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleCreateKey} disabled={createApiKey.isPending}>
                                                    {createApiKey.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                    Create Key
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>

                        {keysLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : apiKeys.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No API Keys</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Create an API key to integrate with external applications.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {apiKeys.map((key) => (
                                    <Card key={key.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${key.is_active ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                        <Key className={`w-5 h-5 ${key.is_active ? 'text-green-500' : 'text-red-500'}`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium text-foreground">{key.name}</h3>
                                                            <Badge variant={key.is_active ? "default" : "secondary"}>
                                                                {key.is_active ? "Active" : "Revoked"}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                            <span className="font-mono">{key.key_prefix}...{key.last_four}</span>
                                                            <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                                                            {key.last_used_at && (
                                                                <span>Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                                                            )}
                                                            <span>{key.request_count} requests</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {key.is_active && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => revokeApiKey.mutate(key.id)}
                                                        >
                                                            Revoke
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => deleteApiKey.mutate(key.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Webhooks Tab */}
                    <TabsContent value="webhooks" className="space-y-4 mt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold">Webhooks</h2>
                                <p className="text-sm text-muted-foreground">
                                    Receive real-time notifications when events occur
                                </p>
                            </div>
                            <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Webhook
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Add Webhook</DialogTitle>
                                        <DialogDescription>
                                            Configure a webhook endpoint
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                                placeholder="E.g., Message Handler"
                                                value={newWebhook.name}
                                                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Endpoint URL</Label>
                                            <Input
                                                placeholder="https://api.example.com/webhook"
                                                value={newWebhook.url}
                                                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Events</Label>
                                            <div className="border border-border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                                                {WEBHOOK_EVENTS.map((event) => (
                                                    <label key={event.value} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={newWebhook.events.includes(event.value)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event.value] });
                                                                } else {
                                                                    setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(ev => ev !== event.value) });
                                                                }
                                                            }}
                                                            className="rounded mt-0.5"
                                                        />
                                                        <div>
                                                            <span className="font-medium">{event.label}</span>
                                                            <p className="text-xs text-muted-foreground">{event.description}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button variant="outline" onClick={() => setIsWebhookDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleCreateWebhook} disabled={createWebhook.isPending}>
                                                {createWebhook.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                Create Webhook
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {webhooksLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : webhooks.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No Webhooks</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Add a webhook to receive real-time event notifications.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {webhooks.map((webhook) => (
                                    <Card key={webhook.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${webhook.is_active ? 'bg-green-500/10' : 'bg-muted'}`}>
                                                        <Webhook className={`w-5 h-5 ${webhook.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium text-foreground">{webhook.name}</h3>
                                                            <Badge variant={webhook.is_active ? "default" : "secondary"}>
                                                                {webhook.is_active ? "Active" : "Disabled"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground truncate">{webhook.url}</p>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                            <span>{webhook.events.length} events</span>
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                                                {webhook.success_count} delivered
                                                            </span>
                                                            {webhook.failure_count > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    <XCircle className="w-3 h-3 text-red-500" />
                                                                    {webhook.failure_count} failed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => testWebhook.mutate(webhook.id)}
                                                        disabled={testWebhook.isPending}
                                                    >
                                                        <Play className="w-4 h-4 mr-1" />
                                                        Test
                                                    </Button>
                                                    <Switch
                                                        checked={webhook.is_active}
                                                        onCheckedChange={(checked) => toggleWebhook.mutate({ id: webhook.id, isActive: checked })}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => deleteWebhook.mutate(webhook.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </motion.div>
        </DashboardLayout>
    );
}
