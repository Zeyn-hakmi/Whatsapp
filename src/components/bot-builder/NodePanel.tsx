import { DragEvent } from 'react';
import {
  MessageSquare,
  MousePointerClick,
  GitBranch,
  Webhook,
  Clock,
  UserPlus,
  Mail,
  FlaskConical,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NodeType {
  type: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  category: 'basic' | 'advanced' | 'integration';
}

const nodeTypes: NodeType[] = [
  // Basic nodes
  {
    type: 'message',
    label: 'Message',
    icon: MessageSquare,
    color: 'whatsapp',
    description: 'Send a text message',
    category: 'basic',
  },
  {
    type: 'quickReply',
    label: 'Quick Reply',
    icon: MousePointerClick,
    color: 'blue-500',
    description: 'Buttons for user input',
    category: 'basic',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranch,
    color: 'amber-500',
    description: 'Branch based on logic',
    category: 'basic',
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    color: 'cyan-500',
    description: 'Wait before continuing',
    category: 'basic',
  },
  // Advanced nodes
  {
    type: 'abTest',
    label: 'A/B Test',
    icon: FlaskConical,
    color: 'emerald-500',
    description: 'Split test different paths',
    category: 'advanced',
  },
  {
    type: 'handoff',
    label: 'Human Handoff',
    icon: UserPlus,
    color: 'orange-500',
    description: 'Transfer to agent',
    category: 'advanced',
  },
  {
    type: 'appointment',
    label: 'Schedule',
    icon: Calendar,
    color: 'sky-500',
    description: 'Book appointments',
    category: 'advanced',
  },
  // Integration nodes
  {
    type: 'apiCall',
    label: 'API Call',
    icon: Webhook,
    color: 'purple-500',
    description: 'Call external API',
    category: 'integration',
  },
  {
    type: 'webhookTrigger',
    label: 'Webhook',
    icon: Webhook,
    color: 'indigo-500',
    description: 'Trigger webhook',
    category: 'integration',
  },
  {
    type: 'email',
    label: 'Send Email',
    icon: Mail,
    color: 'rose-500',
    description: 'Email notification',
    category: 'integration',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  whatsapp: { bg: 'bg-whatsapp/20', text: 'text-whatsapp', border: 'border-whatsapp/30' },
  'blue-500': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'amber-500': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  'purple-500': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  'cyan-500': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'orange-500': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'indigo-500': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  'rose-500': { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
  'emerald-500': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'sky-500': { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' },
};

export function NodePanel() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const basicNodes = nodeTypes.filter(n => n.category === 'basic');
  const advancedNodes = nodeTypes.filter(n => n.category === 'advanced');
  const integrationNodes = nodeTypes.filter(n => n.category === 'integration');

  const renderNodeGroup = (nodes: NodeType[], title: string, startIndex: number) => (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h4>
      {nodes.map((node, index) => {
        const colors = colorMap[node.color];
        return (
          <motion.div
            key={node.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (startIndex + index) * 0.05 }}
            draggable
            onDragStart={(e) => onDragStart(e as unknown as DragEvent<HTMLDivElement>, node.type)}
            className={`p-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] ${colors.bg} ${colors.border}`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                <node.icon className={`w-3.5 h-3.5 ${colors.text}`} />
              </div>
              <div>
                <p className={`text-xs font-medium ${colors.text}`}>{node.label}</p>
                <p className="text-[10px] text-muted-foreground">{node.description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border p-4 flex flex-col gap-4 overflow-y-auto">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Node Types</h3>
        <p className="text-xs text-muted-foreground">Drag nodes to the canvas</p>
      </div>

      <div className="space-y-4">
        {renderNodeGroup(basicNodes, 'Basic', 0)}
        {renderNodeGroup(advancedNodes, 'Advanced', basicNodes.length)}
        {renderNodeGroup(integrationNodes, 'Integrations', basicNodes.length + advancedNodes.length)}
      </div>

      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tip:</strong> Connect nodes by dragging from handles</p>
          <p>🗑️ Select and press Delete to remove</p>
        </div>
      </div>
    </div>
  );
}

