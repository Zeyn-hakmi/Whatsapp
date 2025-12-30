
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, RefreshCw, Smartphone, Facebook, Key } from "lucide-react";
import { toast } from "sonner";
import { usePhoneNumbers } from "@/hooks/usePhoneNumbers";
import { useFacebookSDK } from "@/hooks/useFacebookSDK";
import { Switch } from "@/components/ui/switch";

interface SyncMetaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface MetaPhoneNumber {
    id: string; // The Phone Number ID (not WABA ID)
    verified_name: string;
    display_phone_number: string;
    quality_rating: string;
}

export function SyncMetaDialog({ open, onOpenChange }: SyncMetaDialogProps) {
    const [step, setStep] = useState<"CREDENTIALS" | "SELECTION">("CREDENTIALS");
    const [useManualInput, setUseManualInput] = useState(false);

    // Credentials state
    const [businessAccountId, setBusinessAccountId] = useState("");
    const [accessToken, setAccessToken] = useState("");

    // Data state
    const [isLoading, setIsLoading] = useState(false);
    const [foundNumbers, setFoundNumbers] = useState<MetaPhoneNumber[]>([]);
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);

    const { createPhoneNumber } = usePhoneNumbers();

    // FB SDK
    const appId = import.meta.env.VITE_META_APP_ID || "";
    const { login: fbLogin, isLoaded: isFbLoaded, api: fbApi } = useFacebookSDK({ appId });

    const handleFacebookLogin = async () => {
        if (!appId) {
            toast.error("Meta App ID is missing. Please check your .env file.");
            return;
        }

        try {
            setIsLoading(true);
            const authResponse = await fbLogin({
                scope: "whatsapp_business_management,whatsapp_business_messaging",
                return_scopes: true
            });

            if (!authResponse?.accessToken) {
                throw new Error("Failed to get access token");
            }

            setAccessToken(authResponse.accessToken);

            // Fetch Businesses to find the WABA ID
            // We first get the user's businesses, then their WhatsApp Accounts
            const businesses = await fbApi('/me/businesses', 'GET', { access_token: authResponse.accessToken });

            if (!businesses?.data || businesses.data.length === 0) {
                toast.error("No Meta Businesses found for this user.");
                setIsLoading(false);
                return;
            }

            // For simplicity in this iteration, we'll try to find WABA IDs for the first business
            // A more robust UI would allow selecting the business first.
            // We will try to fetch numbers directly if valid WABA ID is not found, or prompt user.
            // Actually, let's fetch client_whatsapp_business_accounts for each business

            let wabaFound = null;

            // Search for a WABA in the businesses
            for (const bus of businesses.data) {
                const wabaResponse = await fbApi(`/${bus.id}/client_whatsapp_business_accounts`, 'GET', { access_token: authResponse.accessToken });
                if (wabaResponse?.data && wabaResponse.data.length > 0) {
                    wabaFound = wabaResponse.data[0]; // Take the first one found
                    break;
                }
            }

            if (wabaFound) {
                setBusinessAccountId(wabaFound.id);
                toast.success("Connected to Meta Business!");
                // Auto-fetch if we found everything
                await fetchNumbersInternal(wabaFound.id, authResponse.accessToken);
            } else {
                toast.warning("Connected, but no WhatsApp Business Account found automatically. Please enter ID manually or check permissions.");
                setUseManualInput(true); // Reveal inputs to let them paste ID if they know it
                setBusinessAccountId("");
                // We stay on CREDENTIALS step but with token filled
            }

        } catch (error: any) {
            console.error("FB Login Error:", error);
            toast.error(error.message || "Facebook Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNumbersInternal = async (wabaId: string, token: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers?access_token=${token}`
            );

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            if (!data.data || data.data.length === 0) {
                toast.info("No phone numbers found for this Business Account.");
                setFoundNumbers([]);
            } else {
                setFoundNumbers(data.data);
                setStep("SELECTION");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch phone numbers");
        } finally {
            setIsLoading(false);
        }
    }

    const handleManualFetch = async () => {
        if (!businessAccountId || !accessToken) {
            toast.error("Please enter both Business Account ID and Access Token");
            return;
        }
        await fetchNumbersInternal(businessAccountId, accessToken);
    };

    const handleImport = async () => {
        if (selectedNumbers.length === 0) {
            toast.error("Please select at least one number to import");
            return;
        }

        setIsLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const numberId of selectedNumbers) {
            const metaNumber = foundNumbers.find(n => n.id === numberId);
            if (!metaNumber) continue;

            try {
                await createPhoneNumber.mutateAsync({
                    phone_number: metaNumber.display_phone_number,
                    display_name: metaNumber.verified_name,
                    verified_name: metaNumber.verified_name,
                    business_account_id: businessAccountId, // Save the WABA ID
                    platform: "CLOUD_API"
                });
                successCount++;
            } catch (error) {
                console.error(`Failed to import ${metaNumber.display_phone_number}`, error);
                failCount++;
            }
        }

        setIsLoading(false);
        toast.success(`Imported ${successCount} numbers successfully.${failCount > 0 ? ` Failed: ${failCount}` : ''}`);
        onOpenChange(false);

        // Reset state
        setStep("CREDENTIALS");
        setFoundNumbers([]);
        setSelectedNumbers([]);
        // We keep tokens/IDs for convenience until dialog closes fully or page reload
    };

    const toggleSelection = (id: string) => {
        setSelectedNumbers(prev =>
            prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Sync from Meta</DialogTitle>
                    <DialogDescription>
                        {step === "CREDENTIALS"
                            ? "Connect your Meta Business account to import numbers."
                            : "Select the numbers you want to import to your dashboard."
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === "CREDENTIALS" ? (
                    <div className="space-y-6 py-4">
                        {/* FB Login Button */}
                        {!useManualInput && (
                            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                                <Button
                                    size="lg"
                                    className="bg-[#1877F2] hover:bg-[#1864D9] text-white w-full sm:w-auto gap-2"
                                    onClick={handleFacebookLogin}
                                    disabled={isLoading || !isFbLoaded}
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Facebook className="h-5 w-5" />}
                                    Connect with Facebook
                                </Button>
                                {!appId && (
                                    <p className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                                        Meta App ID not missing in .env
                                    </p>
                                )}
                                <div className="relative w-full">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Manual Toggle */}
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="manual-mode"
                                checked={useManualInput}
                                onCheckedChange={setUseManualInput}
                            />
                            <Label htmlFor="manual-mode" className="text-sm font-normal text-muted-foreground cursor-pointer">
                                Enter credentials manually (Advanced)
                            </Label>
                        </div>

                        {/* Manual Inputs */}
                        {useManualInput && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label htmlFor="waba-id">WhatsApp Business Account ID</Label>
                                    <Input
                                        id="waba-id"
                                        placeholder="e.g. 10456..."
                                        value={businessAccountId}
                                        onChange={(e) => setBusinessAccountId(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="access-token">System User Access Token</Label>
                                    <div className="relative">
                                        <Input
                                            id="access-token"
                                            type="password"
                                            placeholder="EAAG..."
                                            value={accessToken}
                                            onChange={(e) => setAccessToken(e.target.value)}
                                            className="pr-8"
                                        />
                                        <Key className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <Button onClick={handleManualFetch} disabled={isLoading} className="w-full">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Fetch Numbers
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                            {foundNumbers.map((num) => (
                                <div key={num.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <Checkbox
                                        id={`num-${num.id}`}
                                        checked={selectedNumbers.includes(num.id)}
                                        onCheckedChange={() => toggleSelection(num.id)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor={`num-${num.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {num.verified_name}
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                            {num.display_phone_number}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${num.quality_rating === 'GREEN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground'}`}>
                                                {num.quality_rating}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                <DialogFooter>
                    {step === "SELECTION" && (
                        <>
                            <Button variant="outline" onClick={() => setStep("CREDENTIALS")}>Back</Button>
                            <Button onClick={handleImport} disabled={isLoading || selectedNumbers.length === 0}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Import Selected ({selectedNumbers.length})
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
