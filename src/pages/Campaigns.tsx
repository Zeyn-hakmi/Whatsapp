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
import { useCampaigns, CampaignInput } from "@/hooks/useCampaigns";
import { useSegments } from "@/hooks/useSegments";
import { useTemplates } from "@/hooks/useTemplates";
import { usePhoneNumbers } from "@/hooks/usePhoneNumbers";
import {
    Megaphone,
    Plus,
    Trash2,
    Edit,
    Search,
    Play,
    Pause,
    X,
    Calendar,
    Users,
    MessageSquare,
    Send,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2,
    BarChart3
} from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG = {
    draft: { icon: Edit, color: 'bg-muted text-muted-foreground', label: 'Draft' },
    scheduled: { icon: Clock, color: 'bg-blue-500/10 text-blue-500', label: 'Scheduled' },
    sending: { icon: Loader2, color: 'bg-yellow-500/10 text-yellow-500', label: 'Sending' },
    sent: { icon: CheckCircle, color: 'bg-green-500/10 text-green-500', label: 'Sent' },
    paused: { icon: Pause, color: 'bg-orange-500/10 text-orange-500', label: 'Paused' },
    cancelled: { icon: X, color: 'bg-red-500/10 text-red-500', label: 'Cancelled' },
};

export default function Campaigns() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [newCampaign, setNewCampaign] = useState<Partial<CampaignInput>>({
        name: '',
        description: '',
        segment_ids: [],
    });

    const { campaigns, isLoading, stats, createCampaign, deleteCampaign, startCampaign, pauseCampaign, cancelCampaign } = useCampaigns();
    const { segments } = useSegments();
    const { templates } = useTemplates();
    const { phoneNumbers } = usePhoneNumbers();

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || campaign.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const handleCreate = () => {
        if (!newCampaign.name) {
            toast.error("Please enter a campaign name");
            return;
        }

        createCampaign.mutate(newCampaign as CampaignInput);
        setIsAddDialogOpen(false);
        setNewCampaign({ name: '', description: '', segment_ids: [] });
    };

    const getDeliveryRate = (campaign: typeof campaigns[0]) => {
        if (campaign.sent_count === 0) return 0;
        return Math.round((campaign.delivered_count / campaign.sent_count) * 100);
    };

    const getReadRate = (campaign: typeof campaigns[0]) => {
        if (campaign.delivered_count === 0) return 0;
        return Math.round((campaign.read_count / campaign.delivered_count) * 100);
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
                            <Megaphone className="w-8 h-8 text-primary" />
                            Broadcast Campaigns
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Send targeted messages to your contact segments
                        </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Create Campaign
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create Campaign</DialogTitle>
                                <DialogDescription>
                                    Set up a new broadcast campaign
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Campaign Name</Label>
                                    <Input
                                        placeholder="E.g., Holiday Promotion"
                                        value={newCampaign.name}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description (Optional)</Label>
                                    <Textarea
                                        placeholder="Describe this campaign..."
                                        value={newCampaign.description || ''}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Select
                                            value={newCampaign.phone_number_id || ''}
                                            onValueChange={(v) => setNewCampaign({ ...newCampaign, phone_number_id: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select phone number" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {phoneNumbers.map((phone) => (
                                                    <SelectItem key={phone.id} value={phone.id}>
                                                        {phone.display_name} ({phone.phone_number})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Message Template</Label>
                                        <Select
                                            value={newCampaign.template_id || ''}
                                            onValueChange={(v) => setNewCampaign({ ...newCampaign, template_id: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates.filter(t => t.status === 'approved').map((template) => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Target Segments</Label>
                                    <div className="border border-border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                                        {segments.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No segments created yet</p>
                                        ) : (
                                            segments.map((segment) => (
                                                <label key={segment.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={newCampaign.segment_ids?.includes(segment.id)}
                                                        onChange={(e) => {
                                                            const ids = newCampaign.segment_ids || [];
                                                            if (e.target.checked) {
                                                                setNewCampaign({ ...newCampaign, segment_ids: [...ids, segment.id] });
                                                            } else {
                                                                setNewCampaign({ ...newCampaign, segment_ids: ids.filter(id => id !== segment.id) });
                                                            }
                                                        }}
                                                        className="rounded border-border"
                                                    />
                                                    <div
                                                        className="w-3 h-3 rounded"
                                                        style={{ backgroundColor: segment.color }}
                                                    />
                                                    <span className="flex-1">{segment.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {segment.contact_count} contacts
                                                    </span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreate} disabled={createCampaign.isPending}>
                                        {createCampaign.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Create Campaign
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                            <div className="text-sm text-muted-foreground">Total Campaigns</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-500">{stats.scheduled}</div>
                            <div className="text-sm text-muted-foreground">Scheduled</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-foreground">{stats.totalSent.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Messages Sent</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-500">{stats.totalDelivered.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Delivered</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-primary">{stats.totalRead.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Read</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs and Search */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="draft">Drafts</TabsTrigger>
                            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                            <TabsTrigger value="sending">Sending</TabsTrigger>
                            <TabsTrigger value="sent">Sent</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search campaigns..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Campaigns List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">No Campaigns</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Create your first broadcast campaign to reach your contacts.
                            </p>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Campaign
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredCampaigns.map((campaign) => {
                            const statusConfig = STATUS_CONFIG[campaign.status];
                            const StatusIcon = statusConfig.icon;
                            return (
                                <Card key={campaign.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
                                                    <Badge className={statusConfig.color}>
                                                        <StatusIcon className={`w-3 h-3 mr-1 ${campaign.status === 'sending' ? 'animate-spin' : ''}`} />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                                {campaign.description && (
                                                    <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                                                )}
                                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {campaign.total_recipients} recipients
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Send className="w-4 h-4" />
                                                        {campaign.sent_count} sent
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle className="w-4 h-4" />
                                                        {getDeliveryRate(campaign)}% delivered
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="w-4 h-4" />
                                                        {getReadRate(campaign)}% read
                                                    </span>
                                                    {campaign.scheduled_at && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(campaign.scheduled_at).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {campaign.status === 'draft' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => startCampaign.mutate(campaign.id)}
                                                        >
                                                            <Play className="w-4 h-4 mr-1" />
                                                            Send Now
                                                        </Button>
                                                        <Button variant="outline" size="sm">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            Schedule
                                                        </Button>
                                                    </>
                                                )}
                                                {campaign.status === 'sending' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => pauseCampaign.mutate(campaign.id)}
                                                    >
                                                        <Pause className="w-4 h-4 mr-1" />
                                                        Pause
                                                    </Button>
                                                )}
                                                {campaign.status === 'scheduled' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => cancelCampaign.mutate(campaign.id)}
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        Cancel
                                                    </Button>
                                                )}
                                                {campaign.status === 'sent' && (
                                                    <Button variant="outline" size="sm">
                                                        <BarChart3 className="w-4 h-4 mr-1" />
                                                        Report
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => deleteCampaign.mutate(campaign.id)}
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
