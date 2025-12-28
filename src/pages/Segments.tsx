import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSegments, SegmentInput } from "@/hooks/useSegments";
import {
    Users,
    Plus,
    Trash2,
    Edit,
    Search,
    Filter,
    Loader2,
    Hash
} from "lucide-react";
import { toast } from "sonner";

const COLORS = [
    { value: '#6366f1', label: 'Indigo' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#f43f5e', label: 'Rose' },
    { value: '#f97316', label: 'Orange' },
    { value: '#eab308', label: 'Yellow' },
    { value: '#22c55e', label: 'Green' },
    { value: '#06b6d4', label: 'Cyan' },
];

const FIELDS = [
    { value: 'tags', label: 'Tags' },
    { value: 'opt_in_status', label: 'Opt-in Status' },
    { value: 'name', label: 'Name' },
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
];

const OPERATORS = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
];

interface SegmentRule {
    field: string;
    operator: string;
    value: string;
    logic: 'AND' | 'OR';
}

export default function Segments() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newSegment, setNewSegment] = useState<Partial<SegmentInput>>({
        name: '',
        description: '',
        color: '#6366f1',
        is_dynamic: false,
    });
    const [rules, setRules] = useState<SegmentRule[]>([
        { field: 'tags', operator: 'contains', value: '', logic: 'AND' }
    ]);

    const { segments, isLoading, createSegment, deleteSegment } = useSegments();

    const filteredSegments = segments.filter(segment =>
        segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        segment.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        if (!newSegment.name) {
            toast.error("Please enter a segment name");
            return;
        }

        createSegment.mutate({
            ...newSegment as SegmentInput,
            rules: newSegment.is_dynamic ? rules.map((r, idx) => ({
                field: r.field,
                operator: r.operator as any,
                value: r.value,
                value_list: null,
                logic: r.logic,
                order_index: idx,
            })) : undefined,
        });
        setIsAddDialogOpen(false);
        setNewSegment({ name: '', description: '', color: '#6366f1', is_dynamic: false });
        setRules([{ field: 'tags', operator: 'contains', value: '', logic: 'AND' }]);
    };

    const addRule = () => {
        setRules([...rules, { field: 'tags', operator: 'contains', value: '', logic: 'AND' }]);
    };

    const removeRule = (index: number) => {
        if (rules.length > 1) {
            setRules(rules.filter((_, i) => i !== index));
        }
    };

    const updateRule = (index: number, updates: Partial<SegmentRule>) => {
        setRules(rules.map((rule, i) => i === index ? { ...rule, ...updates } : rule));
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pb-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Users className="w-8 h-8 text-primary" />
                            Contact Segments
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Organize contacts into groups for targeted campaigns
                        </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Create Segment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create Segment</DialogTitle>
                                <DialogDescription>
                                    Create a new segment to group your contacts
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Segment Name</Label>
                                        <Input
                                            placeholder="E.g., VIP Customers"
                                            value={newSegment.name}
                                            onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color</Label>
                                        <Select
                                            value={newSegment.color}
                                            onValueChange={(v) => setNewSegment({ ...newSegment, color: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COLORS.map((color) => (
                                                    <SelectItem key={color.value} value={color.value}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: color.value }} />
                                                            {color.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description (Optional)</Label>
                                    <Textarea
                                        placeholder="Describe this segment..."
                                        value={newSegment.description || ''}
                                        onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <Label>Dynamic Segment</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically add contacts based on rules
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newSegment.is_dynamic}
                                            onChange={(e) => setNewSegment({ ...newSegment, is_dynamic: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                                    </label>
                                </div>

                                {newSegment.is_dynamic && (
                                    <div className="space-y-4 p-4 border border-border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <Label>Segment Rules</Label>
                                            <Button variant="outline" size="sm" onClick={addRule}>
                                                <Plus className="w-4 h-4 mr-1" /> Add Rule
                                            </Button>
                                        </div>
                                        {rules.map((rule, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                {index > 0 && (
                                                    <Select value={rule.logic} onValueChange={(v) => updateRule(index, { logic: v as any })}>
                                                        <SelectTrigger className="w-20">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="AND">AND</SelectItem>
                                                            <SelectItem value="OR">OR</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                                <Select value={rule.field} onValueChange={(v) => updateRule(index, { field: v })}>
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {FIELDS.map((field) => (
                                                            <SelectItem key={field.value} value={field.value}>
                                                                {field.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Select value={rule.operator} onValueChange={(v) => updateRule(index, { operator: v })}>
                                                    <SelectTrigger className="w-36">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {OPERATORS.map((op) => (
                                                            <SelectItem key={op.value} value={op.value}>
                                                                {op.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {!['is_empty', 'is_not_empty'].includes(rule.operator) && (
                                                    <Input
                                                        placeholder="Value"
                                                        className="flex-1"
                                                        value={rule.value}
                                                        onChange={(e) => updateRule(index, { value: e.target.value })}
                                                    />
                                                )}
                                                {rules.length > 1 && (
                                                    <Button variant="ghost" size="icon" onClick={() => removeRule(index)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreate} disabled={createSegment.isPending}>
                                        {createSegment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Create Segment
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search segments..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Segments Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredSegments.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">No Segments Yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Create segments to organize your contacts for targeted campaigns.
                            </p>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Segment
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredSegments.map((segment) => (
                            <Card key={segment.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: `${segment.color}20` }}
                                            >
                                                <Hash className="w-5 h-5" style={{ color: segment.color }} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{segment.name}</CardTitle>
                                                {segment.description && (
                                                    <CardDescription>{segment.description}</CardDescription>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => deleteSegment.mutate(segment.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {segment.contact_count} contacts
                                            </Badge>
                                            {segment.is_dynamic && (
                                                <Badge variant="outline" className="gap-1">
                                                    <Filter className="w-3 h-3" />
                                                    Dynamic
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            Created {new Date(segment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
