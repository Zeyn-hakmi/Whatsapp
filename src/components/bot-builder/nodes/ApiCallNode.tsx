import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Webhook } from 'lucide-react';

export interface ApiCallNodeData {
  label: string;
  method: string;
  url: string;
  saveAs: string;
}

const ApiCallNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ApiCallNodeData;
  
  const methodColors: Record<string, string> = {
    GET: 'text-green-400 bg-green-500/20',
    POST: 'text-blue-400 bg-blue-500/20',
    PUT: 'text-amber-400 bg-amber-500/20',
    DELETE: 'text-red-400 bg-red-500/20',
  };
  
  const method = nodeData.method || 'GET';
  
  return (
    <div className={`min-w-[220px] rounded-xl border-2 bg-card shadow-lg transition-all ${
      selected ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-border'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-background"
      />
      
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-purple-500/10 rounded-t-xl">
        <div className="p-1.5 rounded-lg bg-purple-500/20">
          <Webhook className="w-4 h-4 text-purple-400" />
        </div>
        <span className="text-sm font-medium text-foreground">{nodeData.label || 'API Call'}</span>
      </div>
      
      <div className="px-3 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-mono rounded ${methodColors[method] || methodColors.GET}`}>
            {method}
          </span>
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">
            {nodeData.url || '/api/endpoint'}
          </span>
        </div>
        {nodeData.saveAs && (
          <div className="text-xs text-muted-foreground">
            Save as: <span className="text-purple-400 font-mono">{nodeData.saveAs}</span>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-background"
      />
    </div>
  );
});

ApiCallNode.displayName = 'ApiCallNode';

export default ApiCallNode;
