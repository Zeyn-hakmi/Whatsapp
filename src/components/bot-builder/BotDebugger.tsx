import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bug,
    Play,
    Pause,
    SkipForward,
    RotateCcw,
    ChevronRight,
    ChevronDown,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DebugStep {
    id: string;
    nodeId: string;
    nodeType: string;
    nodeLabel: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    error?: string;
    timestamp: Date;
}

interface DebugVariable {
    name: string;
    value: unknown;
    type: string;
}

interface BotDebuggerProps {
    isOpen: boolean;
    onClose: () => void;
    botId: string;
}

export function BotDebugger({ isOpen, onClose, botId }: BotDebuggerProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

    // Mock debug steps for demonstration
    const [steps, setSteps] = useState<DebugStep[]>([
        {
            id: '1',
            nodeId: 'start-1',
            nodeType: 'start',
            nodeLabel: 'Start',
            status: 'completed',
            output: { trigger: 'message_received', text: 'Hello' },
            timestamp: new Date(),
        },
        {
            id: '2',
            nodeId: 'message-1',
            nodeType: 'message',
            nodeLabel: 'Welcome Message',
            status: 'completed',
            input: { message: 'Welcome to our bot!' },
            output: { delivered: true },
            timestamp: new Date(),
        },
        {
            id: '3',
            nodeId: 'condition-1',
            nodeType: 'condition',
            nodeLabel: 'Check Intent',
            status: 'running',
            input: { variable: 'intent', operator: '==', value: 'greeting' },
            timestamp: new Date(),
        },
        {
            id: '4',
            nodeId: 'message-2',
            nodeType: 'message',
            nodeLabel: 'Response',
            status: 'pending',
            timestamp: new Date(),
        },
    ]);

    const [variables, setVariables] = useState<DebugVariable[]>([
        { name: 'user_name', value: 'John Doe', type: 'string' },
        { name: 'intent', value: 'greeting', type: 'string' },
        { name: 'message_count', value: 3, type: 'number' },
        { name: 'is_new_user', value: true, type: 'boolean' },
    ]);

    const toggleStepExpanded = (stepId: string) => {
        setExpandedSteps(prev => {
            const next = new Set(prev);
            if (next.has(stepId)) {
                next.delete(stepId);
            } else {
                next.add(stepId);
            }
            return next;
        });
    };

    const handleStart = () => {
        setIsRunning(true);
        setIsPaused(false);
        setCurrentStep(0);
    };

    const handlePause = () => {
        setIsPaused(true);
    };

    const handleResume = () => {
        setIsPaused(false);
    };

    const handleStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setIsPaused(false);
        setCurrentStep(0);
        setSteps(steps.map(s => ({ ...s, status: 'pending' as const })));
    };

    const getStatusColor = (status: DebugStep['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'running': return 'bg-blue-500 animate-pulse';
            case 'error': return 'bg-red-500';
            default: return 'bg-muted';
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 bg-card border-l border-border flex flex-col h-full"
        >
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Bug className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Debugger</h3>
                    </div>
                    <Badge variant={isRunning ? (isPaused ? 'secondary' : 'default') : 'outline'}>
                        {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
                    </Badge>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    {!isRunning ? (
                        <Button size="sm" onClick={handleStart} className="flex-1">
                            <Play className="w-4 h-4 mr-1" />
                            Start
                        </Button>
                    ) : (
                        <>
                            {isPaused ? (
                                <Button size="sm" onClick={handleResume} variant="default">
                                    <Play className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button size="sm" onClick={handlePause} variant="secondary">
                                    <Pause className="w-4 h-4" />
                                </Button>
                            )}
                            <Button size="sm" onClick={handleStep} variant="outline">
                                <SkipForward className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={handleReset} variant="ghost">
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Steps */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="px-4 py-2 border-b border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Execution Steps</h4>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`rounded-lg border transition-colors ${currentStep === index ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleStepExpanded(step.id)}
                                    className="w-full p-2 flex items-center gap-2 text-left"
                                >
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(step.status)}`} />
                                    <span className="text-xs text-muted-foreground">{index + 1}.</span>
                                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                                        {step.nodeLabel}
                                    </span>
                                    {expandedSteps.has(step.id) ? (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {expandedSteps.has(step.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-3 pb-2 space-y-2 text-xs">
                                                {step.input && (
                                                    <div>
                                                        <span className="text-muted-foreground">Input:</span>
                                                        <pre className="mt-1 p-2 bg-muted rounded text-[10px] overflow-x-auto">
                                                            {JSON.stringify(step.input, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {step.output && (
                                                    <div>
                                                        <span className="text-muted-foreground">Output:</span>
                                                        <pre className="mt-1 p-2 bg-muted rounded text-[10px] overflow-x-auto">
                                                            {JSON.stringify(step.output, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {step.error && (
                                                    <div className="text-red-400">
                                                        <span>Error:</span>
                                                        <p className="mt-1">{step.error}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Variables */}
            <div className="border-t border-border">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Variables</h4>
                    <Eye className="w-3 h-3 text-muted-foreground" />
                </div>
                <ScrollArea className="h-32">
                    <div className="p-3 space-y-1">
                        {variables.map((variable) => (
                            <div key={variable.name} className="flex items-center justify-between text-xs">
                                <span className="font-mono text-primary">{variable.name}</span>
                                <span className="text-muted-foreground truncate max-w-[120px]">
                                    {JSON.stringify(variable.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </motion.div>
    );
}
