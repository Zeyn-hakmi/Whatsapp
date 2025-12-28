import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CannedResponse {
    id: string;
    user_id: string;
    title: string;
    shortcut: string | null;
    content: string;
    category: string;
    is_shared: boolean;
    use_count: number;
    created_at: string;
    updated_at: string;
}

export interface CannedResponseInput {
    title: string;
    shortcut?: string | null;
    content: string;
    category?: string;
    is_shared?: boolean;
}

export interface CannedResponseCategory {
    id: string;
    user_id: string;
    name: string;
    color: string;
    order_index: number;
    created_at: string;
}

export function useCannedResponses() {
    const queryClient = useQueryClient();

    // Fetch canned responses
    const { data: responses = [], isLoading, error } = useQuery({
        queryKey: ["canned-responses"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("canned_responses")
                .select("*")
                .order("use_count", { ascending: false });

            if (error) throw error;
            return data as CannedResponse[];
        },
    });

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ["canned-response-categories"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("canned_response_categories")
                .select("*")
                .order("order_index");

            if (error) throw error;
            return data as CannedResponseCategory[];
        },
    });

    // Create response
    const createResponse = useMutation({
        mutationFn: async (input: CannedResponseInput) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("canned_responses")
                .insert({
                    user_id: user.id,
                    ...input,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
            toast.success("Response saved");
        },
        onError: (error: Error) => {
            toast.error(`Failed to save response: ${error.message}`);
        },
    });

    // Update response
    const updateResponse = useMutation({
        mutationFn: async ({ id, ...input }: Partial<CannedResponseInput> & { id: string }) => {
            const { data, error } = await supabase
                .from("canned_responses")
                .update(input)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
            toast.success("Response updated");
        },
        onError: (error: Error) => {
            toast.error(`Failed to update response: ${error.message}`);
        },
    });

    // Delete response
    const deleteResponse = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("canned_responses")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
            toast.success("Response deleted");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete response: ${error.message}`);
        },
    });

    // Track usage
    const trackUsage = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.rpc("increment_canned_response_count", { response_id: id });
            if (error) {
                // Fallback: update directly
                await supabase
                    .from("canned_responses")
                    .update({ use_count: responses.find(r => r.id === id)?.use_count ?? 0 + 1 })
                    .eq("id", id);
            }
        },
    });

    // Search by shortcut
    const findByShortcut = (shortcut: string) => {
        return responses.find(r => r.shortcut === shortcut);
    };

    // Search responses
    const searchResponses = (query: string) => {
        const lowerQuery = query.toLowerCase();
        return responses.filter(r =>
            r.title.toLowerCase().includes(lowerQuery) ||
            r.content.toLowerCase().includes(lowerQuery) ||
            r.shortcut?.toLowerCase().includes(lowerQuery)
        );
    };

    // Get responses by category
    const getByCategory = (category: string) => {
        return responses.filter(r => r.category === category);
    };

    // Create category
    const createCategory = useMutation({
        mutationFn: async (input: { name: string; color?: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("canned_response_categories")
                .insert({
                    user_id: user.id,
                    name: input.name,
                    color: input.color || '#6366f1',
                    order_index: categories.length,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["canned-response-categories"] });
            toast.success("Category created");
        },
        onError: (error: Error) => {
            toast.error(`Failed to create category: ${error.message}`);
        },
    });

    return {
        responses,
        categories,
        isLoading,
        error,
        createResponse,
        updateResponse,
        deleteResponse,
        trackUsage,
        findByShortcut,
        searchResponses,
        getByCategory,
        createCategory,
    };
}

export default useCannedResponses;
