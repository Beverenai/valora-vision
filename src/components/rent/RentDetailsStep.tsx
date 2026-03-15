import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PropertyTypeSelector from "@/components/shared/PropertyTypeSelector";
import { RentValuationData } from "@/types/valuation";
import { Sofa, Package, Armchair } from "lucide-react";

interface RentDetailsStepProps {
  formData: RentValuationData;
  onChange: (field: keyof RentValuationData, value: string) => void;
}

const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8+"];
const BATHROOM_OPTIONS = ["1", "2", "3", "4", "5", "6", "7+"];

const showPlotSize = (cat: string) => ["Houses", "Rural Properties", "New Development"].includes(cat);
const showTerraceAndFloor = (cat: string) => cat === "Apartments";

const FURNISHED_OPTIONS = [
  { value: "furnished", label: "Fully Furnished", desc: "Ready to move in with all furniture", Icon: Sofa },
  { value: "unfurnished", label: "Unfurnished", desc: "Empty property, no furniture", Icon: Package },
  { value: "partially_furnished", label: "Partially Furnished", desc: "Some furniture included", Icon: Armchair },
];

const PillSelector: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">
      {label} <span className="text-destructive">*</span>
    </Label>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`min-w-[44px] h-[44px] px-4 rounded-full text-sm font-semibold transition-all duration-200 border ${
            value === opt
              ? "bg-accent text-accent-foreground border-accent shadow-md scale-105"
              : "bg-card text-foreground border-border hover:border-accent/50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const RentDetailsStep: React.FC<RentDetailsStepProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-bold text-foreground">Property Details</h3>
        <p className="text-muted-foreground mt-1">Tell us about your property.</p>
      </div>

      <PropertyTypeSelector
        category={formData.propertyCategory}
        propertyType={formData.propertyType}
        onCategoryChange={(v) => onChange("propertyCategory", v)}
        onPropertyTypeChange={(v) => onChange("propertyType", v)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="builtSize" className="text-sm font-medium text-foreground">
            Built Size (m²) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="builtSize"
            type="number"
            min="0"
            placeholder="e.g. 120"
            value={formData.builtSize}
            onChange={(e) => onChange("builtSize", e.target.value)}
            className="text-base"
            style={{ fontSize: "16px" }}
          />
        </div>

        {showPlotSize(formData.propertyCategory) && (
          <div className="space-y-2">
            <Label htmlFor="plotSize" className="text-sm font-medium text-foreground">Plot Size (m²)</Label>
            <Input id="plotSize" type="number" min="0" placeholder="e.g. 500"
              value={formData.plotSize} onChange={(e) => onChange("plotSize", e.target.value)}
              className="text-base" style={{ fontSize: "16px" }} />
          </div>
        )}

        {showTerraceAndFloor(formData.propertyCategory) && (
          <>
            <div className="space-y-2">
              <Label htmlFor="terraceSize" className="text-sm font-medium text-foreground">Terrace Size (m²)</Label>
              <Input id="terraceSize" type="number" min="0" placeholder="e.g. 20"
                value={formData.terraceSize} onChange={(e) => onChange("terraceSize", e.target.value)}
                className="text-base" style={{ fontSize: "16px" }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor" className="text-sm font-medium text-foreground">Floor</Label>
              <Input id="floor" type="number" min="0" placeholder="e.g. 3"
                value={formData.floor} onChange={(e) => onChange("floor", e.target.value)}
                className="text-base" style={{ fontSize: "16px" }} />
            </div>
          </>
        )}
      </div>

      <PillSelector label="Bedrooms" options={BEDROOM_OPTIONS} value={formData.bedrooms} onChange={(v) => onChange("bedrooms", v)} />
      <PillSelector label="Bathrooms" options={BATHROOM_OPTIONS} value={formData.bathrooms} onChange={(v) => onChange("bathrooms", v)} />

      {/* Furnished status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Furnished Status <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FURNISHED_OPTIONS.map(({ value, label, desc, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("furnished", value)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                formData.furnished === value
                  ? "border-accent bg-accent/8 shadow-sm"
                  : "border-border bg-card hover:border-accent/40"
              }`}
            >
              <Icon className={`h-6 w-6 mb-2 ${formData.furnished === value ? "text-accent" : "text-muted-foreground"}`} />
              <div className="font-medium text-sm text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentDetailsStep;
