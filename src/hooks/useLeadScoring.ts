import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface LeadScore {
    id: string;
    contact_id: string;
    score: number;
    factors: LeadScoreFactor[];
    last_calculated_at: string;
    created_at: string;
    updated_at: string;
}

export interface LeadScoreFactor {
    name: string;
    value: number;
    weight: number;
    contribution: number;
}

export interface LeadScoringRule {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_set' | 'is_not_set';
    value?: string;
    score_change: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export function useLeadScoring() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Get lead score for a contact
    const useContactScore = (contactId: string) => {
        return useQuery({
            queryKey: ['leadScore', contactId],
            queryFn: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data, error } = await supabase
                    .from('lead_scores' as any)
                    .select('*')
                    .eq('contact_id', contactId)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                return data as LeadScore | null;
            },
            enabled: !!contactId,
        });
    };

    // Get all scoring rules
    const useScoringRules = () => {
        return useQuery({
            queryKey: ['leadScoringRules'],
            queryFn: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data, error } = await supabase
                    .from('lead_scoring_rules' as any)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return (data || []) as LeadScoringRule[];
            },
        });
    };

    // Create scoring rule
    const createRule = useMutation({
        mutationFn: async (rule: Omit<LeadScoringRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('lead_scoring_rules' as any)
                .insert({
                    ...rule,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data as LeadScoringRule;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leadScoringRules'] });
            toast({ title: "Scoring rule created" });
        },
        onError: (error: Error) => {
            toast({ title: "Error creating rule", description: error.message, variant: "destructive" });
        },
    });

    // Update scoring rule
    const updateRule = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<LeadScoringRule> & { id: string }) => {
            const { data, error } = await supabase
                .from('lead_scoring_rules' as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as LeadScoringRule;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leadScoringRules'] });
            toast({ title: "Rule updated" });
        },
        onError: (error: Error) => {
            toast({ title: "Error updating rule", description: error.message, variant: "destructive" });
        },
    });

    // Delete scoring rule
    const deleteRule = useMutation({
        mutationFn: async (ruleId: string) => {
            const { error } = await supabase
                .from('lead_scoring_rules' as any)
                .delete()
                .eq('id', ruleId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leadScoringRules'] });
            toast({ title: "Rule deleted" });
        },
        onError: (error: Error) => {
            toast({ title: "Error deleting rule", description: error.message, variant: "destructive" });
        },
    });

    // Recalculate score for a contact
    const recalculateScore = useMutation({
        mutationFn: async (contactId: string) => {
            // In a real implementation, this would call an Edge Function
            // For now, we simulate score calculation
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Simulate calculation with mock score
            const newScore = Math.floor(Math.random() * 100);

            const { data, error } = await supabase
                .from('lead_scores' as any)
                .upsert({
                    contact_id: contactId,
                    user_id: user.id,
                    score: newScore,
                    factors: [
                        { name: 'Message Activity', value: 10, weight: 0.3, contribution: 3 },
                        { name: 'Response Rate', value: 8, weight: 0.25, contribution: 2 },
                        { name: 'Engagement', value: 7, weight: 0.25, contribution: 1.75 },
                        { name: 'Profile Completeness', value: 9, weight: 0.2, contribution: 1.8 },
                    ],
                    last_calculated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            return data as LeadScore;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['leadScore', data.contact_id] });
            toast({ title: "Score recalculated" });
        },
        onError: (error: Error) => {
            toast({ title: "Error calculating score", description: error.message, variant: "destructive" });
        },
    });

    // Get scoring rules statistics
    const getScoringStats = () => {
        const rules = useScoringRules();
        const activeRules = rules.data?.filter(r => r.is_active).length || 0;
        const totalRules = rules.data?.length || 0;

        return {
            totalRules,
            activeRules,
            isLoading: rules.isLoading,
        };
    };

    return {
        useContactScore,
        useScoringRules,
        createRule,
        updateRule,
        deleteRule,
        recalculateScore,
        getScoringStats,
    };
}
