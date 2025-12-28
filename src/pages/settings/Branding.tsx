import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Palette,
    Upload,
    Image,
    Type,
    Save,
    RotateCcw,
    Eye
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BrandingSettings {
    logoUrl?: string;
    faviconUrl?: string;
    appName: string;
    primaryColor: string;
    accentColor: string;
    headerBg: string;
    footerText?: string;
}

export default function Branding() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useState<BrandingSettings>({
        appName: 'WhatsApp Bot Builder',
        primaryColor: '#25D366',
        accentColor: '#128C7E',
        headerBg: '#075E54',
        footerText: '© 2024 Your Company',
    });

    const [previewLogo, setPreviewLogo] = useState<string | null>(null);
    const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewLogo(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewFavicon(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        toast({ title: "Branding settings saved" });
    };

    const handleReset = () => {
        if (confirm('Reset all branding to defaults?')) {
            setSettings({
                appName: 'WhatsApp Bot Builder',
                primaryColor: '#25D366',
                accentColor: '#128C7E',
                headerBg: '#075E54',
                footerText: '© 2024 Your Company',
            });
            setPreviewLogo(null);
            setPreviewFavicon(null);
            toast({ title: "Branding reset to defaults" });
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Palette className="w-7 h-7 text-primary" />
                            Branding Settings
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Customize the look and feel of your platform
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Settings */}
                    <div className="col-span-2 space-y-6">
                        {/* Logo & Favicon */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Image className="w-5 h-5" />
                                    Logo & Favicon
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Logo */}
                                    <div className="space-y-3">
                                        <Label>Logo</Label>
                                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                            {previewLogo ? (
                                                <img src={previewLogo} alt="Logo preview" className="max-h-20 mx-auto mb-3" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                            )}
                                            <p className="text-xs text-muted-foreground mb-3">
                                                PNG, JPG or SVG. Max 2MB
                                            </p>
                                            <label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                />
                                                <Button variant="outline" size="sm" asChild>
                                                    <span>Upload Logo</span>
                                                </Button>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Favicon */}
                                    <div className="space-y-3">
                                        <Label>Favicon</Label>
                                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                            {previewFavicon ? (
                                                <img src={previewFavicon} alt="Favicon preview" className="w-8 h-8 mx-auto mb-3" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                            )}
                                            <p className="text-xs text-muted-foreground mb-3">
                                                32x32 or 64x64 pixels
                                            </p>
                                            <label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFaviconUpload}
                                                    className="hidden"
                                                />
                                                <Button variant="outline" size="sm" asChild>
                                                    <span>Upload Favicon</span>
                                                </Button>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* App Name & Text */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Type className="w-5 h-5" />
                                    App Name & Text
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Application Name</Label>
                                    <Input
                                        value={settings.appName}
                                        onChange={e => setSettings({ ...settings, appName: e.target.value })}
                                        placeholder="Your App Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Footer Text</Label>
                                    <Input
                                        value={settings.footerText}
                                        onChange={e => setSettings({ ...settings, footerText: e.target.value })}
                                        placeholder="© 2024 Your Company"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Colors */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Palette className="w-5 h-5" />
                                    Colors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Primary Color</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={settings.primaryColor}
                                                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                                                className="w-10 h-10 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={settings.primaryColor}
                                                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                                                className="font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Accent Color</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={settings.accentColor}
                                                onChange={e => setSettings({ ...settings, accentColor: e.target.value })}
                                                className="w-10 h-10 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={settings.accentColor}
                                                onChange={e => setSettings({ ...settings, accentColor: e.target.value })}
                                                className="font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Header Background</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={settings.headerBg}
                                                onChange={e => setSettings({ ...settings, headerBg: e.target.value })}
                                                className="w-10 h-10 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={settings.headerBg}
                                                onChange={e => setSettings({ ...settings, headerBg: e.target.value })}
                                                className="font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview */}
                    <div>
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border border-border rounded-lg overflow-hidden">
                                    {/* Header Preview */}
                                    <div
                                        className="p-3 flex items-center gap-2"
                                        style={{ backgroundColor: settings.headerBg }}
                                    >
                                        {previewLogo ? (
                                            <img src={previewLogo} alt="Logo" className="h-6" />
                                        ) : (
                                            <div className="w-6 h-6 bg-white/20 rounded" />
                                        )}
                                        <span className="text-white text-sm font-medium">{settings.appName}</span>
                                    </div>

                                    {/* Content Preview */}
                                    <div className="p-4 bg-background">
                                        <div className="space-y-2">
                                            <div
                                                className="h-8 rounded flex items-center justify-center text-white text-sm"
                                                style={{ backgroundColor: settings.primaryColor }}
                                            >
                                                Primary Button
                                            </div>
                                            <div
                                                className="h-8 rounded flex items-center justify-center text-white text-sm"
                                                style={{ backgroundColor: settings.accentColor }}
                                            >
                                                Accent Button
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Preview */}
                                    <div className="p-2 bg-muted text-center">
                                        <span className="text-xs text-muted-foreground">{settings.footerText}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
