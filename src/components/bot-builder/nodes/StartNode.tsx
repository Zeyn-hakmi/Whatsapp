import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';

const StartNode = memo(({ selected }: NodeProps) => {
  return (
    <div className={`min-w-[120px] rounded-xl border-2 bg-card shadow-lg transition-all ${
      selected ? 'border-whatsapp ring-2 ring-whatsapp/30' : 'border-border'
    }`}>
      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-whatsapp/20 to-whatsapp/10 rounded-xl">
        <div className="p-2 rounded-full bg-whatsapp/30">
          <Play className="w-4 h-4 text-whatsapp fill-whatsapp" />
        </div>
        <span className="text-sm font-semibold text-whatsapp">Start</span>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-whatsapp !border-2 !border-background"
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';

export default StartNode;
