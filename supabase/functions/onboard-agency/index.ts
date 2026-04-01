import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OnboardInput {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: OnboardInput = await req.json();
    const { company_name, contact_name, email, phone, website, address } = body;

    if (!company_name || !contact_name || !email || !address) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result: Record<string, unknown> = {
      logo_url: null,
      description: "",
      cover_photo_url: null,
      team: [],
      social: { instagram: null, facebook: null, linkedin: null },
      google_rating: null,
      google_review_count: null,
      languages: ["es", "en"],
      service_areas: [],
      lat: null,
      lng: null,
      steps: [] as { key: string; status: string; label: string }[],
    };

    const steps = result.steps as { key: string; status: string; label: string }[];

    // --- 1. Scrape website with Firecrawl (if provided) ---
    let scrapedContent = "";
    if (website) {
      steps.push({ key: "scan_website", status: "loading", label: "Scanning your website..." });
      const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
      if (firecrawlKey) {
        try {
          let formattedUrl = website.trim();
          if (!formattedUrl.startsWith("http")) formattedUrl = `https://${formattedUrl}`;

          const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${firecrawlKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: formattedUrl,
              formats: ["markdown", "links"],
              onlyMainContent: false,
            }),
          });

          const scrapeData = await scrapeRes.json();
          if (scrapeData.success !== false) {
            const md = scrapeData.data?.markdown || scrapeData.markdown || "";
            scrapedContent = md.substring(0, 6000);
            const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

            // Extract logo from metadata
            if (metadata.ogImage) result.logo_url = metadata.ogImage;

            // Use og:image as cover photo candidate
            if (metadata.ogImage) result.cover_photo_url = metadata.ogImage;

            // Extract social links from all links
            const links: string[] = scrapeData.data?.links || scrapeData.links || [];
            for (const link of links) {
              if (typeof link === "string") {
                if (link.includes("instagram.com") && !(result.social as Record<string, unknown>).instagram)
                  (result.social as Record<string, unknown>).instagram = link;
                if (link.includes("facebook.com") && !(result.social as Record<string, unknown>).facebook)
                  (result.social as Record<string, unknown>).facebook = link;
                if (link.includes("linkedin.com") && !(result.social as Record<string, unknown>).linkedin)
                  (result.social as Record<string, unknown>).linkedin = link;
              }
            }

            steps.push({ key: "found_logo", status: result.logo_url ? "done" : "skip", label: result.logo_url ? "Found your logo" : "No logo found" });
            steps.push({ key: "found_social", status: "done", label: "Checked social media links" });
          }
        } catch (e) {
          console.error("Firecrawl error:", e);
          steps.push({ key: "scan_website", status: "error", label: "Could not scan website" });
        }
      }
    }

    // --- 2. Generate description with Lovable AI ---
    steps.push({ key: "generate_desc", status: "loading", label: "Generating description..." });
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (lovableKey) {
      try {
        const prompt = scrapedContent
          ? `Based on this real estate agency's website content, write a professional 2-3 sentence description for "${company_name}" located at "${address}". Website content: ${scrapedContent.substring(0, 3000)}`
          : `Write a professional 2-3 sentence description for a real estate agency called "${company_name}" located at "${address}" on the Costa del Sol, Spain. Make it warm and professional.`;

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are a professional copywriter for real estate agencies. Write concise, warm descriptions. Reply with ONLY the description text, no quotes or extra formatting." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          result.description = aiData.choices?.[0]?.message?.content?.trim() || "";
          steps.push({ key: "generate_desc", status: "done", label: "Generated description" });
        }
      } catch (e) {
        console.error("AI error:", e);
      }
    }

    // --- 3. Extract team from scraped content (AI) ---
    if (scrapedContent && lovableKey) {
      steps.push({ key: "find_team", status: "loading", label: "Looking for team members..." });
      try {
        const teamRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "user", content: `Extract team member names, roles, email addresses, phone numbers, and WhatsApp numbers from this real estate agency website content. Return a JSON array. If no team members found, return []. Content: ${scrapedContent.substring(0, 4000)}` },
            ],
            tools: [{
              type: "function",
              function: {
                name: "extract_team",
                description: "Extract team members from website content",
                parameters: {
                  type: "object",
                  properties: {
                    members: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          role: { type: "string" },
                          email: { type: "string" },
                          phone: { type: "string" },
                          whatsapp: { type: "string" },
                        },
                        required: ["name", "role"],
                      },
                    },
                  },
                  required: ["members"],
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "extract_team" } },
          }),
        });

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          const toolCall = teamData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            const parsed = JSON.parse(toolCall.function.arguments);
            result.team = (parsed.members || []).slice(0, 10);
            const count = (result.team as unknown[]).length;
            steps.push({ key: "find_team", status: count > 0 ? "done" : "skip", label: count > 0 ? `Found ${count} team member${count > 1 ? "s" : ""}` : "No team members found" });
          }
        }
      } catch (e) {
        console.error("Team extraction error:", e);
      }
    }

    // --- 4. Detect languages from content ---
    if (scrapedContent) {
      const langMap: Record<string, string> = {
        english: "en", spanish: "es", norwegian: "no", swedish: "sv",
        german: "de", french: "fr", dutch: "nl", russian: "ru", arabic: "ar",
        dansk: "da", finnish: "fi", italian: "it", portuguese: "pt",
      };
      const lower = scrapedContent.toLowerCase();
      const detected: string[] = [];
      for (const [keyword, code] of Object.entries(langMap)) {
        if (lower.includes(keyword)) detected.push(code);
      }
      if (detected.length > 0) {
        result.languages = [...new Set(["es", "en", ...detected])];
        steps.push({ key: "languages", status: "done", label: `Detected languages: ${(result.languages as string[]).join(", ")}` });
      }
    }

    // --- 5. Google Places API ---
    const googleKey = Deno.env.get("VITE_GOOGLE_MAPS_API_KEY");
    if (googleKey) {
      steps.push({ key: "google", status: "loading", label: "Checking Google Business Profile..." });
      try {
        const query = encodeURIComponent(`${company_name} ${address}`);
        const placesRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=rating,user_ratings_total,geometry&key=${googleKey}`
        );
        const placesData = await placesRes.json();
        const candidate = placesData.candidates?.[0];
        if (candidate) {
          if (candidate.rating) result.google_rating = candidate.rating;
          if (candidate.user_ratings_total) result.google_review_count = candidate.user_ratings_total;
          if (candidate.geometry?.location) {
            result.lat = candidate.geometry.location.lat;
            result.lng = candidate.geometry.location.lng;
          }
          if (result.google_rating) {
            steps.push({
              key: "google_reviews",
              status: "done",
              label: `Found ${result.google_review_count} reviews (${result.google_rating}★ average)`,
            });
          }
        }
      } catch (e) {
        console.error("Google Places error:", e);
      }

      // Geocode address if no lat/lng from Places
      if (!result.lat) {
        try {
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleKey}`
          );
          const geoData = await geoRes.json();
          const loc = geoData.results?.[0]?.geometry?.location;
          if (loc) {
            result.lat = loc.lat;
            result.lng = loc.lng;
          }
        } catch (e) {
          console.error("Geocode error:", e);
        }
      }
    }

    // --- 6. Detect service areas from address ---
    const knownAreas = ["Marbella", "Estepona", "Benahavís", "Mijas", "Fuengirola", "Málaga", "Torremolinos", "Benalmádena", "Nerja", "Manilva", "Casares", "Sotogrande", "San Pedro"];
    const addressLower = address.toLowerCase();
    const matchedAreas = knownAreas.filter((a) => addressLower.includes(a.toLowerCase()));
    if (matchedAreas.length > 0) {
      result.service_areas = matchedAreas;
    }

    steps.push({ key: "complete", status: "done", label: "Profile ready!" });

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Onboard error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
