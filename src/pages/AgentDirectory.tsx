import { useEffect, useMemo, useState } from "react";
import { useSEO } from "@/hooks/use-seo";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, CheckCircle, MapPin, Globe, ChevronRight, Sparkles, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MUNICIPALITIES = [
  "All locations",
  "Marbella",
  "Estepona",
  "Benahavís",
  "Mijas",
  "Fuengirola",
  "Benalmádena",
  "Torremolinos",
  "Málaga",
  "Nerja",
  "Manilva",
  "Nueva Andalucía",
  "Puerto Banús",
  "San Pedro",
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "no", label: "Norsk" },
  { code: "sv", label: "Svenska" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "nl", label: "Nederlands" },
];

const PAGE_SIZE = 12;

interface Professional {
  id: string;
  company_name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  tagline: string | null;
  avg_rating: number | null;
  total_reviews: number | null;
  is_verified: boolean | null;
  languages: string[] | null;
  service_zones: string[] | null;
  office_address: string | null;
  created_at: string | null;
  type: string;
  agency_id: string | null;
  contact_name: string | null;
}

interface ProfessionalZone {
  professional_id: string;
  tier: string;
  is_active: boolean | null;
}

interface Zone {
  id: string;
  name: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function AgentCard({ agent, zone, isFeatured }: { agent: Professional; zone: string | null; isFeatured: boolean }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const displayLocation = zone || agent.office_address;
  const hasRating = agent.avg_rating != null && agent.avg_rating > 0;

  return (
    <Link to={`/agentes/${agent.slug}`} className="block group">
      <Card className={`hover:shadow-md transition-shadow h-full ${isFeatured ? "ring-1 ring-primary/30 shadow-sm" : ""}`}>
        <CardContent className="p-5">
          {isFeatured && (
            <div className="flex items-center gap-1 mb-3">
              <Badge className="bg-primary/10 text-primary border-0 text-[0.6rem] uppercase tracking-wider font-semibold">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
          <div className="flex items-start gap-3 mb-3">
            {agent.logo_url && !logoFailed ? (
              <img
                src={agent.logo_url}
                alt={agent.company_name}
                className="w-12 h-12 rounded-full object-cover shrink-0"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#D4713B] flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-sm">
                  {getInitials(agent.company_name)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-foreground truncate">{agent.company_name}</h3>
                {agent.is_verified && (
                  <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] shrink-0" />
                )}
              </div>
              {hasRating ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span>{(agent.avg_rating!).toFixed(1)}</span>
                  <span>({agent.total_reviews || 0})</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">New on ValoraCasa</p>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {agent.tagline || agent.description || "Real estate professional"}
          </p>

          {displayLocation && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </div>
          )}

          {agent.languages && agent.languages.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mb-4">
              <Globe className="h-3 w-3 shrink-0 text-muted-foreground" />
              {agent.languages.slice(0, 4).map((lang) => (
                <Badge key={lang} variant="outline" className="text-[0.6rem] px-1.5 py-0 uppercase tracking-wide">
                  {lang}
                </Badge>
              ))}
            </div>
          )}

          <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
            View Profile
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
        <div className="h-3 w-1/3 bg-muted rounded mb-2" />
        <div className="h-3 w-1/4 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

export default function AgentDirectory() {
  const [agents, setAgents] = useState<Professional[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [profZones, setProfZones] = useState<ProfessionalZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [sort, setSort] = useState<"rating" | "reviews" | "newest">("rating");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useSEO({ title: "Real Estate Agents in Costa del Sol | ValoraCasa", description: "Find verified real estate agents across Costa del Sol. Compare ratings, reviews, and expertise to find your perfect property partner." });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [agentsRes, zonesRes, pzRes] = await Promise.all([
      supabase
        .from("professionals")
        .select("id, company_name, slug, logo_url, description, tagline, avg_rating, total_reviews, is_verified, languages, service_zones, office_address, created_at, type, agency_id, contact_name")
        .eq("is_active", true),
      supabase.from("zones").select("id, name"),
      supabase.from("professional_zones").select("professional_id, tier, is_active").eq("is_active", true),
    ]);
    setAgents((agentsRes.data as Professional[]) || []);
    setZones((zonesRes.data as Zone[]) || []);
    setProfZones((pzRes.data as ProfessionalZone[]) || []);
    setLoading(false);
  }

  const zoneMap = useMemo(() => {
    const m: Record<string, string> = {};
    zones.forEach((z) => (m[z.id] = z.name));
    return m;
  }, [zones]);

  const featuredSet = useMemo(() => {
    const s = new Set<string>();
    profZones.forEach((pz) => {
      if (pz.tier === "premium" || pz.tier === "featured") s.add(pz.professional_id);
    });
    return s;
  }, [profZones]);

  const filtered = useMemo(() => {
    let list = [...agents];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.company_name.toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) ||
          (a.office_address || "").toLowerCase().includes(q) ||
          (a.service_zones || []).some((zid) => (zoneMap[zid] || "").toLowerCase().includes(q))
      );
    }

    if (location !== "All locations") {
      list = list.filter((a) =>
        (a.service_zones || []).some((zid) => (zoneMap[zid] || "").toLowerCase().includes(location.toLowerCase())) ||
        (a.office_address || "").toLowerCase().includes(location.toLowerCase())
      );
    }

    if (selectedLangs.length > 0) {
      list = list.filter((a) =>
        selectedLangs.some((lang) => (a.languages || []).some((l) => l.toLowerCase().startsWith(lang)))
      );
    }

    list.sort((a, b) => {
      const aFeatured = featuredSet.has(a.id) ? 1 : 0;
      const bFeatured = featuredSet.has(b.id) ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      if (sort === "rating") return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sort === "reviews") return (b.total_reviews || 0) - (a.total_reviews || 0);
      // newest
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    return list;
  }, [agents, search, location, selectedLangs, sort, zoneMap, featuredSet]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function toggleLang(code: string) {
    setSelectedLangs((prev) => (prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]));
  }

  function clearFilters() {
    setSearch("");
    setLocation("All locations");
    setSelectedLangs([]);
    setSort("rating");
    setVisibleCount(PAGE_SIZE);
  }

  function getPrimaryZone(agent: Professional): string | null {
    const zoneIds = agent.service_zones || [];
    if (zoneIds.length === 0) return null;
    return zoneMap[zoneIds[0]] || null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Real Estate Agents in Costa del Sol",
    description: "Browse verified real estate agents across Costa del Sol.",
    numberOfItems: filtered.length,
    itemListElement: visible.map((agent, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "RealEstateAgent",
        name: agent.company_name,
        url: `https://valora-vision.lovable.app/agentes/${agent.slug}`,
        ...(agent.avg_rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: agent.avg_rating, reviewCount: agent.total_reviews || 0 } } : {}),
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary to-background pt-24 pb-12 px-4 text-center">
        <h1 className="font-serif text-3xl md:text-5xl text-foreground mb-3">
          Find a Real Estate Expert
        </h1>
        <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-xl mx-auto">
          Verified agents across Costa del Sol — matched by proximity, reviews, and expertise
        </p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          />
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border py-3 px-4">
        <div className="max-w-6xl mx-auto flex gap-3 items-center overflow-x-auto flex-nowrap">
          <Select value={location} onValueChange={(v) => { setLocation(v); setVisibleCount(PAGE_SIZE); }}>
            <SelectTrigger className="w-[160px] shrink-0">
              <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MUNICIPALITIES.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1.5 flex-nowrap">
            {LANGUAGES.map((lang) => (
              <Badge
                key={lang.code}
                variant={selectedLangs.includes(lang.code) ? "default" : "outline"}
                className="cursor-pointer text-xs whitespace-nowrap shrink-0"
                onClick={() => { toggleLang(lang.code); setVisibleCount(PAGE_SIZE); }}
              >
                {lang.label}
              </Badge>
            ))}
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v as "rating" | "reviews" | "newest")}>
            <SelectTrigger className="w-[150px] ml-auto shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest rated</SelectItem>
              <SelectItem value="reviews">Most reviews</SelectItem>
              <SelectItem value="newest">Recently joined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No agents found matching your criteria.</p>
            <p className="text-muted-foreground text-sm mt-1">Try expanding your search.</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} agent{filtered.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((agent) => (
                <AgentCard key={agent.id} agent={agent} zone={getPrimaryZone(agent)} isFeatured={featuredSet.has(agent.id)} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <Button variant="outline" onClick={() => setVisibleCount((p) => p + PAGE_SIZE)}>
                  Load more agents
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* CTA for agents */}
      <section className="bg-secondary py-16 px-4 text-center">
        <Users className="h-8 w-8 text-primary mx-auto mb-4" />
        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">Are you a real estate agent?</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Join ValoraCasa to receive qualified leads from homeowners in your area. Free to start — upgrade for guaranteed visibility.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button asChild>
            <Link to="/pro">Get started free</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pro#pricing">See plans</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}