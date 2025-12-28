import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FlowCanvas } from '@/components/bot-builder/FlowCanvas';
import { BotSettingsPanel } from '@/components/bot-builder/BotSettingsPanel';
import { BotTestDialog } from '@/components/bot-builder/BotTestDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Play, ArrowLeft, Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useBots } from '@/hooks/useBots';
import { Node, Edge } from '@xyflow/react';

export default function BotBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const botId = searchParams.get('id');
  
  const { bots, isLoading: botsLoading, createBot, updateBot } = useBots();
  
  const [botName, setBotName] = useState('New Bot Flow');
  const [description, setDescription] = useState('');
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  // Load bot data when editing existing bot
  useEffect(() => {
    if (botId && bots.length > 0 && !isInitialized) {
      const bot = bots.find(b => b.id === botId);
      if (bot) {
        setBotName(bot.name);
        setDescription(bot.description || '');
        setTriggerKeywords(bot.trigger_keywords || []);
        setIsActive(bot.is_active);
        const flowData = bot.flow_data as { nodes?: Node[]; edges?: Edge[] } | null;
        if (flowData?.nodes) setNodes(flowData.nodes);
        if (flowData?.edges) setEdges(flowData.edges);
        setIsInitialized(true);
      }
    } else if (!botId && !isInitialized) {
      setIsInitialized(true);
    }
  }, [botId, bots, isInitialized]);

  const handleFlowChange = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const flowData = { nodes, edges };
      
      if (botId) {
        await updateBot.mutateAsync({
          id: botId,
          name: botName,
          description,
          trigger_keywords: triggerKeywords,
          is_active: isActive,
          flow_data: flowData,
        });
      } else {
        const newBot = await createBot.mutateAsync({
          name: botName,
          description,
          trigger_keywords: triggerKeywords,
          is_active: isActive,
          flow_data: flowData,
        });
        navigate(`/bots/builder?id=${newBot.id}`, { replace: true });
      }
      toast.success('Bot saved successfully!');
    } catch (error) {
      toast.error('Failed to save bot');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = () => {
    if (nodes.length === 0) {
      toast.error('Add some nodes to test the bot flow');
      return;
    }
    setTestDialogOpen(true);
  };

  if (botsLoading && botId) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-14 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4"
      >
        <div className="flex items-center gap-4">
          <Link to="/bots">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Input
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="w-48 h-8 bg-background/50 border-border/50 focus:border-whatsapp"
            />
            <span className="text-xs text-muted-foreground">
              {botId ? 'Editing' : 'Draft'}
            </span>
            {triggerKeywords.length > 0 && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {triggerKeywords.length} trigger{triggerKeywords.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={settingsOpen ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={handleTest}>
            <Play className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Button variant="glow" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Flow Canvas */}
        <div className="flex-1 overflow-hidden">
          <FlowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onFlowChange={handleFlowChange}
            isInitialized={isInitialized}
          />
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {settingsOpen && (
            <BotSettingsPanel
              isOpen={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              botName={botName}
              onBotNameChange={setBotName}
              description={description}
              onDescriptionChange={setDescription}
              triggerKeywords={triggerKeywords}
              onTriggerKeywordsChange={setTriggerKeywords}
              isActive={isActive}
              onIsActiveChange={setIsActive}
            />
          )}
        </AnimatePresence>

        {/* Test Dialog */}
        <BotTestDialog
          open={testDialogOpen}
          onOpenChange={setTestDialogOpen}
          nodes={nodes}
          edges={edges}
          triggerKeywords={triggerKeywords}
        />
      </div>
    </div>
  );
}
