import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      user_id,
      company_name,
      contact_name,
      email,
      phone,
      website,
      office_address,
      slug,
      description,
      logo_url,
      languages,
      instagram_url,
      facebook_url,
      linkedin_url,
      avg_rating,
      total_reviews,
      team_size,
      team,
    } = await req.json();

    console.log("[publish-agent-profile] Received:", { user_id, company_name, contact_name, email, slug });

    if (!user_id || !company_name || !contact_name || !email || !slug) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Insert professional
    const { data: profData, error: profError } = await supabaseAdmin
      .from("professionals")
      .insert({
        user_id,
        company_name,
        contact_name,
        email,
        phone: phone || null,
        website: website || null,
        office_address: office_address || null,
        slug,
        type: "agent",
        description: description || null,
        logo_url: logo_url || null,
        languages: languages || [],
        instagram_url: instagram_url || null,
        facebook_url: facebook_url || null,
        linkedin_url: linkedin_url || null,
        avg_rating: avg_rating || 0,
        total_reviews: total_reviews || 0,
        team_size: team_size || null,
        is_active: true,
        is_verified: false,
      })
      .select("id")
      .single();

    if (profError) throw profError;
    console.log("[publish-agent-profile] Created professional:", profData.id);

    // 2. Insert team members
    if (team && team.length > 0 && profData) {
      const teamInserts = team.map((m: any, i: number) => ({
        professional_id: profData.id,
        name: m.name,
        role: m.role || null,
        photo_url: m.photo_url || null,
        sort_order: i,
      }));
      await supabaseAdmin.from("agent_team_members").insert(teamInserts);
    }

    // 3. Assign agent role
    await supabaseAdmin.from("user_roles").insert({
      user_id,
      role: "agent",
    });

    return new Response(
      JSON.stringify({ success: true, slug }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("publish-agent-profile error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Failed to publish profile" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
