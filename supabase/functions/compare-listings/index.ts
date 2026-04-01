import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COMPARISON_TOOL = {
  type: "function",
  function: {
    name: "generate_comparison_analysis",
    description: "Generate a structured comparison of two properties.",
    parameters: {
      type: "object",
      properties: {
        winner: { type: "string", enum: ["a", "b", "tie"], description: "Which property offers better value overall" },
        summary: { type: "string", description: "2-3 sentence comparison overview" },
        comparison_points: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string", description: "e.g. Price, Value per m², Location, Features" },
              property_a: { type: "string", description: "Brief fact about property A" },
              property_b: { type: "string", description: "Brief fact about property B" },
              advantage: { type: "string", enum: ["a", "b", "tie"], description: "Which property is better for this category" },
            },
            required: ["category", "property_a", "property_b", "advantage"],
            additionalProperties: false,
          },
          description: "4-6 structured comparison points",
        },
        recommendation: { type: "string", description: "Neutral recommendation text" },
      },
      required: ["winner", "summary", "comparison_points", "recommendation"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url_a, url_b } = await req.json();

    if (!url_a || !url_b) {
      return new Response(JSON.stringify({ error: "Both url_a and url_b are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Analyze both listings in parallel by calling analyze-listing edge function
    const analyzeUrl = `${supabaseUrl}/functions/v1/analyze-listing`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseServiceKey}`,
    };

    const [resA, resB] = await Promise.all([
      fetch(analyzeUrl, { method: "POST", headers, body: JSON.stringify({ url: url_a }) }),
      fetch(analyzeUrl, { method: "POST", headers, body: JSON.stringify({ url: url_b }) }),
    ]);

    const dataA = await resA.json();
    const dataB = await resB.json();

    if (!dataA.analysis_id || !dataB.analysis_id) {
      return new Response(JSON.stringify({
        error: "Failed to analyze one or both properties.",
        details: { a: dataA, b: dataB },
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Create comparison record
    const { data: comparison, error: insertError } = await supabase
      .from("buy_comparisons")
      .insert({
        analysis_a_id: dataA.analysis_id,
        analysis_b_id: dataB.analysis_id,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError) throw new Error(insertError.message);
    const comparisonId = comparison.id;

    // 3. Fetch both full analyses
    const [{ data: analysisA }, { data: analysisB }] = await Promise.all([
      supabase.from("buy_analyses").select("*").eq("id", dataA.analysis_id).single(),
      supabase.from("buy_analyses").select("*").eq("id", dataB.analysis_id).single(),
    ]);

    if (!analysisA || !analysisB) {
      await supabase.from("buy_comparisons").update({ status: "error" }).eq("id", comparisonId);
      return new Response(JSON.stringify({ comparison_id: comparisonId, status: "error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Build comparison data package for AI
    const buildPropertySummary = (a: any, label: string) => ({
      label,
      address: a.address || "Unknown",
      city: a.city || "Unknown",
      asking_price: a.asking_price,
      estimated_value: a.estimated_value,
      price_deviation_percent: a.price_deviation_percent,
      price_score: a.price_score,
      size_m2: a.size_m2,
      rooms: a.rooms,
      bathrooms: a.bathrooms,
      price_per_m2: a.asking_price_per_m2,
      estimated_price_per_m2: a.estimated_price_per_m2,
      property_type: a.property_type,
      features: a.features,
      feature_adjustments: a.feature_adjustments,
      comparables_count: a.comparables_count,
      confidence_level: a.confidence_level,
    });

    const dataPackage = {
      property_a: buildPropertySummary(analysisA, "Property A"),
      property_b: buildPropertySummary(analysisB, "Property B"),
    };

    // 5. Call AI for comparison
    let aiResult: any = null;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (LOVABLE_API_KEY) {
      try {
        const systemPrompt = `You are a neutral property market analyst for ValoraCasa. Compare two properties based on pre-computed data. Be data-driven and objective. NEVER say a property is "too expensive" or "a bad deal". Present findings neutrally. Focus on value-for-money, size, features, and market positioning. Do not use markdown formatting.`;

        const userPrompt = `Compare these two properties and determine which offers better value:\n\n${JSON.stringify(dataPackage, null, 2)}`;

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            temperature: 0.3,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            tools: [COMPARISON_TOOL],
            tool_choice: { type: "function", function: { name: "generate_comparison_analysis" } },
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall?.function?.arguments) {
            try {
              aiResult = JSON.parse(toolCall.function.arguments);
            } catch (e) {
              console.error("Failed to parse AI comparison:", e);
            }
          }
        } else {
          const errText = await aiRes.text();
          console.error("AI comparison error:", aiRes.status, errText);
        }
      } catch (aiError) {
        console.error("AI error:", aiError);
      }
    }

    // 6. Update comparison with results
    await supabase.from("buy_comparisons").update({
      ai_comparison: aiResult?.summary || null,
      ai_winner: aiResult?.winner || "tie",
      ai_comparison_points: aiResult ? {
        comparison_points: aiResult.comparison_points || [],
        recommendation: aiResult.recommendation || "",
      } : null,
      status: "ready",
    }).eq("id", comparisonId);

    return new Response(JSON.stringify({
      comparison_id: comparisonId,
      analysis_a_id: dataA.analysis_id,
      analysis_b_id: dataB.analysis_id,
      status: "ready",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("compare-listings error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
