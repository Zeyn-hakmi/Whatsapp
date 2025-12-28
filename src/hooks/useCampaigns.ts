import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BroadcastCampaign {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
    template_id: string | null;
    template_variables: Record<string, string>;
    segment_ids: string[];
    phone_number_id: string | null;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    read_count: number;
    failed_count: number;
    created_at: string;
    updated_at: string;
}

export interface CampaignInput {
    name: string;
    description?: string | null;
    template_id?: string | null;
    template_variables?: Record<string, string>;
    segment_ids?: string[];
    phone_number_id?: string | null;
    scheduled_at?: string | null;
}

export function useCampaigns() {
    const queryClient = useQueryClient();

    // Fetch campaigns
    const { data: campaigns = [], isLoading, error } = useQuery({
        queryKey: ["campaigns"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("broadcast_campaigns")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as BroadcastCampaign[];
        },
    });

    // Create campaign
    const createCampaign = useMutation({
        mutationFn: async (input: CampaignInput) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("broadcast_campaigns")
                .insert({
                    user_id: user.id,
                    status: 'draft',
                    ...input,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            toast.success("Campaign created");
        },
        onError: (error: Error) => {
            toast.error(`Failed to create campaign: ${error.message}`);
        },
    });

    // Update campaign
    const updateCampaign = useMutation({
        mutationFn: async ({ id, ...input }: Partial<CampaignInput> & { id: string }) => {
            const { data, error } = await supabase
                .from("broadcast_campaigns")
                .update(input)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            toast.success("Campaign updated");
        },
        onError: (error: Error) => {
            toast.error(`Failed to update campaign: ${error.message}`);
        },
    });

    // Delete campaign
    const deleteCampaign = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("broadcast_campaigns")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            toast.success("Campaign deleted");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete campaign: ${error.message}`);
        },
    });

    // Schedule campaign
    const scheduleCampaign = useMutation({
        mutationFn: async ({ id, scheduledAt }: { id: string; scheduledAt: string }) => {
            const { data, error } = await supabase
                .from("broadcast_campaigns")
                .update({
                    status: 'scheduled',
                    scheduled_at: scheduledAt,
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            toast.success("Campaign scheduled");
        },
        onError: (error: Error) => {
            toast.error(`Failed to schedule campaign: ${error.message}`);
        },
    });

    // Start campaign (send now)
    const startCampaign = useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await supabase
                .from("broadcast_campaigns")
                .update({
                    status: 'sending',
                    started_at: new Date().toISOString(),
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            if (error) throw error;

            console.log("Triggering broadcast dispatcher for campaign:", id);

            // Call Broadcast Dispatcher Edge Function
            // We don't await the result indefinitely to keep UI responsive, 
            // but for this MVP let's wait to show immediate success/fail
            try {
                const { data: dispatchData, error: dispatchError } = await supabase.functions.invoke('broadcast-dispatcher', {
                    body: { campaign_id: id }
                });

                if (dispatchError) {
                    throw new Error(`Dispatcher failed: ${dispatchError.message}`);
                }

                console.log("Dispatcher result:", dispatchData);

            } catch (err) {
                console.error("Failed to trigger dispatcher:", err);
                toast.error("Campaign started but dispatcher failed to trigger. Check logs.");
                // Optionally revert status or leave as 'sending' for retry
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            toast.success("Campaign started");
        },
        onError: (error: Error) => {
            toast.error(`Failed to start campaign: ${error.message}`);
        },
    });

    // Pause campaign
    const pauseCampaign = useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await supabase
                .from("broadcast_campaigns")
                .update({ status: 'paused' })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            toast.success("Campaign paused");
        },
        onError: (error: Error) => {
            toast.error(`Failed to pause campaign: ${error.message}`);
        },
    });

    // Cancel campaign
    const cancelCampaign = useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await supabase
                .from("broadcast_campaigns")
                .update({ status: 'cancelled' })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            toast.success("Campaign cancelled");
        },
        onError: (error: Error) => {
            toast.error(`Failed to cancel campaign: ${error.message}`);
        },
    });

    // Get campaign stats
    const stats = {
        total: campaigns.length,
        draft: campaigns.filter(c => c.status === 'draft').length,
        scheduled: campaigns.filter(c => c.status === 'scheduled').length,
        sending: campaigns.filter(c => c.status === 'sending').length,
        sent: campaigns.filter(c => c.status === 'sent').length,
        totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
        totalDelivered: campaigns.reduce((sum, c) => sum + c.delivered_count, 0),
        totalRead: campaigns.reduce((sum, c) => sum + c.read_count, 0),
        totalFailed: campaigns.reduce((sum, c) => sum + c.failed_count, 0),
    };

    return {
        campaigns,
        isLoading,
        error,
        stats,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        scheduleCampaign,
        startCampaign,
        pauseCampaign,
        cancelCampaign,
    };
}

export default useCampaigns;
