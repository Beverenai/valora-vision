import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgentSalesStats from "@/components/agent/AgentSalesStats";
import AgentPropertyCards from "@/components/agent/AgentPropertyCards";
import {
  Star, MapPin, ChevronRight, Send, Phone, Mail, Home,
  Building2, CheckCircle2, Globe, Users,
} from "lucide-react";

const AgentPropertyMap = lazy(() => import("@/components/agent/AgentPropertyMap"));

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? "hsl(var(--primary))" : "none"}
          className={i <= Math.round(rating) ? "text-primary" : "text-muted-foreground/30"}
          strokeWidth={i <= Math.round(rating) ? 0 : 1.5}
        />
      ))}
    </div>
  );
}

const SECTION_LABEL = "text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6";

export default function TeamMemberProfile() {
  const { slug, memberSlug } = useParams<{ slug: string; memberSlug: string }>();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [agency, setAgency] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  

  const [contactForm, setContactForm] = useState({
    name: "", email: "", phone: "",
    interest: "selling",
    message: "",
  });

  useSEO({
    title: member && agency
      ? `${member.name} — ${agency.company_name} | ValoraCasa`
      : "Agent Profile | ValoraCasa",
    description: member?.bio || `View this agent's profile and sales record on ValoraCasa.`,
  });

  useEffect(() => {
    if (!slug || !memberSlug) return;

    async function load() {
      setLoading(true);
      setError(false);

      // Fetch agency by slug
      const { data: prof, error: profErr } = await supabase
        .from("professionals")
        .select("*")
        .ilike("slug", slug!)
        .single();

      if (profErr || !prof) { setLoading(false); setError(true); return; }
      setAgency(prof);

      // Fetch member by slug within this agency
      const { data: members } = await supabase
        .from("agent_team_members")
        .select("*")
        .eq("professional_id", prof.id)
        .eq("slug", memberSlug!);

      const mem = members?.[0];
      if (!mem) { setLoading(false); setError(true); return; }
      setMember(mem);

      // Fetch member sales & reviews in parallel
      const [salesRes, reviewsRes] = await Promise.all([
        supabase
          .from("agent_sales")
          .select("*")
          .eq("professional_id", prof.id)
          .eq("team_member_id", mem.id)
          .order("sale_date", { ascending: false, nullsFirst: false }),
        supabase
          .from("agent_reviews")
          .select("*")
          .eq("professional_id", prof.id)
          .eq("lead_id", mem.id)
          .order("created_at", { ascending: false }),
      ]);

      setSales(salesRes.data || []);
      setReviews(reviewsRes.data || []);
      setLoading(false);
    }

    load();
  }, [slug, memberSlug]);

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agency || !member) return;
    if (!contactForm.name.trim() || !contactForm.email.trim()) {
      toast({ title: "Required fields", description: "Please fill in name and email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("agent_contact_requests").insert({
      professional_id: agency.id,
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone.trim() || null,
      interest: contactForm.interest,
      message: `[For ${member.name}] ${contactForm.message.trim()}`,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Could not send message.", variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: `Your message has been sent to ${member.name}.` });
      setContactForm({ name: "", email: "", phone: "", interest: "selling", message: "" });
    }
  }

  // Stats
  const totalSales = sales.length;
  const medianPrice = (() => {
    const prices = sales.filter(s => s.sale_price).map(s => Number(s.sale_price)).sort((a, b) => a - b);
    if (prices.length === 0) return null;
    const mid = Math.floor(prices.length / 2);
    return prices.length % 2 ? prices[mid] : Math.round((prices[mid - 1] + prices[mid]) / 2);
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="animate-pulse">
          <div className="h-[30vh] md:h-[40vh] w-full bg-muted" />
          <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
            <div className="w-24 h-24 rounded-full bg-muted border-4 border-background mb-4" />
            <div className="h-8 w-48 bg-muted rounded mb-2" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !agency || !member) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Building2 size={48} className="text-muted-foreground/40" />
          <h2 className="text-xl font-semibold text-foreground">Agent not found</h2>
          <p className="text-muted-foreground text-center max-w-md">
            We couldn't find this agent profile. They may have moved or changed their profile.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to={`/agentes/${slug}`}>View agency</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/agentes">Browse all agents</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  

  const ContactFormSection = (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <p className={SECTION_LABEL}>CONTACT {member.name.toUpperCase()}</p>
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <Input placeholder="Your name *" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required />
          <Input type="email" placeholder="Email *" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required />
          <Input type="tel" placeholder="Phone (optional)" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={contactForm.interest}
            onChange={e => setContactForm(f => ({ ...f, interest: e.target.value }))}
          >
            <option value="selling">I'm interested in selling</option>
            <option value="buying">I'm interested in buying</option>
            <option value="renting">I'm interested in renting</option>
            <option value="valuation">I want a valuation</option>
            <option value="other">Other</option>
          </select>
          <Textarea
            placeholder="Your message..."
            value={contactForm.message}
            onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
            rows={4}
          />
          <Button type="submit" className="w-full rounded-full" disabled={submitting}>
            <Send size={16} className="mr-2" />
            {submitting ? "Sending..." : "Send Message"}
          </Button>
          <p className="text-[0.7rem] text-muted-foreground text-center leading-relaxed">
            Your message goes directly to {agency.company_name}. ValoraCasa does not share your details.
          </p>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        <div
          className="h-[30vh] md:h-[40vh] w-full"
          style={{
            background: agency.cover_photo_url
              ? `url(${agency.cover_photo_url}) ${agency.cover_photo_focus_x ?? 50}% ${agency.cover_photo_focus_y ?? 50}%/cover no-repeat`
              : "linear-gradient(135deg, hsl(21 62% 53% / 0.25) 0%, hsl(30 80% 80% / 0.15) 50%, hsl(40 9% 97%) 100%)",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
          {/* Member photo */}
          <div className="w-24 h-24 rounded-full border-4 border-background bg-card shadow-lg flex items-center justify-center overflow-hidden mb-4">
            {member.photo_url ? (
              <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">{getInitials(member.name)}</span>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{member.name}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {member.role && (
                  <span className="text-sm text-muted-foreground">{member.role}</span>
                )}
                {member.avg_rating > 0 && member.total_reviews > 0 && (
                  <>
                    <StarRating rating={member.avg_rating} size={14} />
                    <span className="text-sm text-muted-foreground">
                      ({member.total_reviews} reviews)
                    </span>
                  </>
                )}
              </div>
              {member.languages && member.languages.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {member.languages.map((l: string) => (
                    <Badge key={l} variant="secondary" className="text-[0.65rem] px-2 py-0.5">{l}</Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="rounded-full shrink-0"
              onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              Contact {member.name.split(" ")[0]}
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/60 mt-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex gap-6 md:gap-10 overflow-x-auto">
          {totalSales > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <Home size={16} className="text-primary" />
              <span className="text-sm text-muted-foreground">{totalSales} properties sold</span>
            </div>
          )}
          {medianPrice && (
            <div className="flex items-center gap-2 shrink-0">
              <Star size={16} className="text-primary" />
              <span className="text-sm text-muted-foreground">Median: €{medianPrice.toLocaleString()}</span>
            </div>
          )}
          {member.email && (
            <div className="flex items-center gap-2 shrink-0">
              <Mail size={16} className="text-primary" />
              <span className="text-sm text-muted-foreground">{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-2 shrink-0">
              <Phone size={16} className="text-primary" />
              <span className="text-sm text-muted-foreground">{member.phone}</span>
            </div>
          )}
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/agentes" className="hover:text-foreground transition-colors">Agents</Link>
          <ChevronRight size={12} />
          <Link to={`/agentes/${agency.slug}`} className="hover:text-foreground transition-colors">{agency.company_name}</Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{member.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8 md:gap-12 items-start">
          {/* Left column */}
          <div className="space-y-12">
            {/* Bio */}
            {member.bio && (
              <section>
                <p className={SECTION_LABEL}>ABOUT</p>
                <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-line">
                  {member.bio}
                </div>
              </section>
            )}

            {/* Agency card */}
            <section>
              <p className={SECTION_LABEL}>AGENCY</p>
              <Link to={`/agentes/${agency.slug}`}>
                <Card className="border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-muted shrink-0">
                      {agency.logo_url ? (
                        <img src={agency.logo_url} alt={agency.company_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">{getInitials(agency.company_name)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{agency.company_name}</p>
                      {agency.tagline && <p className="text-xs text-muted-foreground">{agency.tagline}</p>}
                    </div>
                    <ChevronRight size={16} className="ml-auto text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </section>

            {/* Sales Statistics */}
            {sales.length > 0 && (
              <AgentSalesStats
                sales={sales.map(s => ({
                  sale_price: s.sale_price ? Number(s.sale_price) : null,
                  show_price: s.show_price ?? true,
                  property_type: s.property_type,
                  sale_date: s.sale_date,
                }))}
                agentName={member.name}
              />
            )}

            {/* Sales Map */}
            {sales.some((s: any) => s.latitude != null && s.longitude != null) && (
              <Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded-xl" />}>
                <AgentPropertyMap
                  sales={sales.map((s: any) => ({
                    id: s.id,
                    latitude: s.latitude ? Number(s.latitude) : null,
                    longitude: s.longitude ? Number(s.longitude) : null,
                    property_type: s.property_type,
                    city: s.city,
                    sale_price: s.sale_price ? Number(s.sale_price) : null,
                    show_price: s.show_price ?? true,
                    photo_url: s.photo_url,
                    bedrooms: s.bedrooms,
                    verified: s.verified ?? false,
                    sale_date: s.sale_date || null,
                  }))}
                  centerLat={(() => {
                    const withCoords = sales.filter((s: any) => s.latitude != null);
                    return withCoords.length > 0 ? withCoords.reduce((sum: number, s: any) => sum + Number(s.latitude), 0) / withCoords.length : undefined;
                  })()}
                  centerLng={(() => {
                    const withCoords = sales.filter((s: any) => s.longitude != null);
                    return withCoords.length > 0 ? withCoords.reduce((sum: number, s: any) => sum + Number(s.longitude), 0) / withCoords.length : undefined;
                  })()}
                />
              </Suspense>
            )}

            {/* Property Cards */}
            {sales.length > 0 && (
              <AgentPropertyCards
                sales={sales.map((s: any) => ({
                  id: s.id,
                  property_type: s.property_type,
                  city: s.city,
                  address_text: s.address_text,
                  sale_price: s.sale_price ? Number(s.sale_price) : null,
                  show_price: s.show_price ?? true,
                  sale_date: s.sale_date,
                  photo_url: s.photo_url,
                  bedrooms: s.bedrooms,
                  built_size_sqm: s.built_size_sqm ? Number(s.built_size_sqm) : null,
                  verified: s.verified ?? false,
                }))}
                agentName={member.name}
                agencyName={agency.company_name}
              />
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <section>
                <p className={SECTION_LABEL}>REVIEWS</p>
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review.id} className="border-border/40">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sm">{review.reviewer_name}</p>
                          <span className="text-[0.65rem] text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <StarRating rating={review.rating} size={12} />
                        {review.comment && <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{review.comment}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column — Contact Form */}
          <div className={isMobile ? "" : "sticky top-24"} id="contact-form">
            {ContactFormSection}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/60 py-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
          <p className="text-xs text-muted-foreground">
            Valuation powered by <Link to="/" className="text-primary hover:underline">ValoraCasa</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
    </ErrorBoundary>
  );
}
