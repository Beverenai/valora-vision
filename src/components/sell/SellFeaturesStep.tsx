import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SellValuationData } from "@/types/valuation";

interface SellFeaturesStepProps {
  formData: SellValuationData;
  onChange: (field: keyof SellValuationData, value: string | boolean) => void;
}

const CONDITIONS = [
  { value: "excellent", label: "Excellent", desc: "Recently renovated, like new" },
  { value: "good", label: "Good", desc: "Well maintained, minor updates needed" },
  { value: "fair", label: "Fair", desc: "Needs some renovation" },
  { value: "needs-renovation", label: "Needs Renovation", desc: "Full renovation required" },
];

const VIEWS_OPTIONS = [
  { value: "sea", label: "Sea" },
  { value: "partial-sea", label: "Partial Sea View" },
  { value: "mountain", label: "Mountain" },
  { value: "golf", label: "Golf" },
  { value: "garden", label: "Garden" },
  { value: "pool", label: "Pool" },
  { value: "urban", label: "Urban" },
  { value: "multiple", label: "Multiple Views" },
];

const ORIENTATIONS = ["North", "South", "East", "West", "Southeast", "Southwest", "Northeast", "Northwest"];

const ENERGY_CERTS = ["A", "B", "C", "D", "E", "F", "G", "Pending", "Exempt"];

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
        ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.08)] shadow-sm"
        : "border-border bg-card hover:border-[hsl(var(--gold)/0.4)]"
    }`}
  >
    <div className="font-medium text-sm text-foreground">{label}</div>
    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
  </button>
);

const SellFeaturesStep: React.FC<SellFeaturesStepProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-bold text-foreground">Property Features</h3>
        <p className="text-muted-foreground mt-1">What features does your property have?</p>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Condition <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {CONDITIONS.map((c) => (
            <SelectableCard
              key={c.value}
              selected={formData.condition === c.value}
              onClick={() => onChange("condition", c.value)}
              label={c.label}
              desc={c.desc}
            />
          ))}
        </div>
      </div>

      {/* Views dropdown */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Views (select most prominent view)</Label>
        <Select value={formData.views} onValueChange={(v) => onChange("views", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select view type" />
          </SelectTrigger>
          <SelectContent>
            {VIEWS_OPTIONS.map((v) => (
              <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orientation */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Orientation</Label>
        <div className="flex flex-wrap gap-2">
          {ORIENTATIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onChange("orientation", o)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                formData.orientation === o
                  ? "bg-[hsl(var(--gold))] text-white border-[hsl(var(--gold))] shadow-sm"
                  : "bg-card text-foreground border-border hover:border-[hsl(var(--gold)/0.4)]"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle switches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
          <Label htmlFor="hasPool" className="text-sm font-medium text-foreground cursor-pointer">
            Swimming Pool
          </Label>
          <Switch id="hasPool" checked={formData.hasPool} onCheckedChange={(v) => onChange("hasPool", v)} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
          <Label htmlFor="hasGarage" className="text-sm font-medium text-foreground cursor-pointer">
            Garage / Parking
          </Label>
          <Switch id="hasGarage" checked={formData.hasGarage} onCheckedChange={(v) => onChange("hasGarage", v)} />
        </div>
      </div>

      {/* Property Features textarea */}
      <div className="space-y-2">
        <Label htmlFor="propertyFeatures" className="text-sm font-medium text-foreground">
          Additional Property Features
        </Label>
        <Textarea
          id="propertyFeatures"
          placeholder="Describe additional features: terrace, gym, sauna, wine cellar, smart home, elevator, etc."
          value={formData.propertyFeatures}
          onChange={(e) => onChange("propertyFeatures", e.target.value)}
          className="text-base min-h-[80px]"
          style={{ fontSize: "16px" }}
        />
        <p className="text-xs text-muted-foreground">
          Enter key features separated by commas (e.g., private pool, roof terrace, wine cellar)
        </p>
      </div>

      {/* Year Built + Energy Certificate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yearBuilt" className="text-sm font-medium text-foreground">Year Built</Label>
          <Input
            id="yearBuilt"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            placeholder="e.g. 2005"
            value={formData.yearBuilt}
            onChange={(e) => onChange("yearBuilt", e.target.value)}
            className="text-base"
            style={{ fontSize: "16px" }}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Energy Certificate</Label>
          <Select value={formData.energyCertificate} onValueChange={(v) => onChange("energyCertificate", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              {ENERGY_CERTS.map((cert) => (
                <SelectItem key={cert} value={cert}>{cert}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SellFeaturesStep;
