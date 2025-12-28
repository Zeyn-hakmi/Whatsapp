import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export interface ConditionNodeData {
  label: string;
  variable: string;
  operator: string;
  value: string;
}

const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ConditionNodeData;
  
  return (
    <div className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-all ${
      selected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background"
      />
      
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-amber-500/10 rounded-t-xl">
        <div className="p-1.5 rounded-lg bg-amber-500/20">
          <GitBranch className="w-4 h-4 text-amber-400" />
        </div>
        <span className="text-sm font-medium text-foreground">{nodeData.label || 'Condition'}</span>
      </div>
      
      <div className="px-3 py-3">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-amber-400 font-mono">{nodeData.variable || 'variable'}</span>
          <span className="text-muted-foreground">{nodeData.operator || '=='}</span>
          <span className="text-amber-400 font-mono">"{nodeData.value || 'value'}"</span>
        </div>
      </div>
      
      <div className="flex justify-between px-3 pb-2 text-xs">
        <span className="text-green-400">True</span>
        <span className="text-red-400">False</span>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-background"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-background"
        style={{ left: '70%' }}
      />
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;
