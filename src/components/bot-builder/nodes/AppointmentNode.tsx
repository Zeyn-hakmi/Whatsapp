import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Calendar } from 'lucide-react';

export interface AppointmentNodeData {
    label: string;
    calendarType: 'google' | 'outlook' | 'custom';
    duration: number;
    buffer: number;
    confirmationMessage?: string;
}

const AppointmentNode = memo(({ data, selected }: NodeProps) => {
    const nodeData = data as unknown as AppointmentNodeData;

    const getCalendarLabel = () => {
        switch (nodeData.calendarType) {
            case 'google':
                return '📅 Google Calendar';
            case 'outlook':
                return '📧 Outlook';
            default:
                return '📆 Custom';
        }
    };

    return (
        <div className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-all ${selected ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-border'
            }`}>
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-sky-500 !border-2 !border-background"
            />

            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-sky-500/10 rounded-t-xl">
                <div className="p-1.5 rounded-lg bg-sky-500/20">
                    <Calendar className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-sm font-medium text-foreground">{nodeData.label || 'Schedule'}</span>
            </div>

            <div className="px-3 py-3">
                <div className="text-xs text-muted-foreground mb-1">{getCalendarLabel()}</div>
                <div className="flex items-center gap-3">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-sky-400">{nodeData.duration || 30}</div>
                        <div className="text-xs text-muted-foreground">min</div>
                    </div>
                    {nodeData.buffer > 0 && (
                        <div className="text-center border-l border-border pl-3">
                            <div className="text-sm font-medium text-muted-foreground">+{nodeData.buffer || 0}</div>
                            <div className="text-xs text-muted-foreground">buffer</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between px-3 pb-2 text-xs">
                <span className="text-green-400">Booked</span>
                <span className="text-red-400">Cancelled</span>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                id="booked"
                className="!w-3 !h-3 !bg-green-500 !border-2 !border-background"
                style={{ left: '30%' }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="cancelled"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-background"
                style={{ left: '70%' }}
            />
        </div>
    );
});

AppointmentNode.displayName = 'AppointmentNode';

export default AppointmentNode;
