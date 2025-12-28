import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    ArrowRight,
    BarChart3,
    Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FunnelStep {
    name: string;
    value: number;
    conversion: number;
    dropoff: number;
}

interface ConversionFunnelsProps {
    botId?: string;
}

export function ConversionFunnels({ botId }: ConversionFunnelsProps) {
    const [selectedFunnel, setSelectedFunnel] = useState('main');
    const [timeRange, setTimeRange] = useState('7d');

    // Mock funnel data
    const funnelData: FunnelStep[] = [
        { name: 'Bot Started', value: 10000, conversion: 100, dropoff: 0 },
        { name: 'Greeted', value: 8500, conversion: 85, dropoff: 15 },
        { name: 'Asked Question', value: 6200, conversion: 73, dropoff: 27 },
        { name: 'Got Answer', value: 5100, conversion: 82, dropoff: 18 },
        { name: 'Clicked CTA', value: 2800, conversion: 55, dropoff: 45 },
        { name: 'Completed Goal', value: 1200, conversion: 43, dropoff: 57 },
    ];

    const maxValue = Math.max(...funnelData.map(s => s.value));
    const overallConversion = ((funnelData[funnelData.length - 1].value / funnelData[0].value) * 100).toFixed(1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select funnel" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="main">Main Flow</SelectItem>
                            <SelectItem value="support">Support Flow</SelectItem>
                            <SelectItem value="sales">Sales Flow</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="24h">24 hours</SelectItem>
                            <SelectItem value="7d">7 days</SelectItem>
                            <SelectItem value="30d">30 days</SelectItem>
                            <SelectItem value="90d">90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Sessions</p>
                                <p className="text-2xl font-bold text-foreground">{funnelData[0].value.toLocaleString()}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Conversions</p>
                                <p className="text-2xl font-bold text-foreground">{funnelData[funnelData.length - 1].value.toLocaleString()}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Overall Rate</p>
                                <p className="text-2xl font-bold text-foreground">{overallConversion}%</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Funnel Visualization */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {funnelData.map((step, index) => (
                            <motion.div
                                key={step.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                {/* Step number */}
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                    {index + 1}
                                </div>

                                {/* Step info */}
                                <div className="w-40">
                                    <p className="text-sm font-medium text-foreground">{step.name}</p>
                                    <p className="text-xs text-muted-foreground">{step.value.toLocaleString()} users</p>
                                </div>

                                {/* Bar */}
                                <div className="flex-1 h-10 bg-muted rounded-lg overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(step.value / maxValue) * 100}%` }}
                                        transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-lg flex items-center justify-end pr-3"
                                    >
                                        <span className="text-xs font-bold text-primary-foreground">
                                            {step.conversion}%
                                        </span>
                                    </motion.div>
                                </div>

                                {/* Arrow to next */}
                                {index < funnelData.length - 1 && (
                                    <div className="flex items-center gap-2">
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        <span className={`text-xs font-medium ${step.dropoff > 30 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                            -{funnelData[index + 1] ? (100 - funnelData[index + 1].conversion).toFixed(0) : 0}%
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Drop-off Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        Drop-off Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {funnelData.slice(0, -1).map((step, index) => {
                            const nextStep = funnelData[index + 1];
                            const dropoffCount = step.value - nextStep.value;
                            const dropoffRate = ((dropoffCount / step.value) * 100).toFixed(1);

                            return (
                                <div key={step.name} className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">{step.name} → {nextStep.name}</span>
                                        <span className={`text-sm font-bold ${parseFloat(dropoffRate) > 30 ? 'text-red-400' : 'text-amber-400'}`}>
                                            -{dropoffRate}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {dropoffCount.toLocaleString()} users dropped off
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
