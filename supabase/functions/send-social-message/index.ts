import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendMessageRequest {
  platform: string;
  recipientId: string;
  message: {
    text?: string;
    buttons?: Array<{
      type: string;
      title: string;
      payload?: string;
      url?: string;
    }>;
    quickReplies?: Array<{
      title: string;
      payload: string;
    }>;
    media?: {
      type: "image" | "video" | "document" | "audio";
      url: string;
      caption?: string;
    };
  };
  connectionId?: string;
}

// Send WhatsApp message via Cloud API
async function sendWhatsAppMessage(
  accessToken: string,
  phoneNumberId: string,
  recipientId: string,
  message: SendMessageRequest["message"]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const payload: any = {
      messaging_product: "whatsapp",
      to: recipientId,
      type: message.media ? message.media.type : "text",
    };

    if (message.text && !message.media) {
      payload.text = { body: message.text };
    }

    if (message.buttons && message.buttons.length > 0) {
      payload.type = "interactive";
      payload.interactive = {
        type: "button",
        body: { text: message.text || "" },
        action: {
          buttons: message.buttons.slice(0, 3).map((btn, idx) => ({
            type: "reply",
            reply: { id: `btn_${idx}`, title: btn.title.slice(0, 20) },
          })),
        },
      };
    }

    if (message.media) {
      payload[message.media.type] = { link: message.media.url };
      if (message.media.caption) {
        payload[message.media.type].caption = message.media.caption;
      }
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    }
    return { success: false, error: JSON.stringify(data) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Send Instagram message via Graph API
async function sendInstagramMessage(
  accessToken: string,
  igUserId: string,
  recipientId: string,
  message: SendMessageRequest["message"]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const payload: any = {
      recipient: { id: recipientId },
      message: {},
    };

    if (message.text) {
      payload.message.text = message.text.slice(0, 1000);
    }

    if (message.quickReplies && message.quickReplies.length > 0) {
      payload.message.quick_replies = message.quickReplies.slice(0, 13).map((qr) => ({
        content_type: "text",
        title: qr.title.slice(0, 20),
        payload: qr.payload,
      }));
    }

    if (message.media) {
      payload.message.attachment = {
        type: message.media.type === "image" ? "image" : "file",
        payload: { url: message.media.url, is_reusable: true },
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (data.message_id) {
      return { success: true, messageId: data.message_id };
    }
    return { success: false, error: JSON.stringify(data) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Send Facebook Messenger message
async function sendFacebookMessage(
  accessToken: string,
  pageId: string,
  recipientId: string,
  message: SendMessageRequest["message"]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const payload: any = {
      recipient: { id: recipientId },
      message: {},
    };

    if (message.text) {
      payload.message.text = message.text.slice(0, 2000);
    }

    if (message.buttons && message.buttons.length > 0) {
      payload.message = {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: message.text || "Choose an option",
            buttons: message.buttons.slice(0, 3).map((btn) => {
              if (btn.url) {
                return { type: "web_url", url: btn.url, title: btn.title };
              }
              return { type: "postback", payload: btn.payload, title: btn.title };
            }),
          },
        },
      };
    }

    if (message.quickReplies && message.quickReplies.length > 0) {
      payload.message.quick_replies = message.quickReplies.slice(0, 13).map((qr) => ({
        content_type: "text",
        title: qr.title.slice(0, 20),
        payload: qr.payload,
      }));
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (data.message_id) {
      return { success: true, messageId: data.message_id };
    }
    return { success: false, error: JSON.stringify(data) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Send Telegram message
async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: SendMessageRequest["message"]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    let method = "sendMessage";
    const payload: any = { chat_id: chatId };

    if (message.media) {
      switch (message.media.type) {
        case "image":
          method = "sendPhoto";
          payload.photo = message.media.url;
          if (message.media.caption) payload.caption = message.media.caption;
          break;
        case "video":
          method = "sendVideo";
          payload.video = message.media.url;
          if (message.media.caption) payload.caption = message.media.caption;
          break;
        case "document":
          method = "sendDocument";
          payload.document = message.media.url;
          if (message.media.caption) payload.caption = message.media.caption;
          break;
        case "audio":
          method = "sendAudio";
          payload.audio = message.media.url;
          if (message.media.caption) payload.caption = message.media.caption;
          break;
      }
    } else {
      payload.text = message.text;
    }

    if (message.buttons && message.buttons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: message.buttons.map((btn) => [
          btn.url
            ? { text: btn.title, url: btn.url }
            : { text: btn.title, callback_data: btn.payload || btn.title },
        ]),
      };
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, messageId: data.result?.message_id?.toString() };
    }
    return { success: false, error: data.description };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Send Twitter/X DM (requires OAuth 1.0a which is complex, simplified here)
async function sendTwitterMessage(
  bearerToken: string,
  recipientId: string,
  message: SendMessageRequest["message"]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const payload = {
      event: {
        type: "message_create",
        message_create: {
          target: { recipient_id: recipientId },
          message_data: { text: message.text?.slice(0, 280) || "" },
        },
      },
    };

    const response = await fetch("https://api.twitter.com/1.1/direct_messages/events/new.json", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.event?.id) {
      return { success: true, messageId: data.event.id };
    }
    return { success: false, error: JSON.stringify(data) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header to identify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { platform, recipientId, message, connectionId }: SendMessageRequest = await req.json();

    if (!platform || !recipientId || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the user's connection for this platform
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let query = supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .eq("is_active", true);

    if (connectionId) {
      query = query.eq("id", connectionId);
    }

    const { data: connection, error: connError } = await query.single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: "No active connection found for platform" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let result: { success: boolean; messageId?: string; error?: string };

    switch (platform) {
      case "whatsapp":
        result = await sendWhatsAppMessage(
          connection.access_token,
          connection.platform_user_id || "",
          recipientId,
          message
        );
        break;
      case "instagram":
        result = await sendInstagramMessage(
          connection.access_token,
          connection.platform_user_id || "",
          recipientId,
          message
        );
        break;
      case "facebook":
        result = await sendFacebookMessage(
          connection.access_token,
          connection.platform_user_id || "",
          recipientId,
          message
        );
        break;
      case "telegram":
        result = await sendTelegramMessage(
          connection.access_token,
          recipientId,
          message
        );
        break;
      case "twitter":
        result = await sendTwitterMessage(
          connection.access_token,
          recipientId,
          message
        );
        break;
      default:
        return new Response(JSON.stringify({ error: "Unsupported platform" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    if (result.success) {
      console.log(`Message sent via ${platform}: ${result.messageId}`);
    } else {
      console.error(`Failed to send via ${platform}: ${result.error}`);
    }

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Send message error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});