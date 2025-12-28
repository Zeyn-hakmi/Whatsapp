import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TemplateList } from "@/components/templates/TemplateList";
import { TemplateForm } from "@/components/templates/TemplateForm";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useTemplates, type Template as DBTemplate, type TemplateInput } from "@/hooks/useTemplates";

export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?: string;
  buttons?: { type: string; text: string; url?: string; phone_number?: string }[];
}

export interface Template {
  id: string;
  name: string;
  language: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";
  components: TemplateComponent[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Convert DB template to UI template format
function dbToUITemplate(db: DBTemplate): Template {
  const components: TemplateComponent[] = [];
  
  if (db.header_content) {
    components.push({
      type: "HEADER",
      format: (db.header_type?.toUpperCase() as "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT") || "TEXT",
      text: db.header_content,
    });
  }
  
  components.push({
    type: "BODY",
    text: db.body_text,
  });
  
  if (db.footer_text) {
    components.push({
      type: "FOOTER",
      text: db.footer_text,
    });
  }
  
  if (db.buttons && db.buttons.length > 0) {
    components.push({
      type: "BUTTONS",
      buttons: db.buttons,
    });
  }

  return {
    id: db.id,
    name: db.name,
    language: db.language || "en",
    category: (db.category?.toUpperCase() as "MARKETING" | "UTILITY" | "AUTHENTICATION") || "UTILITY",
    status: (db.status?.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" | "DISABLED") || "PENDING",
    components,
    usageCount: 0, // Would need a separate counter
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// Convert UI template to DB format
function uiToDBTemplate(ui: Omit<Template, "id" | "usageCount" | "createdAt" | "updatedAt" | "status">): TemplateInput {
  const header = ui.components.find(c => c.type === "HEADER");
  const body = ui.components.find(c => c.type === "BODY");
  const footer = ui.components.find(c => c.type === "FOOTER");
  const buttons = ui.components.find(c => c.type === "BUTTONS");

  return {
    name: ui.name,
    category: ui.category,
    language: ui.language,
    header_type: header?.format?.toLowerCase() || null,
    header_content: header?.text || null,
    body_text: body?.text || "",
    footer_text: footer?.text || null,
    buttons: buttons?.buttons || null,
  };
}

export default function Templates() {
  const { templates: dbTemplates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const templates = useMemo(() => dbTemplates.map(dbToUITemplate), [dbTemplates]);

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDelete = async (template: Template) => {
    try {
      await deleteTemplate.mutateAsync(template.id);
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
      }
      toast.success(`Template "${template.name}" deleted`);
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const handleSave = async (template: Omit<Template, "id" | "usageCount" | "createdAt" | "updatedAt" | "status">) => {
    try {
      const dbInput = uiToDBTemplate(template);
      
      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, ...dbInput });
        toast.success(`Template "${template.name}" updated`);
      } else {
        await createTemplate.mutateAsync(dbInput);
        toast.success(`Template "${template.name}" created`);
      }
      setIsFormOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Templates" subtitle="Manage your WhatsApp message templates">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Templates" subtitle="Manage your WhatsApp message templates">
      <div className="flex items-center justify-end mb-6">
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <TemplateList
            templates={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            selectedTemplate={selectedTemplate}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TemplatePreview template={selectedTemplate} />
        </motion.div>
      </div>

      <TemplateForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        template={editingTemplate}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
