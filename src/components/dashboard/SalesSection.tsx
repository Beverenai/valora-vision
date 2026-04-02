import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Home, CheckCircle2, Calendar, TrendingUp, Loader2, Trash2,
  ExternalLink, Check, RefreshCw, LayoutGrid, List, Search, Pencil, X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import AddSaleDialog from "./AddSaleDialog";
import EditSaleSheet from "./EditSaleSheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AgentSale {
  id: string;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  built_size_sqm: number | null;
  sale_price: number | null;
  show_price: boolean;
  address_text: string | null;
  city: string | null;
  sale_date: string | null;
  listing_url: string | null;
  listing_source: string | null;
  photo_url: string | null;
  verified: boolean;
  days_on_market: number | null;
  created_at: string;
  team_member_id: string | null;
}

const MILESTONES = [
  { count: 1, label: "Appear in Recent Sales on your public profile", emoji: "🏠" },
  { count: 3, label: "Unlock sales map on your profile", emoji: "🗺️" },
  { count: 5, label: "+30 merit points and higher search ranking", emoji: "📈" },
  { count: 10, label: "Top Seller badge on valuation results", emoji: "🏆" },
];

const VERIFIED_MILESTONE = { count: 5, label: "Verified Track Record trust badge", emoji: "✅" };

const PAGE_SIZE = 25;

