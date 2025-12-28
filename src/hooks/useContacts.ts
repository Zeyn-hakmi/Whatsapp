import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/activity-logger";
import { useTeamAccess } from "@/hooks/useTeamAccess";

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  tags: string[];
  custom_fields: Record<string, string>;
  opt_in_status: "opted_in" | "opted_out" | "pending";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactInput {
  name: string;
  phone: string;
  email?: string;
  tags?: string[];
  custom_fields?: Record<string, string>;
  opt_in_status?: "opted_in" | "opted_out" | "pending";
  notes?: string;
}

export function useContacts() {
  const { user } = useAuth();
  const { getEffectiveUserId, hasPermission } = useTeamAccess();
  const queryClient = useQueryClient();
  
  const effectiveUserId = getEffectiveUserId();

  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ["contacts", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((c) => ({
        ...c,
        custom_fields: (c.custom_fields as Record<string, string>) || {},
      })) as Contact[];
    },
    enabled: !!effectiveUserId,
  });

  const createContact = useMutation({
    mutationFn: async (input: ContactInput) => {
      if (!user || !effectiveUserId) throw new Error("Not authenticated");
      if (!hasPermission("canEditContacts")) throw new Error("You don't have permission to create contacts");
      
      const { data, error } = await supabase
        .from("contacts")
        .insert({
          user_id: effectiveUserId,
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          tags: input.tags || [],
          custom_fields: (input.custom_fields || {}) as Json,
          opt_in_status: input.opt_in_status || "pending",
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity(user.id, "contact_created", "contact", data.id, { name: input.name, phone: input.phone });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateContact = useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<ContactInput>) => {
      if (!user) throw new Error("Not authenticated");
      if (!hasPermission("canEditContacts")) throw new Error("You don't have permission to edit contacts");
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.email !== undefined) updateData.email = input.email || null;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.custom_fields !== undefined) updateData.custom_fields = input.custom_fields as Json;
      if (input.opt_in_status !== undefined) updateData.opt_in_status = input.opt_in_status;
      if (input.notes !== undefined) updateData.notes = input.notes || null;

      const { data, error } = await supabase
        .from("contacts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await logActivity(user.id, "contact_updated", "contact", id, { changes: Object.keys(updateData) });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      if (!hasPermission("canEditContacts")) throw new Error("You don't have permission to delete contacts");
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await logActivity(user.id, "contact_deleted", "contact", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact removed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const createManyContacts = useMutation({
    mutationFn: async (inputs: ContactInput[]) => {
      if (!user || !effectiveUserId) throw new Error("Not authenticated");
      if (!hasPermission("canEditContacts")) throw new Error("You don't have permission to import contacts");
      
      const { data, error } = await supabase
        .from("contacts")
        .insert(
          inputs.map((input) => ({
            user_id: effectiveUserId,
            name: input.name,
            phone: input.phone,
            email: input.email || null,
            tags: input.tags || [],
            custom_fields: (input.custom_fields || {}) as Json,
            opt_in_status: input.opt_in_status || "pending",
            notes: input.notes || null,
          }))
        )
        .select();

      if (error) throw error;

      await logActivity(user.id, "contact_created", "contact", null, { imported_count: inputs.length });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success(`Imported ${data.length} contacts`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    contacts,
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
    createManyContacts,
  };
}
