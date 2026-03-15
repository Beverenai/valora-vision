import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Home, Store, Landmark } from "lucide-react";
import {
  PROPERTY_CATEGORIES,
  PROPERTY_TYPE_CATEGORIES,
  ALL_PROPERTY_TYPES,
} from "@/types/valuation";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Apartments: Building,
  Houses: Home,
  Commercial: Store,
  "Rural Properties": Landmark,
  "New Development": Building,
};

interface PropertyTypeSelectorProps {
  category: string;
  propertyType: string;
  onCategoryChange: (category: string) => void;
  onPropertyTypeChange: (type: string) => void;
}

const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({
  category,
  propertyType,
  onCategoryChange,
  onPropertyTypeChange,
}) => {
  const availablePropertyTypes = category
    ? PROPERTY_TYPE_CATEGORIES.find((cat) => cat.category === category)?.types || []
    : [];

  const CategoryIcon = CATEGORY_ICONS[category] || Building;
  const selectedPropertyType = ALL_PROPERTY_TYPES.find((t) => t.value === propertyType);

  const handleCategoryChange = (newCategory: string) => {
    onCategoryChange(newCategory);
    if (propertyType) {
      onPropertyTypeChange("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-foreground">
          Property Category <span className="text-destructive">*</span>
        </Label>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select property category" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.value] || Building;
              return (
                <SelectItem key={cat.value} value={cat.value} className="py-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div>{cat.label}</div>
                      <div className="text-xs text-muted-foreground">{cat.description}</div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Specific type selector */}
      {category && (
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground">
            Specific Property Type <span className="text-destructive">*</span>
          </Label>
          <Select value={propertyType} onValueChange={onPropertyTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select specific property type" />
            </SelectTrigger>
            <SelectContent>
              {availablePropertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="py-2">
                  <div>
                    <div>{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default PropertyTypeSelector;
