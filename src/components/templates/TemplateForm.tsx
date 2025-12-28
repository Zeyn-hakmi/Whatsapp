import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical, Layers } from "lucide-react";
import type { Template, TemplateComponent } from "@/pages/Templates";
import { PlatformTemplateEditor } from "./PlatformTemplateEditor";

interface TemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onSave: (template: Omit<Template, "id" | "usageCount" | "createdAt" | "updatedAt" | "status"> & { platformFormats?: Record<string, unknown> }) => void;
}

const languages = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

export function TemplateForm({ open, onOpenChange, template, onSave }: TemplateFormProps) {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [category, setCategory] = useState<Template["category"]>("UTILITY");
  const [headerText, setHeaderText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState<{ type: string; text: string; url?: string }[]>([]);
  const [platformFormats, setPlatformFormats] = useState<Record<string, unknown>>({});
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (template) {
      setName(template.name);
      setLanguage(template.language);
      setCategory(template.category);
      const header = template.components.find(c => c.type === "HEADER");
      const body = template.components.find(c => c.type === "BODY");
      const footer = template.components.find(c => c.type === "FOOTER");
      const btns = template.components.find(c => c.type === "BUTTONS");
      setHeaderText(header?.text || "");
      setBodyText(body?.text || "");
      setFooterText(footer?.text || "");
      setButtons(btns?.buttons || []);
      setPlatformFormats((template as any).platformFormats || {});
    } else {
      resetForm();
    }
  }, [template, open]);

  const resetForm = () => {
    setName("");
    setLanguage("en");
    setCategory("UTILITY");
    setHeaderText("");
    setBodyText("");
    setFooterText("");
    setButtons([]);
    setPlatformFormats({});
    setActiveTab("basic");
  };

  const handleAddButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { type: "QUICK_REPLY", text: "" }]);
    }
  };

  const handleRemoveButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleButtonChange = (index: number, field: string, value: string) => {
    setButtons(buttons.map((btn, i) => 
      i === index ? { ...btn, [field]: value } : btn
    ));
  };

  const handleSubmit = () => {
    const components: TemplateComponent[] = [];
    
    if (headerText.trim()) {
      components.push({ type: "HEADER", format: "TEXT", text: headerText });
    }
    
    if (bodyText.trim()) {
      components.push({ type: "BODY", text: bodyText });
    }
    
    if (footerText.trim()) {
      components.push({ type: "FOOTER", text: footerText });
    }
    
    if (buttons.length > 0) {
      components.push({ type: "BUTTONS", buttons });
    }

    onSave({
      name: name.toLowerCase().replace(/\s+/g, "_"),
      language,
      category,
      components,
      platformFormats: Object.keys(platformFormats).length > 0 ? platformFormats : undefined,
    });
  };

  const isValid = name.trim() && bodyText.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create Template"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Template</TabsTrigger>
            <TabsTrigger value="platforms" className="gap-2">
              <Layers className="w-4 h-4" />
              Platform Formats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., order_confirmation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and underscores only
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Template["category"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTILITY">Utility</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-2">
              <Label htmlFor="header">Header (Optional)</Label>
              <Input
                id="header"
                placeholder="Enter header text..."
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {headerText.length}/60 characters
              </p>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Body *</Label>
              <Textarea
                id="body"
                placeholder="Enter your message body. Use {{1}}, {{2}}, etc. for variables..."
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={4}
                maxLength={1024}
              />
              <p className="text-xs text-muted-foreground">
                {bodyText.length}/1024 characters. Use {"{{1}}"}, {"{{2}}"}, etc. for dynamic variables.
              </p>
            </div>

            {/* Footer */}
            <div className="space-y-2">
              <Label htmlFor="footer">Footer (Optional)</Label>
              <Input
                id="footer"
                placeholder="Enter footer text..."
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {footerText.length}/60 characters
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Buttons (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddButton}
                  disabled={buttons.length >= 3}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Button
                </Button>
              </div>
              
              {buttons.map((btn, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-secondary rounded-lg">
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-2.5" />
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Select
                      value={btn.type}
                      onValueChange={(v) => handleButtonChange(index, "type", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                        <SelectItem value="URL">URL</SelectItem>
                        <SelectItem value="PHONE_NUMBER">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Button text"
                      value={btn.text}
                      onChange={(e) => handleButtonChange(index, "text", e.target.value)}
                      maxLength={25}
                    />
                    {btn.type === "URL" && (
                      <Input
                        placeholder="https://..."
                        value={btn.url || ""}
                        onChange={(e) => handleButtonChange(index, "url", e.target.value)}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveButton(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              
              {buttons.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No buttons added. You can add up to 3 buttons.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="py-4">
            <PlatformTemplateEditor
              baseText={bodyText}
              platformFormats={platformFormats as any}
              onPlatformFormatsChange={setPlatformFormats as any}
            />
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {template ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
