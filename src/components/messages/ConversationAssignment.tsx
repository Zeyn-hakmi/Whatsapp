import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useConversationAssignment } from "@/hooks/useConversationAssignment";
import { UserPlus, Users, Zap, Loader2 } from "lucide-react";

interface ConversationAssignmentProps {
  conversationId: string;
  currentAssignee?: string | null;
  onAssigned?: () => void;
}

export function ConversationAssignment({
  conversationId,
  currentAssignee,
  onAssigned,
}: ConversationAssignmentProps) {
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>(currentAssignee || "");
  const { workloadData, isLoading, assignConversation, autoAssign } = useConversationAssignment();

  const handleAssign = async () => {
    await assignConversation.mutateAsync({
      conversationId,
      teamMemberId: selectedMember || null,
    });
    setOpen(false);
    onAssigned?.();
  };

  const handleAutoAssign = async () => {
    await autoAssign.mutateAsync(conversationId);
    setOpen(false);
    onAssigned?.();
  };

  const maxWorkload = Math.max(...workloadData.map((w) => w.activeConversations), 1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          {currentAssignee ? "Reassign" : "Assign"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Conversation</DialogTitle>
          <DialogDescription>
            Assign this conversation to a team member or let the system auto-assign based on workload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Auto-assign button */}
          <Button
            onClick={handleAutoAssign}
            disabled={autoAssign.isPending || workloadData.length === 0}
            className="w-full gap-2"
            variant="secondary"
          >
            {autoAssign.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Auto-assign (Lowest Workload)
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or select manually</span>
            </div>
          </div>

          {/* Team member selection */}
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {workloadData.map((item) => (
                <SelectItem key={item.member.id} value={item.member.id}>
                  <div className="flex items-center gap-2">
                    <span>{item.member.member_email}</span>
                    <Badge variant="secondary" className="ml-2">
                      {item.activeConversations} active
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Workload visualization */}
          {workloadData.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Workload
              </h4>
              <div className="space-y-2">
                {workloadData.map((item) => (
                  <Card key={item.member.id} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {item.member.member_email}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.assignedCount} total</Badge>
                        <Badge 
                          variant={item.activeConversations === 0 ? "secondary" : "default"}
                        >
                          {item.activeConversations} active
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(item.activeConversations / maxWorkload) * 100} 
                      className="h-2"
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {workloadData.length === 0 && !isLoading && (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active team members</p>
              <p className="text-sm">Invite team members to enable assignment</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={assignConversation.isPending}
          >
            {assignConversation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Bulk assignment component for the team dashboard
export function BulkConversationAssignment() {
  const { workloadData, bulkAutoAssign, isLoading } = useConversationAssignment();

  return (
    <Button
      onClick={() => bulkAutoAssign.mutate()}
      disabled={bulkAutoAssign.isPending || isLoading || workloadData.length === 0}
      variant="outline"
      className="gap-2"
    >
      {bulkAutoAssign.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Zap className="w-4 h-4" />
      )}
      Auto-assign All Unassigned
    </Button>
  );
}
