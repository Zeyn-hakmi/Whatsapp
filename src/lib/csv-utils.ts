import { Contact } from "@/pages/Contacts";

const CSV_HEADERS = ["name", "phone", "email", "tags", "optInStatus", "notes", "customFields"];

const SAMPLE_TEMPLATE = `name,phone,email,tags,optInStatus,notes,customFields
John Doe,+1 555 123 4567,john@example.com,VIP; Newsletter,opted_in,Sample note,"{""company"":""Acme Inc""}"
Jane Smith,+1 555 987 6543,jane@example.com,Lead,pending,,{}`;

export function downloadCSVTemplate(): void {
  downloadCSV(SAMPLE_TEMPLATE, "contacts-template.csv");
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\.]/g, "");
}

export function exportContactsToCSV(contacts: Contact[]): string {
  const headers = [
    "name",
    "phone",
    "email",
    "tags",
    "optInStatus",
    "notes",
    "customFields",
  ];

  const rows = contacts.map((contact) => [
    escapeCSVField(contact.name),
    escapeCSVField(contact.phone),
    escapeCSVField(contact.email || ""),
    escapeCSVField(contact.tags.join("; ")),
    escapeCSVField(contact.optInStatus),
    escapeCSVField(contact.notes || ""),
    escapeCSVField(JSON.stringify(contact.customFields)),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function parseCSVToContacts(csvContent: string): Omit<Contact, "id" | "createdAt">[] {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const contacts: Omit<Contact, "id" | "createdAt">[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const contact = createContactFromRow(headers, values);
    if (contact) contacts.push(contact);
  }

  return contacts;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function createContactFromRow(
  headers: string[],
  values: string[]
): Omit<Contact, "id" | "createdAt"> | null {
  const getValue = (key: string): string => {
    const index = headers.indexOf(key);
    return index >= 0 && values[index] ? values[index] : "";
  };

  const name = getValue("name");
  const phone = getValue("phone");

  if (!name || !phone) return null;

  const tagsStr = getValue("tags");
  const tags = tagsStr
    ? tagsStr.split(/[;,]/).map((t) => t.trim()).filter(Boolean)
    : [];

  let customFields: Record<string, string> = {};
  const customFieldsStr = getValue("customfields");
  if (customFieldsStr) {
    try {
      customFields = JSON.parse(customFieldsStr);
    } catch {
      customFields = {};
    }
  }

  const optInValue = getValue("optinstatus").toLowerCase();
  let optInStatus: Contact["optInStatus"] = "pending";
  if (optInValue === "opted_in" || optInValue === "optedin" || optInValue === "yes") {
    optInStatus = "opted_in";
  } else if (optInValue === "opted_out" || optInValue === "optedout" || optInValue === "no") {
    optInStatus = "opted_out";
  }

  return {
    name,
    phone,
    email: getValue("email") || undefined,
    tags,
    customFields,
    optInStatus,
    notes: getValue("notes") || undefined,
  };
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
