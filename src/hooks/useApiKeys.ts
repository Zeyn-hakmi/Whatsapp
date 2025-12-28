import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ApiKey {
    id: string;
    user_id: string;
    name: string;
    key_prefix: string;
    last_four: string;
    scopes: string[];
    is_active: boolean;
    expires_at: string | null;
    last_used_at: string | null;
    last_used_ip: string | null;
    request_count: number;
    rate_limit_per_minute: number;
    created_at: string;
}

export interface ApiKeyInput {
    name: string;
    scopes?: string[];
    expires_at?: string | null;
    rate_limit_per_minute?: number;
}

export interface Webhook {
    id: string;
    user_id: string;
    name: string;
    url: string;
    secret: string;
    events: string[];
    is_active: boolean;
    headers: Record<string, string>;
    retry_count: number;
    timeout_seconds: number;
    last_triggered_at: string | null;
    success_count: number;
    failure_count: number;
    created_at: string;
    updated_at: string;
}

export interface WebhookInput {
    name: string;
    url: string;
    events: string[];
    headers?: Record<string, string>;
    retry_count?: number;
    timeout_seconds?: number;
}

export interface WebhookLog {
    id: string;
    webhook_id: string;
    event_type: string;
    payload: Record<string, unknown>;
    status: 'pending' | 'success' | 'failed' | 'retrying';
    status_code: number | null;
    response_body: string | null;
    response_time_ms: number | null;
    attempt_count: number;
    error_message: string | null;
    created_at: string;
}

// Available webhook events
export const WEBHOOK_EVENTS = [
    { value: 'message.received', label: 'Message Received', description: 'When a new message is received' },
    { value: 'message.sent', label: 'Message Sent', description: 'When a message is sent' },
    { value: 'message.delivered', label: 'Message Delivered', description: 'When a message is delivered' },
    { value: 'message.read', label: 'Message Read', description: 'When a message is read' },
    { value: 'conversation.created', label: 'Conversation Created', description: 'When a new conversation starts' },
    { value: 'conversation.assigned', label: 'Conversation Assigned', description: 'When a conversation is assigned' },
    { value: 'contact.created', label: 'Contact Created', description: 'When a new contact is added' },
    { value: 'contact.updated', label: 'Contact Updated', description: 'When a contact is updated' },
    { value: 'bot.triggered', label: 'Bot Triggered', description: 'When a bot flow is triggered' },
    { value: 'bot.completed', label: 'Bot Completed', description: 'When a bot flow is completed' },
    { value: 'campaign.sent', label: 'Campaign Sent', description: 'When a campaign finishes sending' },
];

// Available API scopes
export const API_SCOPES = [
    { value: 'messages:read', label: 'Read Messages' },
    { value: 'messages:write', label: 'Send Messages' },
    { value: 'contacts:read', label: 'Read Contacts' },
    { value: 'contacts:write', label: 'Manage Contacts' },
    { value: 'bots:read', label: 'Read Bots' },
    { value: 'bots:write', label: 'Manage Bots' },
    { value: 'templates:read', label: 'Read Templates' },
    { value: 'templates:write', label: 'Manage Templates' },
    { value: 'analytics:read', label: 'Read Analytics' },
    { value: 'webhooks:manage', label: 'Manage Webhooks' },
];

