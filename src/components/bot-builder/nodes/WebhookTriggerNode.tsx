import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Webhook } from 'lucide-react';

export interface WebhookTriggerNodeData {
    label: string;
    webhookUrl: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    waitForResponse: boolean;
}

const WebhookTriggerNode = memo(({ data, selected }: NodeProps) => {
    const nodeData = data as unknown as WebhookTriggerNodeData;

    return (
        <div className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-all ${selected ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-border'
            }`}>
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background"
            />

            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-indigo-500/10 rounded-t-xl">
                <div className="p-1.5 rounded-lg bg-indigo-500/20">
                    <Webhook className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-sm font-medium text-foreground">{nodeData.label || 'Webhook'}</span>
            </div>

            <div className="px-3 py-3">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${nodeData.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                            nodeData.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                                nodeData.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-red-500/20 text-red-400'
                        }`}>
                        {nodeData.method || 'POST'}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground truncate font-mono">
                    {nodeData.webhookUrl || 'Enter webhook URL...'}
                </p>
                {nodeData.waitForResponse && (
                    <p className="text-xs text-indigo-400 mt-1">⏳ Waits for response</p>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background"
            />
        </div>
    );
});

WebhookTriggerNode.displayName = 'WebhookTriggerNode';

export default WebhookTriggerNode;
