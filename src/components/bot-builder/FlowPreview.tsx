import { Node, Edge } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Smartphone, Send } from 'lucide-react';

interface FlowPreviewProps {
  nodes: Node[];
  edges: Edge[];
}

interface MessageData {
  message?: string;
  body?: string;
  buttons?: { id: string; title: string }[];
}

export function FlowPreview({ nodes, edges }: FlowPreviewProps) {
  // Build conversation preview from the flow
  const getConversationPreview = () => {
    const messages: { type: 'bot' | 'user'; content: string; buttons?: { id: string; title: string }[] }[] = [];
    
    // Find start node
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) return messages;
    
    // Follow the flow
    let currentNodeId = startNode.id;
    let visited = new Set<string>();
    
    while (currentNodeId && !visited.has(currentNodeId) && messages.length < 10) {
      visited.add(currentNodeId);
      const node = nodes.find(n => n.id === currentNodeId);
      if (!node) break;
      
      const data = node.data as MessageData;
      
      if (node.type === 'message') {
        messages.push({
          type: 'bot',
          content: data.message || 'Hello! How can I help you?',
        });
      } else if (node.type === 'quickReply') {
        messages.push({
          type: 'bot',
          content: data.body || 'Please select an option:',
          buttons: data.buttons,
        });
        // Add simulated user response
        if (data.buttons && data.buttons.length > 0) {
          messages.push({
            type: 'user',
            content: data.buttons[0].title,
          });
        }
      } else if (node.type === 'apiCall') {
        messages.push({
          type: 'bot',
          content: '⏳ Processing...',
        });
      }
      
      // Find next node
      const edge = edges.find(e => e.source === currentNodeId);
      currentNodeId = edge?.target || '';
    }
    
    return messages;
  };

  const messages = getConversationPreview();

  return (
    <div className="w-80 bg-sidebar border-l border-sidebar-border p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-whatsapp" />
        <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
      </div>
      
      {/* Phone mockup */}
      <div className="flex-1 flex justify-center">
        <div className="w-64 bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
          {/* Phone notch */}
          <div className="w-20 h-4 mx-auto bg-black rounded-full mb-1" />
          
          {/* Screen */}
          <div className="bg-[#0b141a] rounded-2xl overflow-hidden h-[400px] flex flex-col">
            {/* Header */}
            <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-whatsapp/30 flex items-center justify-center">
                <span className="text-xs text-whatsapp">🤖</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Bot Preview</p>
                <p className="text-xs text-gray-400">online</p>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-gray-500 text-center">
                    Add nodes to see<br />the conversation preview
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 ${
                        msg.type === 'user'
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#1f2c34] text-white rounded-tl-none'
                      }`}
                    >
                      <p className="text-xs">{msg.content}</p>
                      {msg.buttons && (
                        <div className="mt-2 space-y-1">
                          {msg.buttons.map((btn) => (
                            <div
                              key={btn.id}
                              className="text-xs text-center py-1.5 border border-[#00a884]/50 rounded text-[#00a884]"
                            >
                              {btn.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Input */}
            <div className="p-2 flex items-center gap-2">
              <div className="flex-1 bg-[#1f2c34] rounded-full px-4 py-2">
                <p className="text-xs text-gray-500">Type a message</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-whatsapp flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
