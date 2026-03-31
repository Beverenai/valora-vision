import { useEffect, useMemo, useState, type FC } from "react";
import { useSEO } from "@/hooks/use-seo";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, CheckCircle, MapPin, Globe, ChevronRight } from "lucide-react";
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

function AgentCard({ agent, zone }: { agent: Professional; zone: string | null }) {
  const [logoFailed, setLogoFailed] = useState(false);
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          {agent.logo_url && !logoFailed ? (
            <img
              src={agent.logo_url}
              alt={agent.company_name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-semibold text-sm">
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
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span>{(agent.avg_rating || 0).toFixed(1)}</span>
              <span>({agent.total_reviews || 0})</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {agent.tagline || agent.description || "Real estate professional"}
        </p>

        {zone && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span>{zone}</span>
          </div>
        )}

        {agent.languages && agent.languages.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <Globe className="h-3 w-3" />
            <span>{agent.languages.join(" · ")}</span>
          </div>
        )}

        <Link
          to={`/agentes/${agent.slug}`}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          View Profile
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function AgentDirectory() {
  const [agents, setAgents] = useState<Professional[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [sort, setSort] = useState<"rating" | "reviews">("rating");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useSEO({ title: "Real Estate Agents in Costa del Sol | ValoraCasa", description: "Browse verified real estate agents across Costa del Sol. Filter by location, language, and rating to find your ideal property expert." });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [agentsRes, zonesRes] = await Promise.all([
      supabase
        .from("professionals")
        .select("id, company_name, slug, logo_url, description, tagline, avg_rating, total_reviews, is_verified, languages, service_zones")
        .eq("is_active", true),
      supabase.from("zones").select("id, name"),
    ]);
    setAgents((agentsRes.data as Professional[]) || []);
    setZones((zonesRes.data as Zone[]) || []);
    setLoading(false);
  }

  const zoneMap = useMemo(() => {
    const m: Record<string, string> = {};
    zones.forEach((z) => (m[z.id] = z.name));
    return m;
  }, [zones]);

  const filtered = useMemo(() => {
    let list = [...agents];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.company_name.toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) ||
          (a.service_zones || []).some((zid) => (zoneMap[zid] || "").toLowerCase().includes(q))
      );
    }

    // Location filter
    if (location !== "All locations") {
      list = list.filter((a) =>
        (a.service_zones || []).some((zid) => (zoneMap[zid] || "").toLowerCase().includes(location.toLowerCase()))
      );
    }

    // Language filter
    if (selectedLangs.length > 0) {
      list = list.filter((a) =>
        selectedLangs.some((lang) => (a.languages || []).some((l) => l.toLowerCase().startsWith(lang)))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sort === "rating") return (b.avg_rating || 0) - (a.avg_rating || 0);
      return (b.total_reviews || 0) - (a.total_reviews || 0);
    });

    return list;
  }, [agents, search, location, selectedLangs, sort, zoneMap]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function toggleLang(code: string) {
    setSelectedLangs((prev) => (prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]));
  }

  function getPrimaryZone(agent: Professional): string | null {
    const zoneIds = agent.service_zones || [];
    if (zoneIds.length === 0) return null;
    return zoneMap[zoneIds[0]] || null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary to-background pt-24 pb-12 px-4 text-center">
        <h1 className="font-['DM_Serif_Display'] text-3xl md:text-5xl text-foreground mb-3">
          Find a Real Estate Expert
        </h1>
        <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-xl mx-auto">
          Verified agents across Costa del Sol
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
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3 items-center">
          <Select value={location} onValueChange={(v) => { setLocation(v); setVisibleCount(PAGE_SIZE); }}>
            <SelectTrigger className="w-[160px]">
              <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MUNICIPALITIES.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1.5 flex-wrap">
            {LANGUAGES.map((lang) => (
              <Badge
                key={lang.code}
                variant={selectedLangs.includes(lang.code) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => { toggleLang(lang.code); setVisibleCount(PAGE_SIZE); }}
              >
                {lang.label}
              </Badge>
            ))}
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v as "rating" | "reviews")}>
            <SelectTrigger className="w-[150px] ml-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest rated</SelectItem>
              <SelectItem value="reviews">Most reviews</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse h-56" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No agents found in this area.</p>
            <p className="text-muted-foreground text-sm mt-1">Try expanding your search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((agent) => (
                <AgentCard key={agent.id} agent={agent} zone={getPrimaryZone(agent)} />
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

      <Footer />
    </div>
  );
}
