import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusUpdate {
  wa_message_id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Received webhook payload:', JSON.stringify(body));

      // Handle WhatsApp Cloud API webhook format
      if (body.entry) {
        for (const entry of body.entry) {
          for (const change of entry.changes || []) {
            if (change.value?.statuses) {
              for (const status of change.value.statuses) {
                const update: StatusUpdate = {
                  wa_message_id: status.id,
                  status: status.status,
                  timestamp: status.timestamp,
                };

                console.log('Processing status update:', update);

                const { error } = await supabase
                  .from('messages')
                  .update({ 
                    status: update.status,
                    metadata: {
                      status_updated_at: update.timestamp || new Date().toISOString(),
                    }
                  })
                  .eq('wa_message_id', update.wa_message_id);

                if (error) {
                  console.error('Error updating message status:', error);
                } else {
                  console.log(`Message ${update.wa_message_id} status updated to ${update.status}`);
                }
              }
            }
          }
        }
      }
      
      // Handle direct status update format
      if (body.wa_message_id && body.status) {
        const update: StatusUpdate = {
          wa_message_id: body.wa_message_id,
          status: body.status,
        };

        console.log('Processing direct status update:', update);

        const { error } = await supabase
          .from('messages')
          .update({ 
            status: update.status,
            metadata: {
              status_updated_at: new Date().toISOString(),
            }
          })
          .eq('wa_message_id', update.wa_message_id);

        if (error) {
          console.error('Error updating message status:', error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Webhook verification for WhatsApp
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      // For now, accept any verification token
      // In production, you'd validate against a stored verify_token
      if (mode === 'subscribe' && challenge) {
        console.log('Webhook verified successfully');
        return new Response(challenge, { headers: corsHeaders });
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
