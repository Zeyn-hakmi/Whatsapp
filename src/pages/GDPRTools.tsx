import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Shield,
    Download,
    Trash2,
    FileJson,
    Clock,
    CheckCircle,
    AlertTriangle,
    Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DataRequest {
    id: string;
    type: 'export' | 'deletion';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    requestedAt: Date;
    completedAt?: Date;
    downloadUrl?: string;
}

export default function GDPRTools() {
    const { toast } = useToast();
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);
    const [deletionConfirmation, setDeletionConfirmation] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [requests, setRequests] = useState<DataRequest[]>([
        {
            id: '1',
            type: 'export',
            status: 'completed',
            requestedAt: new Date(Date.now() - 86400000),
            completedAt: new Date(Date.now() - 82800000),
            downloadUrl: '#',
        },
    ]);

    const handleRequestExport = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newRequest: DataRequest = {
            id: Date.now().toString(),
            type: 'export',
            status: 'processing',
            requestedAt: new Date(),
        };

        setRequests([newRequest, ...requests]);
        setIsExportDialogOpen(false);
        setIsProcessing(false);
        toast({
            title: "Export request submitted",
            description: "We'll notify you when your data is ready for download"
        });

        // Simulate processing
        setTimeout(() => {
            setRequests(prev => prev.map(r =>
                r.id === newRequest.id
                    ? { ...r, status: 'completed', completedAt: new Date(), downloadUrl: '#' }
                    : r
            ));
        }, 5000);
    };

    const handleRequestDeletion = async () => {
        if (deletionConfirmation !== 'DELETE MY ACCOUNT') {
            toast({ title: "Please type the confirmation phrase", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newRequest: DataRequest = {
            id: Date.now().toString(),
            type: 'deletion',
            status: 'pending',
            requestedAt: new Date(),
        };

        setRequests([newRequest, ...requests]);
        setIsDeletionDialogOpen(false);
        setIsProcessing(false);
        setDeletionConfirmation('');
        toast({
            title: "Deletion request submitted",
            description: "Your account will be deleted within 30 days"
        });
    };

    const getStatusBadge = (status: DataRequest['status']) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Completed</Badge>;
            case 'processing':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Processing</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">Pending</Badge>;
            case 'failed':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Failed</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Shield className="w-7 h-7 text-primary" />
                        GDPR & Privacy Tools
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your data and privacy settings
                    </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Data Export */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Download className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Export Your Data</CardTitle>
                                    <CardDescription>Download a copy of all your data</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Request a complete export of your data including contacts, conversations, messages, and settings. This process may take a few minutes.
                            </p>
                            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full">
                                        <FileJson className="w-4 h-4 mr-2" />
                                        Request Data Export
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Export Your Data</DialogTitle>
                                        <DialogDescription>
                                            We'll prepare a complete export of your data
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Your export will include:
                                        </p>
                                        <ul className="text-sm space-y-1 text-muted-foreground">
                                            <li>• Profile and account information</li>
                                            <li>• All contacts and their data</li>
                                            <li>• Conversation history and messages</li>
                                            <li>• Bot configurations and flows</li>
                                            <li>• Templates and settings</li>
                                        </ul>
                                        <Alert>
                                            <Clock className="h-4 w-4" />
                                            <AlertDescription>
                                                The export will be available for 7 days after generation.
                                            </AlertDescription>
                                        </Alert>
                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleRequestExport} disabled={isProcessing}>
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'Request Export'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    {/* Account Deletion */}
                    <Card className="border-red-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Delete Account</CardTitle>
                                    <CardDescription>Permanently delete your account and data</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                This will permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <Dialog open={isDeletionDialogOpen} onOpenChange={setIsDeletionDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Request Account Deletion
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-red-500">Delete Your Account</DialogTitle>
                                        <DialogDescription>
                                            This action is permanent and cannot be undone
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4">
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                All your data will be permanently deleted within 30 days. You will lose access to your account immediately.
                                            </AlertDescription>
                                        </Alert>
                                        <div className="space-y-2">
                                            <Label>Type "DELETE MY ACCOUNT" to confirm</Label>
                                            <Input
                                                value={deletionConfirmation}
                                                onChange={e => setDeletionConfirmation(e.target.value)}
                                                placeholder="DELETE MY ACCOUNT"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button variant="outline" onClick={() => setIsDeletionDialogOpen(false)}>Cancel</Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleRequestDeletion}
                                                disabled={isProcessing || deletionConfirmation !== 'DELETE MY ACCOUNT'}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'Delete Account'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>

                {/* Request History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Request History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {requests.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No data requests yet
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {requests.map((request, index) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            {request.type === 'export' ? (
                                                <Download className="w-5 h-5 text-blue-500" />
                                            ) : (
                                                <Trash2 className="w-5 h-5 text-red-500" />
                                            )}
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {request.type === 'export' ? 'Data Export' : 'Account Deletion'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Requested: {request.requestedAt.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {getStatusBadge(request.status)}
                                            {request.status === 'completed' && request.downloadUrl && request.type === 'export' && (
                                                <Button variant="outline" size="sm">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
