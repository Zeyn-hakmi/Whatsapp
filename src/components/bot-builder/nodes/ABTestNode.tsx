import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlaskConical } from 'lucide-react';

export interface ABTestNodeData {
    label: string;
    variants: Array<{
        name: string;
        percentage: number;
    }>;
}

const ABTestNode = memo(({ data, selected }: NodeProps) => {
    const nodeData = data as unknown as ABTestNodeData;
    const variants = nodeData.variants || [
        { name: 'A', percentage: 50 },
        { name: 'B', percentage: 50 },
    ];

    return (
        <div className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-all ${selected ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-border'
            }`}>
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background"
            />

            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-emerald-500/10 rounded-t-xl">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-foreground">{nodeData.label || 'A/B Test'}</span>
            </div>

            <div className="px-3 py-3">
                <div className="space-y-1">
                    {variants.map((variant, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-emerald-400 font-medium">Variant {variant.name}</span>
                            <span className="text-muted-foreground">{variant.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-around px-3 pb-2 text-xs">
                {variants.map((variant, idx) => (
                    <span key={idx} className="text-emerald-400">{variant.name}</span>
                ))}
            </div>

            {variants.map((variant, idx) => (
                <Handle
                    key={idx}
                    type="source"
                    position={Position.Bottom}
                    id={`variant-${variant.name.toLowerCase()}`}
                    className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background"
                    style={{ left: `${((idx + 1) / (variants.length + 1)) * 100}%` }}
                />
            ))}
        </div>
    );
});

ABTestNode.displayName = 'ABTestNode';

export default ABTestNode;
