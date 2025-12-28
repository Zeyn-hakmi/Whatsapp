import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Tag, MessageCircle, Instagram, Facebook, Send, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useSocialConnections, SOCIAL_PLATFORMS } from '@/hooks/useSocialConnections';

const platformIcons: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  telegram: Send,
  twitter: Twitter,
};

interface BotSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  botName: string;
  onBotNameChange: (name: string) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
  triggerKeywords: string[];
  onTriggerKeywordsChange: (keywords: string[]) => void;
  isActive: boolean;
  onIsActiveChange: (active: boolean) => void;
  enabledPlatforms?: string[];
  onEnabledPlatformsChange?: (platforms: string[]) => void;
}

export function BotSettingsPanel({
  isOpen,
  onClose,
  botName,
  onBotNameChange,
  description,
  onDescriptionChange,
  triggerKeywords,
  onTriggerKeywordsChange,
  isActive,
  onIsActiveChange,
  enabledPlatforms = [],
  onEnabledPlatformsChange,
}: BotSettingsPanelProps) {
  const [newKeyword, setNewKeyword] = useState('');
  const { connections } = useSocialConnections();

  const handleAddKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase();
    if (keyword && !triggerKeywords.includes(keyword)) {
      onTriggerKeywordsChange([...triggerKeywords, keyword]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onTriggerKeywordsChange(triggerKeywords.filter((k) => k !== keyword));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handlePlatformToggle = (platformId: string, checked: boolean) => {
    if (!onEnabledPlatformsChange) return;
    if (checked) {
      onEnabledPlatformsChange([...enabledPlatforms, platformId]);
    } else {
      onEnabledPlatformsChange(enabledPlatforms.filter((p) => p !== platformId));
    }
  };

  if (!isOpen) return null;

  // Get active connections
  const activeConnections = connections.filter((c) => c.is_active);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-80 h-full bg-card border-l border-border flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Bot Settings</h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Bot Name */}
          <div className="space-y-2">
            <Label htmlFor="bot-name">Bot Name</Label>
            <Input
              id="bot-name"
              value={botName}
              onChange={(e) => onBotNameChange(e.target.value)}
              placeholder="Enter bot name"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="bot-description">Description</Label>
            <Textarea
              id="bot-description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe what this bot does..."
              rows={3}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bot Status</Label>
              <p className="text-xs text-muted-foreground">
                Enable to activate this bot
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={onIsActiveChange} />
          </div>

          {/* Social Media Platforms */}
          {onEnabledPlatformsChange && (
            <div className="space-y-3">
              <div>
                <Label>Run on Platforms</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Select which social media platforms this bot should respond to
                </p>
              </div>

              {activeConnections.length > 0 ? (
                <div className="space-y-2">
                  {activeConnections.map((connection) => {
                    const platform = SOCIAL_PLATFORMS.find((p) => p.id === connection.platform);
                    const Icon = platformIcons[connection.platform] || MessageCircle;
                    const isEnabled = enabledPlatforms.includes(connection.platform);
                    
                    return (
                      <label
                        key={connection.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border cursor-pointer hover:bg-secondary/70 transition-colors"
                      >
                        <Checkbox
                          checked={isEnabled}
                          onCheckedChange={(checked) => 
                            handlePlatformToggle(connection.platform, checked as boolean)
                          }
                        />
                        <div className={`p-1.5 rounded ${platform?.color || 'bg-muted'}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {platform?.name || connection.platform}
                          </span>
                          {connection.platform_username && (
                            <p className="text-xs text-muted-foreground">
                              {connection.platform_username}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-secondary/50 text-center">
                  <MessageCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No connected platforms
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect social media in Settings
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <a href="/settings">Go to Settings</a>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Trigger Keywords */}
          <div className="space-y-3">
            <div>
              <Label>Trigger Keywords</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Messages containing these keywords will activate this bot
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add keyword..."
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {triggerKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {triggerKeywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="pl-2 pr-1 py-1 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {keyword}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-4 w-4 ml-1 hover:bg-destructive/20"
                      onClick={() => handleRemoveKeyword(keyword)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <Tag className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No trigger keywords set
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add keywords to activate this bot
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="text-sm font-medium text-foreground mb-2">Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use common words customers might type</li>
              <li>• Keywords are case-insensitive</li>
              <li>• Add multiple keywords for better coverage</li>
              <li>• Use "hi", "hello", "help" for general queries</li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
