import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import {
    Globe,
    Plus,
    Trash2,
    Shield,
    AlertTriangle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface IPEntry {
    id: string;
    ip: string;
    label?: string;
    createdAt: Date;
}

interface IPWhitelistProps {
    isEnabled: boolean;
    onEnabledChange: (enabled: boolean) => void;
}

export function IPWhitelist({ isEnabled, onEnabledChange }: IPWhitelistProps) {
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newIP, setNewIP] = useState('');
    const [newLabel, setNewLabel] = useState('');

    const [ips, setIps] = useState<IPEntry[]>([
        { id: '1', ip: '192.168.1.0/24', label: 'Office Network', createdAt: new Date() },
        { id: '2', ip: '10.0.0.1', label: 'VPN Exit', createdAt: new Date() },
    ]);

    const isValidIP = (ip: string) => {
        // Basic validation for IP or CIDR
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
        return ipv4Regex.test(ip);
    };

    const handleAddIP = () => {
        if (!isValidIP(newIP)) {
            toast({ title: "Invalid IP address", description: "Please enter a valid IP or CIDR range", variant: "destructive" });
            return;
        }

        setIps([...ips, {
            id: Date.now().toString(),
            ip: newIP,
            label: newLabel || undefined,
            createdAt: new Date(),
        }]);

        setNewIP('');
        setNewLabel('');
        setIsAddDialogOpen(false);
        toast({ title: "IP address added" });
    };

    const handleRemoveIP = (id: string) => {
        if (ips.length === 1 && isEnabled) {
            toast({
                title: "Cannot remove last IP",
                description: "Disable IP whitelisting first, or add another IP",
                variant: "destructive"
            });
            return;
        }
        setIps(ips.filter(ip => ip.id !== id));
        toast({ title: "IP address removed" });
    };

    const handleToggleWhitelist = (enabled: boolean) => {
        if (enabled && ips.length === 0) {
            toast({
                title: "Add an IP first",
                description: "You need at least one whitelisted IP to enable this feature",
                variant: "destructive"
            });
            return;
        }
        onEnabledChange(enabled);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">IP Whitelisting</CardTitle>
                            <CardDescription>Restrict API access to specific IP addresses</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="ip-whitelist-toggle" className="text-sm text-muted-foreground">
                                {isEnabled ? 'Enabled' : 'Disabled'}
                            </Label>
                            <Switch
                                id="ip-whitelist-toggle"
                                checked={isEnabled}
                                onCheckedChange={handleToggleWhitelist}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isEnabled && (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-500">
                            Only requests from the listed IP addresses will be accepted. Make sure your current IP is whitelisted to avoid being locked out.
                        </p>
                    </div>
                )}

                {/* IP List */}
                <div className="space-y-2">
                    {ips.map((ip, index) => (
                        <motion.div
                            key={ip.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <code className="text-sm font-mono text-foreground">{ip.ip}</code>
                                    {ip.label && (
                                        <span className="text-xs text-muted-foreground ml-2">({ip.label})</span>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive h-8 w-8"
                                onClick={() => handleRemoveIP(ip.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Add IP Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add IP Address
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add IP Address</DialogTitle>
                            <DialogDescription>Add an IP address or CIDR range to the whitelist</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>IP Address or CIDR Range</Label>
                                <Input
                                    placeholder="e.g., 192.168.1.1 or 10.0.0.0/24"
                                    value={newIP}
                                    onChange={e => setNewIP(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Label (Optional)</Label>
                                <Input
                                    placeholder="e.g., Office Network"
                                    value={newLabel}
                                    onChange={e => setNewLabel(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddIP}>Add IP</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
