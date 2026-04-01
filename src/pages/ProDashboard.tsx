import { useState, useEffect, useMemo, useRef } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, User, MessageSquare, BarChart3, CreditCard, Settings,
  Star, Eye, TrendingUp, Loader2, ExternalLink, ChevronDown, Check, X,
  Mail, Phone, MapPin, Globe, Instagram, Facebook, Linkedin, Edit2, Plus, Shield,
  LogOut, Upload, ArrowUpDown, Archive, ArrowRight, Bell, Trash2
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
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatsBar, type StatTile } from "@/components/admin/StatsBar";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type Section = "overview" | "profile" | "leads" | "zones" | "reviews" | "analytics" | "subscription" | "settings";

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
      { key: "zones" as Section, label: "My Zones", icon: MapPin },
      { key: "reviews" as Section, label: "Reviews", icon: Star },
      { key: "analytics" as Section, label: "Performance", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { key: "subscription" as Section, label: "Subscription", icon: CreditCard },
      { key: "settings" as Section, label: "Settings", icon: Settings },
    ],
  },
];

const allNavItems = navGroups.flatMap((g) => g.items);

const AVAILABLE_LANGUAGES = [
  "English", "Spanish", "French", "German", "Dutch", "Swedish", "Norwegian",
  "Danish", "Finnish", "Portuguese", "Italian", "Russian", "Arabic", "Chinese",
];

const tiers = [
  {
    name: "Basic",
    price: 149,
    current: true,
    features: [
      "Appear on result pages",
      "1 zone coverage",
      "Standard ranking",
      "Basic analytics",
      "Email notifications",
    ],
  },
  {
    name: "Premium",
    price: 299,
    popular: true,
    features: [
      "Appear on result pages",
      "3 zone coverage",
      "Higher ranking",
      "Verified badge",
      "Full analytics",
      "Email + SMS notifications",
      "Monthly report",
    ],
  },
  {
    name: "Elite",
    price: 499,
    features: [
      "Appear on result pages",
      "Unlimited zones",
      "Highest ranking",
      "Verified badge",
      "Full analytics",
      "Email + SMS + WhatsApp",
      "Monthly report",
    ],
  },
];

