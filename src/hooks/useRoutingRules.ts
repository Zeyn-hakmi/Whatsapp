import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface RoutingRule {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    priority: number;
    type: 'round_robin' | 'skills_based' | 'availability' | 'load_balanced';
    conditions: RoutingCondition[];
    target_agents: string[];
    target_skill?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface RoutingCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'starts_with';
    value: string;
}

export interface AgentSkill {
    id: string;
    user_id: string;
    agent_id: string;
    skill: string;
    proficiency: 'beginner' | 'intermediate' | 'expert';
    created_at: string;
}

export interface AgentAvailability {
    id: string;
    agent_id: string;
    status: 'online' | 'away' | 'busy' | 'offline';
    max_concurrent_chats: number;
    current_chat_count: number;
    last_updated: string;
}

export function useRoutingRules() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Get all routing rules
    const { data: rules = [], isLoading, error } = useQuery({
        queryKey: ['routingRules'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('routing_rules' as any)
                .select('*')
                .order('priority', { ascending: true });

            if (error) throw error;
            return (data || []) as RoutingRule[];
        },
    });

    // Get agent skills
    const useAgentSkills = (agentId?: string) => {
        return useQuery({
            queryKey: ['agentSkills', agentId],
            queryFn: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                let query = supabase
                    .from('agent_skills' as any)
                    .select('*');

                if (agentId) {
                    query = query.eq('agent_id', agentId);
                }

                const { data, error } = await query;
                if (error) throw error;
                return (data || []) as AgentSkill[];
            },
        });
    };

    // Get all unique skills
    const useAllSkills = () => {
        return useQuery({
            queryKey: ['allSkills'],
            queryFn: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data, error } = await supabase
                    .from('agent_skills' as any)
                    .select('skill');

                if (error) throw error;
                const uniqueSkills = [...new Set((data || []).map((s: any) => s.skill))];
                return uniqueSkills as string[];
            },
        });
    };

    // Create routing rule
    const createRule = useMutation({
        mutationFn: async (rule: Omit<RoutingRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('routing_rules' as any)
                .insert({
                    ...rule,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data as RoutingRule;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routingRules'] });
            toast({ title: "Routing rule created" });
        },
        onError: (error: Error) => {
            toast({ title: "Error creating rule", description: error.message, variant: "destructive" });
        },
    });

    // Update routing rule
    const updateRule = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<RoutingRule> & { id: string }) => {
            const { data, error } = await supabase
                .from('routing_rules' as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as RoutingRule;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routingRules'] });
            toast({ title: "Rule updated" });
        },
        onError: (error: Error) => {
            toast({ title: "Error updating rule", description: error.message, variant: "destructive" });
        },
    });

    // Delete routing rule
    const deleteRule = useMutation({
        mutationFn: async (ruleId: string) => {
            const { error } = await supabase
                .from('routing_rules' as any)
                .delete()
                .eq('id', ruleId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routingRules'] });
            toast({ title: "Rule deleted" });
        },
        onError: (error: Error) => {
            toast({ title: "Error deleting rule", description: error.message, variant: "destructive" });
        },
    });

    // Add skill to agent
    const addAgentSkill = useMutation({
        mutationFn: async (skill: Omit<AgentSkill, 'id' | 'user_id' | 'created_at'>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('agent_skills' as any)
                .insert({
                    ...skill,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data as AgentSkill;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agentSkills'] });
            queryClient.invalidateQueries({ queryKey: ['allSkills'] });
            toast({ title: "Skill added to agent" });
        },
        onError: (error: Error) => {
            toast({ title: "Error adding skill", description: error.message, variant: "destructive" });
        },
    });

    // Remove skill from agent
    const removeAgentSkill = useMutation({
        mutationFn: async (skillId: string) => {
            const { error } = await supabase
                .from('agent_skills' as any)
                .delete()
                .eq('id', skillId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agentSkills'] });
            queryClient.invalidateQueries({ queryKey: ['allSkills'] });
            toast({ title: "Skill removed from agent" });
        },
        onError: (error: Error) => {
            toast({ title: "Error removing skill", description: error.message, variant: "destructive" });
        },
    });

    return {
        rules,
        isLoading,
        error,
        useAgentSkills,
        useAllSkills,
        createRule,
        updateRule,
        deleteRule,
        addAgentSkill,
        removeAgentSkill,
    };
}
