import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link2, PenLine, Loader2 } from "lucide-react";

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
}

export default function AddSaleDialog({ open, onOpenChange, professionalId, onSaleAdded }: AddSaleDialogProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"link" | "manual">("link");
  const [saving, setSaving] = useState(false);

  // Link mode
  const [listingUrl, setListingUrl] = useState("");

  // Manual mode
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
  });

  const updateForm = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

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
    });
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
      photo_url: form.photo_url.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Could not save. Try again.", variant: "destructive" });
    } else {
      toast({ title: "Sale registered!" });
      setForm({ property_type: "apartment", bedrooms: "", bathrooms: "", built_size_sqm: "", address_text: "", city: "", sale_price: "", sale_date: "", photo_url: "" });
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

            <div>
              <Label>Photo URL (optional)</Label>
              <Input value={form.photo_url} onChange={e => updateForm("photo_url", e.target.value)} placeholder="https://..." />
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
