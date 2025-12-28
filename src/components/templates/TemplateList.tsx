import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, MoreVertical, Pencil, Trash2, Eye, Copy, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Template } from "@/pages/Templates";
import { useState } from "react";

interface TemplateListProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onPreview: (template: Template) => void;
}

const statusConfig = {
  APPROVED: { label: "Approved", icon: CheckCircle, className: "bg-success/20 text-success border-success/30" },
  PENDING: { label: "Pending", icon: Clock, className: "bg-warning/20 text-warning border-warning/30" },
  REJECTED: { label: "Rejected", icon: XCircle, className: "bg-destructive/20 text-destructive border-destructive/30" },
  DISABLED: { label: "Disabled", icon: AlertCircle, className: "bg-muted text-muted-foreground border-muted" },
};

const categoryConfig = {
  MARKETING: { label: "Marketing", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  UTILITY: { label: "Utility", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  AUTHENTICATION: { label: "Auth", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
};

export function TemplateList({ templates, selectedTemplate, onEdit, onDelete, onPreview }: TemplateListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  const handleDeleteClick = (template: Template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      onDelete(templateToDelete);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  if (templates.length === 0) {
    return (
      <Card className="p-12 bg-card border-border">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No templates yet</h3>
          <p className="text-muted-foreground">Create your first template to start sending messages.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card border-border overflow-hidden">
        <div className="divide-y divide-border">
          {templates.map((template) => {
            const status = statusConfig[template.status];
            const category = categoryConfig[template.category];
            const StatusIcon = status.icon;

            return (
              <div
                key={template.id}
                onClick={() => onPreview(template)}
                className={cn(
                  "p-4 hover:bg-secondary/50 transition-colors cursor-pointer",
                  selectedTemplate?.id === template.id && "bg-secondary"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{template.name}</h3>
                        <Badge variant="outline" className={cn("text-xs", category.className)}>
                          {category.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {template.components.find(c => c.type === "BODY")?.text || "No body text"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="outline" className={cn("text-xs gap-1", status.className)}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                        <span>{template.language.toUpperCase()}</span>
                        <span>•</span>
                        <span>{template.usageCount} uses</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreview(template); }}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(template); }}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(template); }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
