import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

export interface MessageNodeData {
  label: string;
  message: string;
}

const MessageNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as MessageNodeData;
  
  return (
    <div className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-all ${
      selected ? 'border-whatsapp ring-2 ring-whatsapp/30' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-whatsapp !border-2 !border-background"
      />
      
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-whatsapp/10 rounded-t-xl">
        <div className="p-1.5 rounded-lg bg-whatsapp/20">
          <MessageSquare className="w-4 h-4 text-whatsapp" />
        </div>
        <span className="text-sm font-medium text-foreground">{nodeData.label || 'Message'}</span>
      </div>
      
      <div className="px-3 py-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {nodeData.message || 'Enter your message...'}
        </p>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-whatsapp !border-2 !border-background"
      />
    </div>
  );
});

MessageNode.displayName = 'MessageNode';

export default MessageNode;
