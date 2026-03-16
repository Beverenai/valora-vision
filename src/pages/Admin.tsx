import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRefCode } from "@/utils/referenceCode";
import { Lock, ExternalLink } from "lucide-react";

const ADMIN_PASSWORD = "valoracasa2024";

interface LeadRow {
  id: string;
  type: "sell" | "rent";
  full_name: string;
  email: string;
  address: string;
  city: string | null;
  property_type: string | null;
  status: string | null;
  estimated_value: number | null;
  annual_income_estimate: number | null;
  created_at: string | null;
}

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    fetchLeads();
  }, [authenticated]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const [sellRes, rentRes] = await Promise.all([
        supabase.from("leads_sell").select("id, full_name, email, address, city, property_type, status, estimated_value, created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("leads_rent").select("id, full_name, email, address, city, property_type, status, annual_income_estimate, created_at").order("created_at", { ascending: false }).limit(200),
      ]);

      const sellLeads: LeadRow[] = (sellRes.data || []).map((l) => ({
        ...l,
        type: "sell" as const,
        annual_income_estimate: null,
      }));

      const rentLeads: LeadRow[] = (rentRes.data || []).map((l) => ({
        ...l,
        type: "rent" as const,
        estimated_value: null,
      }));

      const all = [...sellLeads, ...rentLeads].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      setLeads(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = leads.filter((l) => {
    if (typeFilter !== "all" && l.type !== typeFilter) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    return true;
  });

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="max-w-sm w-full flex flex-col items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Admin Access</h1>
          <div className="w-full flex gap-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin}>Enter</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Valuation Dashboard</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} leads</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Table */}
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
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      lead.type === "sell" ? "bg-primary/10 text-primary" : "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                    }`}>
                      {lead.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{lead.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.email}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{lead.address}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      lead.status === "completed" ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-muted text-muted-foreground"
                    }`}>
                      {lead.status || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {lead.type === "sell" && lead.estimated_value
                      ? `€${lead.estimated_value.toLocaleString()}`
                      : lead.type === "rent" && lead.annual_income_estimate
                      ? `€${lead.annual_income_estimate.toLocaleString()}/yr`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/${lead.type}/result/${lead.id}`)}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground">
                    {loading ? "Loading..." : "No leads found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
