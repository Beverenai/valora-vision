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

// ── Helpers ──

async function scrapeUrl(firecrawlKey: string, url: string): Promise<{ markdown: string; links: string[]; metadata: Record<string, unknown> } | null> {
  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http")) formattedUrl = `https://${formattedUrl}`;

    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: formattedUrl, formats: ["markdown", "links"], onlyMainContent: false }),
    });
    const data = await res.json();
    if (data.success === false) return null;
    return {
      markdown: (data.data?.markdown || data.markdown || "").substring(0, 6000),
      links: data.data?.links || data.links || [],
      metadata: data.data?.metadata || data.metadata || {},
    };
  } catch (e) {
    console.error("Scrape error:", e);
    return null;
  }
}

async function extractReviewsWithAI(lovableKey: string, content: string, source: string): Promise<Array<{ reviewer_name: string; rating: number; comment: string }>> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: `Extract individual customer reviews from this ${source} page content. Only extract real reviews with actual reviewer names and ratings. Content:\n\n${content.substring(0, 5000)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_reviews",
            description: "Extract customer reviews from page content",
            parameters: {
              type: "object",
              properties: {
                reviews: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      reviewer_name: { type: "string" },
                      rating: { type: "number", description: "Rating from 1 to 5" },
                      comment: { type: "string" },
                    },
                    required: ["reviewer_name", "rating", "comment"],
                  },
                },
              },
              required: ["reviews"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_reviews" } },
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return [];
    const parsed = JSON.parse(toolCall.function.arguments);
    return (parsed.reviews || [])
      .filter((r: any) => r.reviewer_name && r.rating >= 1 && r.rating <= 5)
      .slice(0, 20);
  } catch (e) {
    console.error("Review extraction error:", e);
    return [];
  }
}

// ── Main Handler ──

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
      reviews: [] as Array<{ reviewer_name: string; rating: number; comment: string; source: string; source_url: string }>,
      steps: [] as { key: string; status: string; label: string }[],
    };

    const steps = result.steps as { key: string; status: string; label: string }[];

    // --- 1. Scrape website with Firecrawl (if provided) ---
    let scrapedContent = "";
    let scrapedLinks: string[] = [];
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (website && firecrawlKey) {
      steps.push({ key: "scan_website", status: "loading", label: "Scanning your website..." });
      const scrapeResult = await scrapeUrl(firecrawlKey, website);

      if (scrapeResult) {
        scrapedContent = scrapeResult.markdown;
        scrapedLinks = scrapeResult.links;
        const metadata = scrapeResult.metadata;

        if (metadata.ogImage) result.logo_url = metadata.ogImage;
        if (metadata.ogImage) result.cover_photo_url = metadata.ogImage;

        // Extract social links
        for (const link of scrapedLinks) {
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
      } else {
        steps.push({ key: "scan_website", status: "error", label: "Could not scan website" });
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
          headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
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
          headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
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

    // --- 7. Scrape reviews from Google/Trustpilot links ---
    if (firecrawlKey && lovableKey) {
      const reviewResults = result.reviews as Array<{ reviewer_name: string; rating: number; comment: string; source: string; source_url: string }>;

      // Find review page links from scraped website links
      let googleReviewUrl: string | null = null;
      let trustpilotUrl: string | null = null;

      for (const link of scrapedLinks) {
        if (typeof link !== "string") continue;
        if (!googleReviewUrl && (link.includes("google.com/maps") || link.includes("business.google.com") || link.includes("g.page"))) {
          googleReviewUrl = link;
        }
        if (!trustpilotUrl && link.includes("trustpilot.com")) {
          trustpilotUrl = link;
        }
      }

      // Also check scraped content for Trustpilot links
      if (!trustpilotUrl && scrapedContent) {
        const tpMatch = scrapedContent.match(/trustpilot\.com\/review\/[^\s)"\]]+/);
        if (tpMatch) trustpilotUrl = `https://www.${tpMatch[0]}`;
      }

      const reviewSources: Array<{ url: string; source: string }> = [];
      if (googleReviewUrl) reviewSources.push({ url: googleReviewUrl, source: "google" });
      if (trustpilotUrl) reviewSources.push({ url: trustpilotUrl, source: "trustpilot" });

      if (reviewSources.length > 0) {
        steps.push({ key: "import_reviews", status: "loading", label: "Importing reviews..." });
        
        for (const { url, source } of reviewSources) {
          try {
            const reviewPageData = await scrapeUrl(firecrawlKey, url);
            if (reviewPageData && reviewPageData.markdown.length > 100) {
              const extracted = await extractReviewsWithAI(lovableKey, reviewPageData.markdown, source);
              for (const review of extracted) {
                reviewResults.push({
                  reviewer_name: review.reviewer_name,
                  rating: review.rating,
                  comment: review.comment,
                  source,
                  source_url: url,
                });
              }
            }
          } catch (e) {
            console.error(`Error scraping ${source} reviews:`, e);
          }
        }

        const totalReviews = reviewResults.length;
        steps.push({
          key: "import_reviews",
          status: totalReviews > 0 ? "done" : "skip",
          label: totalReviews > 0 ? `Imported ${totalReviews} reviews` : "No reviews found",
        });
      }
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
