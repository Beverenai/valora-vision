import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRefCode } from "@/utils/referenceCode";
import { Lock, ExternalLink, RefreshCw, Activity, Database, Zap, Users, AlertTriangle, CheckCircle, Clock, Play } from "lucide-react";

const ADMIN_PASSWORD = "valoracasa2024";

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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: "bg-emerald-500/10 text-emerald-600",
    ready: "bg-emerald-500/10 text-emerald-600",
    success: "bg-emerald-500/10 text-emerald-600",
    running: "bg-blue-500/10 text-blue-600",
    processing: "bg-blue-500/10 text-blue-600",
    pending: "bg-muted text-muted-foreground",
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

function HealthCard({ label, value, icon: Icon, color = "text-foreground" }: { label: string; value: number | string; icon: any; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Admin Component ─────────────────────────────────
const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="max-w-sm w-full flex flex-col items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Admin Access</h1>
          <div className="w-full flex gap-2">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            <Button onClick={handleLogin}>Enter</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-foreground mb-6">ValoraCasa Admin</h1>
        <Tabs defaultValue="leads">
          <TabsList className="mb-4">
            <TabsTrigger value="leads"><Users size={14} className="mr-1.5" />Leads</TabsTrigger>
            <TabsTrigger value="zones"><Database size={14} className="mr-1.5" />Zones</TabsTrigger>
            <TabsTrigger value="jobs"><Zap size={14} className="mr-1.5" />Scrape Jobs</TabsTrigger>
            <TabsTrigger value="health"><Activity size={14} className="mr-1.5" />Health</TabsTrigger>
          </TabsList>

          <TabsContent value="leads"><LeadsTab navigate={navigate} /></TabsContent>
          <TabsContent value="zones"><ZonesTab /></TabsContent>
          <TabsContent value="jobs"><JobsTab /></TabsContent>
          <TabsContent value="health"><HealthTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ─── LEADS TAB ────────────────────────────────────────────
function LeadsTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const [sellRes, rentRes, buyRes] = await Promise.all([
        supabase.from("leads_sell").select("id, full_name, email, address, city, property_type, status, estimated_value, created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("leads_rent").select("id, full_name, email, address, city, property_type, status, annual_income_estimate, created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("buy_analyses").select("id, email, address, city, property_type, status, estimated_value, asking_price, price_score, source_url, created_at").order("created_at", { ascending: false }).limit(200),
      ]);

      const sellLeads: LeadRow[] = (sellRes.data || []).map((l) => ({ ...l, type: "sell" as const, annual_income_estimate: null, asking_price: null, price_score: null, full_name: l.full_name }));
      const rentLeads: LeadRow[] = (rentRes.data || []).map((l) => ({ ...l, type: "rent" as const, estimated_value: null, asking_price: null, price_score: null }));
      const buyLeads: LeadRow[] = (buyRes.data || []).map((l) => ({
        ...l,
        type: "buy" as const,
        full_name: l.email || "—",
        email: l.email || "",
        annual_income_estimate: null,
        asking_price: l.asking_price as number | null,
        price_score: l.price_score as string | null,
      }));

      const all = [...sellLeads, ...rentLeads, ...buyLeads].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setLeads(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const filtered = leads.filter((l) => {
    if (typeFilter !== "all" && l.type !== typeFilter) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="buy">Buy</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} leads</span>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ref</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Address</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Value</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={`${lead.type}-${lead.id}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-primary">{formatRefCode(lead.id)}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    lead.type === "sell" ? "bg-primary/10 text-primary"
                    : lead.type === "buy" ? "bg-blue-500/10 text-blue-600"
                    : "bg-emerald-500/10 text-emerald-600"
                  }`}>{lead.type}</span>
                </td>
                <td className="px-4 py-3 text-foreground">{lead.full_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.email}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{lead.address}</td>
                <td className="px-4 py-3"><StatusBadge status={lead.status || "pending"} /></td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {lead.type === "sell" && lead.estimated_value ? `€${lead.estimated_value.toLocaleString()}`
                    : lead.type === "buy" && lead.asking_price ? `€${lead.asking_price.toLocaleString()}`
                    : lead.type === "rent" && lead.annual_income_estimate ? `€${lead.annual_income_estimate.toLocaleString()}/yr`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => {
                    if (lead.type === "buy") navigate(`/buy/result/${lead.id}`);
                    else navigate(`/${lead.type}/result/${lead.id}`);
                  }}>
                    <ExternalLink size={14} />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">{loading ? "Loading..." : "No leads found"}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ZONES TAB ────────────────────────────────────────────
function ZonesTab() {
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
      const { error } = await supabase.functions.invoke("process-scrape-job", {
        body: { zone_id: zone.id },
      });
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
        <Button variant="outline" size="sm" onClick={fetchZones} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
        <span className="text-sm text-muted-foreground ml-auto">{zones.length} zones</span>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Zone</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Municipality</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tier</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location ID</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Scraped</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Properties</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{zone.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{zone.municipality || "—"}</td>
                <td className="px-4 py-3"><TierBadge tier={zone.tier} /></td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{zone.idealista_location || "—"}</td>
                <td className="px-4 py-3"><StalenessIndicator lastScraped={zone.last_scraped_at} tier={zone.tier} /></td>
                <td className="px-4 py-3 text-foreground">{zone.total_properties || 0}</td>
                <td className="px-4 py-3"><StatusBadge status={zone.last_scrape_status || "pending"} /></td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" disabled={!zone.idealista_location || scraping === zone.id} onClick={() => triggerScrape(zone)}>
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
function JobsTab() {
  const [jobs, setJobs] = useState<ScrapeJobRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("scrape_jobs")
      .select("*, zones(name)")
      .order("created_at", { ascending: false })
      .limit(100);
    setJobs((data as ScrapeJobRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Auto-refresh every 30s if there are running jobs
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
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} jobs</span>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Zone</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Items Found</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Upserted</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Duration</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Error</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => {
              const duration = job.started_at && job.completed_at
                ? `${Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s`
                : job.started_at ? "Running..." : "—";
              return (
                <tr key={job.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{job.zones?.name || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-4 py-3 text-foreground">{job.items_found ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">{job.items_upserted ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{duration}</td>
                  <td className="px-4 py-3 text-muted-foreground">{job.created_at ? new Date(job.created_at).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-destructive text-xs max-w-[200px] truncate">{job.error_message || ""}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">{loading ? "Loading..." : "No jobs found"}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── HEALTH TAB ───────────────────────────────────────────
function HealthTab() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("system_health_check");
    if (!error && data) setHealth(data as unknown as HealthData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  if (!health) {
    return <div className="py-12 text-center text-muted-foreground">{loading ? "Loading health data..." : "Failed to load health data"}</div>;
  }

  return (
    <div>
      <div className="flex gap-3 mb-6 items-center">
        <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <HealthCard label="Active Sale Properties" value={health.active_sale_properties} icon={Database} color="text-primary" />
        <HealthCard label="Active Rent Properties" value={health.active_rent_properties} icon={Database} color="text-emerald-600" />
        <HealthCard label="Total Zones" value={health.zones_total} icon={Activity} />
        <HealthCard label="Stale Zones" value={health.zones_stale} icon={AlertTriangle} color={health.zones_stale > 0 ? "text-amber-600" : "text-emerald-600"} />
        <HealthCard label="Sell Valuations Today" value={health.sell_valuations_today} icon={Users} color="text-primary" />
        <HealthCard label="Buy Analyses Today" value={health.buy_analyses_today} icon={Users} color="text-blue-600" />
        <HealthCard label="Pending Jobs" value={health.pending_scrape_jobs} icon={Clock} color={health.pending_scrape_jobs > 5 ? "text-amber-600" : "text-muted-foreground"} />
        <HealthCard label="Running Jobs" value={health.running_scrape_jobs} icon={Play} color="text-blue-600" />
        <HealthCard label="Completed Jobs (24h)" value={health.completed_scrape_jobs_24h} icon={CheckCircle} color="text-emerald-600" />
        <HealthCard label="Failed Jobs (24h)" value={health.failed_scrape_jobs_24h} icon={AlertTriangle} color={health.failed_scrape_jobs_24h > 0 ? "text-destructive" : "text-emerald-600"} />
      </div>
    </div>
  );
}

export default Admin;
