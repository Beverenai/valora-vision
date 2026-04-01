import React from "react";
import { Label } from "@/components/ui/label";
import GoogleAddressInput from "@/components/shared/GoogleAddressInput";
import { SellValuationData } from "@/types/valuation";

interface SellLocationStepProps {
  formData: SellValuationData;
  onChange: (field: keyof SellValuationData, value: string | number | undefined) => void;
  onLocationConfirmed?: () => void;
}

const SellLocationStep: React.FC<SellLocationStepProps> = ({ formData, onChange, onLocationConfirmed }) => {
  const addressData = {
    streetAddress: formData.streetAddress,
    urbanization: formData.urbanization,
    city: formData.city,
    province: formData.province,
    country: formData.country,
    complex: formData.complex,
    latitude: formData.latitude,
    longitude: formData.longitude,
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mt-1">Search for your address or use your current location</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Property Address <span className="text-destructive">*</span>
        </Label>
        <GoogleAddressInput
          addressData={addressData}
          onChange={(field, value) => onChange(field as keyof SellValuationData, value)}
          onLocationConfirmed={onLocationConfirmed}
        />
      </div>
    </div>
  );
};

export default SellLocationStep;