export default function SalesSection({ professionalId }: { professionalId: string }) {
  const { toast } = useToast();
  const [sales, setSales] = useState<AgentSale[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editSale, setEditSale] = useState<AgentSale | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Stats (fetched separately, not paginated)
  const [stats, setStats] = useState({ total: 0, verified: 0, last12: 0, avgDays: null as number | null });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch stats (lightweight, all rows counted)
  async function fetchStats() {
    const { count: total } = await supabase
      .from("agent_sales").select("*", { count: "exact", head: true })
      .eq("professional_id", professionalId);

    const { count: verified } = await supabase
      .from("agent_sales").select("*", { count: "exact", head: true })
      .eq("professional_id", professionalId).eq("verified", true);

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    const { count: last12 } = await supabase
      .from("agent_sales").select("*", { count: "exact", head: true })
      .eq("professional_id", professionalId).gte("sale_date", cutoff.toISOString().split("T")[0]);

    const { data: daysData } = await supabase
      .from("agent_sales").select("days_on_market")
      .eq("professional_id", professionalId).not("days_on_market", "is", null);
    
    let avgDays: number | null = null;
    if (daysData && daysData.length > 0) {
      avgDays = Math.round(daysData.reduce((a, r) => a + (r.days_on_market || 0), 0) / daysData.length);
    }

    setStats({ total: total || 0, verified: verified || 0, last12: last12 || 0, avgDays });
  }

  // Fetch paginated sales
  async function fetchSales() {
    setLoading(true);
    let query = supabase
      .from("agent_sales")
      .select("*", { count: "exact" })
      .eq("professional_id", professionalId)
      .order("sale_date", { ascending: false, nullsFirst: false });

    if (debouncedSearch.trim()) {
      const s = `%${debouncedSearch.trim()}%`;
      query = query.or(`city.ilike.${s},address_text.ilike.${s},property_type.ilike.${s}`);
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (!error && data) {
      setSales(data as unknown as AgentSale[]);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }

  useEffect(() => { fetchSales(); }, [professionalId, page, debouncedSearch]);
  useEffect(() => { fetchStats(); }, [professionalId]);

  // Polling for enriching sales
  const isEnriching = useCallback((s: AgentSale) =>
    !!s.listing_url && !s.city && !s.photo_url && !s.property_type, []);
  const hasEnriching = sales.some(isEnriching);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (hasEnriching) {
      pollRef.current = setInterval(() => { fetchSales(); fetchStats(); }, 8000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [hasEnriching]);

  useEffect(() => {
    async function fetchTeam() {
      const { data } = await supabase
        .from("agent_team_members").select("id, name")
        .eq("professional_id", professionalId).eq("is_active", true).order("sort_order");
      if (data) setTeamMembers(data);
    }
    fetchTeam();
  }, [professionalId]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("agent_sales").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Could not delete.", variant: "destructive" });
    } else {
      setSales(s => s.filter(x => x.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      fetchStats();
      toast({ title: "Sale removed" });
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("agent_sales").delete().in("id", ids);
    setBulkDeleting(false);
    if (error) {
      toast({ title: "Error", description: "Could not delete.", variant: "destructive" });
    } else {
      setSelectedIds(new Set());
      fetchSales();
      fetchStats();
      toast({ title: `${ids.length} sale(s) deleted` });
    }
  }

  async function handleBulkAssign(memberId: string) {
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("agent_sales")
      .update({ team_member_id: memberId || null } as any).in("id", ids);
    if (error) {
      toast({ title: "Error", description: "Could not assign.", variant: "destructive" });
    } else {
      setSelectedIds(new Set());
      fetchSales();
      toast({ title: `${ids.length} sale(s) reassigned` });
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const allSelected = sales.length > 0 && sales.every(s => selectedIds.has(s.id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sales.map(s => s.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  const onSaleAdded = () => { fetchSales(); fetchStats(); };

  if (loading && sales.length === 0) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">My Sales Portfolio</h2>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus size={16} /> Add Sale
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sales", value: stats.total, icon: Home },
          { label: "Verified", value: stats.verified, icon: CheckCircle2 },
          { label: "Last 12 Months", value: stats.last12, icon: Calendar },
          { label: "Avg. Days to Sell", value: stats.avgDays ?? "—", icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <stat.icon size={14} />
                <span className="text-xs">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Milestone checklist */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-serif">Sales Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MILESTONES.map((m) => {
            const unlocked = stats.total >= m.count;
            return (
              <div key={m.count} className={`flex items-center gap-3 ${unlocked ? "opacity-100" : "opacity-50"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${unlocked ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {unlocked ? <Check size={14} /> : m.count}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.count}+ sale{m.count > 1 ? "s" : ""} required</p>
                </div>
                <span className="text-lg">{m.emoji}</span>
              </div>
            );
          })}
          <div className={`flex items-center gap-3 ${stats.verified >= VERIFIED_MILESTONE.count ? "opacity-100" : "opacity-50"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${stats.verified >= VERIFIED_MILESTONE.count ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {stats.verified >= VERIFIED_MILESTONE.count ? <Check size={14} /> : VERIFIED_MILESTONE.count}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{VERIFIED_MILESTONE.label}</p>
              <p className="text-xs text-muted-foreground">{VERIFIED_MILESTONE.count}+ verified sales required ({stats.verified}/{VERIFIED_MILESTONE.count})</p>
            </div>
            <span className="text-lg">{VERIFIED_MILESTONE.emoji}</span>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar: search, view toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by city, address, or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-sm transition-colors ${viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-sm transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1" disabled={bulkDeleting}>
                {bulkDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selectedIds.size} sale(s)?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {teamMembers.length > 0 && (
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              defaultValue=""
              onChange={e => { if (e.target.value !== "") handleBulkAssign(e.target.value); }}
            >
              <option value="" disabled>Assign to…</option>
              <option value="">Company</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
            Clear
          </button>
        </div>
      )}

      {/* Sales content */}
      {totalCount === 0 && !debouncedSearch ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Home size={40} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium mb-2">No sales registered yet</p>
            <p className="text-sm text-muted-foreground mb-6">Add your completed sales to build trust with potential clients.</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus size={16} /> Register Your First Sale
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="w-14">Photo</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Beds</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && sales.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No sales match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map(sale => {
                    const enriching = isEnriching(sale);
                    return (
                      <TableRow key={sale.id} className={enriching ? "opacity-60" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(sale.id)}
                            onCheckedChange={() => toggleSelect(sale.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {enriching ? (
                            <div className="w-10 h-10 rounded bg-muted animate-pulse flex items-center justify-center">
                              <RefreshCw size={12} className="animate-spin text-muted-foreground/40" />
                            </div>
                          ) : sale.photo_url ? (
                            <img src={sale.photo_url} alt="" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                              <Home size={12} className="text-muted-foreground/40" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="capitalize text-sm">{enriching ? <Skeleton className="h-3 w-16" /> : sale.property_type || "—"}</TableCell>
                        <TableCell className="text-sm">{enriching ? <Skeleton className="h-3 w-20" /> : sale.city || "—"}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {enriching ? <Skeleton className="h-3 w-16" /> : (sale.show_price && sale.sale_price ? `€${sale.sale_price.toLocaleString()}` : "—")}
                        </TableCell>
                        <TableCell className="text-sm">{sale.bedrooms ?? "—"}</TableCell>
                        <TableCell className="text-sm">{sale.built_size_sqm ? `${sale.built_size_sqm} m²` : "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—"}
                        </TableCell>
                        <TableCell>
                          {enriching ? (
                            <Badge variant="secondary" className="text-[0.6rem] gap-1">
                              <RefreshCw size={8} className="animate-spin" /> Importing
                            </Badge>
                          ) : sale.verified ? (
                            <Badge className="bg-emerald-600 text-white border-0 text-[0.6rem] gap-1">
                              <CheckCircle2 size={8} /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[0.6rem]">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditSale(sale)}
                              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                            {sale.listing_url && (
                              <a
                                href={sale.listing_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                title="View listing"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive" title="Delete">
                                  <Trash2 size={13} />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this sale?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(sale.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sales.map(sale => {
            const enriching = isEnriching(sale);
            if (enriching) {
              return (
                <Card key={sale.id} className="overflow-hidden">
                  <div className="relative h-36 bg-muted animate-pulse">
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground/60">Importing details…</span>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                    <div className="flex gap-3 mt-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return (
              <Card key={sale.id} className="overflow-hidden group">
                <div className="relative h-36 bg-muted">
                  {sale.photo_url ? (
                    <img src={sale.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home size={24} className="text-muted-foreground/30" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-red-600 text-white border-0 text-[0.6rem] uppercase tracking-wider">
                    Sold
                  </Badge>
                  {sale.verified && (
                    <Badge className="absolute top-2 right-2 bg-emerald-600 text-white border-0 text-[0.6rem] gap-1">
                      <CheckCircle2 size={10} /> Verified
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm capitalize">{sale.property_type || "Property"}</p>
                      <p className="text-xs text-muted-foreground">{sale.city || sale.address_text || "—"}</p>
                    </div>
                    {sale.show_price && sale.sale_price && (
                      <p className="font-bold text-sm">€{sale.sale_price.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {sale.bedrooms != null && <span>{sale.bedrooms} bed</span>}
                    {sale.bathrooms != null && <span>{sale.bathrooms} bath</span>}
                    {sale.built_size_sqm != null && <span>{sale.built_size_sqm} m²</span>}
                  </div>
                  {sale.sale_date && (
                    <p className="text-[0.65rem] text-muted-foreground mt-2">
                      Sold {new Date(sale.sale_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      {sale.days_on_market != null && ` · ${sale.days_on_market} days on market`}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditSale(sale)} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Pencil size={12} /> Edit
                    </button>
                    {sale.listing_url && (
                      <a href={sale.listing_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <ExternalLink size={12} /> Listing
                      </a>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="ml-auto text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this sale?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(sale.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === page}
                    onClick={() => setPage(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {totalCount > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount} sales
        </p>
      )}

      <AddSaleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        professionalId={professionalId}
        onSaleAdded={onSaleAdded}
        teamMembers={teamMembers}
      />

      <EditSaleSheet
        open={!!editSale}
        onOpenChange={(open) => { if (!open) setEditSale(null); }}
        sale={editSale}
        onSaved={() => { fetchSales(); fetchStats(); }}
        teamMembers={teamMembers}
      />
    </div>
  );
}
