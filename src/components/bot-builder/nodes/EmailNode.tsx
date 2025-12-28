import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Mail } from 'lucide-react';

export interface EmailNodeData {
    label: string;
    to: string;
    subject: string;
    body: string;
    template?: string;
}

const EmailNode = memo(({ data, selected }: NodeProps) => {
    const nodeData = data as unknown as EmailNodeData;

    return (
        <div className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-all ${selected ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-border'
            }`}>
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-rose-500 !border-2 !border-background"
            />

            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-rose-500/10 rounded-t-xl">
                <div className="p-1.5 rounded-lg bg-rose-500/20">
                    <Mail className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-sm font-medium text-foreground">{nodeData.label || 'Send Email'}</span>
            </div>

            <div className="px-3 py-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">To:</span>
                        <span className="text-rose-400 truncate">{nodeData.to || '{{contact.email}}'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Subject:</span>
                        <span className="text-foreground truncate">{nodeData.subject || 'Email subject...'}</span>
                    </div>
                </div>
                {nodeData.template && (
                    <p className="text-xs text-rose-400 mt-2">📧 Using template</p>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-rose-500 !border-2 !border-background"
            />
        </div>
    );
});

EmailNode.displayName = 'EmailNode';

export default EmailNode;
