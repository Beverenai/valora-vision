import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatRefCode } from "@/utils/referenceCode";
import { Lock, ExternalLink, RefreshCw, Activity, Database, Zap, Users, AlertTriangle, CheckCircle, Clock, Play, Globe, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSidebar, type AdminSection } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

const ADMIN_PASSWORD = "1234";

// ─── Types ───────────────────────────────────────────────
interface LeadRow {
  id: string;
  type: "sell" | "rent" | "buy";
  full_name: string;
  email: string;
  address: string;
  city: string | null;
  property_type: string | null;
  status: string | null;
  estimated_value: number | null;
  annual_income_estimate: number | null;
  asking_price: number | null;
  price_score: string | null;
  created_at: string | null;
}

interface ZoneRow {
  id: string;
  name: string;
  municipality: string | null;
  tier: string | null;
  idealista_location: string | null;
  last_scraped_at: string | null;
  last_scrape_count: number | null;
  last_scrape_status: string | null;
  total_properties: number | null;
  is_active: boolean | null;
}

interface ScrapeJobRow {
  id: string;
  zone_id: string;
  status: string;
  apify_run_id: string | null;
  items_found: number | null;
  items_upserted: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  zones?: { name: string } | null;
}

interface HealthData {
  total_sale_properties: number;
  active_sale_properties: number;
  total_rent_properties: number;
  active_rent_properties: number;
  zones_total: number;
  zones_stale: number;
  sell_valuations_today: number;
  buy_analyses_today: number;
  pending_scrape_jobs: number;
  running_scrape_jobs: number;
  failed_scrape_jobs_24h: number;
  completed_scrape_jobs_24h: number;
}

// ─── Helper Components ────────────────────────────────────

