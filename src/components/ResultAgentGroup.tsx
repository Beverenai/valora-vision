import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ShieldCheck, Star, MapPin, ArrowUp, ArrowDown, Sparkles } from "lucide-react";

// ── Types ──
interface MatchedAgent {
  id: string; company_name: string; slug: string; logo_url: string | null;
  tagline: string | null; bio: string | null; avg_rating: number | null;
  total_reviews: number | null; is_verified: boolean | null;
  languages: string[] | null; website: string | null; distance_km: number | null;
}

// ── Agent Card ──
const AgentCard: React.FC<{ agent: MatchedAgent; onContact: (agent: MatchedAgent) => void }> = ({ agent, onContact }) => {
  const initials = agent.company_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const rating = agent.avg_rating || 0;
  const fullStars = Math.floor(rating);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col items-center text-center">
      {agent.is_verified && (
        <div className="w-full bg-accent text-white text-[10px] font-medium tracking-wider uppercase px-3 py-1 text-center">
          Featured Partner
        </div>
      )}
      <div className="p-6 flex flex-col items-center w-full">
      {agent.logo_url ? (
        <img src={agent.logo_url} alt={agent.company_name} className="w-16 h-16 rounded-full object-cover border border-border" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-accent text-white border border-accent/20 flex items-center justify-center text-lg font-semibold">{initials}</div>
      )}
      <div className="mt-4">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="font-heading text-base font-bold text-foreground">{agent.company_name}</h3>
          {agent.is_verified && <ShieldCheck size={14} className="text-accent" />}
        </div>
        {agent.tagline && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{agent.tagline}</p>}
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={i < fullStars ? "fill-gold text-gold" : "text-muted-foreground/30"} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{agent.total_reviews || 0} reviews</span>
      </div>
      {agent.distance_km != null && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin size={11} /> {agent.distance_km} km from property</p>
      )}
      {agent.languages && agent.languages.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-3">
          {agent.languages.slice(0, 4).map((lang) => (
            <span key={lang} className="text-[0.55rem] uppercase tracking-[0.1em] bg-muted px-2 py-0.5 rounded text-muted-foreground">{lang}</span>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 mt-5 w-full">
        <Button onClick={() => onContact(agent)} className="bg-gold text-primary-foreground hover:bg-gold-dark w-full text-sm">
          Contact {agent.company_name.split(" ")[0]}
        </Button>
        <Link to={`/agentes/${agent.slug}`}>
          <Button variant="outline" className="w-full text-sm">View Profile</Button>
        </Link>
      </div>
    </div>
    </div>
  );
};

// ── Contact Modal ──
const ContactAgentModal: React.FC<{
  agent: MatchedAgent | null; open: boolean; onClose: () => void; propertyAddress: string;
}> = ({ agent, open, onClose, propertyAddress }) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    if (open && propertyAddress) {
      setForm((f) => ({ ...f, message: `I valued my property on ValoraCasa at ${propertyAddress} and would like your expert opinion.` }));
    }
  }, [open, propertyAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent || !form.name || !form.email) return;
    setSending(true);
    const { error } = await supabase.from("agent_contact_requests").insert({
      professional_id: agent.id, name: form.name, email: form.email,
      phone: form.phone || null, message: form.message || null, interest: "valuation",
    });
    setSending(false);
    if (error) {
      toast({ title: "Error", description: "Could not send message. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Message Sent!", description: `${agent.company_name} will be in touch soon.` });
      onClose();
      setForm({ name: "", email: "", phone: "", message: "" });
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {agent.logo_url ? (
              <img src={agent.logo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">{agent.company_name.slice(0, 2).toUpperCase()}</div>
            )}
            <DialogTitle className="font-heading">Contact {agent.company_name}</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="contact-name">Name *</Label><Input id="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><Label htmlFor="contact-email">Email *</Label><Input id="contact-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><Label htmlFor="contact-phone">Phone</Label><Input id="contact-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label htmlFor="contact-message">Message</Label><Textarea id="contact-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} /></div>
          <Button type="submit" disabled={sending} className="w-full bg-gold text-primary-foreground hover:bg-gold-dark">{sending ? "Sending..." : "Send Message"}</Button>
          <p className="text-[0.6rem] text-muted-foreground/60 text-center">Your contact details are shared with {agent.company_name} only.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── Matched Agents Section ──
export const MatchedAgentsSection: React.FC<{ latitude: number | null; longitude: number | null; city: string | null; propertyAddress: string }> = ({
  latitude, longitude, city, propertyAddress,
}) => {
  const [agents, setAgents] = useState<MatchedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactAgent, setContactAgent] = useState<MatchedAgent | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) { setLoading(false); return; }
    supabase
      .rpc("match_agents_by_location", { p_lat: latitude, p_lng: longitude, p_limit: 3 })
      .then(({ data, error }) => {
        if (!error && data) setAgents(data as MatchedAgent[]);
        setLoading(false);
      });
  }, [latitude, longitude]);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="animate-pulse text-muted-foreground text-sm">Finding local experts…</div>
        </div>
      </section>
    );
  }

  if (agents.length === 0) {
    return (
      <section id="matched-agents" className="py-8 sm:py-12 border-b border-border/50">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="w-10 h-px bg-gold mx-auto mb-8" />
          <SectionLabel>Recommended Local Experts</SectionLabel>
          <p className="text-sm text-muted-foreground mb-6">Local agents coming soon. Want to be featured here?</p>
          <Link to="/pro"><Button variant="outline" className="rounded-full">Join as an Agent</Button></Link>
        </div>
      </section>
    );
  }

  return (
    <section id="matched-agents" className="py-8 sm:py-12 border-b border-border/50">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="w-10 h-px bg-gold mb-8" />
        <SectionLabel className="mb-2">Recommended Local Experts</SectionLabel>
        <h2 className="font-serif text-2xl sm:text-3xl mb-2">Local Agents</h2>
        <p className="text-sm text-muted-foreground mb-10">Matched based on proximity, reviews, and expertise</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {agents.map((agent) => <AgentCard key={agent.id} agent={agent} onContact={setContactAgent} />)}
        </div>
        {city && (
          <p className="text-sm text-accent mt-8 text-center">
            <Link to={`/agentes?location=${encodeURIComponent(city)}`} className="hover:underline">See all agents in {city} →</Link>
          </p>
        )}
        <p className="text-[0.55rem] text-muted-foreground/50 text-center mt-3">Rankings based on proximity, verified reviews, and platform activity</p>
        <ContactAgentModal agent={contactAgent} open={!!contactAgent} onClose={() => setContactAgent(null)} propertyAddress={propertyAddress} />
      </div>
    </section>
  );
};

