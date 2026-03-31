import { useState, useEffect, useMemo } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, User, MessageSquare, BarChart3, CreditCard, Settings,
  Star, Eye, TrendingUp, Loader2, ExternalLink, ChevronDown, Check, X,
  Mail, Phone, MapPin, Globe, Instagram, Facebook, Linkedin, Edit2, Plus, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatsBar, type StatTile } from "@/components/admin/StatsBar";
import { cn } from "@/lib/utils";

type Section = "overview" | "profile" | "leads" | "analytics" | "subscription";

interface Professional {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  bio: string | null;
  description: string | null;
  tagline: string | null;
  logo_url: string | null;
  slug: string;
  languages: string[] | null;
  service_zones: string[] | null;
  avg_rating: number | null;
  total_reviews: number | null;
  is_verified: boolean | null;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  office_address: string | null;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  interest: string | null;
  created_at: string | null;
  status: string;
}

const navGroups = [
  {
    label: "Main",
    items: [
      { key: "overview" as Section, label: "Dashboard", icon: LayoutDashboard },
      { key: "profile" as Section, label: "My Profile", icon: User },
    ],
  },
  {
    label: "Business",
    items: [
      { key: "leads" as Section, label: "Leads", icon: MessageSquare },
      { key: "analytics" as Section, label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { key: "subscription" as Section, label: "Subscription", icon: CreditCard },
    ],
  },
];

const allNavItems = navGroups.flatMap((g) => g.items);

/* ─── Sidebar ─── */
function DashboardSidebar({ active, onNav, companyName, isVerified, badges }: {
  active: Section; onNav: (s: Section) => void; companyName: string; isVerified: boolean; badges?: Partial<Record<Section, number>>;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {!collapsed && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <p className="font-heading font-bold text-sm truncate">{companyName}</p>
              {isVerified && <Shield size={14} className="text-primary shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground">Agent Dashboard</p>
          </div>
        )}
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[0.6rem] uppercase tracking-widest">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      onClick={() => onNav(item.key)}
                      className={cn(
                        active === item.key
                          ? "bg-primary/5 text-primary font-medium border-l-2 border-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <span className="flex-1 flex items-center justify-between">
                          {item.label}
                          {badges?.[item.key] ? (
                            <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                              {badges[item.key]}
                            </span>
                          ) : null}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

/* ─── Mobile Dropdown Nav ─── */
function MobileDropdownNav({ active, onNav, badges }: { active: Section; onNav: (s: Section) => void; badges?: Partial<Record<Section, number>> }) {
  const [open, setOpen] = useState(false);
  const activeItem = allNavItems.find((i) => i.key === active);

  return (
    <div className="relative px-4 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium bg-card border border-border"
      >
        <span className="flex items-center gap-2">
          {activeItem && <activeItem.icon size={16} />}
          {activeItem?.label}
        </span>
        <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-4 right-4 mt-1 rounded-xl border border-border bg-card shadow-lg z-50 py-1">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-4 py-1.5 text-[0.6rem] uppercase tracking-widest font-semibold text-muted-foreground">{group.label}</p>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { onNav(item.key); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                    active === item.key
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon size={15} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {badges?.[item.key] ? (
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                      {badges[item.key]}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Overview Section ─── */
function OverviewSection({ agent, leads, impressionsCount, onViewLeads }: {
  agent: Professional; leads: Lead[]; impressionsCount: number; onViewLeads: () => void;
}) {
  const recentLeads = leads.slice(0, 5);
  const thisMonthLeads = leads.filter((l) => {
    if (!l.created_at) return false;
    const d = new Date(l.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-bold">Welcome back, {agent.company_name}</h1>
        {agent.is_verified && <Shield size={18} className="text-primary" />}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-serif">Recent Leads</CardTitle>
            <Button variant="link" size="sm" onClick={onViewLeads}>View all leads</Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No leads yet. Your leads will appear here.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{l.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{l.created_at ? format(new Date(l.created_at), "dd MMM") : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={l.status === "new" ? "default" : "secondary"} className="capitalize text-xs">
                        {l.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Profile Section ─── */
function ProfileSection({ agent, onSave, saving }: { agent: Professional; onSave: (data: Partial<Professional>) => void; saving: boolean }) {
  const [form, setForm] = useState({
    company_name: agent.company_name,
    tagline: agent.tagline || "",
    description: agent.description || "",
    phone: agent.phone || "",
    website: agent.website || "",
    office_address: agent.office_address || "",
    instagram_url: agent.instagram_url || "",
    facebook_url: agent.facebook_url || "",
    linkedin_url: agent.linkedin_url || "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold">Edit Profile</h2>
        <Button variant="outline" size="sm" onClick={() => window.open(`/agentes/${agent.slug}`, "_blank")} className="rounded-full">
          <ExternalLink className="h-4 w-4 mr-1" /> Preview
        </Button>
      </div>

      <div className="space-y-4">
        <div><Label>Company Name</Label><Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></div>
        <div><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Your elevator pitch" /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><Label>Website</Label><Input value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
        </div>
        <div><Label>Office Address</Label><Input value={form.office_address} onChange={(e) => set("office_address", e.target.value)} /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Instagram</Label><Input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/..." /></div>
          <div><Label>Facebook</Label><Input value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} placeholder="https://facebook.com/..." /></div>
          <div><Label>LinkedIn</Label><Input value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/..." /></div>
        </div>
      </div>

      <Button onClick={() => onSave(form)} disabled={saving} className="rounded-full">
        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Save changes
      </Button>
    </div>
  );
}

/* ─── Leads Section ─── */
function LeadsSection({ leads, onUpdateStatus }: { leads: Lead[]; onUpdateStatus: (id: string, status: string) => void }) {
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-bold">Leads</h2>
      <div className="flex gap-2 flex-wrap">
        {["all", "new", "contacted", "converted"].map((s) => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className="capitalize rounded-full">
            {s} {s !== "all" && `(${leads.filter((l) => l.status === s).length})`}
            {s === "all" && `(${leads.length})`}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No leads found.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((l) => (
            <Card key={l.id} className="cursor-pointer" onClick={() => setExpanded(expanded === l.id ? null : l.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{l.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{l.message || "No message"}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Badge variant={l.status === "new" ? "default" : "secondary"} className="capitalize text-xs">{l.status}</Badge>
                    <span className="text-xs text-muted-foreground">{l.created_at ? format(new Date(l.created_at), "dd MMM") : ""}</span>
                  </div>
                </div>
                {expanded === l.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-4 border-t space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div><Mail className="h-3 w-3 inline mr-1" />{l.email}</div>
                      {l.phone && <div><Phone className="h-3 w-3 inline mr-1" />{l.phone}</div>}
                      {l.interest && <div>Interest: {l.interest}</div>}
                    </div>
                    {l.message && <p className="text-sm bg-muted/50 p-3 rounded-lg">{l.message}</p>}
                    <div className="flex gap-2 pt-2">
                      {l.status !== "contacted" && (
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onUpdateStatus(l.id, "contacted"); }}>
                          Mark as contacted
                        </Button>
                      )}
                      {l.status !== "converted" && (
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onUpdateStatus(l.id, "converted"); }}>
                          Mark as converted
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Analytics Section ─── */
function AnalyticsSection({ impressions, leads }: { impressions: { date: string; count: number }[]; leads: { date: string; count: number }[] }) {
  const totalViews = impressions.reduce((s, i) => s + i.count, 0);
  const totalLeads = leads.reduce((s, i) => s + i.count, 0);

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-bold">Analytics</h2>

      <Card>
        <CardHeader><CardTitle className="text-base font-serif">Profile Views (30 days)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={impressions}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" className="stroke-primary" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base font-serif">Leads (30 days)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leads}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" className="fill-primary" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">📊 Detailed analytics coming soon with Premium plan</p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Subscription Section ─── */
function SubscriptionSection() {
  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-serif text-xl font-bold">Subscription</h2>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Free Plan</CardTitle>
          <CardDescription>Your current plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✓ Public agent profile</li>
            <li>✓ Receive contact requests</li>
            <li>✓ Basic analytics</li>
          </ul>
          <Button variant="outline" className="w-full rounded-full" disabled>
            Upgrade coming soon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Main Dashboard ─── */
const ProDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<Professional | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [impressionsCount, setImpressionsCount] = useState(0);
  const [impressionsByDay, setImpressionsByDay] = useState<{ date: string; count: number }[]>([]);
  const [leadsByDay, setLeadsByDay] = useState<{ date: string; count: number }[]>([]);
  const [section, setSection] = useState<Section>("overview");
  useSEO({ title: "Agent Dashboard | ValoraCasa", description: "Manage your profile, leads, and analytics." });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/pro/login"); return; }

    const { data: prof, error } = await supabase.from("professionals").select("*").eq("user_id", session.user.id).single();
    if (error || !prof) { navigate("/pro/onboard"); return; }

    setAgent(prof as unknown as Professional);

    const [leadsRes, impressionsRes] = await Promise.all([
      supabase.from("agent_contact_requests").select("*").eq("professional_id", prof.id).order("created_at", { ascending: false }),
      supabase.from("professional_impressions").select("created_at").eq("professional_id", prof.id),
    ]);

    if (leadsRes.data) setLeads(leadsRes.data as unknown as Lead[]);

    const imps = impressionsRes.data || [];
    setImpressionsCount(imps.length);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dayMap: Record<string, number> = {};
    const leadDayMap: Record<string, number> = {};

    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const key = format(d, "MMM dd");
      dayMap[key] = 0;
      leadDayMap[key] = 0;
    }

    imps.forEach((imp) => {
      if (imp.created_at) {
        const key = format(new Date(imp.created_at), "MMM dd");
        if (key in dayMap) dayMap[key]++;
      }
    });

    (leadsRes.data || []).forEach((l: any) => {
      if (l.created_at) {
        const key = format(new Date(l.created_at), "MMM dd");
        if (key in leadDayMap) leadDayMap[key]++;
      }
    });

    setImpressionsByDay(Object.entries(dayMap).map(([date, count]) => ({ date, count })));
    setLeadsByDay(Object.entries(leadDayMap).map(([date, count]) => ({ date, count })));
    setLoading(false);
  };

  const handleSaveProfile = async (data: Partial<Professional>) => {
    if (!agent) return;
    setSaving(true);
    const { error } = await supabase.from("professionals").update(data).eq("id", agent.id);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      setAgent({ ...agent, ...data });
      toast({ title: "Profile saved!" });
    }
    setSaving(false);
  };

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("agent_contact_requests").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) return null;

  const thisMonthLeads = leads.filter((l) => {
    if (!l.created_at) return false;
    const d = new Date(l.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  const statsTiles: StatTile[] = [
    { key: "leads-total", label: "Total Leads", value: leads.length, icon: MessageSquare, color: "text-primary" },
    { key: "leads-new", label: "New This Month", value: thisMonthLeads.length, icon: TrendingUp, color: "text-emerald-500" },
    { key: "views", label: "Profile Views", value: impressionsCount, icon: Eye, color: "text-blue-500" },
    { key: "rating", label: "Avg Rating", value: agent.avg_rating ? `${Number(agent.avg_rating).toFixed(1)}★` : "—", icon: Star, color: "text-amber-500" },
  ];

  const badges: Partial<Record<Section, number>> = {};
  if (newLeadsCount > 0) badges.leads = newLeadsCount;

  const content = (
    <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto">
      {/* Stats bar */}
      <div className="mb-6">
        <StatsBar tiles={statsTiles} />
      </div>

      {section === "overview" && (
        <OverviewSection agent={agent} leads={leads} impressionsCount={impressionsCount} onViewLeads={() => setSection("leads")} />
      )}
      {section === "profile" && (
        <ProfileSection agent={agent} onSave={handleSaveProfile} saving={saving} />
      )}
      {section === "leads" && (
        <LeadsSection leads={leads} onUpdateStatus={handleUpdateLeadStatus} />
      )}
      {section === "analytics" && (
        <AnalyticsSection impressions={impressionsByDay} leads={leadsByDay} />
      )}
      {section === "subscription" && <SubscriptionSection />}
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <p className="font-serif font-bold text-sm">{agent.company_name}</p>
            {agent.is_verified && <Shield size={14} className="text-primary" />}
          </div>
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Agent Dashboard</p>
        </div>
        <MobileDropdownNav active={section} onNav={setSection} badges={badges} />
        {content}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar active={section} onNav={setSection} companyName={agent.company_name} isVerified={!!agent.is_verified} badges={badges} />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm text-muted-foreground capitalize font-serif">{section}</span>
          </header>
          {content}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProDashboard;
