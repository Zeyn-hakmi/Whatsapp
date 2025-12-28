import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ContactSegment {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    color: string;
    is_dynamic: boolean;
    contact_count: number;
    created_at: string;
    updated_at: string;
}

export interface SegmentRule {
    id: string;
    segment_id: string;
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | 'in_list';
    value: string | null;
    value_list: string[] | null;
    logic: 'AND' | 'OR';
    order_index: number;
}

export interface SegmentInput {
    name: string;
    description?: string | null;
    color?: string;
    is_dynamic?: boolean;
    rules?: Omit<SegmentRule, 'id' | 'segment_id'>[];
}

export function useSegments() {
    const queryClient = useQueryClient();

    // Fetch segments
    const { data: segments = [], isLoading, error } = useQuery({
        queryKey: ["segments"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("contact_segments")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as ContactSegment[];
        },
    });

    // Fetch segment with rules
    const getSegmentWithRules = async (segmentId: string) => {
        const { data: segment } = await supabase
            .from("contact_segments")
            .select("*")
            .eq("id", segmentId)
            .single();

        const { data: rules } = await supabase
            .from("segment_rules")
            .select("*")
            .eq("segment_id", segmentId)
            .order("order_index");

        return { segment, rules };
    };

    // Create segment
    const createSegment = useMutation({
        mutationFn: async (input: SegmentInput) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { rules, ...segmentData } = input;

            // Create segment
            const { data: segment, error: segmentError } = await supabase
                .from("contact_segments")
                .insert({
                    user_id: user.id,
                    ...segmentData,
                })
                .select()
                .single();

            if (segmentError) throw segmentError;

            // Create rules if any
            if (rules && rules.length > 0 && segment) {
                const { error: rulesError } = await supabase
                    .from("segment_rules")
                    .insert(
                        rules.map((rule, index) => ({
                            segment_id: segment.id,
                            ...rule,
                            order_index: index,
                        }))
                    );

                if (rulesError) throw rulesError;
            }

            return segment;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["segments"] });
            toast.success("Segment created");
        },
        onError: (error: Error) => {
            toast.error(`Failed to create segment: ${error.message}`);
        },
    });

    // Update segment
    const updateSegment = useMutation({
        mutationFn: async ({ id, ...input }: Partial<SegmentInput> & { id: string }) => {
            const { rules, ...segmentData } = input;

            const { data, error } = await supabase
                .from("contact_segments")
                .update(segmentData)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            // Update rules if provided
            if (rules !== undefined) {
                // Delete existing rules
                await supabase
                    .from("segment_rules")
                    .delete()
                    .eq("segment_id", id);

                // Insert new rules
                if (rules.length > 0) {
                    await supabase
                        .from("segment_rules")
                        .insert(
                            rules.map((rule, index) => ({
                                segment_id: id,
                                ...rule,
                                order_index: index,
                            }))
                        );
                }
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["segments"] });
            toast.success("Segment updated");
        },
        onError: (error: Error) => {
            toast.error(`Failed to update segment: ${error.message}`);
        },
    });

    // Delete segment
    const deleteSegment = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("contact_segments")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["segments"] });
            toast.success("Segment deleted");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete segment: ${error.message}`);
        },
    });

    // Add contact to segment
    const addContactToSegment = useMutation({
        mutationFn: async ({ segmentId, contactId }: { segmentId: string; contactId: string }) => {
            const { error } = await supabase
                .from("contact_segment_members")
                .insert({ segment_id: segmentId, contact_id: contactId });

            if (error) throw error;

            // Update contact count
            await supabase.rpc("increment_segment_count", { segment_id: segmentId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["segments"] });
            toast.success("Contact added to segment");
        },
        onError: (error: Error) => {
            toast.error(`Failed to add contact: ${error.message}`);
        },
    });

    // Remove contact from segment
    const removeContactFromSegment = useMutation({
        mutationFn: async ({ segmentId, contactId }: { segmentId: string; contactId: string }) => {
            const { error } = await supabase
                .from("contact_segment_members")
                .delete()
                .eq("segment_id", segmentId)
                .eq("contact_id", contactId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["segments"] });
            toast.success("Contact removed from segment");
        },
        onError: (error: Error) => {
            toast.error(`Failed to remove contact: ${error.message}`);
        },
    });

    return {
        segments,
        isLoading,
        error,
        createSegment,
        updateSegment,
        deleteSegment,
        getSegmentWithRules,
        addContactToSegment,
        removeContactFromSegment,
    };
}

export default useSegments;
