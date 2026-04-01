import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function formatRefCode(uuid: string): string {
  const clean = uuid.replace(/-/g, "").toUpperCase();
  return `VC-${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
}

function fmtEUR(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { lead_id, lead_type } = await req.json();
    if (!lead_id || !lead_type) {
      return new Response(JSON.stringify({ error: "lead_id and lead_type required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const table = lead_type === "rent" ? "leads_rent" : "leads_sell";
    const { data: lead, error } = await supabase.from(table).select("*").eq("id", lead_id).single();

    if (error || !lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const refCode = formatRefCode(lead_id);
    const address = escapeHtml(lead.address || "");
    const city = lead.city ? escapeHtml(lead.city) : "";
    const fullAddress = city ? `${address}, ${city}` : address;
    const date = new Date(lead.created_at || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    let mainValue = "";
    let mainLabel = "";
    let secondaryLines: string[] = [];
    let analysisText = "";

    if (lead_type === "sell") {
      const est = lead.estimated_value || 0;
      const low = lead.price_range_low || Math.round(est * 0.85);
      const high = lead.price_range_high || Math.round(est * 1.15);
      const rental = lead.monthly_rental_estimate || 0;
      mainValue = fmtEUR(est);
      mainLabel = "Estimated Market Value";
      secondaryLines = [
        `Price Range: ${fmtEUR(low)} – ${fmtEUR(high)}`,
        rental ? `Monthly Rental Estimate: ${fmtEUR(rental)}` : "",
        lead.price_per_sqm ? `Price per m²: ${fmtEUR(lead.price_per_sqm)}` : "",
        lead.built_size_sqm ? `Built Size: ${lead.built_size_sqm} m²` : "",
        lead.bedrooms ? `Bedrooms: ${lead.bedrooms}` : "",
        lead.bathrooms ? `Bathrooms: ${lead.bathrooms}` : "",
        lead.property_type ? `Type: ${lead.property_type.replace(/-/g, " ")}` : "",
        lead.condition ? `Condition: ${lead.condition}` : "",
      ].filter(Boolean);
      analysisText = lead.analysis || "";
    } else {
      const monthly = lead.monthly_long_term_estimate || 0;
      const annual = lead.annual_income_estimate || 0;
      mainValue = `${fmtEUR(monthly)}/mo`;
      mainLabel = "Estimated Monthly Rental Income";
      secondaryLines = [
        annual ? `Annual Income Estimate: ${fmtEUR(annual)}` : "",
        lead.weekly_high_season_estimate ? `High Season Weekly: ${fmtEUR(lead.weekly_high_season_estimate)}` : "",
        lead.weekly_low_season_estimate ? `Low Season Weekly: ${fmtEUR(lead.weekly_low_season_estimate)}` : "",
        lead.occupancy_estimate ? `Occupancy Estimate: ${lead.occupancy_estimate}%` : "",
        lead.built_size_sqm ? `Built Size: ${lead.built_size_sqm} m²` : "",
        lead.bedrooms ? `Bedrooms: ${lead.bedrooms}` : "",
        lead.bathrooms ? `Bathrooms: ${lead.bathrooms}` : "",
        lead.property_type ? `Type: ${lead.property_type.replace(/-/g, " ")}` : "",
      ].filter(Boolean);
      analysisText = lead.analysis || "";
    }

    const detailRows = secondaryLines.map(line => `<tr><td style="padding:6px 0;color:#555;font-size:13px;border-bottom:1px solid #f0ebe4;">${escapeHtml(line)}</td></tr>`).join("");

    const analysisParagraphs = analysisText
      ? analysisText.split("\n\n").filter(Boolean).map(p => `<p style="margin:0 0 12px;color:#444;font-size:13px;line-height:1.8;">${escapeHtml(p)}</p>`).join("")
      : "";

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  @page { size: A4; margin: 40px; }
  body { font-family: Georgia, 'Times New Roman', serif; margin: 0; padding: 40px; color: #1a1a1a; background: #fff; }
  .header { text-align: center; padding-bottom: 30px; border-bottom: 2px solid #D4713B; margin-bottom: 30px; }
  .logo { font-size: 28px; font-weight: bold; color: #D4713B; letter-spacing: 2px; }
  .ref { font-family: monospace; font-size: 11px; color: #888; margin-top: 8px; }
  .date { font-size: 11px; color: #888; margin-top: 4px; }
  .address { font-size: 18px; margin: 24px 0 8px; font-style: italic; color: #333; }
  .main-value { font-size: 48px; font-weight: 300; color: #1a1a1a; margin: 20px 0 4px; letter-spacing: -1px; }
  .main-label { font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin-bottom: 30px; }
  .details { width: 100%; border-collapse: collapse; margin: 20px 0; }
  .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin: 30px 0 16px; }
  .analysis { margin-top: 20px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0d8cf; text-align: center; }
  .footer p { font-size: 10px; color: #aaa; margin: 4px 0; }
  .disclaimer { font-size: 9px; color: #bbb; margin-top: 30px; line-height: 1.6; text-align: center; }
</style></head>
<body>
  <div class="header">
    <div class="logo">VALORACASA</div>
    <div class="ref">${refCode}</div>
    <div class="date">${date}</div>
  </div>

  <div style="text-align:center;">
    <div class="address">${fullAddress}</div>
    <div class="main-value">${mainValue}</div>
    <div class="main-label">${mainLabel}</div>
  </div>

  <div class="section-title">Property Details</div>
  <table class="details"><tbody>${detailRows}</tbody></table>

  ${analysisParagraphs ? `<div class="section-title">Analysis</div><div class="analysis">${analysisParagraphs}</div>` : ""}

  <div class="disclaimer">
    This valuation is an estimate based on comparable market data and does not constitute a formal appraisal.
    Actual market value may vary. For a professional valuation, consult a certified appraiser.
  </div>

  <div class="footer">
    <p>ValoraCasa · Costa del Sol Property Intelligence</p>
    <p>valoracasa.es</p>
  </div>
</body>
</html>`;

    // Return HTML as PDF-like content (browsers can render/print)
    // For actual PDF conversion we use a lightweight approach: return HTML with PDF content-disposition
    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="ValoraCasa-${lead_type === "rent" ? "RentalEstimate" : "Valuation"}-${refCode}.html"`,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
