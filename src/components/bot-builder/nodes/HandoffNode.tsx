import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { UserPlus } from 'lucide-react';

export interface HandoffNodeData {
    label: string;
    assignTo: 'available' | 'specific' | 'queue';
    agentId?: string;
    queueName?: string;
    message?: string;
}

const HandoffNode = memo(({ data, selected }: NodeProps) => {
    const nodeData = data as unknown as HandoffNodeData;

    const getAssignmentLabel = () => {
        switch (nodeData.assignTo) {
            case 'specific':
                return 'Specific Agent';
            case 'queue':
                return nodeData.queueName || 'Queue';
            default:
                return 'Available Agent';
        }
    };

    return (
        <div className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-all ${selected ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-border'
            }`}>
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-orange-500 !border-2 !border-background"
            />

            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-orange-500/10 rounded-t-xl">
                <div className="p-1.5 rounded-lg bg-orange-500/20">
                    <UserPlus className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-foreground">{nodeData.label || 'Human Handoff'}</span>
            </div>

            <div className="px-3 py-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">Assign to:</span>
                    <span className="text-sm font-medium text-orange-400">{getAssignmentLabel()}</span>
                </div>
                {nodeData.message && (
                    <p className="text-xs text-muted-foreground line-clamp-2 border-t border-border pt-2">
                        "{nodeData.message}"
                    </p>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-orange-500 !border-2 !border-background"
            />
        </div>
    );
});

HandoffNode.displayName = 'HandoffNode';

export default HandoffNode;
