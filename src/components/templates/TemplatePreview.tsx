import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, ExternalLink } from "lucide-react";
import type { Template } from "@/pages/Templates";

interface TemplatePreviewProps {
  template: Template | null;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  if (!template) {
    return (
      <Card className="p-6 bg-card border-border h-full min-h-[400px] flex flex-col items-center justify-center">
        <Smartphone className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          Select a template to preview
        </p>
      </Card>
    );
  }

  const header = template.components.find(c => c.type === "HEADER");
  const body = template.components.find(c => c.type === "BODY");
  const footer = template.components.find(c => c.type === "FOOTER");
  const buttons = template.components.find(c => c.type === "BUTTONS");

  // Replace variables with sample data for preview
  const formatText = (text: string) => {
    return text
      .replace(/\{\{1\}\}/g, "John")
      .replace(/\{\{2\}\}/g, "#12345")
      .replace(/\{\{3\}\}/g, "2-3");
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Preview</h3>
        <Badge variant="outline" className="text-xs">
          {template.language.toUpperCase()}
        </Badge>
      </div>

      {/* Phone Frame */}
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        {/* Phone Header */}
        <div className="bg-primary/10 px-4 py-3 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">B</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Business Name</p>
            <p className="text-xs text-muted-foreground">WhatsApp Business</p>
          </div>
        </div>

        {/* Chat Background */}
        <div className="p-4 min-h-[300px] bg-[url('/placeholder.svg')] bg-opacity-5" style={{ backgroundColor: 'hsl(var(--secondary))' }}>
          {/* Message Bubble */}
          <div className="max-w-[85%] bg-card rounded-lg rounded-tl-none shadow-sm border border-border overflow-hidden">
            {/* Header */}
            {header && (
              <div className="px-3 pt-3">
                <p className="font-semibold text-foreground text-sm">
                  {formatText(header.text || "")}
                </p>
              </div>
            )}

            {/* Body */}
            {body && (
              <div className="px-3 py-2">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {formatText(body.text || "")}
                </p>
              </div>
            )}

            {/* Footer */}
            {footer && (
              <div className="px-3 pb-2">
                <p className="text-xs text-muted-foreground">
                  {formatText(footer.text || "")}
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="px-3 pb-2 text-right">
              <span className="text-[10px] text-muted-foreground">10:30 AM</span>
            </div>

            {/* Buttons */}
            {buttons && buttons.buttons && buttons.buttons.length > 0 && (
              <div className="border-t border-border divide-y divide-border">
                {buttons.buttons.map((btn, i) => (
                  <button
                    key={i}
                    className="w-full px-3 py-2.5 text-sm text-primary font-medium hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
                  >
                    {btn.type === "URL" && <ExternalLink className="w-3 h-3" />}
                    {btn.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Name</span>
          <span className="text-foreground font-medium">{template.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Category</span>
          <span className="text-foreground">{template.category}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Usage</span>
          <span className="text-foreground">{template.usageCount} times</span>
        </div>
      </div>
    </Card>
  );
}
