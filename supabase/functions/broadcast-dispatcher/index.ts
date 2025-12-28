import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { campaign_id } = await req.json();

        if (!campaign_id) {
            throw new Error("campaign_id is required");
        }

        // 1. Fetch Campaign Details
        const { data: campaign, error: campError } = await supabase
            .from("broadcast_campaigns")
            .select("*, message_templates(name, content, language)")
            .eq("id", campaign_id)
            .single();

        if (campError || !campaign) throw new Error("Campaign not found");

        // 2. Update status to 'sending'
        await supabase.from("broadcast_campaigns").update({ status: "sending", started_at: new Date().toISOString() }).eq("id", campaign_id);

        // 3. Resolve Contacts from Segments
        // Assuming static segments for now using contact_segment_members
        const { data: members, error: memError } = await supabase
            .from("contact_segment_members")
            .select("contact_id")
            .in("segment_id", campaign.segment_ids);

        if (memError) throw new Error("Failed to fetch segment members");

        // Get unique contact IDs
        const contactIds = [...new Set(members.map(m => m.contact_id))];

        // Fetch Contact Details (Phone Numbers) and Platform info
        const { data: contacts, error: contError } = await supabase
            .from("contacts")
            .select("id, phone, name") // Assuming 'phone' field exists on contacts
            .in("id", contactIds);

        if (contError) throw new Error("Failed to fetch contacts");

        // 4. Send Messages
        let sentCount = 0;
        let failedCount = 0;

        for (const contact of contacts) {
            try {
                // Find appropriate channel/connection for this user (sender)
                // For now, defaulting to 'whatsapp' or using campaign.phone_number_id if available
                // In a real scenario, you'd match the contact's preferred channel
                const platform = "whatsapp";

                // Insert into campaign_recipients as 'pending'
                const { data: recipient, error: recError } = await supabase
                    .from("campaign_recipients")
                    .insert({
                        campaign_id: campaign.id,
                        contact_id: contact.id,
                        status: "pending"
                    })
                    .select()
                    .single();

                if (recError) {
                    console.error("Failed to track recipient", recError);
                    continue;
                }

                // Call send-social-message
                // We invoke it directly to reuse logic
                const { data: sendResult, error: sendError } = await supabase.functions.invoke('send-social-message', {
                    body: {
                        platform: platform,
                        recipientId: contact.phone,
                        message: {
                            type: "template",
                            template: {
                                name: campaign.message_templates?.name,
                                language: { code: campaign.message_templates?.language || "en" },
                                components: [] // Add variable logic here if needed from campaign.template_variables
                            }
                        }
                    }
                });

                if (sendError) {
                    throw new Error(sendError.message);
                }

                // Update recipient status
                await supabase
                    .from("campaign_recipients")
                    .update({
                        status: "sent",
                        sent_at: new Date().toISOString()
                        // message_id: sendResult.messageId 
                    })
                    .eq("id", recipient.id);

                sentCount++;

            } catch (err) {
                console.error(`Failed to send to contact ${contact.id}:`, err);
                failedCount++;
                // Update recipient status to failed
                await supabase
                    .from("campaign_recipients")
                    .update({
                        status: "failed",
                        error_message: String(err)
                    })
                    .eq("contact_id", contact.id)
                    .eq("campaign_id", campaign.id);
            }
        }

        // 5. Update Campaign Completion
        await supabase.from("broadcast_campaigns").update({
            status: "sent",
            completed_at: new Date().toISOString(),
            sent_count: sentCount,
            failed_count: failedCount
        }).eq("id", campaign_id);

        return new Response(JSON.stringify({
            success: true,
            total: contacts.length,
            sent: sentCount,
            failed: failedCount
        }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
});
