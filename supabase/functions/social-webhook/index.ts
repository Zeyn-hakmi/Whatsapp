import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  platform: string;
  userId?: string;
  connectionId?: string;
  // Platform-specific fields
  [key: string]: unknown;
}

// Verify Meta webhook (Instagram/Facebook)
function verifyMetaWebhook(req: Request, url: URL): Response | null {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && challenge) {
    console.log("Meta webhook verification request received");
    return new Response(challenge, { status: 200, headers: corsHeaders });
  }
  return null;
}

// Verify Telegram webhook
async function verifyTelegramWebhook(body: any, secret: string): Promise<boolean> {
  // Telegram doesn't require signature verification for setWebhook
  // But we can verify the secret_token header if provided
  return true;
}

// Process Meta (Instagram/Facebook) message
function processMetaMessage(body: any): WebhookPayload | null {
  try {
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0] || entry?.changes?.[0]?.value?.messages?.[0];

    if (!messaging) return null;

    const platform = body.object === "instagram" ? "instagram" : "facebook";

    return {
      platform,
      senderId: messaging.sender?.id || messaging.from,
      recipientId: messaging.recipient?.id || entry?.id,
      messageId: messaging.message?.mid || messaging.id,
      text: messaging.message?.text || messaging.text?.body,
      timestamp: messaging.timestamp || Date.now(),
      messageType: messaging.message?.attachments ? "media" : "text",
      raw: body,
    };
  } catch (error) {
    console.error("Error processing Meta message:", error);
    return null;
  }
}

// Process Telegram message
function processTelegramMessage(body: any): WebhookPayload | null {
  try {
    const message = body.message || body.edited_message;
    if (!message) return null;

    return {
      platform: "telegram",
      senderId: message.from?.id?.toString(),
      chatId: message.chat?.id?.toString(),
      messageId: message.message_id?.toString(),
      text: message.text,
      timestamp: message.date * 1000,
      messageType: message.photo ? "image" : message.document ? "document" : "text",
      raw: body,
    };
  } catch (error) {
    console.error("Error processing Telegram message:", error);
    return null;
  }
}

// Process Twitter/X DM
function processTwitterMessage(body: any): WebhookPayload | null {
  try {
    const dmEvent = body.direct_message_events?.[0];
    if (!dmEvent || dmEvent.type !== "message_create") return null;

    return {
      platform: "twitter",
      senderId: dmEvent.message_create?.sender_id,
      recipientId: dmEvent.message_create?.target?.recipient_id,
      messageId: dmEvent.id,
      text: dmEvent.message_create?.message_data?.text,
      timestamp: parseInt(dmEvent.created_timestamp),
      messageType: "text",
      raw: body,
    };
  } catch (error) {
    console.error("Error processing Twitter message:", error);
    return null;
  }
}

