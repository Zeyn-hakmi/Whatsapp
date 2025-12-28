import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Shield,
    Smartphone,
    Key,
    Copy,
    Check,
    Download,
    AlertTriangle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TwoFactorSetupProps {
    isEnabled: boolean;
    onEnableChange: (enabled: boolean) => void;
}

export function TwoFactorSetup({ isEnabled, onEnableChange }: TwoFactorSetupProps) {
    const { toast } = useToast();
    const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
    const [setupStep, setSetupStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState('');
    const [copiedSecret, setCopiedSecret] = useState(false);

    // Mock data - in real app these would come from the backend
    const mockSecret = 'JBSWY3DPEHPK3PXP';
    const mockQrUrl = 'otpauth://totp/WhatsAppBot:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=WhatsAppBot';
    const mockBackupCodes = [
        'a1b2c3d4e5',
        'f6g7h8i9j0',
        'k1l2m3n4o5',
        'p6q7r8s9t0',
        'u1v2w3x4y5',
        'z6a7b8c9d0',
        'e1f2g3h4i5',
        'j6k7l8m9n0',
    ];

    const copySecret = () => {
        navigator.clipboard.writeText(mockSecret);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
    };

    const downloadBackupCodes = () => {
        const content = `WhatsApp Bot Builder - 2FA Backup Codes\n\nGenerated: ${new Date().toISOString()}\n\nKeep these codes safe. Each code can only be used once.\n\n${mockBackupCodes.join('\n')}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'whatsapp-bot-backup-codes.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleVerify = () => {
        if (verificationCode.length === 6) {
            // In real app, verify with backend
            setSetupStep(3);
        }
    };

    const handleComplete = () => {
        onEnableChange(true);
        setIsSetupDialogOpen(false);
        setSetupStep(1);
        setVerificationCode('');
        toast({ title: "2FA enabled successfully" });
    };

    const handleDisable = () => {
        if (confirm('Are you sure you want to disable 2FA? This will reduce the security of your account.')) {
            onEnableChange(false);
            toast({ title: "2FA disabled" });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                            <CardDescription>Add an extra layer of security to your account</CardDescription>
                        </div>
                    </div>
                    {isEnabled ? (
                        <Button variant="outline" onClick={handleDisable}>Disable 2FA</Button>
                    ) : (
                        <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>Enable 2FA</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                                    <DialogDescription>
                                        {setupStep === 1 && "Scan the QR code with your authenticator app"}
                                        {setupStep === 2 && "Enter the verification code from your app"}
                                        {setupStep === 3 && "Save your backup codes"}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="py-4">
                                    {/* Step 1: QR Code */}
                                    {setupStep === 1 && (
                                        <div className="space-y-4">
                                            <div className="flex justify-center">
                                                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border">
                                                    {/* Placeholder for QR code - in real app use qrcode library */}
                                                    <div className="text-center text-muted-foreground">
                                                        <Smartphone className="w-12 h-12 mx-auto mb-2" />
                                                        <p className="text-xs">QR Code Here</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground mb-2">Can't scan? Enter this code manually:</p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <code className="px-3 py-1.5 bg-muted rounded font-mono text-sm">{mockSecret}</code>
                                                    <Button variant="ghost" size="icon" onClick={copySecret}>
                                                        {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            <Button className="w-full" onClick={() => setSetupStep(2)}>
                                                Continue
                                            </Button>
                                        </div>
                                    )}

                                    {/* Step 2: Verification */}
                                    {setupStep === 2 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Enter 6-digit code</Label>
                                                <Input
                                                    type="text"
                                                    maxLength={6}
                                                    placeholder="000000"
                                                    value={verificationCode}
                                                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                                    className="text-center text-2xl font-mono tracking-widest"
                                                />
                                            </div>

                                            <Button
                                                className="w-full"
                                                onClick={handleVerify}
                                                disabled={verificationCode.length !== 6}
                                            >
                                                Verify
                                            </Button>

                                            <Button variant="ghost" className="w-full" onClick={() => setSetupStep(1)}>
                                                Back
                                            </Button>
                                        </div>
                                    )}

                                    {/* Step 3: Backup Codes */}
                                    {setupStep === 3 && (
                                        <div className="space-y-4">
                                            <Alert>
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator.
                                                </AlertDescription>
                                            </Alert>

                                            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                                                {mockBackupCodes.map((code, idx) => (
                                                    <code key={idx} className="text-sm font-mono text-center py-1">
                                                        {code}
                                                    </code>
                                                ))}
                                            </div>

                                            <Button variant="outline" className="w-full" onClick={downloadBackupCodes}>
                                                <Download className="w-4 h-4 mr-2" />
                                                Download Backup Codes
                                            </Button>

                                            <Button className="w-full" onClick={handleComplete}>
                                                I've Saved My Codes
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            {isEnabled && (
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-green-500">
                        <Check className="w-4 h-4" />
                        <span>Two-factor authentication is enabled</span>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
