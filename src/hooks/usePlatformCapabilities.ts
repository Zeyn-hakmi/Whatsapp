import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformCapability {
  id: string;
  platform: string;
  supports_buttons: boolean;
  supports_quick_replies: boolean;
  supports_images: boolean;
  supports_videos: boolean;
  supports_documents: boolean;
  supports_audio: boolean;
  supports_location: boolean;
  supports_contacts: boolean;
  max_text_length: number;
  max_buttons: number;
  max_quick_replies: number;
  button_types: string[];
}

export function usePlatformCapabilities() {
  return useQuery({
    queryKey: ["platform-capabilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_capabilities")
        .select("*")
        .order("platform");

      if (error) throw error;
      
      return data.map(cap => ({
        ...cap,
        button_types: Array.isArray(cap.button_types) 
          ? cap.button_types 
          : JSON.parse(cap.button_types as string || "[]"),
      })) as PlatformCapability[];
    },
  });
}

export function getCapabilityForPlatform(
  capabilities: PlatformCapability[] | undefined,
  platform: string
): PlatformCapability | undefined {
  return capabilities?.find(c => c.platform === platform);
}