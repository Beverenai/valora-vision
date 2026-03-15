import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhoneInput from "@/components/shared/PhoneInput";
import { SellValuationData } from "@/types/valuation";

interface SellContactStepProps {
  formData: SellValuationData;
  onChange: (field: keyof SellValuationData, value: string | boolean) => void;
}

const TIMELINES = [
  { value: "asap", label: "As soon as possible" },
  { value: "3-months", label: "Within 3 months" },
  { value: "6-months", label: "Within 6 months" },
  { value: "1-year", label: "Within 1 year" },
  { value: "exploring", label: "Just exploring" },
];

const SellContactStep: React.FC<SellContactStepProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-bold text-foreground">Contact Information</h3>
        <p className="text-muted-foreground mt-1">How can we reach you with your valuation?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          placeholder="Your full name"
          value={formData.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          className="text-base"
          style={{ fontSize: "16px" }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          className="text-base"
          style={{ fontSize: "16px" }}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Phone <span className="text-destructive">*</span>
        </Label>
        <PhoneInput
          value={formData.phone}
          onChange={(v) => onChange("phone", v)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Selling Timeline</Label>
        <Select
          value={formData.sellingTimeline}
          onValueChange={(v) => onChange("sellingTimeline", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="When are you looking to sell?" />
          </SelectTrigger>
          <SelectContent>
            {TIMELINES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={formData.termsAccepted}
          onCheckedChange={(v) => onChange("termsAccepted", !!v)}
          className="mt-0.5"
        />
        <label htmlFor="terms" className="text-sm text-foreground leading-snug cursor-pointer">
          I accept the{" "}
          <span className="underline text-primary">terms and conditions</span> and{" "}
          <span className="underline text-primary">privacy policy</span>
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        Your information is only shared with professionals shown on your results page.
      </p>
    </div>
  );
};

export default SellContactStep;
