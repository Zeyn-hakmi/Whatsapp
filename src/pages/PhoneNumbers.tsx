import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Trash2,
  Edit,
  RefreshCw,
  Webhook,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { WebhookSettings, WebhookConfig } from "@/components/phone-numbers/WebhookSettings";
import { usePhoneNumbers, PhoneNumber, PhoneNumberInput } from "@/hooks/usePhoneNumbers";

const qualityColors = {
  GREEN: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  YELLOW: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  RED: "bg-destructive/10 text-destructive border-destructive/20",
  UNKNOWN: "bg-muted text-muted-foreground border-border",
};

const statusConfig = {
  CONNECTED: { color: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2 },
  PENDING: { color: "bg-amber-500/10 text-amber-500", icon: Clock },
  DISCONNECTED: { color: "bg-muted text-muted-foreground", icon: AlertCircle },
  BANNED: { color: "bg-destructive/10 text-destructive", icon: Shield },
};

const messagingLimitLabels: Record<string, string> = {
  TIER_250: "250/day",
  TIER_1K: "1K/day",
  TIER_10K: "10K/day",
  TIER_100K: "100K/day",
  TIER_UNLIMITED: "Unlimited",
};

export default function PhoneNumbers() {
  const { phoneNumbers, isLoading, createPhoneNumber, updatePhoneNumber, deletePhoneNumber } = usePhoneNumbers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneNumber | null>(null);
  const [webhookPhone, setWebhookPhone] = useState<PhoneNumber | null>(null);

  const [formData, setFormData] = useState({
    phone_number: "",
    display_name: "",
    verified_name: "",
    business_account_id: "",
    platform: "CLOUD_API" as "CLOUD_API" | "ON_PREMISE",
  });

  const filteredPhoneNumbers = phoneNumbers.filter(
    (phone) =>
      phone.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (phone.verified_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      phone_number: "",
      display_name: "",
      verified_name: "",
      business_account_id: "",
      platform: "CLOUD_API",
    });
  };

  const handleAddPhone = async () => {
    if (!formData.phone_number || !formData.display_name) {
      toast.error("Phone number and display name are required");
      return;
    }

    await createPhoneNumber.mutateAsync({
      phone_number: formData.phone_number,
      display_name: formData.display_name,
      verified_name: formData.verified_name || undefined,
      business_account_id: formData.business_account_id || undefined,
      platform: formData.platform,
    });

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditPhone = async () => {
    if (!editingPhone || !formData.phone_number || !formData.display_name) {
      toast.error("Phone number and display name are required");
      return;
    }

    await updatePhoneNumber.mutateAsync({
      id: editingPhone.id,
      phone_number: formData.phone_number,
      display_name: formData.display_name,
      verified_name: formData.verified_name || undefined,
      business_account_id: formData.business_account_id || undefined,
      platform: formData.platform,
    });

    setEditingPhone(null);
    resetForm();
  };

  const handleDeletePhone = async (id: string) => {
    await deletePhoneNumber.mutateAsync(id);
  };

  const openEditDialog = (phone: PhoneNumber) => {
    setEditingPhone(phone);
    setFormData({
      phone_number: phone.phone_number,
      display_name: phone.display_name,
      verified_name: phone.verified_name || "",
      business_account_id: phone.business_account_id || "",
      platform: phone.platform,
    });
  };

  const handleRefreshStatus = (id: string) => {
    toast.success("Status refreshed");
  };

  const handleSaveWebhook = async (config: WebhookConfig) => {
    if (!webhookPhone) return;
    await updatePhoneNumber.mutateAsync({
      id: webhookPhone.id,
      webhook_url: config.webhookUrl || undefined,
      webhook_verify_token: config.verifyToken || undefined,
      webhook_enabled: config.isEnabled,
      webhook_events: config.subscribedEvents,
    });
    setWebhookPhone(null);
  };

  const getWebhookConfig = (phone: PhoneNumber): WebhookConfig => ({
    webhookUrl: phone.webhook_url || "",
    verifyToken: phone.webhook_verify_token || "",
    isEnabled: phone.webhook_enabled,
    subscribedEvents: phone.webhook_events || [],
  });

  const connectedCount = phoneNumbers.filter((p) => p.status === "CONNECTED").length;
  const pendingCount = phoneNumbers.filter((p) => p.status === "PENDING").length;

  if (isLoading) {
    return (
      <DashboardLayout title="Phone Numbers" subtitle="Manage your WhatsApp Business phone numbers">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Phone Numbers" subtitle="Manage your WhatsApp Business phone numbers and their metadata">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Phone Number
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Phone Number</DialogTitle>
                <DialogDescription>Register a new WhatsApp Business phone number</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1 555 123 4567"
                    value={formData.phone_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    placeholder="Main Support"
                    value={formData.display_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verifiedName">Verified Business Name</Label>
                  <Input
                    id="verifiedName"
                    placeholder="Your Company Inc."
                    value={formData.verified_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, verified_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAccountId">Business Account ID</Label>
                  <Input
                    id="businessAccountId"
                    placeholder="BA123456789"
                    value={formData.business_account_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, business_account_id: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value: "CLOUD_API" | "ON_PREMISE") =>
                      setFormData((prev) => ({ ...prev, platform: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLOUD_API">Cloud API</SelectItem>
                      <SelectItem value="ON_PREMISE">On-Premise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPhone} disabled={createPhoneNumber.isPending}>
                  {createPhoneNumber.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Phone Number
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Numbers</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{phoneNumbers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{connectedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {phoneNumbers.filter((p) => p.quality_rating === "RED" || p.quality_rating === "YELLOW").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phone Numbers Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registered Numbers</CardTitle>
                <CardDescription>All phone numbers connected to your WhatsApp Business account</CardDescription>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search phone numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Verified Name</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Messaging Limit</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPhoneNumbers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {phoneNumbers.length === 0 ? "No phone numbers yet. Add one to get started." : "No phone numbers found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPhoneNumbers.map((phone, index) => {
                    const StatusIcon = statusConfig[phone.status].icon;
                    return (
                      <motion.tr
                        key={phone.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="font-mono font-medium">{phone.phone_number}</TableCell>
                        <TableCell>{phone.display_name}</TableCell>
                        <TableCell>
                          {phone.verified_name || <span className="text-muted-foreground italic">Not verified</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={qualityColors[phone.quality_rating]}>
                            {phone.quality_rating}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${statusConfig[phone.status].color} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {phone.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{messagingLimitLabels[phone.messaging_limit] || phone.messaging_limit}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{phone.platform === "CLOUD_API" ? "Cloud API" : "On-Premise"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(phone)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRefreshStatus(phone.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Status
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setWebhookPhone(phone)}>
                                <Webhook className="h-4 w-4 mr-2" />
                                Configure Webhooks
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeletePhone(phone.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingPhone} onOpenChange={(open) => !open && setEditingPhone(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Phone Number</DialogTitle>
              <DialogDescription>Update phone number details and metadata</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phoneNumber">Phone Number *</Label>
                <Input
                  id="edit-phoneNumber"
                  value={formData.phone_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-displayName">Display Name *</Label>
                <Input
                  id="edit-displayName"
                  value={formData.display_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-verifiedName">Verified Business Name</Label>
                <Input
                  id="edit-verifiedName"
                  value={formData.verified_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, verified_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-businessAccountId">Business Account ID</Label>
                <Input
                  id="edit-businessAccountId"
                  value={formData.business_account_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, business_account_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: "CLOUD_API" | "ON_PREMISE") =>
                    setFormData((prev) => ({ ...prev, platform: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLOUD_API">Cloud API</SelectItem>
                    <SelectItem value="ON_PREMISE">On-Premise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPhone(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditPhone} disabled={updatePhoneNumber.isPending}>
                {updatePhoneNumber.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Settings Dialog */}
        {webhookPhone && (
          <WebhookSettings
            open={!!webhookPhone}
            onOpenChange={(open) => !open && setWebhookPhone(null)}
            phoneNumber={webhookPhone.phone_number}
            displayName={webhookPhone.display_name}
            config={getWebhookConfig(webhookPhone)}
            onSave={handleSaveWebhook}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
