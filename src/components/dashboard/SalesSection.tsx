import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, CheckCircle2, Calendar, TrendingUp, Loader2, Trash2, ExternalLink, Check, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import AddSaleDialog from "./AddSaleDialog";
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
}

const MILESTONES = [
  { count: 1, label: "Appear in Recent Sales on your public profile", emoji: "🏠" },
  { count: 3, label: "Unlock sales map on your profile", emoji: "🗺️" },
  { count: 5, label: "+30 merit points and higher search ranking", emoji: "📈" },
  { count: 10, label: "Top Seller badge on valuation results", emoji: "🏆" },
];

const VERIFIED_MILESTONE = { count: 5, label: "Verified Track Record trust badge", emoji: "✅" };

export default function SalesSection({ professionalId }: { professionalId: string }) {
  const { toast } = useToast();
  const [sales, setSales] = useState<AgentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([]);

  async function fetchSales() {
    setLoading(true);
    const { data, error } = await supabase
      .from("agent_sales")
      .select("*")
      .eq("professional_id", professionalId)
      .order("sale_date", { ascending: false, nullsFirst: false });
    if (!error && data) setSales(data as unknown as AgentSale[]);
    setLoading(false);
  }

  useEffect(() => { fetchSales(); }, [professionalId]);

  // Polling: re-fetch while any sale is still enriching
  const isEnriching = useCallback((s: AgentSale) => 
    !!s.listing_url && !s.city && !s.photo_url && !s.property_type, []);
  const hasEnriching = sales.some(isEnriching);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (hasEnriching) {
      pollRef.current = setInterval(fetchSales, 8000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [hasEnriching]);

  useEffect(() => {
    async function fetchTeam() {
      const { data } = await supabase
        .from("agent_team_members")
        .select("id, name")
        .eq("professional_id", professionalId)
        .eq("is_active", true)
        .order("sort_order");
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
      toast({ title: "Sale removed" });
    }
  }

  const totalSales = sales.length;
  const verifiedCount = sales.filter(s => s.verified).length;
  const avgDays = sales.filter(s => s.days_on_market != null).length > 0
    ? Math.round(sales.filter(s => s.days_on_market != null).reduce((a, s) => a + (s.days_on_market || 0), 0) / sales.filter(s => s.days_on_market != null).length)
    : null;
  const last12 = sales.filter(s => {
    if (!s.sale_date) return false;
    const d = new Date(s.sale_date);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    return d >= cutoff;
  }).length;

  if (loading) {
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
          { label: "Total Sales", value: totalSales, icon: Home },
          { label: "Verified", value: verifiedCount, icon: CheckCircle2 },
          { label: "Last 12 Months", value: last12, icon: Calendar },
          { label: "Avg. Days to Sell", value: avgDays ?? "—", icon: TrendingUp },
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
            const unlocked = totalSales >= m.count;
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
          {/* Verified milestone */}
          <div className={`flex items-center gap-3 ${verifiedCount >= VERIFIED_MILESTONE.count ? "opacity-100" : "opacity-50"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${verifiedCount >= VERIFIED_MILESTONE.count ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {verifiedCount >= VERIFIED_MILESTONE.count ? <Check size={14} /> : VERIFIED_MILESTONE.count}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{VERIFIED_MILESTONE.label}</p>
              <p className="text-xs text-muted-foreground">{VERIFIED_MILESTONE.count}+ verified sales required ({verifiedCount}/{VERIFIED_MILESTONE.count})</p>
            </div>
            <span className="text-lg">{VERIFIED_MILESTONE.emoji}</span>
          </div>
        </CardContent>
      </Card>

      {/* Sales grid */}
      {sales.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sales.map(sale => (
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
                  {sale.listing_url && (
                    <a href={sale.listing_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      <ExternalLink size={12} /> View listing
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
          ))}
        </div>
      )}

      <AddSaleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        professionalId={professionalId}
        onSaleAdded={fetchSales}
        teamMembers={teamMembers}
      />
    </div>
  );
}