// Process WhatsApp message (Cloud API)
function processWhatsAppMessage(body: any): WebhookPayload | null {
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return null;

    return {
      platform: "whatsapp",
      senderId: message.from,
      phoneNumberId: value.metadata?.phone_number_id,
      messageId: message.id,
      text: message.text?.body || message.caption,
      timestamp: parseInt(message.timestamp) * 1000,
      messageType: message.type || "text",
      raw: body,
    };
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
    return null;
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const platform = url.pathname.split("/").pop() || url.searchParams.get("platform");

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET requests (webhook verification)
  if (req.method === "GET") {
    // Meta platforms verification
    const metaVerify = verifyMetaWebhook(req, url);
    if (metaVerify) return metaVerify;

    return new Response(JSON.stringify({ status: "ok", message: "Webhook endpoint active" }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Handle POST requests (incoming messages)
  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log(`Received webhook for platform: ${platform}`, JSON.stringify(body).slice(0, 500));

      let processedMessage: WebhookPayload | null = null;

      // Process based on platform or detect from payload
      if (platform === "whatsapp" || body.object === "whatsapp_business_account") {
        processedMessage = processWhatsAppMessage(body);
      } else if (platform === "instagram" || body.object === "instagram") {
        processedMessage = processMetaMessage(body);
      } else if (platform === "facebook" || body.object === "page") {
        processedMessage = processMetaMessage(body);
      } else if (platform === "telegram" || body.update_id) {
        processedMessage = processTelegramMessage(body);
      } else if (platform === "twitter" || body.direct_message_events) {
        processedMessage = processTwitterMessage(body);
      }

      if (!processedMessage) {
        console.log("Could not process message or no message in payload");
        return new Response(JSON.stringify({ status: "ok", processed: false }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Store message in database
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Find the social connection for this platform
      const { data: connections } = await supabase
        .from("social_connections")
        .select("id, user_id, platform")
        .eq("platform", processedMessage.platform)
        .eq("is_active", true);

      if (!connections || connections.length === 0) {
        console.log(`No active connection found for platform: ${processedMessage.platform}`);
        return new Response(JSON.stringify({ status: "ok", processed: false, reason: "no_connection" }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // For each connection, find or create conversation and store message
      for (const connection of connections) {
        const senderId = processedMessage.senderId as string;

        // Find or create conversation
        let { data: conversation } = await supabase
          .from("conversations")
          .select("id")
          .eq("user_id", connection.user_id)
          .eq("contact_phone", senderId)
          .single();

        if (!conversation) {
          const { data: newConv, error: convError } = await supabase
            .from("conversations")
            .insert({
              user_id: connection.user_id,
              contact_phone: senderId,
              contact_name: `${processedMessage.platform} User`,
              status: "active",
              last_message_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (convError) {
            console.error("Error creating conversation:", convError);
            continue;
          }
          conversation = newConv;
        }

        // Store the message
        const { error: msgError } = await supabase
          .from("messages")
          .insert({
            user_id: connection.user_id,
            conversation_id: conversation.id,
            content: processedMessage.text as string,
            direction: "inbound",
            message_type: processedMessage.messageType as string || "text",
            source: processedMessage.platform,
            metadata: {
              platform_message_id: processedMessage.messageId,
              sender_id: senderId,
              raw: processedMessage.raw,
            },
          });

        if (msgError) {
          console.error("Error storing message:", msgError);
        } else {
          console.log(`Message stored for user ${connection.user_id}`);

          // Update conversation last_message_at
          await supabase
            .from("conversations")
            .update({
              last_message_at: new Date().toISOString(),
              unread_count: supabase.rpc("increment_unread", { conv_id: conversation.id })
            })
            .eq("id", conversation.id);

          // ---------------------------------------------------------
          // BOT TRIGGER LOGIC
          // ---------------------------------------------------------

          // Check if conversation is in "bot mode" (assuming default is bot mode unless handed off)
          // You might want to add a 'mode' column to conversations table: 'bot' | 'agent'
          // For now, we assume if no 'agent_id' is assigned, it's bot mode

          if (!conversation.agent_id) {
            // 1. Find active bot for this user/connection
            const { data: activeBot } = await supabase
              .from("bots")
              .select("id")
              .eq("user_id", connection.user_id)
              .eq("status", "active")
              .single();

            if (activeBot) {
              // 2. Find or Create Bot Session
              let { data: session } = await supabase
                .from("bot_sessions")
                .select("*")
                .eq("conversation_id", conversation.id)
                .eq("status", "active")
                .single();

              if (!session) {
                // Start new session
                const { data: newSession, error: sessError } = await supabase
                  .from("bot_sessions")
                  .insert({
                    bot_id: activeBot.id,
                    conversation_id: conversation.id,
                    status: "active",
                    current_node_id: null, // Will start at 'start' node
                    variables: {}
                  })
                  .select()
                  .single();

                if (!sessError) session = newSession;
              }

              if (session) {
                // 3. Trigger Bot Runner (Async Fire-and-Forget)
                // We don't await this to return 200 OK to Meta quickly

                fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/bot-runner`, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    session_id: session.id,
                    bot_id: activeBot.id,
                    contact_id: conversation.contact_id, // Ensure this exists in your schema
                    current_node_id: session.current_node_id,
                    input_text: processedMessage.text
                  })
                }).catch(err => console.error("Failed to trigger bot runner:", err));
              }
            }
          }
          // ---------------------------------------------------------
        }
      }

      return new Response(JSON.stringify({ status: "ok", processed: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } catch (error) {
      console.error("Webhook processing error:", error);
      return new Response(JSON.stringify({ error: "Processing failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});