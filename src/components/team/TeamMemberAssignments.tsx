import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTeamAssignments } from "@/hooks/useTeamAssignments";
import { useBots } from "@/hooks/useBots";
import { useContacts } from "@/hooks/useContacts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bot, Users, Loader2 } from "lucide-react";

interface TeamMemberAssignmentsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: {
    id: string;
    member_email: string;
    role: string;
  } | null;
}

export function TeamMemberAssignments({ open, onOpenChange, teamMember }: TeamMemberAssignmentsProps) {
  const [activeTab, setActiveTab] = useState("bots");
  const [ownerName, setOwnerName] = useState<string>("Team Owner");
  const { user } = useAuth();
  
  const { 
    botAssignments, 
    contactAssignments, 
    isLoading,
    assignBot,
    unassignBot,
    assignContact,
    unassignContact,
  } = useTeamAssignments(teamMember?.id);

  const { bots } = useBots();
  const { contacts } = useContacts();

  // Fetch owner name for notifications
  useEffect(() => {
    const fetchOwnerName = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setOwnerName(data.full_name || data.company_name || "Team Owner");
      }
    };
    fetchOwnerName();
  }, [user]);

  if (!teamMember) return null;

  const assignedBotIds = botAssignments?.map(a => a.bot_id) || [];
  const assignedContactIds = contactAssignments?.map(a => a.contact_id) || [];

  const handleBotToggle = (botId: string, botName: string, isAssigned: boolean) => {
    if (isAssigned) {
      unassignBot.mutate({ 
        teamMemberId: teamMember.id, 
        botId,
        memberEmail: teamMember.member_email,
        ownerName,
        botName,
      });
    } else {
      assignBot.mutate({ 
        teamMemberId: teamMember.id, 
        botId,
        memberEmail: teamMember.member_email,
        ownerName,
        botName,
      });
    }
  };

  const handleContactToggle = (contactId: string, contactName: string, isAssigned: boolean) => {
    if (isAssigned) {
      unassignContact.mutate({ 
        teamMemberId: teamMember.id, 
        contactId,
        memberEmail: teamMember.member_email,
        ownerName,
        contactName,
      });
    } else {
      assignContact.mutate({ 
        teamMemberId: teamMember.id, 
        contactId,
        memberEmail: teamMember.member_email,
        ownerName,
        contactName,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Assignments</DialogTitle>
          <DialogDescription>
            Assign bots and contacts to {teamMember.member_email}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{teamMember.role}</Badge>
          <span className="text-sm text-muted-foreground">
            {assignedBotIds.length} bots, {assignedContactIds.length} contacts assigned
          </span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bots" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Bots ({assignedBotIds.length})
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contacts ({assignedContactIds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bots" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !bots?.length ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Bot className="h-8 w-8 mb-2" />
                <p>No bots available</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {bots.map((bot) => {
                    const isAssigned = assignedBotIds.includes(bot.id);
                    return (
                      <div
                        key={bot.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isAssigned}
                            onCheckedChange={() => handleBotToggle(bot.id, bot.name, isAssigned)}
                            disabled={assignBot.isPending || unassignBot.isPending}
                          />
                          <div>
                            <p className="font-medium">{bot.name}</p>
                            {bot.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                {bot.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={bot.is_active ? "default" : "secondary"}>
                          {bot.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !contacts?.length ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Users className="h-8 w-8 mb-2" />
                <p>No contacts available</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {contacts.map((contact) => {
                    const isAssigned = assignedContactIds.includes(contact.id);
                    return (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isAssigned}
                            onCheckedChange={() => handleContactToggle(contact.id, contact.name, isAssigned)}
                            disabled={assignContact.isPending || unassignContact.isPending}
                          />
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          </div>
                        </div>
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex gap-1">
                            {contact.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
