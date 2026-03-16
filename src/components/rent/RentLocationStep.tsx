import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MapboxAddressInput from "@/components/shared/MapboxAddressInput";
import { RentValuationData } from "@/types/valuation";

const POPULAR_CITIES = [
  "Marbella", "Estepona", "Mijas", "Fuengirola",
  "Benalmádena", "Málaga", "Benahavís", "Nerja",
];

interface RentLocationStepProps {
  formData: RentValuationData;
  onChange: (field: keyof RentValuationData, value: string) => void;
}

const RentLocationStep: React.FC<RentLocationStepProps> = ({ formData, onChange }) => {
  const addressData = {
    streetAddress: formData.streetAddress,
    urbanization: formData.urbanization,
    city: formData.city,
    province: formData.province,
    country: formData.country,
    complex: formData.complex,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-bold text-foreground">Property Location</h3>
        <p className="text-muted-foreground mt-1">Where is your property located?</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Property Address <span className="text-destructive">*</span>
        </Label>
        <GoogleMapsAddressInput
          addressData={addressData}
          onChange={(field, value) => onChange(field as keyof RentValuationData, value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="urbanization" className="text-sm font-medium text-foreground">
          Urbanization / Community Name
        </Label>
        <Input
          id="urbanization"
          placeholder="e.g. Los Monteros, La Quinta"
          value={formData.urbanization}
          onChange={(e) => onChange("urbanization", e.target.value)}
          className="text-base"
          style={{ fontSize: "16px" }}
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Quick City Select</Label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onChange("city", city)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                formData.city === city
                  ? "bg-accent text-accent-foreground border-accent shadow-md"
                  : "bg-card text-foreground border-border hover:border-accent/50 hover:bg-accent/5"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentLocationStep;
