import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContactList } from "@/components/contacts/ContactList";
import { ContactForm } from "@/components/contacts/ContactForm";
import { ContactDetails } from "@/components/contacts/ContactDetails";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, FileDown, Loader2 } from "lucide-react";
import { exportContactsToCSV, parseCSVToContacts, downloadCSV, downloadCSVTemplate, normalizePhone } from "@/lib/csv-utils";
import { toast } from "sonner";
import { useContacts, Contact as DBContact, ContactInput } from "@/hooks/useContacts";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  tags: string[];
  customFields: Record<string, string>;
  optInStatus: "opted_in" | "opted_out" | "pending";
  createdAt: Date;
  lastActivity?: Date;
  notes?: string;
}

// Convert DB contact to UI contact
const toUIContact = (c: DBContact): Contact => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  email: c.email || undefined,
  tags: c.tags,
  customFields: c.custom_fields,
  optInStatus: c.opt_in_status,
  createdAt: new Date(c.created_at),
  notes: c.notes || undefined,
});

export default function Contacts() {
  const { contacts: dbContacts, isLoading, createContact, updateContact, deleteContact, createManyContacts } = useContacts();
  const contacts = dbContacts.map(toUIContact);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    if (contacts.length === 0) {
      toast.error("No contacts to export");
      return;
    }
    const csvContent = exportContactsToCSV(contacts);
    downloadCSV(csvContent, `contacts-${new Date().toISOString().split("T")[0]}.csv`);
    toast.success(`Exported ${contacts.length} contacts`);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const importedContacts = parseCSVToContacts(text);

      if (importedContacts.length === 0) {
        toast.error("No valid contacts found in file");
        return;
      }

      const existingPhones = new Set(contacts.map((c) => normalizePhone(c.phone)));
      const uniqueContacts: ContactInput[] = [];
      let duplicateCount = 0;

      for (const contact of importedContacts) {
        const normalizedPhone = normalizePhone(contact.phone);
        if (existingPhones.has(normalizedPhone)) {
          duplicateCount++;
        } else {
          existingPhones.add(normalizedPhone);
          uniqueContacts.push({
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            tags: contact.tags,
            custom_fields: contact.customFields,
            opt_in_status: contact.optInStatus,
            notes: contact.notes,
          });
        }
      }

      if (uniqueContacts.length === 0) {
        toast.error(`All ${duplicateCount} contacts already exist`);
        return;
      }

      await createManyContacts.mutateAsync(uniqueContacts);
      if (duplicateCount > 0) {
        toast.success(`Imported ${uniqueContacts.length} contacts (${duplicateCount} duplicates skipped)`);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleDownloadTemplate = () => {
    downloadCSVTemplate();
    toast.success("Template downloaded");
  };

  const handleCreateContact = async (contact: Omit<Contact, "id" | "createdAt">) => {
    await createContact.mutateAsync({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      tags: contact.tags,
      custom_fields: contact.customFields,
      opt_in_status: contact.optInStatus,
      notes: contact.notes,
    });
    setIsFormOpen(false);
  };

  const handleUpdateContact = async (contact: Omit<Contact, "id" | "createdAt">) => {
    if (!editingContact) return;
    await updateContact.mutateAsync({
      id: editingContact.id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      tags: contact.tags,
      custom_fields: contact.customFields,
      opt_in_status: contact.optInStatus,
      notes: contact.notes,
    });
    setEditingContact(null);
    if (selectedContact?.id === editingContact.id) {
      setSelectedContact({ ...editingContact, ...contact, id: editingContact.id, createdAt: editingContact.createdAt });
    }
  };

  const handleDeleteContact = async (id: string) => {
    await deleteContact.mutateAsync(id);
    if (selectedContact?.id === id) setSelectedContact(null);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
  };

  const handleToggleOptIn = async (id: string) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    const newStatus = contact.optInStatus === "opted_in" ? "opted_out" : "opted_in";
    await updateContact.mutateAsync({ id, opt_in_status: newStatus });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Contacts" subtitle="Manage your customer contacts">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Contacts" subtitle="Manage your customer contacts, tags, and custom fields">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">All Contacts ({contacts.length})</h2>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
              <Button variant="ghost" size="sm" onClick={handleDownloadTemplate} className="gap-2 text-muted-foreground">
                <FileDown className="h-4 w-4" />
                Template
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </div>
          <ContactList
            contacts={contacts}
            selectedContact={selectedContact}
            onSelectContact={(contact) => setSelectedContact(contact)}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            onToggleOptIn={handleToggleOptIn}
          />
        </div>
        <div className="lg:col-span-1">
          <ContactDetails contact={selectedContact} onEdit={handleEditContact} onToggleOptIn={handleToggleOptIn} />
        </div>
      </div>
      <ContactForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contact={null}
        onSubmit={handleCreateContact}
      />
      <ContactForm
        open={!!editingContact}
        onOpenChange={(open) => !open && setEditingContact(null)}
        contact={editingContact}
        onSubmit={handleUpdateContact}
      />
    </DashboardLayout>
  );
}
