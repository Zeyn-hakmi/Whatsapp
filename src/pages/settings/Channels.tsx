import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    MessageCircle,
    Instagram,
    Facebook,
    Send,
    Twitter,
    CheckCircle2,
    Plus,
    Trash2,
    Loader2
} from "lucide-react";
import { useSocialConnections, SOCIAL_PLATFORMS } from "@/hooks/useSocialConnections";
import { toast } from "sonner";

export default function Channels() {
    const { connections, isLoading, createConnection, toggleConnection, deleteConnection } = useSocialConnections();
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        accessToken: "",
        phoneNumberId: "",
        verifyToken: "",
    });

    const handleConnect = async () => {
        if (!selectedPlatform) return;
        if (!formData.accessToken || !formData.phoneNumberId) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await createConnection.mutateAsync({
                platform: selectedPlatform,
                platform_user_id: formData.phoneNumberId, // Use phone ID as user ID for WhatsApp
                access_token: formData.accessToken,
                is_active: true,
                metadata: { verify_token: formData.verifyToken }
            });
            setIsDialogOpen(false);
            setFormData({ accessToken: "", phoneNumberId: "", verifyToken: "" });
            setSelectedPlatform(null);
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case "MessageCircle": return <MessageCircle className="w-6 h-6 text-white" />;
            case "Instagram": return <Instagram className="w-6 h-6 text-white" />;
            case "Facebook": return <Facebook className="w-6 h-6 text-white" />;
            case "Send": return <Send className="w-6 h-6 text-white" />;
            case "Twitter": return <Twitter className="w-6 h-6 text-white" />;
            default: return <MessageCircle className="w-6 h-6 text-white" />;
        }
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 max-w-5xl mx-auto"
            >
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Channels</h1>
                    <p className="text-muted-foreground mt-1">
                        Connect and manage your messaging platforms
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SOCIAL_PLATFORMS.map((platform) => {
                        const connection = connections.find(c => c.platform === platform.id);
                        const isConnected = !!connection;

                        return (
                            <Card key={platform.id} className="overflow-hidden border-muted/50 transition-all hover:border-primary/50 hover:shadow-lg">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${platform.color} shadow-lg`}>
                                            {getIcon(platform.icon)}
                                        </div>
                                        {isConnected && (
                                            <Badge variant={connection.is_active ? "default" : "secondary"} className="gap-1">
                                                {connection.is_active ? (
                                                    <><CheckCircle2 className="w-3 h-3" /> Active</>
                                                ) : (
                                                    "Disabled"
                                                )}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="mt-4">{platform.name}</CardTitle>
                                    <CardDescription>
                                        {isConnected
                                            ? `Connected as ${connection.platform_user_id}`
                                            : "Not connected"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isConnected ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-medium">Status</Label>
                                                <Switch
                                                    checked={connection.is_active}
                                                    onCheckedChange={(checked) => toggleConnection.mutate({ id: connection.id, is_active: checked })}
                                                />
                                            </div>
                                            <Button
                                                variant="destructive"
                                                className="w-full gap-2"
                                                onClick={() => deleteConnection.mutate(connection.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Disconnect
                                            </Button>
                                        </div>
                                    ) : (
                                        <Dialog open={isDialogOpen && selectedPlatform === platform.id} onOpenChange={(open) => {
                                            setIsDialogOpen(open);
                                            if (!open) setSelectedPlatform(null);
                                            else setSelectedPlatform(platform.id);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full gap-2" variant="outline">
                                                    <Plus className="w-4 h-4" />
                                                    Connect
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Connect {platform.name}</DialogTitle>
                                                    <DialogDescription>
                                                        Enter your API credentials to connect this channel.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Phone ID / User ID</Label>
                                                        <Input
                                                            placeholder="100609346..."
                                                            value={formData.phoneNumberId}
                                                            onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Access Token</Label>
                                                        <Input
                                                            type="password"
                                                            placeholder="EAAG..."
                                                            value={formData.accessToken}
                                                            onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                                                        />
                                                    </div>
                                                    {platform.id === 'whatsapp' && (
                                                        <div className="space-y-2">
                                                            <Label>Webhook Verify Token</Label>
                                                            <Input
                                                                placeholder="my_secret_token"
                                                                value={formData.verifyToken}
                                                                onChange={(e) => setFormData({ ...formData, verifyToken: e.target.value })}
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Use this token when configuring the webhook in Meta dashboard.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                                    <Button onClick={handleConnect} disabled={createConnection.isPending}>
                                                        {createConnection.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                        Connect
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