function StatusBadge({ status, dark }: { status: string; dark?: boolean }) {
  const colors: Record<string, string> = {
    completed: "bg-emerald-500/10 text-emerald-600",
    ready: "bg-emerald-500/10 text-emerald-600",
    success: "bg-emerald-500/10 text-emerald-600",
    running: "bg-blue-500/10 text-blue-600",
    processing: "bg-blue-500/10 text-blue-600",
    pending: dark ? "bg-white/10 text-white/80" : "bg-muted text-muted-foreground",
    failed: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

function TierBadge({ tier }: { tier: string | null }) {
  const colors: Record<string, string> = {
    hot: "bg-red-500/10 text-red-600",
    warm: "bg-amber-500/10 text-amber-600",
    cold: "bg-blue-500/10 text-blue-600",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[tier || ""] || "bg-muted text-muted-foreground"}`}>
      {tier || "—"}
    </span>
  );
}

function StalenessIndicator({ lastScraped, tier }: { lastScraped: string | null; tier: string | null }) {
  if (!lastScraped) return <span className="text-destructive text-xs">Never scraped</span>;
  const hours = (Date.now() - new Date(lastScraped).getTime()) / (1000 * 60 * 60);
  const maxHours = tier === "hot" ? 72 : tier === "warm" ? 168 : 336;
  const pct = Math.min(hours / maxHours, 1);
  const color = pct < 0.5 ? "text-emerald-600" : pct < 0.8 ? "text-amber-600" : "text-destructive";
  const ago = hours < 1 ? "< 1h ago" : hours < 24 ? `${Math.round(hours)}h ago` : `${Math.round(hours / 24)}d ago`;
  return <span className={`text-xs font-medium ${color}`}>{ago}</span>;
}

// ─── Main Admin Component ─────────────────────────────────
const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [dark, setDark] = useState(true);
  const [section, setSection] = useState<AdminSection>("leads");
  const navigate = useNavigate();

  const [leadCount, setLeadCount] = useState(0);
  const [buyCount, setBuyCount] = useState(0);
  const [healthScore, setHealthScore] = useState("—");

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
  };

  // Fetch quick stats
  useEffect(() => {
    if (!authenticated) return;
    const fetchStats = async () => {
      const [sellRes, rentRes, buyRes] = await Promise.all([
        supabase.from("leads_sell").select("id", { count: "exact", head: true }),
        supabase.from("leads_rent").select("id", { count: "exact", head: true }),
        supabase.from("buy_analyses").select("id", { count: "exact", head: true }),
      ]);
      setLeadCount((sellRes.count || 0) + (rentRes.count || 0));
      setBuyCount(buyRes.count || 0);
    };
    fetchStats();
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[hsl(220,18%,9%)] flex items-center justify-center px-5">
        <div className="max-w-sm w-full flex flex-col items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Lock size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-serif font-semibold text-white">Admin Access</h1>
          <div className="w-full flex gap-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button onClick={handleLogin}>Enter</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[60] bg-primary/90 text-primary-foreground text-xs px-4 py-1 rounded-b-lg">
        ⚙ Admin View
      </div>
    <div className={cn(
      "min-h-screen flex flex-col",
      dark ? "bg-[hsl(220,18%,9%)]" : "bg-background"
    )}>
      <AdminHeader dark={dark} onToggleDark={() => setDark(!dark)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile, shown via dropdown in content area */}
        <div className="hidden md:flex h-full">
          <AdminSidebar active={section} onNav={setSection} dark={dark} badges={{ leads: leadCount, buy: buyCount }} />
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Mobile nav dropdown */}
          <div className="md:hidden px-4 pt-4">
            <AdminSidebar active={section} onNav={setSection} dark={dark} badges={{ leads: leadCount, buy: buyCount }} />
          </div>

          {/* Content */}
          <div className="flex-1 px-4 md:px-6 py-6">
            {section === "leads" && <LeadsTab navigate={navigate} dark={dark} />}
            {section === "buy" && <BuyAnalysesTab navigate={navigate} dark={dark} />}
            {section === "zones" && <ZonesTab dark={dark} />}
            {section === "jobs" && <JobsTab dark={dark} />}
            {section === "resales" && <ResalesTab dark={dark} />}
            {section === "health" && <HealthTab dark={dark} onHealthScore={setHealthScore} />}
            {section === "map" && <ValuationsMapTab dark={dark} />}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

// ─── VALUATIONS TAB (formerly Leads) ──────────────────────
function LeadsTab({ navigate, dark }: { navigate: ReturnType<typeof useNavigate>; dark: boolean }) {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const [sellRes, rentRes] = await Promise.all([
        supabase.from("leads_sell").select("id, full_name, email, address, city, property_type, status, estimated_value, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("leads_rent").select("id, full_name, email, address, city, property_type, status, annual_income_estimate, created_at").order("created_at", { ascending: false }).limit(500),
      ]);

      const sellLeads: LeadRow[] = (sellRes.data || []).map((l) => ({ ...l, type: "sell" as const, annual_income_estimate: null, asking_price: null, price_score: null }));
      const rentLeads: LeadRow[] = (rentRes.data || []).map((l) => ({ ...l, type: "rent" as const, estimated_value: null, asking_price: null, price_score: null }));

      const all = [...sellLeads, ...rentLeads].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setLeads(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const cities = Array.from(new Set(leads.map(l => l.city).filter(Boolean) as string[])).sort();

  const filtered = leads.filter((l) => {
    if (typeFilter !== "all" && l.type !== typeFilter) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (cityFilter !== "all" && l.city !== cityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = [l.full_name, l.email, l.address, l.city].some(f => f?.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="relative">
          <Search size={14} className={cn("absolute left-3 top-1/2 -translate-y-1/2", dark ? "text-white/50" : "text-muted-foreground")} />
          <Input
            placeholder="Search name, email, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("pl-9 w-[240px]", dark && "bg-white/10 border-white/20 text-white placeholder:text-white/50")}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className={cn("w-[120px]", dark && "bg-white/10 border-white/20 text-white")}><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={cn("w-[120px]", dark && "bg-white/10 border-white/20 text-white")}><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
          </SelectContent>
        </Select>
        {cities.length > 0 && (
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className={cn("w-[140px]", dark && "bg-white/10 border-white/20 text-white")}><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading} className={cn(dark && "border-white/10 text-white/80 hover:text-white hover:bg-white/5")}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
        <span className={cn("text-sm ml-auto", dark ? "text-white/60" : "text-muted-foreground")}>{filtered.length} valuations</span>
      </div>

      <div className={cn("rounded-xl overflow-x-auto", dark ? "border border-white/10" : "border border-border")}>
        <table className="w-full text-sm">
          <thead>
            <tr className={cn("border-b", dark ? "border-white/10 bg-white/5" : "border-border bg-muted/50")}>
              {["Ref", "Date", "Type", "Name", "Email", "Address", "City", "Status", "Value", ""].map((h) => (
                <th key={h} className={cn("text-left px-4 py-3 font-medium text-xs uppercase tracking-wider", dark ? "text-white/60" : "text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={`${lead.type}-${lead.id}`} className={cn("border-b transition-colors", dark ? "border-white/5 hover:bg-white/5" : "border-border/50 hover:bg-muted/30")}>
                <td className="px-4 py-3 font-mono text-xs text-primary">{formatRefCode(lead.id)}</td>
                <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    lead.type === "sell" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-600"
                  }`}>{lead.type}</span>
                </td>
                <td className={cn("px-4 py-3", dark ? "text-white" : "text-foreground")}>{lead.full_name}</td>
                <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{lead.email}</td>
                <td className={cn("px-4 py-3 max-w-[200px] truncate", dark ? "text-white/50" : "text-muted-foreground")}>{lead.address}</td>
                <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{lead.city || "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={lead.status || "pending"} dark={dark} /></td>
                <td className={cn("px-4 py-3 font-medium", dark ? "text-white" : "text-foreground")}>
                  {lead.type === "sell" && lead.estimated_value ? `€${lead.estimated_value.toLocaleString()}`
                    : lead.type === "rent" && lead.annual_income_estimate ? `€${lead.annual_income_estimate.toLocaleString()}/yr`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/${lead.type}/result/${lead.id}`)} className={cn(dark && "text-white/60 hover:text-white hover:bg-white/10")}>
                    <ExternalLink size={14} />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className={cn("text-center py-12", dark ? "text-white/60" : "text-muted-foreground")}>{loading ? "Loading..." : "No valuations found"}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── BUY ANALYSES TAB ─────────────────────────────────────
interface BuyAnalysisRow {
  id: string;
  email: string | null;
  address: string | null;
  city: string | null;
  property_type: string | null;
  status: string | null;
  price_score: string | null;
  asking_price: number;
  estimated_value: number | null;
  source_url: string;
  created_at: string | null;
}

function BuyAnalysesTab({ navigate, dark }: { navigate: ReturnType<typeof useNavigate>; dark: boolean }) {
  const [analyses, setAnalyses] = useState<BuyAnalysisRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;

  const fetchAnalyses = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data } = await supabase
        .from("buy_analyses")
        .select("id, email, address, city, property_type, status, price_score, asking_price, estimated_value, source_url, created_at")
        .order("created_at", { ascending: false })
        .range(from, to);

      const rows = (data || []) as BuyAnalysisRow[];
      if (append) {
        setAnalyses(prev => [...prev, ...rows]);
      } else {
        setAnalyses(rows);
      }
      setHasMore(rows.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalyses(0); }, [fetchAnalyses]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchAnalyses(next, true);
  };

  const cities = Array.from(new Set(analyses.map(a => a.city).filter(Boolean) as string[])).sort();
  const scores = Array.from(new Set(analyses.map(a => a.price_score).filter(Boolean) as string[])).sort();

  const filtered = analyses.filter((a) => {
    if (cityFilter !== "all" && a.city !== cityFilter) return false;
    if (scoreFilter !== "all" && a.price_score !== scoreFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = [a.email, a.address, a.city].some(f => f?.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const scoreColor = (score: string | null) => {
    if (!score) return "";
    const s = score.toLowerCase();
    if (s.includes("below")) return "bg-emerald-500/10 text-emerald-600";
    if (s.includes("good")) return "bg-emerald-500/10 text-emerald-600";
    if (s.includes("fair")) return "bg-blue-500/10 text-blue-600";
    if (s.includes("slightly")) return "bg-amber-500/10 text-amber-600";
    if (s.includes("above")) return "bg-red-500/10 text-red-600";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div>
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="relative">
          <Search size={14} className={cn("absolute left-3 top-1/2 -translate-y-1/2", dark ? "text-white/50" : "text-muted-foreground")} />
          <Input
            placeholder="Search email, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("pl-9 w-[220px]", dark && "bg-white/10 border-white/20 text-white placeholder:text-white/50")}
          />
        </div>
        {cities.length > 0 && (
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className={cn("w-[140px]", dark && "bg-white/10 border-white/20 text-white")}><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {scores.length > 0 && (
          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className={cn("w-[160px]", dark && "bg-white/10 border-white/20 text-white")}><SelectValue placeholder="Price Score" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              {scores.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Button variant="outline" size="sm" onClick={() => { setPage(0); fetchAnalyses(0); }} disabled={loading} className={cn(dark && "border-white/10 text-white/80 hover:text-white hover:bg-white/5")}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
        <span className={cn("text-sm ml-auto", dark ? "text-white/60" : "text-muted-foreground")}>{filtered.length} analyses</span>
      </div>

      <div className={cn("rounded-xl overflow-x-auto", dark ? "border border-white/10" : "border border-border")}>
        <table className="w-full text-sm">
          <thead>
            <tr className={cn("border-b", dark ? "border-white/10 bg-white/5" : "border-border bg-muted/50")}>
              {["Date", "Email", "Address", "City", "Score", "Asking", "Estimated", "Status", ""].map((h) => (
                <th key={h} className={cn("text-left px-4 py-3 font-medium text-xs uppercase tracking-wider", dark ? "text-white/60" : "text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className={cn("border-b transition-colors", dark ? "border-white/5 hover:bg-white/5" : "border-border/50 hover:bg-muted/30")}>
                <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}</td>
                <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{a.email || "—"}</td>
                <td className={cn("px-4 py-3 max-w-[200px] truncate", dark ? "text-white" : "text-foreground")}>{a.address || "—"}</td>
                <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{a.city || "—"}</td>
                <td className="px-4 py-3">
                  {a.price_score ? (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${scoreColor(a.price_score)}`}>{a.price_score}</span>
                  ) : "—"}
                </td>
                <td className={cn("px-4 py-3 font-medium", dark ? "text-white" : "text-foreground")}>€{a.asking_price?.toLocaleString()}</td>
                <td className={cn("px-4 py-3 font-medium", dark ? "text-white" : "text-foreground")}>{a.estimated_value ? `€${a.estimated_value.toLocaleString()}` : "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status || "pending"} dark={dark} /></td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/buy/result/${a.id}`)} className={cn(dark && "text-white/60 hover:text-white hover:bg-white/10")}>
                    <ExternalLink size={14} />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className={cn("text-center py-12", dark ? "text-white/60" : "text-muted-foreground")}>{loading ? "Loading..." : "No buy analyses found"}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && filtered.length > 0 && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={loading} className={cn(dark && "border-white/10 text-white/80 hover:text-white hover:bg-white/5")}>
            {loading ? <RefreshCw size={14} className="animate-spin" /> : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── ZONES TAB ────────────────────────────────────────────
function ZonesTab({ dark }: { dark: boolean }) {
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState<string | null>(null);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("zones").select("id, name, municipality, tier, idealista_location, last_scraped_at, last_scrape_count, last_scrape_status, total_properties, is_active").order("name");
    setZones((data as ZoneRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  const triggerScrape = async (zone: ZoneRow) => {
    if (!zone.idealista_location) return;
    setScraping(zone.id);
    try {
      const { error } = await supabase.functions.invoke("process-scrape-job", { body: { zone_id: zone.id } });
      if (error) console.error("Scrape trigger error:", error);
      await fetchZones();
    } catch (e) {
      console.error("Scrape trigger error:", e);
    } finally {
      setScraping(null);
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-4 items-center">
        <Button variant="outline" size="sm" onClick={fetchZones} disabled={loading} className={cn(dark && "border-white/10 text-white/80 hover:text-white hover:bg-white/5")}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
        <span className={cn("text-sm ml-auto", dark ? "text-white/60" : "text-muted-foreground")}>{zones.length} zones</span>
      </div>

      <div className={cn("rounded-xl overflow-x-auto", dark ? "border border-white/10" : "border border-border")}>
        <table className="w-full text-sm">
          <thead>
            <tr className={cn("border-b", dark ? "border-white/10 bg-white/5" : "border-border bg-muted/50")}>
              {["Zone", "Municipality", "Tier", "Location ID", "Last Scraped", "Properties", "Status", ""].map((h) => (
                <th key={h} className={cn("text-left px-4 py-3 font-medium text-xs uppercase tracking-wider", dark ? "text-white/60" : "text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.id} className={cn("border-b transition-colors", dark ? "border-white/5 hover:bg-white/5" : "border-border/50 hover:bg-muted/30")}>
                <td className={cn("px-4 py-3 font-medium", dark ? "text-white" : "text-foreground")}>{zone.name}</td>
                <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{zone.municipality || "—"}</td>
                <td className="px-4 py-3"><TierBadge tier={zone.tier} /></td>
                <td className={cn("px-4 py-3 font-mono text-xs", dark ? "text-white/60" : "text-muted-foreground")}>{zone.idealista_location || "—"}</td>
                <td className="px-4 py-3"><StalenessIndicator lastScraped={zone.last_scraped_at} tier={zone.tier} /></td>
                <td className={cn("px-4 py-3", dark ? "text-white" : "text-foreground")}>{zone.total_properties || 0}</td>
                <td className="px-4 py-3"><StatusBadge status={zone.last_scrape_status || "pending"} dark={dark} /></td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" disabled={!zone.idealista_location || scraping === zone.id} onClick={() => triggerScrape(zone)}
                    className={cn(dark && "border-white/10 text-white/80 hover:text-white hover:bg-white/5")}>
                    {scraping === zone.id ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                    Scrape
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SCRAPE JOBS TAB ──────────────────────────────────────
function JobsTab({ dark }: { dark: boolean }) {
  const [jobs, setJobs] = useState<ScrapeJobRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("scrape_jobs").select("*, zones(name)").order("created_at", { ascending: false }).limit(100);
    setJobs((data as ScrapeJobRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    const hasRunning = jobs.some(j => j.status === "running" || j.status === "pending");
    if (!hasRunning) return;
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, [jobs, fetchJobs]);

  const filtered = jobs.filter(j => statusFilter === "all" || j.status === statusFilter);

  return (
    <div>
      <div className="flex gap-3 mb-4 items-center flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={cn("w-[140px]", dark && "bg-white/10 border-white/20 text-white")}><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading} className={cn(dark && "border-white/10 text-white/80 hover:text-white hover:bg-white/5")}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
        <span className={cn("text-sm ml-auto", dark ? "text-white/60" : "text-muted-foreground")}>{filtered.length} jobs</span>
      </div>

      <div className={cn("rounded-xl overflow-x-auto", dark ? "border border-white/10" : "border border-border")}>
        <table className="w-full text-sm">
          <thead>
            <tr className={cn("border-b", dark ? "border-white/10 bg-white/5" : "border-border bg-muted/50")}>
              {["Zone", "Status", "Items Found", "Upserted", "Duration", "Created", "Error"].map((h) => (
                <th key={h} className={cn("text-left px-4 py-3 font-medium text-xs uppercase tracking-wider", dark ? "text-white/60" : "text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => {
              const duration = job.started_at && job.completed_at
                ? `${Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s`
                : job.started_at ? "Running..." : "—";
              return (
                <tr key={job.id} className={cn("border-b transition-colors", dark ? "border-white/5 hover:bg-white/5" : "border-border/50 hover:bg-muted/30")}>
                  <td className={cn("px-4 py-3 font-medium", dark ? "text-white" : "text-foreground")}>{job.zones?.name || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status} dark={dark} /></td>
                  <td className={cn("px-4 py-3", dark ? "text-white" : "text-foreground")}>{job.items_found ?? "—"}</td>
                  <td className={cn("px-4 py-3", dark ? "text-white" : "text-foreground")}>{job.items_upserted ?? "—"}</td>
                  <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{duration}</td>
                  <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{job.created_at ? new Date(job.created_at).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-destructive text-xs max-w-[200px] truncate">{job.error_message || ""}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className={cn("text-center py-12", dark ? "text-white/60" : "text-muted-foreground")}>{loading ? "Loading..." : "No jobs found"}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── RESALES ONLINE TAB ───────────────────────────────────
interface ResalesConfig {
  id: string;
  contact_id: string;
  api_key: string;
  filter_alias: string;
  filter_id: number;
  province: string | null;
  sync_interval_hours: number | null;
  is_active: boolean | null;
  last_sync_at: string | null;
  last_sync_status: string | null;
}

interface SyncLogRow {
  id: string;
  config_id: string | null;
  filter_alias: string | null;
  status: string;
  properties_fetched: number | null;
  properties_upserted: number | null;
  properties_deactivated: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
}

function ResalesTab({ dark }: { dark: boolean }) {
  const [configs, setConfigs] = useState<ResalesConfig[]>([]);
  const [logs, setLogs] = useState<SyncLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [rolCount, setRolCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newConfig, setNewConfig] = useState({ contact_id: "", api_key: "", filter_alias: "sale", filter_id: 1, province: "Málaga", sync_interval_hours: 24 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [configRes, logRes, countRes] = await Promise.all([
      supabase.from("resales_online_config").select("*").order("filter_id"),
      supabase.from("resales_sync_log").select("*").order("started_at", { ascending: false }).limit(20),
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("data_source", "resales_online").eq("is_active", true),
    ]);
    setConfigs((configRes.data || []) as ResalesConfig[]);
    setLogs((logRes.data || []) as SyncLogRow[]);
    setRolCount(countRes.count || 0);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh while syncing
  useEffect(() => {
    const hasRunning = logs.some(l => l.status === "running");
    if (!hasRunning) return;
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [logs, fetchData]);

  const handleSync = async (filterId?: string) => {
    setSyncing(filterId || "all");
    try {
      const body = filterId ? { filter_id: filterId } : { sync_all: true };
      await supabase.functions.invoke("resales-online-sync", { body });
      await fetchData();
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setSyncing(null);
    }
  };

  const handleAddConfig = async () => {
    await supabase.from("resales_online_config").insert({
      contact_id: newConfig.contact_id,
      api_key: newConfig.api_key,
      filter_alias: newConfig.filter_alias,
      filter_id: newConfig.filter_id,
      province: newConfig.province,
      sync_interval_hours: newConfig.sync_interval_hours,
    });
    setShowAddModal(false);
    setNewConfig({ contact_id: "", api_key: "", filter_alias: "sale", filter_id: 1, province: "Málaga", sync_interval_hours: 24 });
    await fetchData();
  };

  const lastSuccessfulSync = configs.find(c => c.last_sync_at)?.last_sync_at;
  const overallStatus = configs.length === 0 ? "No configs" : configs.some(c => c.last_sync_status === "failed") ? "Error" : "Connected";

  return (
    <div className="space-y-6">
      {/* API Status Card */}
      <div className={cn("rounded-xl p-5 flex flex-wrap items-center gap-4 justify-between", dark ? "bg-white/5 border border-white/10" : "bg-card border border-border")}>
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", overallStatus === "Connected" ? "bg-emerald-500/10" : overallStatus === "Error" ? "bg-destructive/10" : "bg-muted")}>
            <Globe size={18} className={overallStatus === "Connected" ? "text-emerald-600" : overallStatus === "Error" ? "text-destructive" : "text-muted-foreground"} />
          </div>
          <div>
            <p className={cn("font-medium", dark ? "text-white" : "text-foreground")}>Resales Online API</p>
            <div className="flex gap-3 text-xs mt-0.5">
              <StatusBadge status={overallStatus === "Connected" ? "completed" : overallStatus === "Error" ? "failed" : "pending"} dark={dark} />
              <span className={dark ? "text-white/60" : "text-muted-foreground"}>{rolCount} properties</span>
              {lastSuccessfulSync && <span className={dark ? "text-white/60" : "text-muted-foreground"}>Last sync: {timeAgo(lastSuccessfulSync)}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)} className={cn(dark && "border-white/10 text-white/80 hover:text-white hover:bg-white/5")}>
            Add Config
          </Button>
          <Button size="sm" onClick={() => handleSync()} disabled={syncing !== null || configs.length === 0}>
            {syncing === "all" ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            Sync All
          </Button>
        </div>
      </div>

      {/* Add Config Modal */}
      {showAddModal && (
        <div className={cn("rounded-xl p-5 space-y-4", dark ? "bg-white/5 border border-white/10" : "bg-card border border-border")}>
          <h3 className={cn("font-medium", dark ? "text-white" : "text-foreground")}>Add Resales Online Config</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Contact ID (p1)" value={newConfig.contact_id} onChange={e => setNewConfig(p => ({ ...p, contact_id: e.target.value }))} className={cn(dark && "bg-white/10 border-white/20 text-white")} />
            <Input placeholder="API Key (p2)" type="password" value={newConfig.api_key} onChange={e => setNewConfig(p => ({ ...p, api_key: e.target.value }))} className={cn(dark && "bg-white/10 border-white/20 text-white")} />
            <Select value={String(newConfig.filter_id)} onValueChange={v => setNewConfig(p => ({ ...p, filter_id: Number(v), filter_alias: v === "1" ? "sale" : v === "2" ? "st_rental" : "lt_rental" }))}>
              <SelectTrigger className={cn(dark && "bg-white/10 border-white/20 text-white")}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Sale (Filter 1)</SelectItem>
                <SelectItem value="2">Short-term Rental (Filter 2)</SelectItem>
                <SelectItem value="3">Long-term Rental (Filter 3)</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Province" value={newConfig.province} onChange={e => setNewConfig(p => ({ ...p, province: e.target.value }))} className={cn(dark && "bg-white/10 border-white/20 text-white")} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)} className={cn(dark && "border-white/10 text-white/80")}>Cancel</Button>
            <Button size="sm" onClick={handleAddConfig} disabled={!newConfig.contact_id || !newConfig.api_key}>Save</Button>
          </div>
        </div>
      )}

      {/* Filter Cards */}
      {configs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {configs.map(config => (
            <div key={config.id} className={cn("rounded-xl p-4 space-y-3", dark ? "bg-white/5 border border-white/10" : "bg-card border border-border")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("font-medium text-sm", dark ? "text-white" : "text-foreground")}>{config.filter_alias}</p>
                  <p className={cn("text-xs", dark ? "text-white/60" : "text-muted-foreground")}>Filter #{config.filter_id} · {config.province}</p>
                </div>
                <StatusBadge status={config.last_sync_status === "completed" ? "completed" : config.last_sync_status === "failed" ? "failed" : "pending"} dark={dark} />
              </div>
              <div className={cn("text-xs space-y-1", dark ? "text-white/50" : "text-muted-foreground")}>
                <p>Last sync: {config.last_sync_at ? timeAgo(config.last_sync_at) : "Never"}</p>
                <p>Interval: {config.sync_interval_hours}h</p>
              </div>
              <Button variant="outline" size="sm" className={cn("w-full", dark && "border-white/10 text-white/80 hover:text-white hover:bg-white/5")}
                onClick={() => handleSync(config.id)} disabled={syncing !== null}>
                {syncing === config.id ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                Sync Now
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Sync History */}
      <div>
        <div className="flex gap-3 mb-3 items-center">
          <h3 className={cn("text-sm font-medium", dark ? "text-white/80" : "text-muted-foreground")}>Sync History</h3>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className={cn("ml-auto", dark && "border-white/10 text-white/80 hover:text-white hover:bg-white/5")}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
        <div className={cn("rounded-xl overflow-x-auto", dark ? "border border-white/10" : "border border-border")}>
          <table className="w-full text-sm">
            <thead>
              <tr className={cn("border-b", dark ? "border-white/10 bg-white/5" : "border-border bg-muted/50")}>
                {["Time", "Filter", "Status", "Fetched", "Upserted", "Deactivated", "Duration", "Error"].map(h => (
                  <th key={h} className={cn("text-left px-4 py-3 font-medium text-xs uppercase tracking-wider", dark ? "text-white/60" : "text-muted-foreground")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className={cn("border-b transition-colors", dark ? "border-white/5 hover:bg-white/5" : "border-border/50 hover:bg-muted/30")}>
                  <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{log.started_at ? timeAgo(log.started_at) : "—"}</td>
                  <td className={cn("px-4 py-3", dark ? "text-white" : "text-foreground")}>{log.filter_alias || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={log.status} dark={dark} /></td>
                  <td className={cn("px-4 py-3", dark ? "text-white" : "text-foreground")}>{log.properties_fetched ?? "—"}</td>
                  <td className={cn("px-4 py-3", dark ? "text-white" : "text-foreground")}>{log.properties_upserted ?? "—"}</td>
                  <td className={cn("px-4 py-3", dark ? "text-white" : "text-foreground")}>{log.properties_deactivated ?? "—"}</td>
                  <td className={cn("px-4 py-3", dark ? "text-white/50" : "text-muted-foreground")}>{log.duration_seconds ? `${log.duration_seconds}s` : "—"}</td>
                  <td className="px-4 py-3 text-destructive text-xs max-w-[200px] truncate">{log.error_message || ""}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={8} className={cn("text-center py-12", dark ? "text-white/60" : "text-muted-foreground")}>No sync history</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const hours = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
  if (hours < 1) return "< 1h ago";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

// ─── HEALTH TAB ───────────────────────────────────────────
function HealthTab({ dark, onHealthScore }: { dark: boolean; onHealthScore: (v: string) => void }) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("system_health_check");
    if (!error && data) {
      const h = data as unknown as HealthData;
      setHealth(h);
      const score = h.failed_scrape_jobs_24h === 0 && h.zones_stale === 0 ? "Good" : h.failed_scrape_jobs_24h > 3 ? "Poor" : "Fair";
      onHealthScore(score);
    }
    setLoading(false);
  }, [onHealthScore]);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  if (!health) {
    return <div className={cn("py-12 text-center", dark ? "text-white/60" : "text-muted-foreground")}>{loading ? "Loading health data..." : "Failed to load health data"}</div>;
  }

  const cards = [
    { label: "Active Sale Properties", value: health.active_sale_properties, icon: Database, color: "text-primary" },
    { label: "Active Rent Properties", value: health.active_rent_properties, icon: Database, color: "text-emerald-600" },
    { label: "Total Zones", value: health.zones_total, icon: Activity },
    { label: "Stale Zones", value: health.zones_stale, icon: AlertTriangle, color: health.zones_stale > 0 ? "text-amber-600" : "text-emerald-600" },
    { label: "Sell Valuations Today", value: health.sell_valuations_today, icon: Users, color: "text-primary" },
    { label: "Buy Analyses Today", value: health.buy_analyses_today, icon: Users, color: "text-blue-600" },
    { label: "Pending Jobs", value: health.pending_scrape_jobs, icon: Clock, color: health.pending_scrape_jobs > 5 ? "text-amber-600" : undefined },
    { label: "Running Jobs", value: health.running_scrape_jobs, icon: Play, color: "text-blue-600" },
    { label: "Completed Jobs (24h)", value: health.completed_scrape_jobs_24h, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Failed Jobs (24h)", value: health.failed_scrape_jobs_24h, icon: AlertTriangle, color: health.failed_scrape_jobs_24h > 0 ? "text-destructive" : "text-emerald-600" },
  ];

  return (
    <div>
      <div className="flex gap-3 mb-6 items-center">
        <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading} className={cn(dark && "border-white/10 text-white/80 hover:text-white hover:bg-white/5")}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={cn(
            "rounded-xl p-4 flex items-center gap-3",
            dark ? "bg-white/5 border border-white/10" : "bg-card border border-border"
          )}>
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", dark ? "bg-white/10" : "bg-muted")}>
              <c.icon size={16} className={c.color || (dark ? "text-white/80" : "text-muted-foreground")} />
            </div>
            <div>
              <p className={cn("text-xl font-bold leading-none", dark ? "text-white" : "text-foreground")}>{c.value}</p>
              <p className={cn("text-[0.6rem] uppercase tracking-wider mt-0.5", dark ? "text-white/60" : "text-muted-foreground")}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VALUATIONS MAP TAB ───────────────────────────────────
function ValuationsMapTab({ dark }: { dark: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [stats, setStats] = useState({ sell: 0, rent: 0 });

  useEffect(() => {
    if (!mapRef.current) {
      setMapError(true);
      return;
    }

    let map: google.maps.Map | null = null;

    async function initMap() {
      try {
        const { setOptions: setGoogleOptions, importLibrary } = await import("@googlemaps/js-api-loader");
        const { GOOGLE_MAPS_API_KEY } = await import("@/config/google-maps");

        setGoogleOptions({ key: GOOGLE_MAPS_API_KEY });

        const [sellRes, rentRes] = await Promise.all([
          supabase.from("leads_sell").select("id, address, city, property_type, estimated_value, latitude, longitude, created_at").not("latitude", "is", null).not("longitude", "is", null).in("status", ["completed", "ready"]).limit(500),
          supabase.from("leads_rent").select("id, address, city, property_type, annual_income_estimate, latitude, longitude, created_at").not("latitude", "is", null).not("longitude", "is", null).in("status", ["completed", "ready"]).limit(500),
        ]);

        const sellPoints = (sellRes.data || []).map(s => ({ ...s, type: "sell" as const }));
        const rentPoints = (rentRes.data || []).map(s => ({ ...s, type: "rent" as const }));
        const merged = [...sellPoints, ...rentPoints];

        // Deduplicate by address — keep most recent per unique address
        const byAddress = new Map<string, typeof merged[number]>();
        merged.forEach(p => {
          const key = (p.address || "").trim().toLowerCase();
          const existing = byAddress.get(key);
          if (!existing || (p.created_at && existing.created_at && p.created_at > existing.created_at)) {
            byAddress.set(key, p);
          }
        });
        const allPoints = Array.from(byAddress.values());

        setStats({ sell: sellPoints.length, rent: rentPoints.length });

        if (allPoints.length === 0) {
          setMapError(true);
          return;
        }

        const { Map: GoogleMap } = await importLibrary("maps") as google.maps.MapsLibrary;
        await importLibrary("marker");

        map = new GoogleMap(mapRef.current!, {
          center: { lat: allPoints[0].latitude!, lng: allPoints[0].longitude! },
          zoom: 9,
          mapId: "admin-valuations-map",
          disableDefaultUI: true,
          zoomControl: true,
        });

        const infoWindow = new google.maps.InfoWindow();
        const bounds = new google.maps.LatLngBounds();

        allPoints.forEach(point => {
          const position = { lat: point.latitude!, lng: point.longitude! };
          bounds.extend(position);

          const el = document.createElement("div");
          el.className = "w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer";
          el.style.backgroundColor = point.type === "sell" ? "#2563eb" : "#16a34a";

          const value = point.type === "sell"
            ? (point as any).estimated_value ? `€${((point as any).estimated_value / 1000).toFixed(0)}k` : ""
            : (point as any).annual_income_estimate ? `€${((point as any).annual_income_estimate / 1000).toFixed(0)}k/yr` : "";

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content: el,
          });

          marker.addListener("click", () => {
            infoWindow.setContent(`
              <div style="font-size:12px;max-width:220px">
                <p style="font-weight:600">${point.address || "Unknown"}</p>
                ${point.city ? `<p style="color:#6b7280">${point.city}</p>` : ""}
                ${point.property_type ? `<p style="text-transform:capitalize">${point.property_type}</p>` : ""}
                ${value ? `<p style="font-weight:600;margin-top:4px">${value}</p>` : ""}
                <p style="color:#9ca3af;margin-top:4px">${point.type === "sell" ? "Sale" : "Rental"} valuation · ${point.created_at ? new Date(point.created_at).toLocaleDateString() : ""}</p>
              </div>
            `);
            infoWindow.open(map, marker);
          });
        });

        if (allPoints.length > 1) {
          map.fitBounds(bounds, 60);
        }

        setMapLoaded(true);
      } catch {
        setMapError(true);
      }
    }

    initMap();
    return () => { map = null; };
  }, [dark]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
          <span className={cn("text-sm", dark ? "text-white/80" : "text-muted-foreground")}>Sale valuations ({stats.sell})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
          <span className={cn("text-sm", dark ? "text-white/80" : "text-muted-foreground")}>Rental valuations ({stats.rent})</span>
        </div>
        <span className={cn("text-sm ml-auto", dark ? "text-white/60" : "text-muted-foreground")}>{stats.sell + stats.rent} total</span>
      </div>
      <div className={cn("rounded-xl overflow-hidden border relative", dark ? "border-white/10" : "border-border")}>
        <div ref={mapRef} className="h-[500px] md:h-[600px] w-full" />
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <MapPin size={24} className="text-muted-foreground/30" />
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className={cn("mx-auto mb-3", dark ? "text-white/20" : "text-muted-foreground/30")} />
              <p className={cn("text-sm", dark ? "text-white/60" : "text-muted-foreground")}>No valuation data with coordinates found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
