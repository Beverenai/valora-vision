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
function OverviewSection({ agent, leads, impressionsCount, onViewLeads, setSection, activeZonesCount, reviewCount }: {
  agent: Professional; leads: Lead[]; impressionsCount: number; onViewLeads: () => void; setSection: (s: Section) => void;
  activeZonesCount?: number; reviewCount?: number;
}) {
  const recentLeads = leads.slice(0, 5);

  // ── Improved Merit Score Algorithm ──
  // Profile completeness (10%): 8 key fields
  const profileFields = [agent.bio, agent.logo_url, agent.description, agent.phone, agent.website, agent.tagline, (agent as any).cover_photo_url, agent.languages?.length];
  const profileMerit = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  // Rating (25%): avg_rating out of 5
  const ratingMerit = agent.avg_rating ? Math.round((Number(agent.avg_rating) / 5) * 100) : 0;

  // Zone coverage (15%): has active zones = 100, else 0
  const zoneMerit = (activeZonesCount && activeZonesCount > 0) ? 100 : 0;

  // Review count (15%): normalized, cap at 20 reviews for 100%
  const reviewNorm = Math.min((reviewCount || agent.total_reviews || 0), 20);
  const reviewMerit = Math.round((reviewNorm / 20) * 100);

  // Lead responsiveness (20%): leads with status != 'new' / total leads (proxy for response)
  const totalLeads = leads.length;
  const respondedLeads = leads.filter(l => l.status !== "new").length;
  const responseMerit = totalLeads > 0 ? Math.round((respondedLeads / totalLeads) * 100) : 0;

  // Conversion rate (15%): leads marked 'converted' / total leads
  const convertedLeads = leads.filter(l => l.status === "converted").length;
  const conversionMerit = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const meritScore = Math.round(
    profileMerit * 0.10 +
    ratingMerit * 0.25 +
    zoneMerit * 0.15 +
    reviewMerit * 0.15 +
    responseMerit * 0.20 +
    conversionMerit * 0.15
  );

  const actionItems: { icon: React.ElementType; label: string; desc: string; section: Section; color: string }[] = [];
  if (!agent.bio && !agent.description) actionItems.push({ icon: Edit2, label: "Add a company description", desc: "+15 merit points", section: "profile", color: "text-amber-600" });
  if (!agent.logo_url) actionItems.push({ icon: Eye, label: "Upload your logo", desc: "+20 merit points", section: "profile", color: "text-amber-600" });
  actionItems.push({ icon: MapPin, label: "Select your service zones", desc: "Required to appear in valuation results", section: "zones", color: "text-blue-600" });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-bold">Welcome back, {agent.company_name}</h1>
        {agent.is_verified && <Shield size={18} className="text-primary" />}
      </div>

      {/* Merit Score */}
      <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Merit Score</p>
              <p className="text-3xl font-bold mt-1">{meritScore}</p>
              <p className="text-xs text-muted-foreground mt-1">Profile completeness & engagement</p>
            </div>
            <div className="w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                  strokeDasharray={`${meritScore}, 100`} strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2 mt-4 text-center">
            <div><p className="text-xs text-muted-foreground">Profile</p><p className="text-sm font-medium">{profileMerit}</p></div>
            <div><p className="text-xs text-muted-foreground">Rating</p><p className="text-sm font-medium">{ratingMerit}</p></div>
            <div><p className="text-xs text-muted-foreground">Zones</p><p className="text-sm font-medium">{zoneMerit}</p></div>
            <div><p className="text-xs text-muted-foreground">Reviews</p><p className="text-sm font-medium">{reviewMerit}</p></div>
            <div><p className="text-xs text-muted-foreground">Response</p><p className="text-sm font-medium">{responseMerit}</p></div>
            <div><p className="text-xs text-muted-foreground">Conversion</p><p className="text-sm font-medium">{conversionMerit}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      {actionItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif">Action Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {actionItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSection(item.section)}>
                  {item.section === "zones" ? "Set up" : "Edit"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
  const [coverPhotoUrl, setCoverPhotoUrl] = useState((agent as any).cover_photo_url || "");
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const ext = file.name.split(".").pop();
    const path = `${agent.id}/cover.${ext}`;

    const { error: uploadError } = await supabase.storage.from("agent-logos").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingCover(false);
      return;
    }

    const { data: publicData } = supabase.storage.from("agent-logos").getPublicUrl(path);
    const newUrl = publicData.publicUrl + `?t=${Date.now()}`;
    setCoverPhotoUrl(newUrl);
    setCoverFailed(false);
    setUploadingCover(false);

    const { error } = await supabase.from("professionals").update({ cover_photo_url: newUrl }).eq("id", agent.id);
    if (!error) {
      toast({ title: "Cover photo updated!" });
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

      {/* Cover Photo */}
      <div>
        <Label className="mb-2 block">Cover Photo</Label>
        <p className="text-xs text-muted-foreground mb-2">This appears as the hero banner on your public profile</p>
        {coverPhotoUrl && !coverFailed ? (
          <img src={coverPhotoUrl} alt="Cover" className="w-full h-36 rounded-xl object-cover border mb-2" onError={() => setCoverFailed(true)} />
        ) : (
          <div className="w-full h-36 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-dashed border-border flex items-center justify-center mb-2">
            <span className="text-sm text-muted-foreground">No cover photo</span>
          </div>
        )}
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>
          {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
          {uploadingCover ? "Uploading…" : coverPhotoUrl ? "Change cover photo" : "Upload cover photo"}
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

/* ─── Zones Section ─── */
interface ZoneWithDetails {
  id: string;
  name: string;
  tier: string;
  is_active: boolean;
  municipality: string | null;
  region: string;
}

function ZonesSection({ agent, activeZones, availableZones }: {
  agent: Professional;
  activeZones: ZoneWithDetails[];
  availableZones: ZoneWithDetails[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold">My Active Zones</h2>
        <Badge variant="outline">{activeZones.length} zones</Badge>
      </div>

      {activeZones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              You haven't selected any zones yet.<br />
              Zones determine where you appear on valuation result pages.
            </p>
            <Button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-primary-foreground" asChild>
              <a href="mailto:hello@valoracasa.com?subject=Zone inquiry">Browse available zones</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeZones.map((zone) => (
            <Card key={zone.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{zone.name}</h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier</span>
                    <span className="font-medium capitalize">{zone.tier}</span>
                  </div>
                  {zone.municipality && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Municipality</span>
                      <span className="font-medium">{zone.municipality}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Region</span>
                    <span className="font-medium">{zone.region}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {availableZones.length > 0 && (
        <div>
          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Available Zones</h3>
          <p className="text-sm text-muted-foreground mb-4">Expand your coverage to appear in more valuation results</p>
          <div className="grid md:grid-cols-3 gap-3">
            {availableZones.slice(0, 9).map((zone) => (
              <Card key={zone.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{zone.name}</p>
                    <p className="text-xs text-muted-foreground">{zone.municipality || zone.region}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <a href={`mailto:hello@valoracasa.com?subject=Add zone: ${zone.name}`}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Reviews Section ─── */
interface Review {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  rating: number;
  comment: string | null;
  created_at: string | null;
  is_verified: boolean | null;
}

function ReviewsSection({ reviews, avgRating }: { reviews: Review[]; avgRating: number | null }) {
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...ratingDistribution.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-bold">Reviews</h2>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No reviews yet. Reviews from clients will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <Card>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="text-center">
                <p className="text-4xl font-bold font-serif">{avgRating ? Number(avgRating).toFixed(1) : "—"}</p>
                <div className="flex gap-0.5 justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= Math.round(avgRating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 space-y-1.5 w-full max-w-sm">
                {ratingDistribution.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-right">{star}</span>
                    <Star size={12} className="text-amber-400 shrink-0" />
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Review list */}
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{r.reviewer_name}</p>
                      {r.reviewer_role && <Badge variant="secondary" className="text-[0.6rem] mt-0.5">{r.reviewer_role}</Badge>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {r.created_at ? format(new Date(r.created_at), "dd MMM yyyy") : ""}
                      </span>
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Settings Section ─── */
function SettingsSection({ agent }: { agent: Professional }) {
  const [emailLeads, setEmailLeads] = useState(true);
  const [emailWeekly, setEmailWeekly] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-serif text-xl font-bold">Settings</h2>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-serif flex items-center gap-2"><Bell size={16} /> Notifications</CardTitle>
          <CardDescription>Choose what emails you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">New lead notifications</p>
              <p className="text-xs text-muted-foreground">Get an email when someone sends you an enquiry</p>
            </div>
            <Switch checked={emailLeads} onCheckedChange={setEmailLeads} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly performance digest</p>
              <p className="text-xs text-muted-foreground">Summary of views, leads, and analytics every Monday</p>
            </div>
            <Switch checked={emailWeekly} onCheckedChange={setEmailWeekly} />
          </div>
        </CardContent>
      </Card>

      {/* Public profile link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-serif">Public Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input value={`valoracasa.com/agentes/${agent.slug}`} readOnly className="text-sm" />
            <Button variant="outline" size="sm" onClick={() => window.open(`/agentes/${agent.slug}`, "_blank")}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base font-serif text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5">
                <Trash2 className="h-4 w-4 mr-2" /> Delete my profile
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Please contact hello@valoracasa.com to request profile deletion.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <a href="mailto:hello@valoracasa.com?subject=Delete my agent profile&body=Please delete my agent profile: ${agent.company_name}">
                    Contact support
                  </a>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
  const [activeZones, setActiveZones] = useState<ZoneWithDetails[]>([]);
  const [availableZones, setAvailableZones] = useState<ZoneWithDetails[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
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

    const [leadsRes, impressionsRes, zonesRes, reviewsRes, allZonesRes] = await Promise.all([
      supabase.from("agent_contact_requests").select("*").eq("professional_id", prof.id).order("created_at", { ascending: false }),
      supabase.from("professional_impressions").select("created_at").eq("professional_id", prof.id),
      supabase.from("professional_zones").select("*, zones(*)").eq("professional_id", prof.id).eq("is_active", true),
      supabase.from("agent_reviews").select("*").eq("professional_id", prof.id).order("created_at", { ascending: false }),
      supabase.from("zones").select("id, name, tier, is_active, municipality, region").eq("is_active", true),
    ]);

    if (leadsRes.data) setLeads(leadsRes.data as unknown as Lead[]);

    const imps = impressionsRes.data || [];
    setImpressionsCount(imps.length);

    // Process zones
    const agentZoneIds = new Set<string>();
    if (zonesRes.data) {
      const mapped = zonesRes.data.map((pz: any) => {
        agentZoneIds.add(pz.zone_id);
        const z = pz.zones;
        return {
          id: pz.zone_id,
          name: z?.name || "Unknown",
          tier: pz.tier,
          is_active: pz.is_active,
          municipality: z?.municipality || null,
          region: z?.region || "",
        } as ZoneWithDetails;
      });
      setActiveZones(mapped);
    }

    if (allZonesRes.data) {
      const available = (allZonesRes.data as any[])
        .filter((z) => !agentZoneIds.has(z.id))
        .map((z) => ({
          id: z.id,
          name: z.name,
          tier: z.tier || "warm",
          is_active: true,
          municipality: z.municipality,
          region: z.region,
        } as ZoneWithDetails));
      setAvailableZones(available);
    }

    if (reviewsRes.data) setReviews(reviewsRes.data as unknown as Review[]);

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
        <OverviewSection agent={agent} leads={leads} impressionsCount={impressionsCount} onViewLeads={() => setSection("leads")} setSection={setSection} activeZonesCount={activeZones.length} reviewCount={reviews.length} />
      )}
      {section === "profile" && (
        <ProfileSection agent={agent} onSave={handleSaveProfile} saving={saving} />
      )}
      {section === "leads" && (
        <LeadsSection leads={leads} onUpdateStatus={handleUpdateLeadStatus} />
      )}
      {section === "zones" && (
        <ZonesSection agent={agent} activeZones={activeZones} availableZones={availableZones} />
      )}
      {section === "reviews" && (
        <ReviewsSection reviews={reviews} avgRating={agent.avg_rating} />
      )}
      {section === "analytics" && (
        <AnalyticsSection impressions={impressionsByDay} leads={leadsByDay} />
      )}
      {section === "subscription" && <SubscriptionSection />}
      {section === "settings" && <SettingsSection agent={agent} />}
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
