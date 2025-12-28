import { Contact } from "@/pages/Contacts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  Tag,
  FileText,
  Pencil,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ContactDetailsProps {
  contact: Contact | null;
  onEdit: (contact: Contact) => void;
  onToggleOptIn: (id: string) => void;
}

const optInLabels = {
  opted_in: { label: "Opted In", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  opted_out: { label: "Opted Out", className: "bg-destructive/10 text-destructive border-destructive/20" },
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
};

export function ContactDetails({ contact, onEdit, onToggleOptIn }: ContactDetailsProps) {
  if (!contact) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground p-8">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a contact to view details</p>
        </div>
      </Card>
    );
  }

  const customFieldEntries = Object.entries(contact.customFields);

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <div>
              <CardTitle className="text-xl">{contact.name}</CardTitle>
              <Badge
                variant="outline"
                className={cn("mt-1", optInLabels[contact.optInStatus].className)}
              >
                {optInLabels[contact.optInStatus].label}
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEdit(contact)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Contact Info</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{contact.phone}</span>
            </div>
            {contact.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{contact.email}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Opt-In Status</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={contact.optInStatus === "opted_in" ? "default" : "outline"}
              onClick={() => contact.optInStatus !== "opted_in" && onToggleOptIn(contact.id)}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Opted In
            </Button>
            <Button
              size="sm"
              variant={contact.optInStatus === "opted_out" ? "destructive" : "outline"}
              onClick={() => contact.optInStatus !== "opted_out" && onToggleOptIn(contact.id)}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Opted Out
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
          </div>
          {contact.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tags</p>
          )}
        </div>

        {customFieldEntries.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-muted-foreground">Custom Fields</h4>
              </div>
              <div className="space-y-2">
                {customFieldEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {contact.notes && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
              <p className="text-sm">{contact.notes}</p>
            </div>
          </>
        )}

        <Separator />

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Added {format(contact.createdAt, "MMMM d, yyyy")}</span>
          </div>
          {contact.lastActivity && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Last activity {format(contact.lastActivity, "MMMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
