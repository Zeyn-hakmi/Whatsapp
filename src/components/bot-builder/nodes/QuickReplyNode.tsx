import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MousePointerClick } from 'lucide-react';

export interface QuickReplyButton {
  id: string;
  title: string;
}

export interface QuickReplyNodeData {
  label: string;
  body: string;
  buttons: QuickReplyButton[];
}

const QuickReplyNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as QuickReplyNodeData;
  const buttons = nodeData.buttons || [{ id: '1', title: 'Option 1' }, { id: '2', title: 'Option 2' }];
  
  return (
    <div className={`min-w-[220px] rounded-xl border-2 bg-card shadow-lg transition-all ${
      selected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background"
      />
      
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-blue-500/10 rounded-t-xl">
        <div className="p-1.5 rounded-lg bg-blue-500/20">
          <MousePointerClick className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-sm font-medium text-foreground">{nodeData.label || 'Quick Reply'}</span>
      </div>
      
      <div className="px-3 py-3 space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {nodeData.body || 'Select an option:'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {buttons.slice(0, 3).map((btn, idx) => (
            <span 
              key={btn.id || idx}
              className="px-2 py-1 text-xs rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30"
            >
              {btn.title}
            </span>
          ))}
        </div>
      </div>
      
      {buttons.map((btn, idx) => (
        <Handle
          key={btn.id || idx}
          type="source"
          position={Position.Bottom}
          id={btn.id || `btn-${idx}`}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background"
          style={{ left: `${((idx + 1) / (buttons.length + 1)) * 100}%` }}
        />
      ))}
    </div>
  );
});

QuickReplyNode.displayName = 'QuickReplyNode';

export default QuickReplyNode;
