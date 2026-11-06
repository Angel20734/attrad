// ==============================================================================
// SUPABASE EDGE FUNCTION: capture-lead
// Endpoint: /functions/v1/capture-lead
// Recibe eventos de captura del SDK (sendBeacon o fetch) y registra el lead.
// ==============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Manejo de preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const rawBody = await req.text();
    if (!rawBody) {
      return new Response(JSON.stringify({ error: "Empty payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    const { api_key, ad_id, ref_code } = payload;

    if (!api_key || !ad_id) {
      return new Response(JSON.stringify({ error: "Missing required fields: api_key or ad_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Inicializar cliente Supabase con Service Role Key (privilegiado)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Validar que la API Key pertenezca a un cliente activo
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, organization_id, is_active")
      .eq("api_key", api_key)
      .single();

    if (clientError || !client || !client.is_active) {
      return new Response(JSON.stringify({ error: "Invalid or inactive API Key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Generar o confirmar el código de referencia (ej: #REF-842)
    const finalRefCode = ref_code || `#REF-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Insertar el evento de lead con atribución First-Touch
    const { data: lead, error: insertError } = await supabase
      .from("leads")
      .insert({
        client_id: client.id,
        organization_id: client.organization_id,
        ref_code: finalRefCode,
        ad_id: ad_id,
        ad_name: payload.ad_name || null,
        utm_source: payload.utm_source || "meta",
        utm_medium: payload.utm_medium || "paid_social",
        utm_campaign: payload.utm_campaign || null,
        utm_content: payload.utm_content || null,
        landing_url: payload.landing_url || null,
        referrer: payload.referrer || null,
        customer_phone: payload.customer_phone || null,
        customer_name: payload.customer_name || null,
        status: "nuevo",
        sale_amount: 0.0,
      })
      .select("id, ref_code")
      .single();

    if (insertError) {
      console.error("Error inserting lead:", insertError);
      return new Response(JSON.stringify({ error: "Failed to persist lead" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        ref_code: lead.ref_code,
        message: "Attribution lead captured successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
