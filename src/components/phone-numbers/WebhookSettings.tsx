import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Webhook,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

export interface WebhookConfig {
  webhookUrl: string;
  verifyToken: string;
  isEnabled: boolean;
  subscribedEvents: string[];
  lastDeliveryStatus?: "success" | "failed" | null;
  lastDeliveryAt?: Date;
}

interface WebhookSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  displayName: string;
  config: WebhookConfig;
  onSave: (config: WebhookConfig) => void;
}

const WEBHOOK_EVENTS = [
  { id: "messages", label: "Messages", description: "Incoming messages" },
  { id: "message_status", label: "Message Status", description: "Sent, delivered, read receipts" },
  { id: "message_template_status", label: "Template Status", description: "Template approval updates" },
  { id: "phone_number_quality", label: "Quality Updates", description: "Quality rating changes" },
  { id: "account_update", label: "Account Updates", description: "Business account changes" },
  { id: "phone_number_name", label: "Name Updates", description: "Display name changes" },
];

export function WebhookSettings({
  open,
  onOpenChange,
  phoneNumber,
  displayName,
  config,
  onSave,
}: WebhookSettingsProps) {
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl);
  const [verifyToken, setVerifyToken] = useState(config.verifyToken);
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [subscribedEvents, setSubscribedEvents] = useState<string[]>(config.subscribedEvents);
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleEventToggle = (eventId: string, checked: boolean) => {
    if (checked) {
      setSubscribedEvents((prev) => [...prev, eventId]);
    } else {
      setSubscribedEvents((prev) => prev.filter((e) => e !== eventId));
    }
  };

  const handleSelectAll = () => {
    if (subscribedEvents.length === WEBHOOK_EVENTS.length) {
      setSubscribedEvents([]);
    } else {
      setSubscribedEvents(WEBHOOK_EVENTS.map((e) => e.id));
    }
  };

  const generateToken = () => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setVerifyToken(token);
    toast.success("New verify token generated");
  };

  const copyToken = () => {
    navigator.clipboard.writeText(verifyToken);
    toast.success("Token copied to clipboard");
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    setIsTesting(true);
    // Simulate webhook test
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTesting(false);
    toast.success("Test webhook sent successfully");
  };

  const handleSave = () => {
    if (isEnabled && !webhookUrl) {
      toast.error("Webhook URL is required when enabled");
      return;
    }

    onSave({
      webhookUrl,
      verifyToken,
      isEnabled,
      subscribedEvents,
      lastDeliveryStatus: config.lastDeliveryStatus,
      lastDeliveryAt: config.lastDeliveryAt,
    });
    onOpenChange(false);
    toast.success("Webhook settings saved");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Webhook Configuration
          </DialogTitle>
          <DialogDescription>
            Configure webhooks for <strong>{displayName}</strong> ({phoneNumber})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable Webhooks</Label>
              <p className="text-sm text-muted-foreground">
                Receive real-time notifications for events
              </p>
            </div>
            <Button
              variant={isEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEnabled(!isEnabled)}
            >
              {isEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <Separator />

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Callback URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhookUrl"
                placeholder="https://your-server.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={!isEnabled}
              />
              <Button
                variant="outline"
                onClick={handleTestWebhook}
                disabled={!isEnabled || isTesting || !webhookUrl}
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Test"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your server must respond with HTTP 200 to verify ownership
            </p>
          </div>

          {/* Verify Token */}
          <div className="space-y-2">
            <Label htmlFor="verifyToken">Verify Token</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="verifyToken"
                  type={showToken ? "text" : "password"}
                  placeholder="Your verification token"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  disabled={!isEnabled}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowToken(!showToken)}
                    disabled={!isEnabled}
                  >
                    {showToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={copyToken}
                    disabled={!isEnabled || !verifyToken}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={generateToken}
                disabled={!isEnabled}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Used to verify webhook requests from WhatsApp
            </p>
          </div>

          <Separator />

          {/* Subscribed Events */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Subscribed Events</Label>
                <p className="text-sm text-muted-foreground">
                  Choose which events trigger webhook notifications
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={!isEnabled}
              >
                {subscribedEvents.length === WEBHOOK_EVENTS.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="grid gap-3">
              {WEBHOOK_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 rounded-lg border p-3"
                >
                  <Checkbox
                    id={event.id}
                    checked={subscribedEvents.includes(event.id)}
                    onCheckedChange={(checked) =>
                      handleEventToggle(event.id, checked as boolean)
                    }
                    disabled={!isEnabled}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={event.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {event.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Delivery Status */}
          {config.lastDeliveryStatus && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-base">Last Delivery</Label>
                <div className="flex items-center gap-2">
                  {config.lastDeliveryStatus === "success" ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Success
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-destructive/10 text-destructive border-destructive/20 gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Failed
                    </Badge>
                  )}
                  {config.lastDeliveryAt && (
                    <span className="text-sm text-muted-foreground">
                      {config.lastDeliveryAt.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
