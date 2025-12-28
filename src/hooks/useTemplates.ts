import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/activity-logger";
import { toast } from "sonner";
import { useTeamAccess } from "@/hooks/useTeamAccess";

export interface TemplateButton {
  type: string;
  text: string;
  url?: string;
  phone_number?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  language: string | null;
  status: string | null;
  header_type: string | null;
  header_content: string | null;
  body_text: string;
  footer_text: string | null;
  buttons: TemplateButton[] | null;
  variables: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateInput {
  name: string;
  category: string;
  language?: string;
  header_type?: string | null;
  header_content?: string | null;
  body_text: string;
  footer_text?: string | null;
  buttons?: TemplateButton[] | null;
  variables?: string[] | null;
}

export function useTemplates() {
  const { user } = useAuth();
  const { getEffectiveUserId, hasPermission } = useTeamAccess();
  const queryClient = useQueryClient();

  const effectiveUserId = getEffectiveUserId();

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ["templates", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data.map(t => ({
        ...t,
        buttons: Array.isArray(t.buttons) ? t.buttons as unknown as TemplateButton[] : null,
      })) as Template[];
    },
    enabled: !!effectiveUserId,
  });

  const createTemplate = useMutation({
    mutationFn: async (input: TemplateInput) => {
      if (!user || !effectiveUserId) throw new Error("User not authenticated");
      if (!hasPermission("canEditTemplates")) throw new Error("You don't have permission to create templates");
      
      const { data, error } = await supabase
        .from("message_templates")
        .insert({ 
          ...input, 
          user_id: effectiveUserId,
          buttons: input.buttons as unknown as Json,
        })
        .select()
        .single();
      
      if (error) throw error;

      await logActivity(user.id, "template_created", "template", data.id, { name: input.name, category: input.category });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", effectiveUserId] });
      toast.success("Template created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TemplateInput> & { id: string }) => {
      if (!user) throw new Error("User not authenticated");
      if (!hasPermission("canEditTemplates")) throw new Error("You don't have permission to edit templates");
      
      const { data, error } = await supabase
        .from("message_templates")
        .update({
          ...updates,
          buttons: updates.buttons as unknown as Json,
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;

      await logActivity(user.id, "template_updated", "template", id, { changes: Object.keys(updates) });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", effectiveUserId] });
      toast.success("Template updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      if (!hasPermission("canEditTemplates")) throw new Error("You don't have permission to delete templates");
      
      const { error } = await supabase
        .from("message_templates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;

      await logActivity(user.id, "template_deleted", "template", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", effectiveUserId] });
      toast.success("Template deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
