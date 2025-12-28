import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

/**
 * Logs user activity to the compliance_logs table
 */
export async function logActivity(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string | null,
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    await supabase.from("compliance_logs").insert([{
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      details: details as Json,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    }]);
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - logging should not break the main flow
  }
}