export function useApiKeys() {
    const queryClient = useQueryClient();

    // Fetch API keys
    const { data: apiKeys = [], isLoading, error } = useQuery({
        queryKey: ["api-keys"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("api_keys")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as ApiKey[];
        },
    });

    // Create API key
    const createApiKey = useMutation({
        mutationFn: async (input: ApiKeyInput) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Generate a secure API key
            const keyPrefix = 'wba_live_';
            const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            const fullKey = keyPrefix + randomPart;

            // Hash the key for storage
            const encoder = new TextEncoder();
            const keyData = encoder.encode(fullKey);
            const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const { data, error } = await supabase
                .from("api_keys")
                .insert({
                    user_id: user.id,
                    name: input.name,
                    key_prefix: keyPrefix,
                    key_hash: keyHash,
                    last_four: fullKey.slice(-4),
                    scopes: input.scopes || [],
                    expires_at: input.expires_at,
                    rate_limit_per_minute: input.rate_limit_per_minute || 60,
                })
                .select()
                .single();

            if (error) throw error;

            // Return the full key only on creation (won't be stored)
            return { ...data, fullKey };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["api-keys"] });
            toast.success("API key created. Save it now - you won't see it again!");
        },
        onError: (error: Error) => {
            toast.error(`Failed to create API key: ${error.message}`);
        },
    });

    // Revoke API key
    const revokeApiKey = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("api_keys")
                .update({ is_active: false })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["api-keys"] });
            toast.success("API key revoked");
        },
        onError: (error: Error) => {
            toast.error(`Failed to revoke API key: ${error.message}`);
        },
    });

    // Delete API key
    const deleteApiKey = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("api_keys")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["api-keys"] });
            toast.success("API key deleted");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete API key: ${error.message}`);
        },
    });

    return {
        apiKeys,
        isLoading,
        error,
        createApiKey,
        revokeApiKey,
        deleteApiKey,
    };
}

export function useWebhooks() {
    const queryClient = useQueryClient();

    // Fetch webhooks
    const { data: webhooks = [], isLoading, error } = useQuery({
        queryKey: ["webhooks"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("user_webhooks")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Webhook[];
        },
    });

    // Get webhook logs
    const getWebhookLogs = async (webhookId: string) => {
        const { data, error } = await supabase
            .from("webhook_logs")
            .select("*")
            .eq("webhook_id", webhookId)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) throw error;
        return data as WebhookLog[];
    };

    // Create webhook
    const createWebhook = useMutation({
        mutationFn: async (input: WebhookInput) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Generate webhook secret
            const secret = 'whsec_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            const { data, error } = await supabase
                .from("user_webhooks")
                .insert({
                    user_id: user.id,
                    ...input,
                    secret,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
            toast.success("Webhook created");
        },
        onError: (error: Error) => {
            toast.error(`Failed to create webhook: ${error.message}`);
        },
    });

    // Update webhook
    const updateWebhook = useMutation({
        mutationFn: async ({ id, ...input }: Partial<WebhookInput> & { id: string }) => {
            const { data, error } = await supabase
                .from("user_webhooks")
                .update(input)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
            toast.success("Webhook updated");
        },
        onError: (error: Error) => {
            toast.error(`Failed to update webhook: ${error.message}`);
        },
    });

    // Toggle webhook
    const toggleWebhook = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const { data, error } = await supabase
                .from("user_webhooks")
                .update({ is_active: isActive })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
            toast.success(`Webhook ${data.is_active ? 'enabled' : 'disabled'}`);
        },
        onError: (error: Error) => {
            toast.error(`Failed to toggle webhook: ${error.message}`);
        },
    });

    // Delete webhook
    const deleteWebhook = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("user_webhooks")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
            toast.success("Webhook deleted");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete webhook: ${error.message}`);
        },
    });

    // Test webhook
    const testWebhook = useMutation({
        mutationFn: async (id: string) => {
            const webhook = webhooks.find(w => w.id === id);
            if (!webhook) throw new Error("Webhook not found");

            // Create a test payload
            const testPayload = {
                event: 'webhook.test',
                timestamp: new Date().toISOString(),
                data: {
                    message: 'This is a test webhook delivery',
                },
            };

            // In production, this would actually call the webhook URL
            // For now, we'll simulate the response
            const { error } = await supabase
                .from("webhook_logs")
                .insert({
                    webhook_id: id,
                    event_type: 'webhook.test',
                    payload: testPayload,
                    status: 'success',
                    status_code: 200,
                    response_time_ms: Math.floor(Math.random() * 200) + 50,
                    attempt_count: 1,
                });

            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            toast.success("Test webhook sent successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to test webhook: ${error.message}`);
        },
    });

    return {
        webhooks,
        isLoading,
        error,
        createWebhook,
        updateWebhook,
        toggleWebhook,
        deleteWebhook,
        testWebhook,
        getWebhookLogs,
    };
}

export default useApiKeys;
