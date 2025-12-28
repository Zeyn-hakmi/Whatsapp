import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatSidebar } from "@/components/messages/ChatSidebar";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { Contact as DbContact } from "@/hooks/useContacts";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  source?: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOutbound: boolean;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "document";
  source?: string;
}

export default function Messages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  
  const { conversations, isLoading: conversationsLoading, createConversation } = useConversations();
  const { messages: dbMessages, sendMessage } = useMessages(selectedConversationId);

  // Convert conversations to Contact format for ChatSidebar
  const contacts: Contact[] = useMemo(() => {
    return conversations.map(conv => ({
      id: conv.id,
      name: conv.contact_name || conv.contact_phone,
      phone: conv.contact_phone,
      lastMessage: "",
      lastMessageTime: conv.last_message_at 
        ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })
        : "",
      unreadCount: conv.unread_count || 0,
      isOnline: false,
      source: conv.source || "whatsapp",
    }));
  }, [conversations]);

  // Get the selected conversation for assignment info
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleAssignmentChange = () => {
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  // Convert DB messages to UI Message format
  const messages: Message[] = useMemo(() => {
    return dbMessages.map(msg => ({
      id: msg.id,
      content: msg.content || "",
      timestamp: new Date(msg.created_at).toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit" 
      }),
      isOutbound: msg.direction === "outbound",
      status: (msg.status as "sent" | "delivered" | "read") || "sent",
      type: (msg.message_type as "text" | "image" | "document") || "text",
      source: (msg as any).source || "whatsapp",
    }));
  }, [dbMessages]);

  const selectedContact = contacts.find(c => c.id === selectedConversationId) || null;

  const handleSelectContact = (contact: Contact) => {
    setSelectedConversationId(contact.id);
  };

  const handleNewConversation = async (contact: DbContact) => {
    try {
      const result = await createConversation.mutateAsync({
        contact_phone: contact.phone,
        contact_name: contact.name,
        contact_id: contact.id,
      });
      setSelectedConversationId(result.id);
      toast.success(`Started conversation with ${contact.name}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;
    
    await sendMessage.mutateAsync({
      conversation_id: selectedConversationId,
      content,
      direction: "outbound",
      message_type: "text",
    });
  };

  if (conversationsLoading) {
    return (
      <DashboardLayout title="Messages" subtitle="Manage your conversations">
        <div className="flex h-[calc(100vh-180px)] bg-card rounded-xl border border-border overflow-hidden items-center justify-center">
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Messages" subtitle="Manage your conversations">
      <div className="flex h-[calc(100vh-180px)] bg-card rounded-xl border border-border overflow-hidden">
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={handleSelectContact}
          onNewConversation={handleNewConversation}
          sourceFilter={sourceFilter}
          onSourceFilterChange={setSourceFilter}
        />
        <ChatWindow
          contact={selectedContact}
          messages={messages}
          onSendMessage={handleSendMessage}
          conversationId={selectedConversationId}
          assignedTo={selectedConversation?.assigned_to}
          onAssignmentChange={handleAssignmentChange}
        />
      </div>
    </DashboardLayout>
  );
}
