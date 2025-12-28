import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Plus,
    Calendar,
    BarChart3,
    LineChart,
    PieChart,
    Download,
    Play,
    Trash2,
    Edit,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface CustomReport {
    id: string;
    name: string;
    description: string;
    chartType: 'bar' | 'line' | 'pie' | 'table';
    metrics: string[];
    dimensions: string[];
    schedule?: 'daily' | 'weekly' | 'monthly';
    lastRun?: Date;
    createdAt: Date;
}

const AVAILABLE_METRICS = [
    { value: 'messages_sent', label: 'Messages Sent' },
    { value: 'messages_received', label: 'Messages Received' },
    { value: 'conversations', label: 'Conversations' },
    { value: 'response_time', label: 'Avg Response Time' },
    { value: 'resolution_rate', label: 'Resolution Rate' },
    { value: 'bot_handoffs', label: 'Bot Handoffs' },
    { value: 'csat_score', label: 'CSAT Score' },
    { value: 'conversion_rate', label: 'Conversion Rate' },
];

const AVAILABLE_DIMENSIONS = [
    { value: 'date', label: 'Date' },
    { value: 'hour', label: 'Hour of Day' },
    { value: 'platform', label: 'Platform' },
    { value: 'bot', label: 'Bot' },
    { value: 'agent', label: 'Agent' },
    { value: 'tag', label: 'Contact Tag' },
];

export function CustomReports() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newReport, setNewReport] = useState({
        name: '',
        description: '',
        chartType: 'bar' as const,
        metrics: [] as string[],
        dimensions: [] as string[],
        schedule: undefined as string | undefined,
    });

    const [reports, setReports] = useState<CustomReport[]>([
        {
            id: '1',
            name: 'Weekly Message Volume',
            description: 'Messages sent and received over time',
            chartType: 'line',
            metrics: ['messages_sent', 'messages_received'],
            dimensions: ['date'],
            schedule: 'weekly',
            lastRun: new Date(),
            createdAt: new Date(),
        },
        {
            id: '2',
            name: 'Platform Distribution',
            description: 'Conversations by platform',
            chartType: 'pie',
            metrics: ['conversations'],
            dimensions: ['platform'],
            lastRun: new Date(),
            createdAt: new Date(),
        },
        {
            id: '3',
            name: 'Bot Performance',
            description: 'Resolution rate and handoffs by bot',
            chartType: 'bar',
            metrics: ['resolution_rate', 'bot_handoffs'],
            dimensions: ['bot'],
            schedule: 'daily',
            lastRun: new Date(),
            createdAt: new Date(),
        },
    ]);

    const getChartIcon = (type: string) => {
        switch (type) {
            case 'line': return LineChart;
            case 'pie': return PieChart;
            case 'table': return FileText;
            default: return BarChart3;
        }
    };

    const handleCreateReport = () => {
        if (!newReport.name || newReport.metrics.length === 0) return;

        const report: CustomReport = {
            id: Date.now().toString(),
            ...newReport,
            chartType: newReport.chartType,
            schedule: newReport.schedule as any,
            createdAt: new Date(),
        };

        setReports([...reports, report]);
        setIsCreateDialogOpen(false);
        setNewReport({
            name: '',
            description: '',
            chartType: 'bar',
            metrics: [],
            dimensions: [],
            schedule: undefined,
        });
    };

    const handleRunReport = (reportId: string) => {
        setReports(reports.map(r =>
            r.id === reportId ? { ...r, lastRun: new Date() } : r
        ));
    };

    const handleDeleteReport = (reportId: string) => {
        setReports(reports.filter(r => r.id !== reportId));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Create custom reports to analyze your data
                </p>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Report
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Custom Report</DialogTitle>
                            <DialogDescription>Configure your custom analytics report</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Report Name</Label>
                                <Input
                                    placeholder="E.g., Weekly Performance"
                                    value={newReport.name}
                                    onChange={e => setNewReport({ ...newReport, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="What does this report show?"
                                    value={newReport.description}
                                    onChange={e => setNewReport({ ...newReport, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Chart Type</Label>
                                    <Select
                                        value={newReport.chartType}
                                        onValueChange={v => setNewReport({ ...newReport, chartType: v as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bar">Bar Chart</SelectItem>
                                            <SelectItem value="line">Line Chart</SelectItem>
                                            <SelectItem value="pie">Pie Chart</SelectItem>
                                            <SelectItem value="table">Table</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Schedule (Optional)</Label>
                                    <Select
                                        value={newReport.schedule || ''}
                                        onValueChange={v => setNewReport({ ...newReport, schedule: v || undefined })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="No schedule" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">No schedule</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Metrics</Label>
                                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg">
                                    {AVAILABLE_METRICS.map(metric => (
                                        <Badge
                                            key={metric.value}
                                            variant={newReport.metrics.includes(metric.value) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                if (newReport.metrics.includes(metric.value)) {
                                                    setNewReport({ ...newReport, metrics: newReport.metrics.filter(m => m !== metric.value) });
                                                } else {
                                                    setNewReport({ ...newReport, metrics: [...newReport.metrics, metric.value] });
                                                }
                                            }}
                                        >
                                            {metric.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Group By (Dimensions)</Label>
                                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg">
                                    {AVAILABLE_DIMENSIONS.map(dim => (
                                        <Badge
                                            key={dim.value}
                                            variant={newReport.dimensions.includes(dim.value) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                if (newReport.dimensions.includes(dim.value)) {
                                                    setNewReport({ ...newReport, dimensions: newReport.dimensions.filter(d => d !== dim.value) });
                                                } else {
                                                    setNewReport({ ...newReport, dimensions: [...newReport.dimensions, dim.value] });
                                                }
                                            }}
                                        >
                                            {dim.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateReport}>Create Report</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Reports Grid */}
            {reports.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Custom Reports</h3>
                        <p className="text-muted-foreground mb-6">Create your first custom report to analyze your data</p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Report
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {reports.map((report, index) => {
                        const ChartIcon = getChartIcon(report.chartType);
                        return (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <ChartIcon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{report.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground">{report.description}</p>
                                                </div>
                                            </div>
                                            {report.schedule && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {report.schedule}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {report.metrics.map(m => (
                                                <Badge key={m} variant="outline" className="text-xs">
                                                    {AVAILABLE_METRICS.find(am => am.value === m)?.label}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                {report.lastRun ? `Last run: ${report.lastRun.toLocaleDateString()}` : 'Never run'}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRunReport(report.id)}>
                                                    <Play className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteReport(report.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
