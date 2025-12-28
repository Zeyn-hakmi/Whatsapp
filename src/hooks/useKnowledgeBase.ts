import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface KnowledgeBaseItem {
    id: string;
    user_id: string;
    ai_agent_id: string | null;
    type: 'document' | 'qa' | 'url' | 'text';
    title: string;
    content: string;
    source_url: string | null;
    file_name: string | null;
    file_type: string | null;
    file_size: number | null;
    status: 'pending' | 'processing' | 'ready' | 'failed';
    error_message: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface KnowledgeBaseInput {
    ai_agent_id?: string | null;
    type: 'document' | 'qa' | 'url' | 'text';
    title: string;
    content: string;
    source_url?: string | null;
    file_name?: string | null;
    file_type?: string | null;
    file_size?: number | null;
    metadata?: Record<string, unknown>;
}

export function useKnowledgeBase(agentId?: string) {
    const queryClient = useQueryClient();

    // Fetch knowledge base items
    const { data: items = [], isLoading, error } = useQuery({
        queryKey: ["knowledge-base", agentId],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            let query = supabase
                .from("knowledge_base")
                .select("*")
                .order("created_at", { ascending: false });

            if (agentId) {
                query = query.eq("ai_agent_id", agentId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as KnowledgeBaseItem[];
        },
    });

    // Create new knowledge item
    const createItem = useMutation({
        mutationFn: async (input: KnowledgeBaseInput) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("knowledge_base")
                .insert({
                    user_id: user.id,
                    ...input,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;

            // Simulate processing (in production, this would trigger an edge function)
            setTimeout(async () => {
                await supabase
                    .from("knowledge_base")
                    .update({ status: 'ready' })
                    .eq("id", data.id);
                queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
            }, 2000);

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
            toast.success("Knowledge item added");
        },
        onError: (error: Error) => {
            toast.error(`Failed to add knowledge item: ${error.message}`);
        },
    });

    // Update knowledge item
    const updateItem = useMutation({
        mutationFn: async ({ id, ...input }: Partial<KnowledgeBaseInput> & { id: string }) => {
            const { data, error } = await supabase
                .from("knowledge_base")
                .update(input)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
            toast.success("Knowledge item updated");
        },
        onError: (error: Error) => {
            toast.error(`Failed to update knowledge item: ${error.message}`);
        },
    });

    // Delete knowledge item
    const deleteItem = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("knowledge_base")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
            toast.success("Knowledge item deleted");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete knowledge item: ${error.message}`);
        },
    });

    // Reprocess failed item
    const reprocessItem = useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await supabase
                .from("knowledge_base")
                .update({
                    status: 'pending',
                    error_message: null,
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            // Simulate reprocessing
            setTimeout(async () => {
                await supabase
                    .from("knowledge_base")
                    .update({ status: 'ready' })
                    .eq("id", id);
                queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
            }, 2000);

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
            toast.success("Reprocessing started");
        },
        onError: (error: Error) => {
            toast.error(`Failed to reprocess: ${error.message}`);
        },
    });

    // Stats
    const stats = {
        total: items.length,
        ready: items.filter(i => i.status === 'ready').length,
        pending: items.filter(i => i.status === 'pending' || i.status === 'processing').length,
        failed: items.filter(i => i.status === 'failed').length,
        byType: {
            document: items.filter(i => i.type === 'document').length,
            qa: items.filter(i => i.type === 'qa').length,
            url: items.filter(i => i.type === 'url').length,
            text: items.filter(i => i.type === 'text').length,
        },
    };

    return {
        items,
        isLoading,
        error,
        stats,
        createItem,
        updateItem,
        deleteItem,
        reprocessItem,
    };
}

export default useKnowledgeBase;
