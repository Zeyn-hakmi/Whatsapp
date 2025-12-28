import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SuspensionStatus {
  isSuspended: boolean;
  suspendedReason: string | null;
  isLoading: boolean;
}

export function useSuspensionCheck(): SuspensionStatus {
  const { user } = useAuth();
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendedReason, setSuspendedReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSuspension() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_suspended, suspended_reason")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking suspension status:", error);
          setIsLoading(false);
          return;
        }

        if (data?.is_suspended) {
          setIsSuspended(true);
          setSuspendedReason(data.suspended_reason);
        } else {
          setIsSuspended(false);
          setSuspendedReason(null);
        }
      } catch (err) {
        console.error("Error in suspension check:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkSuspension();
  }, [user]);

  return { isSuspended, suspendedReason, isLoading };
}
