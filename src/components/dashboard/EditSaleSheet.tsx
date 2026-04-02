import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "townhouse", label: "Townhouse" },
  { value: "penthouse", label: "Penthouse" },
  { value: "finca", label: "Finca / Country House" },
  { value: "plot", label: "Plot / Land" },
];

interface SaleData {
  id: string;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  built_size_sqm: number | null;
  address_text: string | null;
  city: string | null;
  sale_price: number | null;
  sale_date: string | null;
  photo_url: string | null;
  show_price: boolean;
  team_member_id?: string | null;
  listing_url?: string | null;
}

interface EditSaleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: SaleData | null;
  onSaved: () => void;
  teamMembers?: { id: string; name: string }[];
}

export default function EditSaleSheet({ open, onOpenChange, sale, onSaved, teamMembers = [] }: EditSaleSheetProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (sale) {
      setForm({
        property_type: sale.property_type || "apartment",
        bedrooms: sale.bedrooms?.toString() || "",
        bathrooms: sale.bathrooms?.toString() || "",
        built_size_sqm: sale.built_size_sqm?.toString() || "",
        address_text: sale.address_text || "",
        city: sale.city || "",
        sale_price: sale.sale_price?.toString() || "",
        sale_date: sale.sale_date || "",
        photo_url: sale.photo_url || "",
        show_price: sale.show_price,
        team_member_id: sale.team_member_id || "",
      });
    }
  }, [sale]);

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
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!sale) return;
    setSaving(true);
    const { error } = await supabase.from("agent_sales").update({
      property_type: form.property_type,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
      built_size_sqm: form.built_size_sqm ? parseFloat(form.built_size_sqm) : null,
      address_text: form.address_text.trim() || null,
      city: form.city.trim() || null,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      sale_date: form.sale_date || null,
      photo_url: form.photo_url || null,
      show_price: form.show_price,
      team_member_id: form.team_member_id || null,
    } as any).eq("id", sale.id);
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: "Could not update.", variant: "destructive" });
    } else {
      toast({ title: "Sale updated" });
      onSaved();
      onOpenChange(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif">Edit Sale</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {sale?.listing_url && (
            <div className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2 truncate">
              Source: {sale.listing_url}
            </div>
          )}

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
              <Label>City</Label>
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

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Show price publicly</p>
              <p className="text-xs text-muted-foreground">Display on your public profile</p>
            </div>
            <Switch checked={form.show_price} onCheckedChange={(v) => updateForm("show_price", v)} />
          </div>

          {teamMembers.length > 0 && (
            <div>
              <Label>Attributed to</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.team_member_id}
                onChange={e => updateForm("team_member_id", e.target.value)}
              >
                <option value="">Company (no specific agent)</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

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

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 size={14} className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
