import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyAdminRequest {
  type: "new_user" | "subscription_expiring" | "user_suspended";
  data: Record<string, unknown>;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, data }: NotifyAdminRequest = await req.json();
    console.log(`Processing admin notification: ${type}`, data);

    // Get admin emails
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw rolesError;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found");
      return new Response(JSON.stringify({ message: "No admins to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get admin emails from auth.users
    const adminEmails: string[] = [];
    for (const role of adminRoles) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(role.user_id);
      if (!userError && userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(JSON.stringify({ message: "No admin emails found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "new_user":
        subject = "🎉 New User Registration";
        htmlContent = `
          <h1>New User Registered</h1>
          <p>A new user has registered on your platform:</p>
          <ul>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Name:</strong> ${data.full_name || "Not provided"}</li>
            <li><strong>Registered at:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Please review the new user in your admin dashboard.</p>
        `;
        break;

      case "subscription_expiring":
        subject = "⚠️ Subscription Expiring Soon";
        htmlContent = `
          <h1>Subscription Expiring</h1>
          <p>A user's subscription is about to expire:</p>
          <ul>
            <li><strong>User:</strong> ${data.user_name || "Unknown"}</li>
            <li><strong>Plan:</strong> ${data.plan_name}</li>
            <li><strong>Expires:</strong> ${data.expires_at}</li>
          </ul>
          <p>Consider reaching out to the user about renewal.</p>
        `;
        break;

      case "user_suspended":
        subject = "🚫 User Account Suspended";
        htmlContent = `
          <h1>User Suspended</h1>
          <p>A user account has been suspended:</p>
          <ul>
            <li><strong>User ID:</strong> ${data.user_id}</li>
            <li><strong>Reason:</strong> ${data.reason || "No reason provided"}</li>
            <li><strong>Suspended at:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        `;
        break;

      default:
        subject = "Admin Notification";
        htmlContent = `<p>A new event occurred: ${type}</p><pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    console.log(`Sending email to admins: ${adminEmails.join(", ")}`);

    const emailResponse = await resend.emails.send({
      from: "Admin Notifications <onboarding@resend.dev>",
      to: adminEmails,
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-admin function:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
