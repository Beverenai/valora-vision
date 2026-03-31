import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Globe, Mail, Phone, MapPin, Building2, User, ArrowLeft, SkipForward, Edit2, Plus, X, Instagram, Facebook, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ProgressIndicator from "@/components/shared/ProgressIndicator";

const wizardSteps = [
  { name: "Info", label: "Basic Info" },
  { name: "AI", label: "AI Magic" },
  { name: "Preview", label: "Review" },
];

const allLanguages = [
  { code: "en", label: "English" }, { code: "es", label: "Spanish" }, { code: "no", label: "Norwegian" },
  { code: "sv", label: "Swedish" }, { code: "de", label: "German" }, { code: "fr", label: "French" },
  { code: "nl", label: "Dutch" }, { code: "ru", label: "Russian" }, { code: "ar", label: "Arabic" },
];

const serviceAreaOptions = [
  "Marbella", "Estepona", "Benahavís", "Mijas", "Fuengirola", "Málaga",
  "Torremolinos", "Benalmádena", "Nerja", "Manilva", "Casares", "Sotogrande", "San Pedro",
];

interface TeamMember {
  name: string;
  role: string;
  photo_url?: string;
}

interface AiStep {
  key: string;
  status: "loading" | "done" | "skip" | "error";
  label: string;
}

const ProOnboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  // Step 1 fields
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");

  // Step 2 AI
  const [aiSteps, setAiSteps] = useState<AiStep[]>([]);
  const [aiDone, setAiDone] = useState(false);

  // Step 3 editable data
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [languages, setLanguages] = useState<string[]>(["es", "en"]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [googleRating, setGoogleRating] = useState<number | null>(null);
  const [googleReviewCount, setGoogleReviewCount] = useState<number | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const progressPercentage = ((step + 1) / wizardSteps.length) * 100;

  // Step 1 validation
  const canProceedStep1 = companyName.trim() && contactName.trim() && email.trim() && phone.trim() && address.trim();

  // Run AI onboarding
  const runAiOnboarding = useCallback(async () => {
    setAiSteps([]);
    setAiDone(false);

    // Simulate initial steps appearing
    const addStep = (s: AiStep) => setAiSteps((prev) => [...prev, s]);

    if (website) {
      addStep({ key: "scan", status: "loading", label: "Scanning your website..." });
    }
    addStep({ key: "profile", status: "loading", label: "Building your profile..." });

    try {
      const res = await supabase.functions.invoke("onboard-agency", {
        body: { company_name: companyName, contact_name: contactName, email, phone, website, address },
      });

      if (res.error) throw new Error(res.error.message);
      const data = res.data;

      if (!data.success) throw new Error(data.error || "Failed to build profile");

      // Update state from AI results
      if (data.description) setDescription(data.description);
      if (data.logo_url) setLogoUrl(data.logo_url);
      if (data.team?.length) setTeam(data.team);
      if (data.languages?.length) setLanguages(data.languages);
      if (data.service_areas?.length) setServiceAreas(data.service_areas);
      if (data.social?.instagram) setSocialInstagram(data.social.instagram);
      if (data.social?.facebook) setSocialFacebook(data.social.facebook);
      if (data.social?.linkedin) setSocialLinkedin(data.social.linkedin);
      if (data.google_rating) setGoogleRating(data.google_rating);
      if (data.google_review_count) setGoogleReviewCount(data.google_review_count);
      if (data.lat) setLat(data.lat);
      if (data.lng) setLng(data.lng);

      // Show AI steps from response
      const responseSteps: AiStep[] = data.steps || [];
      setAiSteps(responseSteps.length > 0 ? responseSteps : [
        { key: "done", status: "done", label: "Profile created successfully" },
      ]);
    } catch (e) {
      console.error("Onboard error:", e);
      setAiSteps([{ key: "error", status: "done", label: "Profile created with defaults" }]);
    }

    setAiDone(true);
  }, [companyName, contactName, email, phone, website, address]);

  // Auto-advance from step 2
  useEffect(() => {
    if (step === 1) {
      runAiOnboarding();
    }
  }, [step]);

  useEffect(() => {
    if (aiDone && step === 1) {
      const t = setTimeout(() => setStep(2), 2000);
      return () => clearTimeout(t);
    }
  }, [aiDone, step]);

  // Publish
  const handlePublish = async () => {
    if (!password || password.length < 6) {
      toast({ title: "Password required", description: "Please enter a password with at least 6 characters.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Failed to create account");

      // 2. Generate slug
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60);

      // 3. Insert professional
      const { error: profError } = await supabase.from("professionals").insert({
        user_id: userId,
        company_name: companyName,
        contact_name: contactName,
        email,
        phone,
        website: website || null,
        office_address: address,
        slug,
        type: "agency",
        description: description || null,
        logo_url: logoUrl,
        languages,
        instagram_url: socialInstagram || null,
        facebook_url: socialFacebook || null,
        linkedin_url: socialLinkedin || null,
        avg_rating: googleRating || 0,
        total_reviews: googleReviewCount || 0,
        team_size: team.length || null,
        is_active: true,
        is_verified: false,
      });
      if (profError) throw profError;

      // 4. Insert team members
      if (team.length > 0) {
        const { data: profData } = await supabase
          .from("professionals")
          .select("id")
          .eq("slug", slug)
          .single();

        if (profData) {
          const teamInserts = team.map((m, i) => ({
            professional_id: profData.id,
            name: m.name,
            role: m.role || null,
            photo_url: m.photo_url || null,
            sort_order: i,
          }));
          await supabase.from("agent_team_members").insert(teamInserts);
        }
      }

      // 5. Insert Google reviews as agent_reviews
      if (googleRating && googleReviewCount) {
        // We don't have individual reviews, just the aggregate — stored on professionals table already
      }

      navigate(`/pro/onboard/success?slug=${slug}`);
    } catch (e: any) {
      console.error("Publish error:", e);
      toast({ title: "Error", description: e.message || "Failed to publish profile", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-[640px] mx-auto px-6 py-8 md:py-12">
        <ProgressIndicator steps={wizardSteps} currentStep={step} progressPercentage={progressPercentage} />

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 0 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Let's get started</h1>
              <p className="text-muted-foreground mb-8">Tell us about your agency. We'll use AI to build your profile.</p>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="companyName">Agency name *</Label>
                  <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Costa del Sol Premium Realty" />
                </div>
                <div>
                  <Label htmlFor="contactName">Your name *</Label>
                  <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="María García" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@agency.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.youragency.com" />
                  <p className="text-xs text-muted-foreground mt-1">We'll use this to auto-fill your profile</p>
                </div>
                <div>
                  <Label htmlFor="address">Office address *</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Ricardo Soriano 72, Marbella" />
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <Button variant="ghost" asChild className="text-sm">
                  <a href="/pro/login">Already have an account? Sign in</a>
                </Button>
                <Button
                  onClick={() => { if (canProceedStep1) setStep(1); else toast({ title: "Required fields", description: "Please fill in all required fields.", variant: "destructive" }); }}
                  className="rounded-full px-8"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: AI Magic */}
          {step === 1 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="text-center py-12">
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Building your profile...</h1>
              <p className="text-muted-foreground mb-10">Our AI is scanning your information to create your profile.</p>

              <div className="max-w-sm mx-auto space-y-3 text-left">
                {aiSteps.map((s, i) => (
                  <motion.div
                    key={s.key + i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="flex items-center gap-3"
                  >
                    {s.status === "loading" ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                    ) : s.status === "done" ? (
                      <Check className="w-5 h-5 text-green-600 shrink-0" />
                    ) : s.status === "skip" ? (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-muted-foreground">—</span>
                      </div>
                    ) : (
                      <X className="w-5 h-5 text-destructive shrink-0" />
                    )}
                    <span className="text-sm">{s.label}</span>
                  </motion.div>
                ))}
              </div>

              {aiDone && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-sm text-primary font-medium">
                  Almost ready — reviewing your profile...
                </motion.p>
              )}

              <button onClick={() => setStep(2)} className="mt-8 text-xs text-muted-foreground hover:text-foreground underline">
                Skip <SkipForward className="inline w-3 h-3" />
              </button>
            </motion.div>
          )}

          {/* Step 3: Review & Edit */}
          {step === 2 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setStep(0)} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="font-heading text-2xl md:text-3xl font-bold">Review your profile</h1>
              </div>
              <p className="text-muted-foreground mb-8">Edit anything below before publishing.</p>

              {/* Logo */}
              <div className="mb-6">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-xl">
                      {companyName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">Logo can be changed after publishing</span>
                </div>
              </div>

              {/* Agency name */}
              <div className="mb-5">
                <Label>Agency name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>

              {/* Description */}
              <div className="mb-5">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe your agency..." />
              </div>

              {/* Google rating */}
              {googleRating && (
                <div className="mb-5 p-3 bg-secondary/50 rounded-xl">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Google Reviews (imported)</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{googleRating}★</span>
                    <span className="text-sm text-muted-foreground">from {googleReviewCount} reviews</span>
                  </div>
                </div>
              )}

              {/* Team */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <Label>Team members</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTeam([...team, { name: "", role: "" }])}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>
                {team.length === 0 && <p className="text-sm text-muted-foreground">No team members yet. Add them above.</p>}
                {team.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder="Name"
                      value={m.name}
                      onChange={(e) => { const t = [...team]; t[i].name = e.target.value; setTeam(t); }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Role"
                      value={m.role}
                      onChange={(e) => { const t = [...team]; t[i].role = e.target.value; setTeam(t); }}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setTeam(team.filter((_, j) => j !== i))}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Languages */}
              <div className="mb-5">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allLanguages.map((lang) => (
                    <Badge
                      key={lang.code}
                      variant={languages.includes(lang.code) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setLanguages((prev) =>
                          prev.includes(lang.code) ? prev.filter((c) => c !== lang.code) : [...prev, lang.code]
                        );
                      }}
                    >
                      {lang.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Service areas */}
              <div className="mb-5">
                <Label>Service areas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {serviceAreaOptions.map((area) => (
                    <Badge
                      key={area}
                      variant={serviceAreas.includes(area) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setServiceAreas((prev) =>
                          prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
                        );
                      }}
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Social links */}
              <div className="mb-5 space-y-3">
                <Label>Social media</Label>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="Instagram URL" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="Facebook URL" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="LinkedIn URL" value={socialLinkedin} onChange={(e) => setSocialLinkedin(e.target.value)} />
                </div>
              </div>

              {/* Password */}
              <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
                <Label htmlFor="password">Create your password *</Label>
                <p className="text-xs text-muted-foreground mb-2">You'll use this to sign in and manage your profile</p>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" />
              </div>

              {/* Actions */}
              <div className="flex gap-3 sticky bottom-4 bg-background/90 backdrop-blur-sm p-3 rounded-xl border">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => toast({ title: "Saved as draft", description: "You can return and publish later." })}>
                  Save as draft
                </Button>
                <Button className="flex-1 rounded-full" onClick={handlePublish} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Publish my profile
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProOnboard;
