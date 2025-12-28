import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';

export interface DelayNodeData {
    label: string;
    duration: number;
    unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

const DelayNode = memo(({ data, selected }: NodeProps) => {
    const nodeData = data as unknown as DelayNodeData;

    const formatDuration = () => {
        const duration = nodeData.duration || 5;
        const unit = nodeData.unit || 'minutes';
        return `${duration} ${unit}`;
    };

    return (
        <div className={`min-w-[180px] rounded-xl border-2 bg-card shadow-lg transition-all ${selected ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-border'
            }`}>
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-background"
            />

            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-cyan-500/10 rounded-t-xl">
                <div className="p-1.5 rounded-lg bg-cyan-500/20">
                    <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm font-medium text-foreground">{nodeData.label || 'Delay'}</span>
            </div>

            <div className="px-3 py-3">
                <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-lg font-semibold text-cyan-400">{formatDuration()}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">Wait before continuing</p>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-background"
            />
        </div>
    );
});

DelayNode.displayName = 'DelayNode';

export default DelayNode;
