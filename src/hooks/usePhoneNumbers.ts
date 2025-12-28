import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PhoneNumber {
  id: string;
  user_id: string;
  phone_number: string;
  display_name: string;
  verified_name: string | null;
  quality_rating: "GREEN" | "YELLOW" | "RED" | "UNKNOWN";
  status: "CONNECTED" | "PENDING" | "DISCONNECTED" | "BANNED";
  messaging_limit: string;
  business_account_id: string | null;
  platform: "CLOUD_API" | "ON_PREMISE";
  webhook_url: string | null;
  webhook_verify_token: string | null;
  webhook_enabled: boolean;
  webhook_events: string[];
  created_at: string;
  updated_at: string;
}

export interface PhoneNumberInput {
  phone_number: string;
  display_name: string;
  verified_name?: string;
  business_account_id?: string;
  platform?: "CLOUD_API" | "ON_PREMISE";
  webhook_url?: string;
  webhook_verify_token?: string;
  webhook_enabled?: boolean;
  webhook_events?: string[];
}

export function usePhoneNumbers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: phoneNumbers = [], isLoading, error } = useQuery({
    queryKey: ["phone_numbers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("phone_numbers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PhoneNumber[];
    },
    enabled: !!user,
  });

  const createPhoneNumber = useMutation({
    mutationFn: async (input: PhoneNumberInput) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("phone_numbers")
        .insert({
          user_id: user.id,
          phone_number: input.phone_number,
          display_name: input.display_name,
          verified_name: input.verified_name || null,
          business_account_id: input.business_account_id || null,
          platform: input.platform || "CLOUD_API",
          webhook_url: input.webhook_url || null,
          webhook_verify_token: input.webhook_verify_token || null,
          webhook_enabled: input.webhook_enabled || false,
          webhook_events: input.webhook_events || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone_numbers"] });
      toast.success("Phone number added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updatePhoneNumber = useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<PhoneNumberInput>) => {
      const { data, error } = await supabase
        .from("phone_numbers")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone_numbers"] });
      toast.success("Phone number updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deletePhoneNumber = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("phone_numbers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone_numbers"] });
      toast.success("Phone number removed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    phoneNumbers,
    isLoading,
    error,
    createPhoneNumber,
    updatePhoneNumber,
    deletePhoneNumber,
  };
}
