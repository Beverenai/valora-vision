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
import AgentBreadcrumbs from "@/components/agent/AgentBreadcrumbs";
import AgentSalesStats from "@/components/agent/AgentSalesStats";
import AgentPropertyCards from "@/components/agent/AgentPropertyCards";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Star, MapPin, Calendar, Users, Globe, Building2,
  Instagram, Facebook, Linkedin, ExternalLink, CheckCircle2,
  Send, Phone, Mail, Home, Eye,
} from "lucide-react";

const AgentPropertyMap = lazy(() => import("@/components/agent/AgentPropertyMap"));

// ── Types ──
interface Professional {
  id: string;
  company_name: string;
  contact_name: string;
  slug: string;
  logo_url: string | null;
  cover_photo_url: string | null;
  tagline: string | null;
  description: string | null;
  bio: string | null;
  avg_rating: number;
  total_reviews: number;
  founded_year: number | null;
  team_size: number | null;
  office_address: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  is_verified: boolean;
  languages: string[] | null;
  service_zones: string[] | null;
  type: string;
  agency_id: string | null;
  agency_role: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  photo_url: string | null;
  avg_rating: number;
  total_reviews: number;
  languages: string[] | null;
  email: string | null;
  slug: string | null;
}

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  source: string | null;
  source_url: string | null;
}

interface ZoneInfo {
  id: string;
  name: string;
  province: string | null;
  municipality: string | null;
}

// ── Helpers ──
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

