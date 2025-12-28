import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Instagram,
  Facebook,
  Send,
  Twitter,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Link,
  Reply,
} from "lucide-react";
import { usePlatformCapabilities, PlatformCapability, getCapabilityForPlatform } from "@/hooks/usePlatformCapabilities";
import { cn } from "@/lib/utils";

const platformIcons: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  telegram: Send,
  twitter: Twitter,
};

const platformColors: Record<string, string> = {
  whatsapp: "bg-green-500",
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  telegram: "bg-sky-500",
  twitter: "bg-black",
};

interface PlatformButton {
  type: "reply" | "url" | "call" | "postback";
  title: string;
  payload?: string;
  url?: string;
  phoneNumber?: string;
}

interface PlatformQuickReply {
  title: string;
  payload: string;
}

interface PlatformFormat {
  text: string;
  buttons: PlatformButton[];
  quickReplies: PlatformQuickReply[];
  mediaUrl?: string;
  mediaType?: "image" | "video" | "document" | "audio";
}

interface PlatformTemplateEditorProps {
  baseText: string;
  platformFormats: Record<string, PlatformFormat>;
  onPlatformFormatsChange: (formats: Record<string, PlatformFormat>) => void;
}

export function PlatformTemplateEditor({
  baseText,
  platformFormats,
  onPlatformFormatsChange,
}: PlatformTemplateEditorProps) {
  const { data: capabilities, isLoading } = usePlatformCapabilities();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("whatsapp");

  const platforms = ["whatsapp", "instagram", "facebook", "telegram", "twitter"];

  const getCurrentFormat = (): PlatformFormat => {
    return platformFormats[selectedPlatform] || {
      text: baseText,
      buttons: [],
      quickReplies: [],
    };
  };

  const updateFormat = (updates: Partial<PlatformFormat>) => {
    const currentFormat = getCurrentFormat();
    onPlatformFormatsChange({
      ...platformFormats,
      [selectedPlatform]: { ...currentFormat, ...updates },
    });
  };

  const currentFormat = getCurrentFormat();
  const capability = getCapabilityForPlatform(capabilities, selectedPlatform);
  const Icon = platformIcons[selectedPlatform] || MessageCircle;

  const addButton = () => {
    if (!capability || currentFormat.buttons.length >= capability.max_buttons) return;
    updateFormat({
      buttons: [...currentFormat.buttons, { type: "reply", title: "", payload: "" }],
    });
  };

  const removeButton = (index: number) => {
    updateFormat({
      buttons: currentFormat.buttons.filter((_, i) => i !== index),
    });
  };

  const updateButton = (index: number, updates: Partial<PlatformButton>) => {
    const newButtons = [...currentFormat.buttons];
    newButtons[index] = { ...newButtons[index], ...updates };
    updateFormat({ buttons: newButtons });
  };

  const addQuickReply = () => {
    if (!capability || currentFormat.quickReplies.length >= capability.max_quick_replies) return;
    updateFormat({
      quickReplies: [...currentFormat.quickReplies, { title: "", payload: "" }],
    });
  };

  const removeQuickReply = (index: number) => {
    updateFormat({
      quickReplies: currentFormat.quickReplies.filter((_, i) => i !== index),
    });
  };

  const updateQuickReply = (index: number, updates: Partial<PlatformQuickReply>) => {
    const newReplies = [...currentFormat.quickReplies];
    newReplies[index] = { ...newReplies[index], ...updates };
    updateFormat({ quickReplies: newReplies });
  };

  const textLength = currentFormat.text?.length || 0;
  const isTextTooLong = capability && textLength > capability.max_text_length;

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Platform-Specific Formatting</Label>
          <Badge variant="outline" className="gap-1">
            <Icon className="w-3 h-3" />
            {selectedPlatform}
          </Badge>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {platforms.map((platform) => {
            const PlatformIcon = platformIcons[platform];
            const hasCustomFormat = !!platformFormats[platform];
            
            return (
              <Button
                key={platform}
                variant={selectedPlatform === platform ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlatform(platform)}
                className="gap-2 whitespace-nowrap"
              >
                <div className={cn("p-1 rounded", platformColors[platform])}>
                  <PlatformIcon className="w-3 h-3 text-white" />
                </div>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                {hasCustomFormat && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Platform Capabilities Info */}
        {capability && (
          <div className="flex flex-wrap gap-2 text-xs">
            {capability.supports_buttons && (
              <Badge variant="secondary" className="gap-1">
                <Reply className="w-3 h-3" />
                {capability.max_buttons} buttons
              </Badge>
            )}
            {capability.supports_quick_replies && (
              <Badge variant="secondary" className="gap-1">
                {capability.max_quick_replies} quick replies
              </Badge>
            )}
            <Badge variant="secondary">
              Max {capability.max_text_length} chars
            </Badge>
          </div>
        )}

        {/* Text Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Message Text</Label>
            <span className={cn("text-xs", isTextTooLong ? "text-destructive" : "text-muted-foreground")}>
              {textLength} / {capability?.max_text_length || 4096}
            </span>
          </div>
          <Textarea
            value={currentFormat.text || baseText}
            onChange={(e) => updateFormat({ text: e.target.value })}
            placeholder="Enter message text..."
            rows={4}
            className={cn(isTextTooLong && "border-destructive")}
          />
          {isTextTooLong && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Text exceeds platform limit
            </p>
          )}
        </div>

        {/* Buttons Section */}
        {capability?.supports_buttons && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Buttons</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addButton}
                disabled={currentFormat.buttons.length >= capability.max_buttons}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Button
              </Button>
            </div>
            
            {currentFormat.buttons.map((button, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 items-start p-3 rounded-lg bg-secondary/50 border border-border"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Select
                      value={button.type}
                      onValueChange={(value) => updateButton(index, { type: value as PlatformButton["type"] })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {capability.button_types.includes("reply") && (
                          <SelectItem value="reply">Reply</SelectItem>
                        )}
                        {capability.button_types.includes("url") && (
                          <SelectItem value="url">URL</SelectItem>
                        )}
                        {capability.button_types.includes("call") && (
                          <SelectItem value="call">Call</SelectItem>
                        )}
                        {capability.button_types.includes("postback") && (
                          <SelectItem value="postback">Postback</SelectItem>
                        )}
                        {capability.button_types.includes("inline") && (
                          <SelectItem value="inline">Inline</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Input
                      value={button.title}
                      onChange={(e) => updateButton(index, { title: e.target.value })}
                      placeholder="Button title"
                      maxLength={20}
                      className="flex-1"
                    />
                  </div>
                  {button.type === "url" && (
                    <Input
                      value={button.url || ""}
                      onChange={(e) => updateButton(index, { url: e.target.value })}
                      placeholder="https://example.com"
                      type="url"
                    />
                  )}
                  {(button.type === "reply" || button.type === "postback") && (
                    <Input
                      value={button.payload || ""}
                      onChange={(e) => updateButton(index, { payload: e.target.value })}
                      placeholder="Payload/callback data"
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeButton(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Replies Section */}
        {capability?.supports_quick_replies && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Quick Replies</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addQuickReply}
                disabled={currentFormat.quickReplies.length >= capability.max_quick_replies}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Quick Reply
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {currentFormat.quickReplies.map((qr, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 p-2 rounded-lg bg-secondary/50 border border-border"
                >
                  <Input
                    value={qr.title}
                    onChange={(e) => updateQuickReply(index, { title: e.target.value })}
                    placeholder="Label"
                    maxLength={20}
                    className="w-24 h-8 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeQuickReply(index)}
                    className="text-destructive hover:text-destructive h-6 w-6"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Warning */}
        {selectedPlatform === "twitter" && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Twitter/X has limited DM capabilities. Only plain text up to 280 characters is supported.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}