import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BotContext {
    session_id: string;
    bot_id: string;
    contact_id: string;
    variables: Record<string, any>;
}

interface NodeExecutorResult {
    next_node_id?: string | null;
    stop_execution?: boolean;
    wait_for_input?: boolean;
}

// Node Executors
const executors = {
    // Send a message
    message: async (node: any, context: BotContext, supabase: any): Promise<NodeExecutorResult> => {
        console.log(`[Message Node] Executing node ${node.id}`);

        // Call send-social-message function (internal call)
        // In a real scenario, you might want to call the API directly to avoid double-invocation overhead
        // For now, we'll insert into the messages table and let the dispatcher handle it OR call the send function

        // We'll simulate sending by inserting to DB for now
        await supabase.from("messages").insert({
            conversation_id: context.session_id, // Assuming session maps to conversation for now
            content: node.data.content,
            direction: "outbound",
            source: "bot",
            message_type: "text",
            metadata: { node_id: node.id, bot_id: context.bot_id }
        });

        return { next_node_id: node.data.nextId }; // Typical flow structure needs refinement
    },

    // Evaluate condition
    condition: async (node: any, context: BotContext): Promise<NodeExecutorResult> => {
        console.log(`[Condition Node] Executing node ${node.id}`);
        const { variable, operator, value } = node.data;
        const actualValue = context.variables[variable];

        let result = false;
        switch (operator) {
            case 'equals': result = actualValue == value; break;
            case 'not_equals': result = actualValue != value; break;
            case 'contains': result = String(actualValue).includes(value); break;
            case 'greater_than': result = Number(actualValue) > Number(value); break;
            case 'less_than': result = Number(actualValue) < Number(value); break;
        }

        // Edges should be stored in the flow structure. 
        // This assumes the node data contains correct edge mapping for true/false
        return { next_node_id: result ? node.data.trueHeight : node.data.falseNext };
    },

    // Wait for user input
    input: async (node: any): Promise<NodeExecutorResult> => {
        console.log(`[Input Node] Waiting for input at ${node.id}`);
        return { stop_execution: true, wait_for_input: true };
    }
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { session_id, bot_id, contact_id, current_node_id, input_text } = await req.json();

        // 1. Fetch Bot Flow & Session Data
        const { data: bot } = await supabase.from("bots").select("flow_data").eq("id", bot_id).single();
        if (!bot) throw new Error("Bot not found");

        const { nodes, edges } = bot.flow_data;

        // 2. Find Current Node (or Start Node)
        let currentNodeId = current_node_id;
        if (!currentNodeId) {
            // Find start node
            const startNode = nodes.find((n: any) => n.type === 'start');
            currentNodeId = startNode ? startNode.id : nodes[0]?.id;
        }

        // 3. Execution Loop
        let executionCount = 0;
        const MAX_STEPS = 20; // Prevent infinite loops
        let nextNodeId: string | null | undefined = currentNodeId;

        while (nextNodeId && executionCount < MAX_STEPS) {
            const node = nodes.find((n: any) => n.id === nextNodeId);
            if (!node) break;

            const executor = executors[node.type as keyof typeof executors];
            if (executor) {
                const result = await executor(node, { session_id, bot_id, contact_id, variables: {} }, supabase);

                if (result.stop_execution) {
                    // Update session state
                    break;
                }

                // Find next node from Edges if not explicitly returned
                if (!result.next_node_id) {
                    const edge = edges.find((e: any) => e.source === node.id);
                    nextNodeId = edge?.target;
                } else {
                    nextNodeId = result.next_node_id;
                }
            } else {
                // No executor for this type, just move next
                const edge = edges.find((e: any) => e.source === node.id);
                nextNodeId = edge?.target;
            }

            executionCount++;
        }

        return new Response(JSON.stringify({ success: true, executed_steps: executionCount }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
});
