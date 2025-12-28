import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Star,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Send,
    TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CSATSurvey {
    id: string;
    name: string;
    trigger: 'conversation_end' | 'after_handoff' | 'manual';
    questions: string[];
    responseCount: number;
    averageScore: number;
    isActive: boolean;
}

interface CSATResponse {
    id: string;
    surveyId: string;
    score: number;
    feedback?: string;
    conversationId: string;
    createdAt: Date;
}

export function CSATSurveys() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [timeRange, setTimeRange] = useState('30d');

    // Mock data
    const [surveys, setSurveys] = useState<CSATSurvey[]>([
        {
            id: '1',
            name: 'Post-Conversation Survey',
            trigger: 'conversation_end',
            questions: ['How satisfied are you?', 'Would you recommend us?'],
            responseCount: 1250,
            averageScore: 4.2,
            isActive: true,
        },
        {
            id: '2',
            name: 'Agent Handoff Feedback',
            trigger: 'after_handoff',
            questions: ['How was your experience with our agent?'],
            responseCount: 380,
            averageScore: 4.5,
            isActive: true,
        },
    ]);

    const recentResponses: CSATResponse[] = [
        { id: '1', surveyId: '1', score: 5, feedback: 'Great experience!', conversationId: 'conv-1', createdAt: new Date() },
        { id: '2', surveyId: '1', score: 4, conversationId: 'conv-2', createdAt: new Date() },
        { id: '3', surveyId: '2', score: 3, feedback: 'Could be faster', conversationId: 'conv-3', createdAt: new Date() },
        { id: '4', surveyId: '1', score: 5, feedback: 'Love the bot!', conversationId: 'conv-4', createdAt: new Date() },
    ];

    const scoreDistribution = [
        { score: 5, count: 520, percentage: 42 },
        { score: 4, count: 380, percentage: 30 },
        { score: 3, count: 200, percentage: 16 },
        { score: 2, count: 100, percentage: 8 },
        { score: 1, count: 50, percentage: 4 },
    ];

    const overallScore = 4.3;
    const totalResponses = surveys.reduce((sum, s) => sum + s.responseCount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="90d">90 days</SelectItem>
                    </SelectContent>
                </Select>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Survey</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create CSAT Survey</DialogTitle>
                            <DialogDescription>Configure a new customer satisfaction survey</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Survey Name</Label>
                                <Input placeholder="E.g., Post-Chat Feedback" />
                            </div>
                            <div className="space-y-2">
                                <Label>Trigger</Label>
                                <Select defaultValue="conversation_end">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="conversation_end">After conversation ends</SelectItem>
                                        <SelectItem value="after_handoff">After agent handoff</SelectItem>
                                        <SelectItem value="manual">Manual trigger</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Question</Label>
                                <Textarea placeholder="How satisfied are you with our service?" />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                <Button>Create</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= Math.round(overallScore) ? 'text-amber-400 fill-amber-400' : 'text-muted'}`}
                                />
                            ))}
                        </div>
                        <p className="text-3xl font-bold text-foreground">{overallScore}</p>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <ThumbsUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{(scoreDistribution.slice(0, 2).reduce((s, d) => s + d.percentage, 0))}%</p>
                        <p className="text-sm text-muted-foreground">Positive (4-5 ⭐)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{totalResponses.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Responses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">+0.3</p>
                        <p className="text-sm text-muted-foreground">vs Last Period</p>
                    </CardContent>
                </Card>
            </div>

            {/* Score Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {scoreDistribution.map((item) => (
                            <div key={item.score} className="flex items-center gap-4">
                                <div className="flex items-center gap-1 w-24">
                                    <span className="text-sm font-medium">{item.score}</span>
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                </div>
                                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percentage}%` }}
                                        transition={{ delay: (5 - item.score) * 0.1, duration: 0.5 }}
                                        className={`h-full rounded-full ${item.score >= 4 ? 'bg-green-500' : item.score === 3 ? 'bg-amber-500' : 'bg-red-500'
                                            }`}
                                    />
                                </div>
                                <span className="text-sm text-muted-foreground w-16 text-right">
                                    {item.percentage}% ({item.count})
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Active Surveys */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Active Surveys</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {surveys.map((survey) => (
                            <div key={survey.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Switch checked={survey.isActive} />
                                    <div>
                                        <p className="font-medium text-foreground">{survey.name}</p>
                                        <p className="text-xs text-muted-foreground">Trigger: {survey.trigger.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-foreground">{survey.averageScore}</p>
                                        <p className="text-xs text-muted-foreground">Avg Score</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-foreground">{survey.responseCount}</p>
                                        <p className="text-xs text-muted-foreground">Responses</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentResponses.filter(r => r.feedback).map((response) => (
                            <div key={response.id} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= response.score ? 'text-amber-400 fill-amber-400' : 'text-muted'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">Just now</span>
                                </div>
                                <p className="text-sm text-foreground">"{response.feedback}"</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
