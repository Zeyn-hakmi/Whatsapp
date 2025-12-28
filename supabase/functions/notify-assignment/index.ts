import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssignmentNotificationRequest {
  memberEmail: string;
  ownerName: string;
  assignmentType: "bot" | "contact";
  itemName: string;
  action: "assigned" | "unassigned";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memberEmail, ownerName, assignmentType, itemName, action }: AssignmentNotificationRequest = await req.json();

    console.log(`Processing ${action} notification for ${memberEmail} - ${assignmentType}: ${itemName}`);

    // Create Supabase client to check notification settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the team member's user ID by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching users:", userError);
    }

    const memberUser = userData?.users?.find(u => u.email === memberEmail);
    
    if (memberUser) {
      // Check if the user has assignment notifications enabled
      const { data: settings } = await supabase
        .from("notification_settings")
        .select("assignment_alerts")
        .eq("user_id", memberUser.id)
        .maybeSingle();

      // If settings exist and assignment_alerts is explicitly false, skip sending
      if (settings && settings.assignment_alerts === false) {
        console.log(`User ${memberEmail} has assignment notifications disabled, skipping email`);
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "notifications_disabled" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    const isAssigned = action === "assigned";
    const itemTypeLabel = assignmentType === "bot" ? "Bot" : "Contact";
    const actionLabel = isAssigned ? "assigned to you" : "removed from your assignments";
    const actionColor = isAssigned ? "#10b981" : "#f59e0b";

    const emailResponse = await resend.emails.send({
      from: "Team Notifications <onboarding@resend.dev>",
      to: [memberEmail],
      subject: `${itemTypeLabel} ${isAssigned ? "Assigned" : "Unassigned"}: ${itemName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${itemTypeLabel} ${isAssigned ? "Assignment" : "Update"}</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${ownerName}</strong> has ${actionLabel}:
              </p>
              <div style="background: white; border: 1px solid #e5e7eb; border-left: 4px solid ${actionColor}; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">${itemTypeLabel}</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 600; color: #111827;">${itemName}</p>
              </div>
              ${isAssigned ? `
              <p style="font-size: 16px; margin-bottom: 20px;">
                You now have access to work with this ${assignmentType}. Log in to your team dashboard to get started.
              </p>
              ` : `
              <p style="font-size: 16px; margin-bottom: 20px;">
                This ${assignmentType} has been removed from your assignments. If you believe this is a mistake, please contact your team owner.
              </p>
              `}
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                This is an automated notification from your team workspace.<br>
                You can manage your notification preferences in Settings.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Assignment notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending assignment notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