// ── Prediction Game ──
export const ValuationPredictionGame: React.FC<{ leadId: string; leadType: "sell" | "rent" }> = ({ leadId, leadType }) => {
  const { toast } = useToast();
  const [prediction, setPrediction] = useState<"higher" | "lower" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handlePrediction = async (guess: "higher" | "lower") => {
    setPrediction(guess);
    const { error } = await supabase.from("valuation_feedback").insert({
      lead_id: leadId, lead_type: leadType, rating: guess === "higher" ? 5 : 1, comment: `prediction:${guess}`,
    });
    if (error) {
      toast({ title: "Error", description: "Could not save your prediction.", variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  const responseText = prediction === "higher"
    ? "Many owners are surprised — your property is performing well against the market."
    : "Great instinct — the Costa del Sol market has been rising steadily.";

  return (
    <section className="py-8 sm:py-12 border-b border-border/50">
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="w-10 h-px bg-gold mx-auto mb-8" />
        <SectionLabel>Your Prediction</SectionLabel>
        <p className="text-lg font-light text-foreground/80 mb-8">Did you think it would be…</p>
        {!submitted ? (
          <div className="flex justify-center gap-4">
            <button onClick={() => handlePrediction("higher")}
              className={`flex flex-col items-center gap-2 px-8 py-6 border rounded-lg transition-all duration-200 ${prediction === "higher" ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"}`}>
              <ArrowUp size={28} strokeWidth={1.5} /><span className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold">Higher</span>
            </button>
            <button onClick={() => handlePrediction("lower")}
              className={`flex flex-col items-center gap-2 px-8 py-6 border rounded-lg transition-all duration-200 ${prediction === "lower" ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"}`}>
              <ArrowDown size={28} strokeWidth={1.5} /><span className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold">Lower</span>
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 text-gold mb-4">
              <Sparkles size={16} /><span className="text-[0.6rem] uppercase tracking-[0.2em] font-semibold">{prediction === "higher" ? "↑ Higher" : "↓ Lower"}</span><Sparkles size={16} />
            </div>
            <p className="text-[15px] leading-[2] text-foreground/70 font-light max-w-sm mx-auto">{responseText}</p>
          </div>
        )}
      </div>
    </section>
  );
};

// ── Disclaimer ──
export const ValuationDisclaimer: React.FC = () => {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          This valuation is an automated estimate based on the information provided and market analysis as of {today}. It may not reflect actual market value. For an accurate appraisal, consult a qualified professional.
        </p>
        <p className="text-xs text-muted-foreground/40 mt-3">© {new Date().getFullYear()} ValoraCasa</p>
      </div>
    </section>
  );
};
