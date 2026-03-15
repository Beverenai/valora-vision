import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RentValuationData } from "@/types/valuation";

interface RentPreferencesStepProps {
  formData: RentValuationData;
  onChange: (field: keyof RentValuationData, value: string | boolean) => void;
}

const CONDITIONS = [
  { value: "excellent", label: "Excellent", desc: "Recently renovated, like new" },
  { value: "good", label: "Good", desc: "Well maintained, minor updates needed" },
  { value: "fair", label: "Fair", desc: "Needs some renovation" },
  { value: "needs-renovation", label: "Needs Renovation", desc: "Full renovation required" },
];

const SEA_VIEWS = [
  { value: "front-line", label: "Front Line Sea", desc: "Direct sea view" },
  { value: "partial", label: "Partial Sea View", desc: "Partial sea view" },
  { value: "none", label: "No Sea View", desc: "No sea view" },
  { value: "mountain-golf", label: "Mountain / Golf View", desc: "Mountain or golf view" },
];

const BEACH_PROXIMITY = [
  { value: "beachfront", label: "Beachfront (0-100m)" },
  { value: "near-beach", label: "Near beach (100-500m)" },
  { value: "walking-distance", label: "Walking distance (500m-1km)" },
  { value: "further", label: "Further (1km+)" },
];

const TOURIST_LICENSE = [
  { value: "yes", label: "Yes, I have one" },
  { value: "can-get", label: "No, but I can get one" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not sure" },
];

const SelectableCard: React.FC<{
  selected: boolean;
  onClick: () => void;
  label: string;
  desc: string;
}> = ({ selected, onClick, label, desc }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
      selected
        ? "border-accent bg-accent/8 shadow-sm"
        : "border-border bg-card hover:border-accent/40"
    }`}
  >
    <div className="font-medium text-sm text-foreground">{label}</div>
    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
  </button>
);

const RentPreferencesStep: React.FC<RentPreferencesStepProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-bold text-foreground">Rental Preferences</h3>
        <p className="text-muted-foreground mt-1">Tell us about your property's features and rental plans.</p>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Condition <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {CONDITIONS.map((c) => (
            <SelectableCard key={c.value} selected={formData.condition === c.value}
              onClick={() => onChange("condition", c.value)} label={c.label} desc={c.desc} />
          ))}
        </div>
      </div>

      {/* Sea View */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Views</Label>
        <div className="grid grid-cols-2 gap-2">
          {SEA_VIEWS.map((v) => (
            <SelectableCard key={v.value} selected={formData.seaView === v.value}
              onClick={() => onChange("seaView", v.value)} label={v.label} desc={v.desc} />
          ))}
        </div>
      </div>

      {/* Toggle switches */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
          <Label htmlFor="hasPool" className="text-sm font-medium text-foreground cursor-pointer">Swimming Pool</Label>
          <Switch id="hasPool" checked={formData.hasPool} onCheckedChange={(v) => onChange("hasPool", v)} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
          <Label htmlFor="hasAC" className="text-sm font-medium text-foreground cursor-pointer">Air Conditioning</Label>
          <Switch id="hasAC" checked={formData.hasAC} onCheckedChange={(v) => onChange("hasAC", v)} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
          <Label htmlFor="hasWifi" className="text-sm font-medium text-foreground cursor-pointer">WiFi / Internet</Label>
          <Switch id="hasWifi" checked={formData.hasWifi} onCheckedChange={(v) => onChange("hasWifi", v)} />
        </div>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Beach Proximity</Label>
          <Select value={formData.beachProximity} onValueChange={(v) => onChange("beachProximity", v)}>
            <SelectTrigger><SelectValue placeholder="Select distance" /></SelectTrigger>
            <SelectContent>
              {BEACH_PROXIMITY.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Tourist License</Label>
          <Select value={formData.touristLicense} onValueChange={(v) => onChange("touristLicense", v)}>
            <SelectTrigger><SelectValue placeholder="Do you have one?" /></SelectTrigger>
            <SelectContent>
              {TOURIST_LICENSE.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default RentPreferencesStep;
