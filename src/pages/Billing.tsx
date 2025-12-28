import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  CreditCard,
  Check,
  MessageSquare,
  Bot,
  Brain,
  ArrowUpRight,
  Loader2,
  Users,
  UserPlus,
  Mail,
  MoreHorizontal,
  Shield,
  UserCog,
  Trash2,
  RefreshCw,
  Activity,
  Settings2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSubscription } from "@/hooks/useSubscription";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { TeamMemberAssignments } from "@/components/team/TeamMemberAssignments";
import { format } from "date-fns";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started",
    seats: 1,
    features: [
      "100 messages/month",
      "1 Bot",
      "1 Seat",
      "Basic analytics",
      "Community support",
    ],
    highlighted: false,
    planId: "free",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing businesses",
    seats: 5,
    features: [
      "5,000 messages/month",
      "5 Bots",
      "5 Seats",
      "AI Agents included",
      "Advanced analytics",
      "Priority support",
    ],
    highlighted: true,
    planId: "pro",
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations",
    seats: 25,
    features: [
      "Unlimited messages",
      "Unlimited bots",
      "25 Seats",
      "Advanced AI features",
      "Custom integrations",
      "Dedicated support",
    ],
    highlighted: false,
    planId: "enterprise",
  },
];

export default function Billing() {
  const { subscription, isLoading, getSeatUsagePercentage, getUsagePercentage, isNearLimit, hasAvailableSeats } = useSubscription();
  const { teamMembers, isLoading: teamLoading, inviteMember, updateMember, removeMember, resendInvite, activeMembers, pendingMembers } = useTeamMembers();
  
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [assignmentsMember, setAssignmentsMember] = useState<{ id: string; member_email: string; role: string } | null>(null);

  // Fetch owner profile for invite emails
  useEffect(() => {
    const fetchProfile = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, company_name")
          .eq("user_id", user.id)
          .single();
        if (data) {
          setOwnerName(data.full_name || data.company_name || user.email || "Team Owner");
        }
      }
    };
    fetchProfile();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    await inviteMember.mutateAsync({ 
      email: inviteEmail, 
      role: inviteRole,
      ownerName: ownerName || "Team Owner"
    });
    setInviteEmail("");
    setInviteRole("member");
    setInviteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Billing" subtitle="Manage your subscription and billing">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const seatLimit = subscription?.seat_limit || 1;
  const seatsUsed = subscription?.seats_used || 1;

  return (
    <DashboardLayout title="Billing" subtitle="Manage your subscription and billing">
      <div className="space-y-8">
        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Current Plan</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary capitalize">
                    {subscription?.plan_name || "Free"}
                  </span>
                  <Badge variant="secondary">{subscription?.status || "active"}</Badge>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Update Payment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Messages Used</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {subscription?.messages_used || 0} / {subscription?.message_limit || 100}
                    </span>
                    <span className={isNearLimit() ? "text-amber-500" : "text-muted-foreground"}>
                      {Math.round(getUsagePercentage())}%
                    </span>
                  </div>
                  <Progress value={getUsagePercentage()} className="h-2" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Team Seats</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {seatsUsed} / {seatLimit}
                    </span>
                    <span className={getSeatUsagePercentage() >= 80 ? "text-amber-500" : "text-muted-foreground"}>
                      {Math.round(getSeatUsagePercentage())}%
                    </span>
                  </div>
                  <Progress value={getSeatUsagePercentage()} className="h-2" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bot className="w-4 h-4" />
                  <span className="text-sm">Bot Limit</span>
                </div>
                <p className="text-lg font-medium text-foreground">
                  {subscription?.bot_limit === -1 ? "Unlimited" : subscription?.bot_limit || 1} bots
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">AI Features</span>
                </div>
                <p className="text-lg font-medium text-foreground">
                  {subscription?.ai_enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>

            {subscription?.current_period_end && (
              <p className="text-sm text-muted-foreground mt-4">
                Your plan renews on {format(new Date(subscription.current_period_end), "MMMM d, yyyy")}
              </p>
            )}
          </Card>
        </motion.div>

        {/* Team Members Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
                <p className="text-sm text-muted-foreground">
                  {activeMembers} active, {pendingMembers} pending • {seatLimit - seatsUsed} seats available
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to="/team/activity">
                    <Activity className="w-4 h-4 mr-2" />
                    Activity Log
                  </Link>
                </Button>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="gap-2" 
                      disabled={!hasAvailableSeats()}
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to add a new team member. They will receive an email with instructions to join.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleInvite} 
                      disabled={!inviteEmail || inviteMember.isPending}
                    >
                      {inviteMember.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </div>
            </div>

            {teamLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No team members yet</p>
                <p className="text-sm">Invite your first team member to get started</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invited</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.member_email}</TableCell>
                        <TableCell className="capitalize">{member.role}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={member.status === "active" ? "default" : "secondary"}
                            className={member.status === "pending" ? "bg-amber-500/10 text-amber-500" : ""}
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(member.invited_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {member.status === "pending" && (
                                <DropdownMenuItem 
                                  onClick={() => resendInvite.mutate({ 
                                    id: member.id, 
                                    ownerName: ownerName || "Team Owner" 
                                  })}
                                  disabled={resendInvite.isPending}
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Resend Invite
                                </DropdownMenuItem>
                              )}
                              {member.status === "active" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => setAssignmentsMember({ 
                                      id: member.id, 
                                      member_email: member.member_email, 
                                      role: member.role 
                                    })}
                                  >
                                    <Settings2 className="w-4 h-4 mr-2" />
                                    Manage Assignments
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => updateMember.mutate({ id: member.id, role: "admin" })}
                                    disabled={member.role === "admin" || updateMember.isPending}
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Make Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateMember.mutate({ id: member.id, role: "editor" })}
                                    disabled={member.role === "editor" || updateMember.isPending}
                                  >
                                    <UserCog className="w-4 h-4 mr-2" />
                                    Make Editor
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateMember.mutate({ id: member.id, role: "member" })}
                                    disabled={member.role === "member" || updateMember.isPending}
                                  >
                                    <Users className="w-4 h-4 mr-2" />
                                    Make Member
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem 
                                onClick={() => removeMember.mutate(member.id)}
                                className="text-destructive focus:text-destructive"
                                disabled={removeMember.isPending}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!hasAvailableSeats() && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-600">
                  You've reached your seat limit. Upgrade your plan to add more team members.
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Available Plans */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Available Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
              >
                <Card
                  className={`p-6 relative ${
                    plan.highlighted
                      ? "bg-primary/5 border-primary"
                      : "bg-card border-border"
                  }`}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <h4 className="text-lg font-semibold text-foreground">{plan.name}</h4>
                    <div className="flex items-baseline justify-center gap-1 mt-2">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full gap-2"
                    variant={plan.highlighted ? "default" : "outline"}
                    disabled={subscription?.plan_id === plan.planId}
                  >
                    {subscription?.plan_id === plan.planId ? (
                      "Current Plan"
                    ) : (
                      <>
                        Upgrade
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Billing History</h3>
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No billing history yet</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Team Member Assignments Dialog */}
      <TeamMemberAssignments
        open={!!assignmentsMember}
        onOpenChange={(open) => !open && setAssignmentsMember(null)}
        teamMember={assignmentsMember}
      />
    </DashboardLayout>
  );
}
