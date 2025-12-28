import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Users,
    Plus,
    Building2,
    MoreVertical,
    TrendingUp,
    MessageSquare,
    Bot,
    Settings
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AgencyClient {
    id: string;
    name: string;
    domain?: string;
    status: 'active' | 'inactive' | 'trial';
    plan: 'starter' | 'pro' | 'enterprise';
    messageCount: number;
    botCount: number;
    createdAt: Date;
}

export default function AgencyClients() {
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        domain: '',
        plan: 'starter',
    });

    const [clients, setClients] = useState<AgencyClient[]>([
        {
            id: '1',
            name: 'Acme Corp',
            domain: 'acme.whatsappbot.pro',
            status: 'active',
            plan: 'pro',
            messageCount: 15420,
            botCount: 5,
            createdAt: new Date(Date.now() - 30 * 86400000),
        },
        {
            id: '2',
            name: 'TechStart Inc',
            domain: 'techstart.whatsappbot.pro',
            status: 'active',
            plan: 'enterprise',
            messageCount: 45230,
            botCount: 12,
            createdAt: new Date(Date.now() - 60 * 86400000),
        },
        {
            id: '3',
            name: 'Demo Company',
            status: 'trial',
            plan: 'starter',
            messageCount: 120,
            botCount: 1,
            createdAt: new Date(Date.now() - 5 * 86400000),
        },
    ]);

    const handleAddClient = () => {
        if (!newClient.name) return;

        const client: AgencyClient = {
            id: Date.now().toString(),
            name: newClient.name,
            domain: newClient.domain || undefined,
            status: 'trial',
            plan: newClient.plan as any,
            messageCount: 0,
            botCount: 0,
            createdAt: new Date(),
        };

        setClients([...clients, client]);
        setIsAddDialogOpen(false);
        setNewClient({ name: '', domain: '', plan: 'starter' });
        toast({ title: "Client added successfully" });
    };

    const getStatusBadge = (status: AgencyClient['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Active</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/30">Inactive</Badge>;
            case 'trial':
                return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">Trial</Badge>;
        }
    };

    const getPlanBadge = (plan: AgencyClient['plan']) => {
        switch (plan) {
            case 'starter':
                return <Badge variant="outline">Starter</Badge>;
            case 'pro':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Pro</Badge>;
            case 'enterprise':
                return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">Enterprise</Badge>;
        }
    };

    const totalMessages = clients.reduce((sum, c) => sum + c.messageCount, 0);
    const totalBots = clients.reduce((sum, c) => sum + c.botCount, 0);
    const activeClients = clients.filter(c => c.status === 'active').length;

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Building2 className="w-7 h-7 text-primary" />
                            Agency Clients
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your white-label client accounts
                        </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Client
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Client</DialogTitle>
                                <DialogDescription>Create a new white-label client account</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Client Name</Label>
                                    <Input
                                        placeholder="Company Name"
                                        value={newClient.name}
                                        onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Custom Domain (Optional)</Label>
                                    <Input
                                        placeholder="client.whatsappbot.pro"
                                        value={newClient.domain}
                                        onChange={e => setNewClient({ ...newClient, domain: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Plan</Label>
                                    <Select value={newClient.plan} onValueChange={v => setNewClient({ ...newClient, plan: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="starter">Starter</SelectItem>
                                            <SelectItem value="pro">Pro</SelectItem>
                                            <SelectItem value="enterprise">Enterprise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddClient}>Add Client</Button>
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
                                    <Users className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{clients.length}</p>
                                    <p className="text-xs text-muted-foreground">Total Clients</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{activeClients}</p>
                                    <p className="text-xs text-muted-foreground">Active Clients</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{(totalMessages / 1000).toFixed(1)}K</p>
                                    <p className="text-xs text-muted-foreground">Total Messages</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{totalBots}</p>
                                    <p className="text-xs text-muted-foreground">Total Bots</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Clients List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {clients.map((client, index) => (
                                <motion.div
                                    key={client.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-foreground">{client.name}</h4>
                                                {getStatusBadge(client.status)}
                                                {getPlanBadge(client.plan)}
                                            </div>
                                            {client.domain && (
                                                <p className="text-sm text-muted-foreground">{client.domain}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-foreground">{client.messageCount.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">Messages</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-foreground">{client.botCount}</p>
                                            <p className="text-xs text-muted-foreground">Bots</p>
                                        </div>
                                        <Button variant="ghost" size="icon">
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
