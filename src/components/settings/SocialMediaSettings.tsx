import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MessageCircle,
  Instagram,
  Facebook,
  Send,
  Twitter,
  Plus,
  Trash2,
  Link2,
  Loader2,
  CheckCircle,
  XCircle,
  Webhook,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useSocialConnections, SOCIAL_PLATFORMS, SocialConnectionInput } from "@/hooks/useSocialConnections";
import { toast } from "sonner";

const platformIcons: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  telegram: Send,
  twitter: Twitter,
};

export function SocialMediaSettings() {
  const { connections, isLoading, createConnection, deleteConnection, toggleConnection } = useSocialConnections();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const connectedPlatforms = connections.map((c) => c.platform);
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !connectedPlatforms.includes(p.id)
  );

  const webhookBaseUrl = `${window.location.origin.replace('localhost', 'YOUR_DOMAIN')}/functions/v1/social-webhook`;

  const handleConnect = async () => {
    if (!selectedPlatform) return;
    
    const input: SocialConnectionInput = {
      platform: selectedPlatform,
      platform_username: username || undefined,
      access_token: accessToken || undefined,
      is_active: true,
    };

    await createConnection.mutateAsync(input);
    setDialogOpen(false);
    setSelectedPlatform("");
    setUsername("");
    setAccessToken("");
  };

  const handleDisconnect = async (id: string) => {
    await deleteConnection.mutateAsync(id);
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    await toggleConnection.mutateAsync({ id, is_active: !currentState });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="connections" className="space-y-6">
      <TabsList>
        <TabsTrigger value="connections">Connections</TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
      </TabsList>

      <TabsContent value="connections" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Connected Accounts</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your social media accounts to receive and send messages
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" disabled={availablePlatforms.length === 0}>
                    <Plus className="w-4 h-4" />
                    Connect Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect Social Media Account</DialogTitle>
                    <DialogDescription>
                      Select a platform and provide your API credentials
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePlatforms.map((platform) => {
                            const Icon = platformIcons[platform.id];
                            return (
                              <SelectItem key={platform.id} value={platform.id}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {platform.name}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Username / Page ID</Label>
                      <Input
                        placeholder="@username or page/bot ID"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Access Token</Label>
                      <Input
                        type="password"
                        placeholder="Your API access token"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Get this from the platform's developer console
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleConnect} 
                      disabled={!selectedPlatform || createConnection.isPending}
                    >
                      {createConnection.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Link2 className="w-4 h-4 mr-2" />
                      )}
                      Connect
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {connections.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No social media accounts connected yet</p>
                <p className="text-sm">Click "Connect Account" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections.map((connection) => {
                  const platform = SOCIAL_PLATFORMS.find((p) => p.id === connection.platform);
                  const Icon = platformIcons[connection.platform] || MessageCircle;
                  
                  return (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${platform?.color || "bg-muted"}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {platform?.name || connection.platform}
                            </span>
                            {connection.is_active ? (
                              <Badge variant="outline" className="text-green-500 border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                          {connection.platform_username && (
                            <p className="text-sm text-muted-foreground">
                              {connection.platform_username}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={connection.is_active}
                          onCheckedChange={() => handleToggle(connection.id, connection.is_active)}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disconnect Account?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the connection to {platform?.name || connection.platform}. 
                                You can reconnect it later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDisconnect(connection.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Disconnect
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Bot Integration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Assign bots to your connected social media accounts from the Bot Builder. 
              Each bot can be configured to respond to messages from specific platforms.
            </p>
            <Button variant="outline" asChild>
              <a href="/bots">Manage Bots</a>
            </Button>
          </Card>
        </motion.div>
      </TabsContent>

      <TabsContent value="webhooks" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <Webhook className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Webhook Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure webhooks to receive messages from each platform
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {SOCIAL_PLATFORMS.map((platform) => {
                const Icon = platformIcons[platform.id];
                const webhookUrl = `${webhookBaseUrl}?platform=${platform.id}`;
                
                return (
                  <div key={platform.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${platform.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={webhookUrl}
                            readOnly
                            className="font-mono text-sm bg-background"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(webhookUrl)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ExternalLink className="w-3 h-3" />
                        <a 
                          href={getSetupDocsUrl(platform.id)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary underline"
                        >
                          View setup documentation →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h4 className="font-semibold text-foreground mb-3">Setup Instructions</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Copy the webhook URL for your platform</li>
              <li>Go to the platform's developer console</li>
              <li>Configure the webhook with the copied URL</li>
              <li>Subscribe to message events</li>
              <li>Verify the webhook connection</li>
            </ol>
          </Card>
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}

function getSetupDocsUrl(platform: string): string {
  const docs: Record<string, string> = {
    whatsapp: "https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/set-up",
    instagram: "https://developers.facebook.com/docs/instagram-api/guides/webhooks",
    facebook: "https://developers.facebook.com/docs/messenger-platform/webhooks",
    telegram: "https://core.telegram.org/bots/api#setwebhook",
    twitter: "https://developer.twitter.com/en/docs/twitter-api/direct-messages",
  };
  return docs[platform] || "#";
}
