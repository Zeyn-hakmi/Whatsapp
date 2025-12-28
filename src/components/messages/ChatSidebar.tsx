import { useState } from "react";
import { Search, MessageCircle, Instagram, Facebook, Send, Twitter, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Contact } from "@/pages/Messages";
import { NewConversationDialog } from "./NewConversationDialog";
import { Contact as DbContact } from "@/hooks/useContacts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  onNewConversation: (contact: DbContact) => void;
  sourceFilter?: string;
  onSourceFilterChange?: (source: string) => void;
}

const sourceIcons: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  telegram: Send,
  twitter: Twitter,
};

const sourceColors: Record<string, string> = {
  whatsapp: "text-green-500",
  instagram: "text-pink-500",
  facebook: "text-blue-600",
  telegram: "text-sky-500",
  twitter: "text-foreground",
};

export function ChatSidebar({ 
  contacts, 
  selectedContact, 
  onSelectContact,
  onNewConversation,
  sourceFilter = "all",
  onSourceFilterChange,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);
    const matchesSource = sourceFilter === "all" || contact.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const existingPhones = contacts.map(c => c.phone);

  return (
    <div className="w-80 border-r border-border flex flex-col bg-sidebar">
      {/* Header with New Chat button */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Conversations</h2>
        <NewConversationDialog 
          onSelectContact={onNewConversation}
          existingConversationPhones={existingPhones}
        />
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary border-none"
          />
        </div>
        {onSourceFilterChange && (
          <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
            <SelectTrigger className="bg-secondary border-none">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="All sources" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="whatsapp">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  WhatsApp
                </div>
              </SelectItem>
              <SelectItem value="instagram">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram
                </div>
              </SelectItem>
              <SelectItem value="facebook">
                <div className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </div>
              </SelectItem>
              <SelectItem value="telegram">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-500" />
                  Telegram
                </div>
              </SelectItem>
              <SelectItem value="twitter">
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  X (Twitter)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Contacts List */}
      <ScrollArea className="flex-1">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-muted-foreground text-sm">No conversations yet</p>
            <p className="text-muted-foreground text-xs mt-1">
              Start a new chat with a contact
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredContacts.map((contact) => {
              const SourceIcon = sourceIcons[contact.source || "whatsapp"] || MessageCircle;
              const sourceColor = sourceColors[contact.source || "whatsapp"] || "text-muted-foreground";
              
              return (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className={cn(
                    "w-full p-4 flex items-start gap-3 hover:bg-secondary/50 transition-colors text-left",
                    selectedContact?.id === contact.id && "bg-secondary"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {contact.name.charAt(0)}
                    </div>
                    {contact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-sidebar" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {contact.name}
                        </span>
                        <SourceIcon className={cn("w-3 h-3", sourceColor)} />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {contact.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate pr-2">
                        {contact.lastMessage}
                      </p>
                      {contact.unreadCount > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