function LogoWithFallback({ logoUrl, name, size = "md" }: { logoUrl: string | null; name: string; size?: "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const initials = getInitials(name) || "A";
  const sizeClass = size === "lg"
    ? "w-20 h-20 rounded-full border-4 border-background bg-card shadow-lg flex items-center justify-center overflow-hidden mb-4"
    : "w-12 h-12 rounded-full flex items-center justify-center overflow-hidden";

  if (logoUrl && !failed) {
    return (
      <div className={sizeClass}>
        <img src={logoUrl} alt={name} className="w-full h-full object-cover" onError={() => setFailed(true)} />
      </div>
    );
  }
  return (
    <div className={`${sizeClass} bg-[#D4713B]`}>
      <span className={`font-bold text-white ${size === "lg" ? "text-xl" : "text-sm"}`}>{initials}</span>
    </div>
  );
}

const SECTION_LABEL = "text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6";

const ROLE_COLORS: Record<string, string> = {
  seller: "bg-primary/10 text-primary",
  buyer: "bg-blue-100 text-blue-700",
  landlord: "bg-emerald-100 text-emerald-700",
};

// ── Page ──
export default function AgentProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [zones, setZones] = useState<ZoneInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agency, setAgency] = useState<Professional | null>(null);
  const [agencyAgents, setAgencyAgents] = useState<Professional[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [showAllSales, setShowAllSales] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);

  const primaryCity = useMemo(() => {
    if (zones.length > 0) return zones[0].name;
    return "Costa del Sol";
  }, [zones]);

  const primaryProvince = useMemo(() => {
    if (zones.length > 0 && zones[0].province) return zones[0].province;
    return null;
  }, [zones]);

  useSEO({
    title: professional ? `${professional.company_name} — Real Estate Agent in ${primaryCity} | ValoraCasa` : "Agent Profile | ValoraCasa",
    description: professional?.tagline || professional?.description?.slice(0, 155) || "View this real estate agent's profile on ValoraCasa.",
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "", email: "", phone: "", interest: "valuation",
    message: "I found you on ValoraCasa and would like to discuss...",
  });

  useEffect(() => {
    if (!slug) return;

    async function load() {
      setLoading(true);
      setError(false);

      // Fetch professional
      const { data: prof, error: profError } = await supabase
        .from("professionals")
        .select("*")
        .ilike("slug", slug)
        .single();
      console.log("[AgentProfile] slug query:", slug, "result:", prof, "error:", profError);

      if (profError || !prof) { setLoading(false); setError(true); return; }
      setProfessional(prof as unknown as Professional);

      // Fetch team, reviews in parallel
      const [teamRes, reviewRes] = await Promise.all([
        supabase
          .from("agent_team_members")
          .select("*")
          .eq("professional_id", prof.id)
          .order("sort_order"),
        supabase
          .from("agent_reviews")
          .select("*")
          .eq("professional_id", prof.id)
          .order("created_at", { ascending: false }),
      ]);

      setTeam((teamRes.data || []) as unknown as TeamMember[]);
      setReviews((reviewRes.data || []) as unknown as Review[]);

      // Fetch zone names with province if service_zones exist
      if (prof.service_zones && (prof.service_zones as string[]).length > 0) {
        const { data: zoneData } = await supabase
          .from("zones")
          .select("id, name, province, municipality")
          .in("id", prof.service_zones as string[]);
        setZones((zoneData || []) as ZoneInfo[]);
      }

      // If this is an agent belonging to an agency, fetch agency info
      if ((prof as any).agency_id) {
        const { data: agencyData } = await supabase
          .from("professionals")
          .select("*")
          .eq("id", (prof as any).agency_id)
          .single();
        if (agencyData) setAgency(agencyData as unknown as Professional);
      }

      // If this is an agency, fetch all agents that belong to it
      if ((prof as any).type === "agency") {
        const { data: agentsData } = await supabase
          .from("professionals")
          .select("*")
          .eq("agency_id", prof.id)
          .eq("is_active", true);
        if (agentsData) setAgencyAgents(agentsData as unknown as Professional[]);
      }

      // Fetch recent sales
      const { data: salesData } = await supabase
        .from("agent_sales")
        .select("*")
        .eq("professional_id", prof.id)
        .order("sale_date", { ascending: false, nullsFirst: false })
        .limit(50);
      if (salesData) setRecentSales(salesData);

      setLoading(false);
    }

    load();
  }, [slug]);

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!professional) return;
    if (!contactForm.name.trim() || !contactForm.email.trim()) {
      toast({ title: "Required fields", description: "Please fill in name and email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("agent_contact_requests").insert({
      professional_id: professional.id,
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone.trim() || null,
      interest: contactForm.interest,
      message: contactForm.message.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Could not send message. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: `Your message has been sent to ${professional.company_name}.` });
      setContactForm({ name: "", email: "", phone: "", interest: "valuation", message: "" });
      setMobileContactOpen(false);
    }
  }

  // Star distribution
  const starDist = [5, 4, 3, 2, 1].map(s => ({
    stars: s,
    count: reviews.filter(r => r.rating === s).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === s).length / reviews.length) * 100) : 0,
  }));

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, isMobile ? 3 : 5);

  // Map center from zones
  const mapCenter = useMemo(() => {
    const salesWithCoords = recentSales.filter(s => s.latitude && s.longitude);
    if (salesWithCoords.length > 0) {
      return {
        lat: salesWithCoords.reduce((sum: number, s: any) => sum + Number(s.latitude), 0) / salesWithCoords.length,
        lng: salesWithCoords.reduce((sum: number, s: any) => sum + Number(s.longitude), 0) / salesWithCoords.length,
      };
    }
    return { lat: 36.51, lng: -4.88 };
  }, [recentSales]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="animate-pulse">
          <div className="h-[30vh] md:h-[40vh] w-full bg-muted" />
          <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-12 relative z-10">
            <div className="w-20 h-20 rounded-full bg-muted border-4 border-background mb-4" />
            <div className="h-8 w-64 bg-muted rounded mb-3" />
            <div className="h-4 w-48 bg-muted rounded mb-2" />
            <div className="h-4 w-80 bg-muted rounded" />
          </div>
          <div className="border-y border-border/60 mt-8">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex gap-6">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-28 bg-muted rounded" />
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8">
              <div className="space-y-4">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Building2 size={48} className="text-muted-foreground/40" />
          <h2 className="text-xl font-semibold text-foreground">Agente no encontrado</h2>
          <p className="text-muted-foreground text-center max-w-md">
            We couldn't find this agent. They may have moved or changed their profile.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/agentes">Browse all agents</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const aboutText = professional.description || professional.bio;

  // ── Contact Form Component ──
  const ContactFormContent = (
    <form onSubmit={handleContactSubmit} className="space-y-4">
      <Input placeholder="Nombre *" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required />
      <Input type="email" placeholder="Email *" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required />
      <Input type="tel" placeholder="Teléfono (opcional)" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} />
      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        value={contactForm.interest}
        onChange={e => setContactForm(f => ({ ...f, interest: e.target.value }))}
      >
        <option value="valuation">I need a valuation</option>
        <option value="selling">I want to sell</option>
        <option value="buying">I want to buy</option>
        <option value="renting">Rental</option>
        <option value="other">Other</option>
      </select>
      <Textarea
        placeholder="Tu mensaje..."
        value={contactForm.message}
        onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
        rows={4}
      />
      <Button type="submit" className="w-full rounded-full bg-[#D4713B] hover:bg-[#c0612f] text-white" disabled={submitting}>
        <Send size={16} className="mr-2" />
        {submitting ? "Enviando..." : "Enviar mensaje"}
      </Button>
      <p className="text-[0.7rem] text-muted-foreground text-center leading-relaxed">
        Tu mensaje va directamente a {professional.company_name}. ValoraCasa no comparte tus datos.
      </p>
    </form>
  );

  const ContactFormSection = (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <p className={SECTION_LABEL}>CONTACT {professional.company_name.toUpperCase()}</p>

        {/* Show phone button */}
        {professional.phone && (
          <div className="mb-4">
            {showPhone ? (
              <a
                href={`tel:${professional.phone}`}
                className="flex items-center gap-2 w-full justify-center rounded-full border border-border py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Phone size={16} className="text-[#D4713B]" />
                {professional.phone}
              </a>
            ) : (
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => setShowPhone(true)}
              >
                <Eye size={16} className="mr-2" />
                Show number
              </Button>
            )}
          </div>
        )}

        {ContactFormContent}
      </CardContent>
    </Card>
  );


  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero / Header ── */}
      <section className="relative">
        <div
          className="h-[30vh] md:h-[40vh] w-full"
          style={{
            background: professional.cover_photo_url
              ? `url(${professional.cover_photo_url}) ${(professional as any).cover_photo_focus_x ?? 50}% ${(professional as any).cover_photo_focus_y ?? 50}%/cover no-repeat`
              : "linear-gradient(135deg, hsl(21 62% 53% / 0.25) 0%, hsl(30 80% 80% / 0.15) 50%, hsl(40 9% 97%) 100%)",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-12 relative z-10">
          <LogoWithFallback logoUrl={professional.logo_url} name={professional.company_name} size="lg" />

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{professional.company_name}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {professional.avg_rating > 0 && professional.total_reviews > 0 && (
                  <>
                    <StarRating rating={professional.avg_rating} />
                    <span className="text-sm text-muted-foreground">
                      {professional.avg_rating.toFixed(1)} ({professional.total_reviews} reviews)
                    </span>
                  </>
                )}
                {professional.is_verified && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[0.65rem] uppercase tracking-wider">
                    <CheckCircle2 size={12} className="mr-1" /> Verified
                  </Badge>
                )}
                {professional.languages && professional.languages.length > 0 && (
                  <div className="flex gap-1">
                    {professional.languages.map(l => (
                      <Badge key={l} variant="outline" className="text-[0.6rem] px-1.5 py-0 uppercase">{l}</Badge>
                    ))}
                  </div>
                )}
              </div>
              {professional.tagline && (
                <p className="text-muted-foreground mt-2 text-sm md:text-base">{professional.tagline}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
              <Button
                className="rounded-full bg-[#D4713B] hover:bg-[#c0612f] text-white"
                onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                Contact
              </Button>
              {professional.website && (
                <Button variant="outline" className="rounded-full" asChild>
                  <a href={professional.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} className="mr-2" /> Web
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-border/60 mt-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex gap-6 md:gap-10 overflow-x-auto">
          {professional.office_address && (
            <div className="flex items-center gap-2 shrink-0">
              <MapPin size={16} className="text-[#D4713B]" />
              <span className="text-sm text-muted-foreground">{professional.office_address}</span>
            </div>
          )}
          {professional.founded_year && (
            <div className="flex items-center gap-2 shrink-0">
              <Calendar size={16} className="text-[#D4713B]" />
              <span className="text-sm text-muted-foreground">Est. {professional.founded_year}</span>
            </div>
          )}
          {professional.team_size && (
            <div className="flex items-center gap-2 shrink-0">
              <Users size={16} className="text-[#D4713B]" />
              <span className="text-sm text-muted-foreground">{professional.team_size} members</span>
            </div>
          )}
          {professional.languages && professional.languages.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <Globe size={16} className="text-[#D4713B]" />
              <span className="text-sm text-muted-foreground">{professional.languages.join(", ")}</span>
            </div>
          )}
          {recentSales.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <Home size={16} className="text-[#D4713B]" />
              <span className="text-sm text-muted-foreground">{recentSales.length} sales</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Breadcrumbs ── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6">
        <AgentBreadcrumbs
          agentName={professional.company_name}
          provincia={primaryProvince}
          ciudad={primaryCity !== "Costa del Sol" ? primaryCity : null}
          agencyName={agency?.company_name}
          agencySlug={agency?.slug}
        />
      </div>

      {/* ── Main Content (2-col on desktop) ── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8 md:gap-12 items-start">
          {/* Left column */}
          <div className="space-y-12">
            {/* About */}
            {aboutText && (
              <section>
                <p className={SECTION_LABEL}>ABOUT US</p>
                <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-line">
                  {aboutText}
                </div>
                {/* Social links */}
                <div className="flex gap-3 mt-6">
                  {professional.instagram_url && (
                    <a href={professional.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[#D4713B] hover:border-[#D4713B] transition-colors">
                      <Instagram size={16} />
                    </a>
                  )}
                  {professional.facebook_url && (
                    <a href={professional.facebook_url} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[#D4713B] hover:border-[#D4713B] transition-colors">
                      <Facebook size={16} />
                    </a>
                  )}
                  {professional.linkedin_url && (
                    <a href={professional.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[#D4713B] hover:border-[#D4713B] transition-colors">
                      <Linkedin size={16} />
                    </a>
                  )}
                  {professional.website && (
                    <a href={professional.website} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[#D4713B] hover:border-[#D4713B] transition-colors">
                      <Globe size={16} />
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Agency context — enhanced */}
            {agency && (
              <section>
                <p className={SECTION_LABEL}>AGENCY</p>
                <Link to={`/agentes/${agency.slug}`}>
                  <Card className="border-border/60 hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center gap-4">
                      <LogoWithFallback logoUrl={agency.logo_url} name={agency.company_name} />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-semibold text-foreground">{agency.company_name}</p>
                        {agency.tagline && <p className="text-xs text-muted-foreground">{agency.tagline}</p>}
                        {agency.office_address && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin size={11} className="text-[#D4713B] shrink-0" />
                            <p className="text-xs text-muted-foreground truncate">{agency.office_address}</p>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-[#D4713B] shrink-0">View more →</span>
                    </CardContent>
                  </Card>
                </Link>

                {/* Other agents in the agency */}
                {agencyAgents.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-4">
                    {agencyAgents.slice(0, 4).map(agent => (
                      <Link
                        key={agent.id}
                        to={`/agentes/${agent.slug}`}
                        className="flex items-center gap-1.5 bg-secondary rounded-full pr-3 pl-1 py-1 hover:bg-accent transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#D4713B] flex items-center justify-center overflow-hidden shrink-0">
                          {agent.logo_url ? (
                            <img src={agent.logo_url} alt={agent.contact_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] font-bold text-white">{getInitials(agent.contact_name)}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-foreground">{agent.contact_name}</span>
                      </Link>
                    ))}
                    {agencyAgents.length > 4 && (
                      <Link
                        to={`/agentes/${agency.slug}`}
                        className="text-xs font-medium text-[#D4713B] hover:underline"
                      >
                        +{agencyAgents.length - 4} more
                      </Link>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Sales Statistics */}
            {recentSales.length > 0 && (
              <AgentSalesStats
                sales={recentSales}
                agentName={professional.contact_name || professional.company_name}
              />
            )}

            {/* Property Map */}
            {recentSales.some((s: any) => s.latitude && s.longitude) && (
              <Suspense fallback={<div className="h-[300px] bg-muted rounded-xl animate-pulse" />}>
                <AgentPropertyMap
                  sales={recentSales}
                  centerLat={mapCenter.lat}
                  centerLng={mapCenter.lng}
                />
              </Suspense>
            )}

            {/* Property Cards with Pagination */}
            {recentSales.length > 0 && (
              <AgentPropertyCards
                sales={recentSales}
                agentName={professional.contact_name || professional.company_name}
                agencyName={agency?.company_name}
              />
            )}

            {/* Team */}
            {team.length > 0 && (
              <section>
                <p className={SECTION_LABEL}>OUR TEAM</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {team.map(member => {
                    const memberCard = (
                      <Card className="border-border/60 hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {member.photo_url ? (
                              <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-semibold text-muted-foreground">{getInitials(member.name)}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-foreground">{member.name}</p>
                            {member.role && <p className="text-xs text-muted-foreground">{member.role}</p>}
                            {member.total_reviews > 0 && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <StarRating rating={member.avg_rating} size={12} />
                                <span className="text-[0.65rem] text-muted-foreground">({member.total_reviews})</span>
                              </div>
                            )}
                            {member.languages && member.languages.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {member.languages.map(l => (
                                  <Badge key={l} variant="secondary" className="text-[0.6rem] px-1.5 py-0">{l}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );

                    return member.slug ? (
                      <Link key={member.id} to={`/agentes/${professional.slug}/${member.slug}`}>
                        {memberCard}
                      </Link>
                    ) : (
                      <div key={member.id}>{memberCard}</div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Agency agents — if this is an agency profile */}
            {!agency && agencyAgents.length > 0 && (
              <section>
                <p className={SECTION_LABEL}>OUR AGENTS</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {agencyAgents.map(agent => (
                    <Link key={agent.id} to={`/agentes/${agent.slug}`}>
                      <Card className="border-border/60 hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-start gap-4">
                          <LogoWithFallback logoUrl={agent.logo_url} name={agent.company_name} />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground">{agent.contact_name || agent.company_name}</p>
                            {agent.tagline && <p className="text-xs text-muted-foreground">{agent.tagline}</p>}
                            {agent.avg_rating > 0 && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <StarRating rating={agent.avg_rating} size={12} />
                                <span className="text-[0.65rem] text-muted-foreground">({agent.total_reviews})</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Service areas */}
            <section>
              <p className={SECTION_LABEL}>SERVICE AREAS</p>
              {zones.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {zones.map(z => (
                    <Badge key={z.id} variant="outline" className="text-sm px-3 py-1.5">
                      <MapPin size={12} className="mr-1.5 text-[#D4713B]" />
                      {z.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Service areas not specified</p>
              )}
            </section>

            {/* Reviews */}
            <section>
              <p className={SECTION_LABEL}>CLIENT REVIEWS</p>

              {reviews.length > 0 ? (
                <>
                  <div className="flex items-start gap-6 mb-8">
                    <div className="text-center">
                      <p className="text-4xl font-serif font-light text-foreground">{professional.avg_rating.toFixed(1)}</p>
                      <StarRating rating={professional.avg_rating} size={14} />
                      <p className="text-xs text-muted-foreground mt-1">{professional.total_reviews} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {starDist.map(d => (
                        <div key={d.stars} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4 text-right">{d.stars}</span>
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                          </div>
                          <span className="text-[0.65rem] text-muted-foreground w-8">{d.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {displayedReviews.map(review => (
                      <Card key={review.id} className="border-border/40">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{review.reviewer_name}</p>
                              {review.reviewer_role && (
                                <Badge className={`text-[0.6rem] border-0 ${ROLE_COLORS[review.reviewer_role] || "bg-muted text-muted-foreground"}`}>
                                  {review.reviewer_role.charAt(0).toUpperCase() + review.reviewer_role.slice(1)}
                                </Badge>
                              )}
                              {review.source && review.source !== "manual" && (
                                <Badge variant="outline" className="text-[0.55rem] px-1.5 py-0 gap-1 font-normal">
                                  {review.source === "google" && (
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3 h-3" />
                                  )}
                                  {review.source === "trustpilot" && (
                                    <img src="https://www.trustpilot.com/favicon.ico" alt="Trustpilot" className="w-3 h-3" />
                                  )}
                                  {review.source.charAt(0).toUpperCase() + review.source.slice(1)}
                                </Badge>
                              )}
                              {review.is_verified && (
                                <CheckCircle2 size={14} className="text-emerald-500" />
                              )}
                            </div>
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

                  {reviews.length > (isMobile ? 3 : 5) && !showAllReviews && (
                    <Button variant="outline" className="w-full mt-4 rounded-full" onClick={() => setShowAllReviews(true)}>
                      View all {reviews.length} reviews
                    </Button>
                  )}
                </>
              ) : professional.total_reviews > 0 ? (
                <Card className="border-border/40">
                  <CardContent className="p-8 text-center">
                    <Star size={32} fill="hsl(var(--primary))" className="mx-auto text-primary mb-3 opacity-30" strokeWidth={0} />
                    <p className="text-sm text-foreground/70">Reviews available soon</p>
                    <p className="text-xs text-muted-foreground mt-1">{professional.total_reviews} Google reviews imported</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/40">
                  <CardContent className="p-8 text-center">
                    <Star size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Be the first to review {professional.company_name}</p>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>

          {/* Right column — Contact Form (sticky on desktop) */}
          <div className={isMobile ? "hidden" : "sticky top-24"} id="contact-form">
            {ContactFormSection}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="border-t border-border/60 py-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by <Link to="/" className="text-[#D4713B] hover:underline">ValoraCasa</Link>
          </p>
          <p className="text-[0.65rem] text-muted-foreground/60 mt-2">
            The information on this page is provided by the agency. ValoraCasa does not guarantee its accuracy.
          </p>
        </div>
      </div>

      <Footer />

      {/* Mobile fixed contact button */}
      {isMobile && (
        <Sheet open={mobileContactOpen} onOpenChange={setMobileContactOpen}>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-4 left-4 right-4 z-50 rounded-full shadow-lg bg-[#D4713B] hover:bg-[#c0612f] text-white h-12 text-base"
            >
              <Mail size={18} className="mr-2" />
              Contact
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-serif text-lg">
                Contact {professional.company_name}
              </SheetTitle>
            </SheetHeader>
            <div className="px-1 py-4">
              {/* Show phone button in mobile sheet */}
              {professional.phone && (
                <div className="mb-4">
                  {showPhone ? (
                    <a
                      href={`tel:${professional.phone}`}
                      className="flex items-center gap-2 w-full justify-center rounded-full border border-border py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <Phone size={16} className="text-[#D4713B]" />
                      {professional.phone}
                    </a>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => setShowPhone(true)}
                    >
                      <Eye size={16} className="mr-2" />
                      Show number
                    </Button>
                  )}
                </div>
              )}
              {ContactFormContent}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
    </ErrorBoundary>
  );
}
