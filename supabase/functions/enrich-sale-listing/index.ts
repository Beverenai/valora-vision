import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sale_id, listing_url } = await req.json();
    if (!sale_id || !listing_url) {
      return new Response(
        JSON.stringify({ success: false, error: "sale_id and listing_url are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Enriching sale ${sale_id} from ${listing_url}`);

    // Scrape listing with Firecrawl using JSON extraction
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: listing_url,
        formats: ["markdown", "extract"],
        extract: {
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              bedrooms: { type: "number" },
              bathrooms: { type: "number" },
              built_size_sqm: { type: "number" },
              plot_size_sqm: { type: "number" },
              property_type: { type: "string" },
              address: { type: "string" },
              city: { type: "string" },
              latitude: { type: "number" },
              longitude: { type: "number" },
              image_url: { type: "string" },
            },
          },
          prompt:
            "Extract property listing details. property_type should be one of: apartment, villa, townhouse, penthouse, finca, plot. image_url should be the main/hero property photo URL. latitude and longitude are the property coordinates if available.",
        },
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeRes.json();

    if (!scrapeRes.ok) {
      console.error("Firecrawl error:", scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: "Scraping failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract structured data - handle nested response
    const extracted = scrapeData?.data?.extract || scrapeData?.extract || scrapeData?.data?.json || {};
    const metadata = scrapeData?.data?.metadata || scrapeData?.metadata || {};

    console.log("Extracted data:", JSON.stringify(extracted));

    // Build update payload — only set fields that were actually extracted
    const update: Record<string, unknown> = {};
    const enrichedFields: string[] = [];

    if (extracted.title) {
      update.enriched_title = extracted.title;
      enrichedFields.push("enriched_title");
    }
    if (extracted.description) {
      update.enriched_description = extracted.description.substring(0, 2000);
      enrichedFields.push("enriched_description");
    }
    if (extracted.price && extracted.price > 0) {
      update.sale_price = extracted.price;
      enrichedFields.push("sale_price");
    }
    if (extracted.bedrooms && extracted.bedrooms > 0) {
      update.bedrooms = extracted.bedrooms;
      enrichedFields.push("bedrooms");
    }
    if (extracted.bathrooms && extracted.bathrooms > 0) {
      update.bathrooms = extracted.bathrooms;
      enrichedFields.push("bathrooms");
    }
    if (extracted.built_size_sqm && extracted.built_size_sqm > 0) {
      update.built_size_sqm = extracted.built_size_sqm;
      enrichedFields.push("built_size_sqm");
    }
    if (extracted.plot_size_sqm && extracted.plot_size_sqm > 0) {
      update.plot_size_sqm = extracted.plot_size_sqm;
      enrichedFields.push("plot_size_sqm");
    }
    if (extracted.property_type) {
      update.property_type = extracted.property_type.toLowerCase();
      enrichedFields.push("property_type");
    }
    if (extracted.address) {
      update.address_text = extracted.address;
      enrichedFields.push("address_text");
    }
    if (extracted.city) {
      update.city = extracted.city;
      enrichedFields.push("city");
    }
    if (extracted.image_url) {
      update.photo_url = extracted.image_url;
      enrichedFields.push("photo_url");
    }
    if (extracted.latitude && extracted.longitude) {
      update.latitude = extracted.latitude;
      update.longitude = extracted.longitude;
      enrichedFields.push("latitude", "longitude");
    }

    if (Object.keys(update).length === 0) {
      console.log("No fields extracted");
      return new Response(
        JSON.stringify({ success: true, enriched_fields: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the sale row
    const { error: updateError } = await supabase
      .from("agent_sales")
      .update(update)
      .eq("id", sale_id);

    if (updateError) {
      console.error("DB update error:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update sale record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Enriched ${enrichedFields.length} fields for sale ${sale_id}`);

    return new Response(
      JSON.stringify({ success: true, enriched_fields: enrichedFields }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Enrich error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
