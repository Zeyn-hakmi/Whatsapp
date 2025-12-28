import { useState, useRef, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, RotateCcw, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BotTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: Node[];
  edges: Edge[];
  triggerKeywords: string[];
}

interface Message {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  buttons?: { id: string; title: string }[];
}

interface MessageData {
  message?: string;
  body?: string;
  buttons?: { id: string; title: string }[];
  condition?: string;
  trueLabel?: string;
  falseLabel?: string;
  endpoint?: string;
}

export function BotTestDialog({
  open,
  onOpenChange,
  nodes,
  edges,
  triggerKeywords,
}: BotTestDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset conversation when dialog opens
  useEffect(() => {
    if (open) {
      resetConversation();
    }
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const resetConversation = () => {
    setMessages([
      {
        id: 'system-1',
        type: 'system',
        content: triggerKeywords.length > 0
          ? `Send a message containing one of these keywords to start: ${triggerKeywords.join(', ')}`
          : 'Send any message to start the conversation',
      },
    ]);
    setCurrentNodeId(null);
    setIsWaiting(false);
    setInputValue('');
  };

  const findStartNode = () => nodes.find((n) => n.type === 'start');

  const findNextNode = (fromNodeId: string, edgeSourceHandle?: string) => {
    const edge = edges.find((e) => {
      if (e.source !== fromNodeId) return false;
      if (edgeSourceHandle && e.sourceHandle !== edgeSourceHandle) return false;
      return true;
    });
    if (!edge) return null;
    return nodes.find((n) => n.id === edge.target);
  };

  const processNode = async (node: Node) => {
    const data = node.data as MessageData;

    switch (node.type) {
      case 'start': {
        // Move to next node from start
        const nextNode = findNextNode(node.id);
        if (nextNode) {
          await delay(500);
          processNode(nextNode);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `system-${Date.now()}`,
              type: 'system',
              content: 'Flow ended - no connected nodes after start',
            },
          ]);
        }
        break;
      }

      case 'message': {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: data.message || 'Hello!',
          },
        ]);
        setCurrentNodeId(node.id);
        
        // Auto-continue to next node
        const nextNode = findNextNode(node.id);
        if (nextNode) {
          await delay(800);
          processNode(nextNode);
        } else {
          setIsWaiting(true);
        }
        break;
      }

      case 'quickReply': {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: data.body || 'Please select an option:',
            buttons: data.buttons,
          },
        ]);
        setCurrentNodeId(node.id);
        setIsWaiting(true);
        break;
      }

      case 'condition': {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            content: `Evaluating condition: ${data.condition || 'unknown'}`,
          },
        ]);
        // Simulate random condition result
        const result = Math.random() > 0.5;
        const handleId = result ? 'true' : 'false';
        
        await delay(500);
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            content: `Condition result: ${result ? (data.trueLabel || 'True') : (data.falseLabel || 'False')}`,
          },
        ]);

        const nextNode = findNextNode(node.id, handleId);
        if (nextNode) {
          await delay(500);
          processNode(nextNode);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `system-${Date.now()}`,
              type: 'system',
              content: 'Flow ended - no connected node for this condition branch',
            },
          ]);
        }
        break;
      }

      case 'apiCall': {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            content: `Simulating API call to: ${data.endpoint || 'unknown endpoint'}`,
          },
        ]);
        await delay(1000);
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            content: 'API call completed (simulated)',
          },
        ]);
        
        const nextNode = findNextNode(node.id);
        if (nextNode) {
          await delay(500);
          processNode(nextNode);
        }
        break;
      }

      default:
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            content: `Unknown node type: ${node.type}`,
          },
        ]);
    }
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsWaiting(false);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: 'user',
        content: userMessage,
      },
    ]);

    // If no conversation started yet, check trigger keywords
    if (!currentNodeId) {
      const matchesTrigger =
        triggerKeywords.length === 0 ||
        triggerKeywords.some((kw) =>
          userMessage.toLowerCase().includes(kw.toLowerCase())
        );

      if (matchesTrigger) {
        const startNode = findStartNode();
        if (startNode) {
          await delay(500);
          processNode(startNode);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `system-${Date.now()}`,
              type: 'system',
              content: 'No start node found in the flow',
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            content: `Message doesn't match any trigger keywords. Try: ${triggerKeywords.join(', ')}`,
          },
        ]);
      }
    } else {
      // Continue from current node
      const nextNode = findNextNode(currentNodeId);
      if (nextNode) {
        await delay(500);
        processNode(nextNode);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            content: 'End of conversation flow',
          },
        ]);
      }
    }
  };

  const handleButtonClick = async (buttonId: string, buttonTitle: string) => {
    if (!currentNodeId) return;

    setIsWaiting(false);

    // Add user selection as message
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: 'user',
        content: buttonTitle,
      },
    ]);

    // Find next node from current quick reply
    const nextNode = findNextNode(currentNodeId);
    if (nextNode) {
      await delay(500);
      processNode(nextNode);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: 'system',
          content: 'End of conversation flow',
        },
      ]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-background overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <DialogTitle>Test Bot Flow</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={resetConversation}
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Chat area */}
        <div className="h-[400px] flex flex-col bg-muted/20">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.type === 'user'
                        ? 'justify-end'
                        : msg.type === 'system'
                        ? 'justify-center'
                        : 'justify-start'
                    }`}
                  >
                    {msg.type === 'system' ? (
                      <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        {msg.content}
                      </div>
                    ) : (
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 ${
                          msg.type === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-card border border-border text-foreground rounded-tl-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        {msg.buttons && msg.buttons.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {msg.buttons.map((btn) => (
                              <button
                                key={btn.id}
                                onClick={() => handleButtonClick(btn.id, btn.title)}
                                className="w-full text-sm text-center py-1.5 border border-primary/50 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                              >
                                {btn.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="p-3 border-t border-border bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
