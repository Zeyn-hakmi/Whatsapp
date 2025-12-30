
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { usePhoneNumbers } from "@/hooks/usePhoneNumbers";

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
    const [businessAccountId, setBusinessAccountId] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [foundNumbers, setFoundNumbers] = useState<MetaPhoneNumber[]>([]);
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);

    const { createPhoneNumber } = usePhoneNumbers();

    const fetchNumbers = async () => {
        if (!businessAccountId || !accessToken) {
            toast.error("Please enter both Business Account ID and Access Token");
            return;
        }

        setIsLoading(true);
        try {
            // https://developers.facebook.com/docs/whatsapp/business-management-api/manage-phone-numbers
            const response = await fetch(
                `https://graph.facebook.com/v18.0/${businessAccountId}/phone_numbers?access_token=${accessToken}`
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
            toast.error(error.message || "Failed to fetch phone numbers from Meta");
        } finally {
            setIsLoading(false);
        }
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
        setAccessToken("");
        // We keep businessAccountId as user might want to reuse it
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
                            ? "Enter your Meta Business credentials to search for WhatsApp numbers."
                            : "Select the numbers you want to import to your dashboard."
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === "CREDENTIALS" ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="waba-id">WhatsApp Business Account ID</Label>
                            <Input
                                id="waba-id"
                                placeholder="e.g. 10456..."
                                value={businessAccountId}
                                onChange={(e) => setBusinessAccountId(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Found in Meta Business Manager under WhatsApp Accounts.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="access-token">System User Access Token</Label>
                            <Input
                                id="access-token"
                                type="password"
                                placeholder="EAAG..."
                                value={accessToken}
                                onChange={(e) => setAccessToken(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Requires 'whatsapp_business_management' permission.
                            </p>
                        </div>
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
                    {step === "CREDENTIALS" ? (
                        <Button onClick={fetchNumbers} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Fetch Numbers
                        </Button>
                    ) : (
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
