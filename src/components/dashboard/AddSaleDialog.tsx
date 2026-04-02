import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link2, PenLine, Loader2, Upload, X } from "lucide-react";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "townhouse", label: "Townhouse" },
  { value: "penthouse", label: "Penthouse" },
  { value: "finca", label: "Finca / Country House" },
  { value: "plot", label: "Plot / Land" },
];

interface AddSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
  onSaleAdded: () => void;
  teamMembers?: { id: string; name: string }[];
}

export default function AddSaleDialog({ open, onOpenChange, professionalId, onSaleAdded, teamMembers = [] }: AddSaleDialogProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"link" | "manual">("link");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [listingUrl, setListingUrl] = useState("");
  const [linkTeamMemberId, setLinkTeamMemberId] = useState("");

  const [form, setForm] = useState({
    property_type: "apartment",
    bedrooms: "",
    bathrooms: "",
    built_size_sqm: "",
    address_text: "",
    city: "",
    sale_price: "",
    sale_date: "",
    photo_url: "",
    show_price: true,
    team_member_id: "",
  });

  const updateForm = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }));

  async function handlePhotoUpload(file: File) {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const ext = file.name.split('.').pop();
      const path = `${session.user.id}/${Date.now()}.${ext}`;
      
      const { error } = await supabase.storage.from("sale-photos").upload(path, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("sale-photos").getPublicUrl(path);
      updateForm("photo_url", publicUrl);
      toast({ title: "Photo uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  }

  async function handleSubmitLink() {
    if (!listingUrl.trim()) {
      toast({ title: "URL required", description: "Paste a listing URL.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const source = listingUrl.includes("idealista") ? "idealista"
      : listingUrl.includes("fotocasa") ? "fotocasa"
      : "other";

    const { error } = await supabase.from("agent_sales").insert({
      professional_id: professionalId,
      listing_url: listingUrl.trim(),
      listing_source: source,
      team_member_id: linkTeamMemberId || null,
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Could not save. Try again.", variant: "destructive" });
    } else {
      toast({ title: "Sale registered!", description: "You can add more details later." });
      setListingUrl("");
      onSaleAdded();
      onOpenChange(false);
    }
  }

  async function handleSubmitManual() {
    if (!form.city.trim()) {
      toast({ title: "City required", description: "Please enter the city.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("agent_sales").insert({
      professional_id: professionalId,
      property_type: form.property_type,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
      built_size_sqm: form.built_size_sqm ? parseFloat(form.built_size_sqm) : null,
      address_text: form.address_text.trim() || null,
      city: form.city.trim(),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      sale_date: form.sale_date || null,
      photo_url: form.photo_url || null,
      show_price: form.show_price,
      team_member_id: form.team_member_id || null,
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Could not save. Try again.", variant: "destructive" });
    } else {
      toast({ title: "Sale registered!" });
      setForm({ property_type: "apartment", bedrooms: "", bathrooms: "", built_size_sqm: "", address_text: "", city: "", sale_price: "", sale_date: "", photo_url: "", show_price: true, team_member_id: "" });
      onSaleAdded();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Register a Sale</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={v => setMode(v as "link" | "manual")} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="gap-2"><Link2 size={14} /> Paste Link</TabsTrigger>
            <TabsTrigger value="manual" className="gap-2"><PenLine size={14} /> Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div>
              <Label>Listing URL</Label>
              <Input
                placeholder="https://www.idealista.com/inmueble/..."
                value={listingUrl}
                onChange={e => setListingUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Paste a link from Idealista, Fotocasa, or another portal.</p>
            </div>
            <Button onClick={handleSubmitLink} disabled={saving} className="w-full">
              {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
              Register Sale
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Property Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.property_type}
                  onChange={e => updateForm("property_type", e.target.value)}
                >
                  {PROPERTY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>City *</Label>
                <Input value={form.city} onChange={e => updateForm("city", e.target.value)} placeholder="e.g. Marbella" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Bedrooms</Label>
                <Input type="number" min="0" value={form.bedrooms} onChange={e => updateForm("bedrooms", e.target.value)} />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input type="number" min="0" value={form.bathrooms} onChange={e => updateForm("bathrooms", e.target.value)} />
              </div>
              <div>
                <Label>Size (m²)</Label>
                <Input type="number" min="0" value={form.built_size_sqm} onChange={e => updateForm("built_size_sqm", e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input value={form.address_text} onChange={e => updateForm("address_text", e.target.value)} placeholder="Street, urbanisation..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sale Price (€)</Label>
                <Input type="number" min="0" value={form.sale_price} onChange={e => updateForm("sale_price", e.target.value)} />
              </div>
              <div>
                <Label>Sale Date</Label>
                <Input type="date" value={form.sale_date} onChange={e => updateForm("sale_date", e.target.value)} />
              </div>
            </div>

            {/* Show price toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Show price publicly</p>
                <p className="text-xs text-muted-foreground">Display the sale price on your public profile</p>
              </div>
              <Switch checked={form.show_price} onCheckedChange={(v) => updateForm("show_price", v)} />
            </div>

            {/* Photo upload */}
            <div>
              <Label>Property Photo</Label>
              {form.photo_url ? (
                <div className="relative mt-1 rounded-lg overflow-hidden h-32 bg-muted">
                  <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => updateForm("photo_url", "")}
                    className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="mt-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  {uploading ? (
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload size={20} className="text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Click to upload photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                  />
                </label>
              )}
            </div>

            <Button onClick={handleSubmitManual} disabled={saving} className="w-full">
              {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
              Register Sale
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