/* ─── Sidebar ─── */
function DashboardSidebar({ active, onNav, companyName, isVerified, badges, onLogout }: {
  active: Section; onNav: (s: Section) => void; companyName: string; isVerified: boolean; badges?: Partial<Record<Section, number>>; onLogout: () => void;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="flex flex-col h-full">
        {!collapsed && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <p className="font-heading font-bold text-sm truncate">{companyName}</p>
              {isVerified && <Shield size={14} className="text-primary shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground">Agent Dashboard</p>
          </div>
        )}
        <div className="flex-1">
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
        </div>
        <div className="p-3 border-t">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "Sign out"}
          </button>
        </div>
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
  const [languages, setLanguages] = useState<string[]>(agent.languages || []);
  const [logoUrl, setLogoUrl] = useState(agent.logo_url || "");
  const [uploading, setUploading] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${agent.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage.from("agent-logos").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage.from("agent-logos").getPublicUrl(path);
    const newUrl = publicData.publicUrl + `?t=${Date.now()}`;
    setLogoUrl(newUrl);
    setLogoFailed(false);
    setUploading(false);

    // Save logo_url immediately
    const { error } = await supabase.from("professionals").update({ logo_url: newUrl }).eq("id", agent.id);
    if (!error) {
      toast({ title: "Logo updated!" });
    }
  };

  const handleSave = () => {
    onSave({ ...form, languages, logo_url: logoUrl || null });
  };

  const initials = agent.company_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold">Edit Profile</h2>
        <Button variant="outline" size="sm" onClick={() => window.open(`/agentes/${agent.slug}`, "_blank")} className="rounded-full">
          <ExternalLink className="h-4 w-4 mr-1" /> Preview
        </Button>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-muted/30">
          {logoUrl && !logoFailed ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" onError={() => setLogoFailed(true)} />
          ) : (
            <span className="text-xl font-bold text-primary/60">{initials}</span>
          )}
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            {uploading ? "Uploading…" : "Upload logo"}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">JPG or PNG, max 2MB</p>
        </div>
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

        {/* Languages */}
        <div>
          <Label className="mb-2 block">Languages</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  languages.includes(lang)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Service Zones (read-only) */}
        {agent.service_zones && agent.service_zones.length > 0 && (
          <div>
            <Label className="mb-2 block">Service Zones</Label>
            <div className="flex flex-wrap gap-2">
              {agent.service_zones.map((zoneId) => (
                <Badge key={zoneId} variant="secondary" className="text-xs">{zoneId.slice(0, 8)}…</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Zones are managed by your subscription plan</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Instagram</Label><Input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/..." /></div>
          <div><Label>Facebook</Label><Input value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} placeholder="https://facebook.com/..." /></div>
          <div><Label>LinkedIn</Label><Input value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/..." /></div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="rounded-full">
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
  const [sortNewest, setSortNewest] = useState(true);

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return sortNewest
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Interest", "Message", "Status", "Date"];
    const rows = sorted.map((l) => [
      l.name,
      l.email,
      l.phone || "",
      l.interest || "",
      (l.message || "").replace(/"/g, '""'),
      l.status,
      l.created_at ? format(new Date(l.created_at), "yyyy-MM-dd") : "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-serif text-xl font-bold">Leads</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSortNewest(!sortNewest)} className="rounded-full text-xs">
            <ArrowUpDown className="h-3 w-3 mr-1" />
            {sortNewest ? "Newest first" : "Oldest first"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="rounded-full text-xs">
            Export CSV
          </Button>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["all", "new", "contacted", "converted", "archived"].map((s) => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className="capitalize rounded-full">
            {s} {s !== "all" && `(${leads.filter((l) => l.status === s).length})`}
            {s === "all" && `(${leads.length})`}
          </Button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No leads found.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((l) => (
            <Card key={l.id} className="cursor-pointer" onClick={() => setExpanded(expanded === l.id ? null : l.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{l.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{l.interest || l.message || "No message"}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Badge variant={l.status === "new" ? "default" : l.status === "archived" ? "outline" : "secondary"} className="capitalize text-xs">{l.status}</Badge>
                    <span className="text-xs text-muted-foreground">{l.created_at ? format(new Date(l.created_at), "dd MMM") : ""}</span>
                  </div>
                </div>
                {expanded === l.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-4 border-t space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div><Mail className="h-3 w-3 inline mr-1" />{l.email}</div>
                      {l.phone && <div><Phone className="h-3 w-3 inline mr-1" />{l.phone}</div>}
                      {l.interest && <div><MapPin className="h-3 w-3 inline mr-1" />{l.interest}</div>}
                    </div>
                    {l.message && <p className="text-sm bg-muted/50 p-3 rounded-lg">{l.message}</p>}
                    <div className="flex gap-2 pt-2 flex-wrap">
                      <Button size="sm" variant="outline" className="rounded-full" asChild>
                        <a href={`mailto:${l.email}?subject=Re: Your property enquiry – ${l.name}&body=Hi ${l.name},%0D%0A%0D%0AThank you for your interest.`} onClick={(e) => e.stopPropagation()}>
                          <Mail className="h-3 w-3 mr-1" /> Reply by email
                        </a>
                      </Button>
                      {l.status !== "contacted" && (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={(e) => { e.stopPropagation(); onUpdateStatus(l.id, "contacted"); }}>
                          Mark as contacted
                        </Button>
                      )}
                      {l.status !== "converted" && (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={(e) => { e.stopPropagation(); onUpdateStatus(l.id, "converted"); }}>
                          Mark as converted
                        </Button>
                      )}
                      {l.status !== "archived" && (
                        <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={(e) => { e.stopPropagation(); onUpdateStatus(l.id, "archived"); }}>
                          <Archive className="h-3 w-3 mr-1" /> Archive
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
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-bold">Subscription</h2>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="font-serif font-bold">Free Plan</p>
            <p className="text-sm text-muted-foreground">Your current plan — upgrade for more zones and visibility</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              "relative",
              tier.popular && "border-primary shadow-lg ring-2 ring-primary/20"
            )}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                Most popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-serif text-lg">{tier.name}</CardTitle>
              <div>
                <span className="text-3xl font-bold">€{tier.price}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full rounded-full"
                variant={tier.popular ? "default" : "outline"}
                asChild
              >
                <a href="mailto:hello@valoracasa.com?subject=Upgrade to ${tier.name} plan">
                  Upgrade to {tier.name}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Contact us at hello@valoracasa.com to upgrade your plan. Stripe billing coming soon.
      </p>
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/pro/login");
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-serif font-bold text-sm">{agent.company_name}</p>
                {agent.is_verified && <Shield size={14} className="text-primary" />}
              </div>
              <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Agent Dashboard</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
        <MobileDropdownNav active={section} onNav={setSection} badges={badges} />
        {content}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar active={section} onNav={setSection} companyName={agent.company_name} isVerified={!!agent.is_verified} badges={badges} onLogout={handleLogout} />
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
