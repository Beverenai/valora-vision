// publish-agent-profile v3 — idempotent upsert
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
      cover_photo_url,
      type,
      agency_role,
      agency_id,
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

    const profileData = {
      user_id,
      company_name,
      contact_name,
      email,
      phone: phone || null,
      website: website || null,
      office_address: office_address || null,
      slug,
      type: type || "agent",
      description: description || null,
      logo_url: logo_url || null,
      languages: languages || [],
      instagram_url: instagram_url || null,
      facebook_url: facebook_url || null,
      linkedin_url: linkedin_url || null,
      avg_rating: avg_rating || 0,
      total_reviews: total_reviews || 0,
      team_size: team_size || null,
      cover_photo_url: cover_photo_url || null,
      agency_role: agency_role || null,
      agency_id: agency_id || null,
      is_active: true,
      is_verified: false,
    };

    // 1. Check if professional already exists for this user_id
    const { data: existing } = await supabaseAdmin
      .from("professionals")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();

    let professionalId: string;

    if (existing) {
      // UPDATE existing record
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("professionals")
        .update(profileData)
        .eq("id", existing.id)
        .select("id")
        .single();
      if (updateError) throw updateError;
      professionalId = updated.id;
      console.log("[publish-agent-profile] Updated professional:", professionalId);
    } else {
      // INSERT new record
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("professionals")
        .insert(profileData)
        .select("id")
        .single();
      if (insertError) {
        // Provide clear message for FK violations
        if (insertError.code === "23503") {
          return new Response(
            JSON.stringify({ error: "User account not found. Please try signing up again." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw insertError;
      }
      professionalId = inserted.id;
      console.log("[publish-agent-profile] Created professional:", professionalId);
    }

    // 2. Idempotent team members: delete existing, then re-insert
    await supabaseAdmin
      .from("agent_team_members")
      .delete()
      .eq("professional_id", professionalId);

    // Always include the owner as a team member
    const ownerTeamEntry = {
      professional_id: professionalId,
      name: contact_name,
      role: "Owner",
      email: email,
      phone: phone || null,
      photo_url: null,
      sort_order: 0,
      is_active: true,
      whatsapp: null,
    };

    const teamInserts = [ownerTeamEntry];
    if (team && team.length > 0) {
      team.forEach((m: any, i: number) => {
        teamInserts.push({
          professional_id: professionalId,
          name: m.name,
          role: m.role || null,
          email: m.email || null,
          phone: m.phone || null,
          photo_url: m.photo_url || null,
          sort_order: i + 1,
          is_active: true,
          whatsapp: m.whatsapp || null,
        });
      });
    }
    await supabaseAdmin.from("agent_team_members").insert(teamInserts);

    // 3. Idempotent role assignment: check first, then insert if missing
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", user_id)
      .eq("role", "agent")
      .maybeSingle();

    if (!existingRole) {
      await supabaseAdmin.from("user_roles").insert({
        user_id,
        role: "agent",
      });
    }

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
