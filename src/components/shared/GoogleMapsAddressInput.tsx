import React, { useState, useEffect, useCallback, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { AlertCircle, Loader } from "lucide-react";
import AddressSearchInput from "./AddressSearchInput";
import {
  geocodeAddress,
  updateAddressFromGeocode,
  reconstructAddressFromData,
} from "@/utils/addressUtils";

interface AddressData {
  streetAddress: string;
  urbanization: string;
  city: string;
  province: string;
  country: string;
  complex?: string;
}

interface GoogleMapsAddressInputProps {
  addressData: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
}

const libraries: ("places")[] = ["places"];

const GoogleMapsAddressInput: React.FC<GoogleMapsAddressInputProps> = ({
  addressData,
  onChange,
}) => {
  const isClearingRef = useRef(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const [apiError, setApiError] = useState<string>("");
  const [formattedAddress, setFormattedAddress] = useState<string>("");
  const [searchInputRef, setSearchInputRef] = useState<{
    setValue: (value: string, shouldFetchData?: boolean) => void;
    clearSuggestions: () => void;
  } | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries,
  });

  useEffect(() => {
    if (isClearingRef.current) return;
    const hasAddressData =
      addressData.streetAddress || addressData.city || addressData.urbanization;
    if (!hasAddressData) {
      if (formattedAddress) setFormattedAddress("");
      return;
    }
    if (!formattedAddress) {
      const reconstructedAddress = reconstructAddressFromData(addressData);
      if (reconstructedAddress) {
        setFormattedAddress(reconstructedAddress);
      }
    }
  }, [addressData, formattedAddress]);

  useEffect(() => {
    if (loadError) {
      console.error("Google Maps API loading error:", loadError);
      setApiError(
        "Failed to load Google Maps. Please check your API key and ensure the Places API is enabled."
      );
    } else {
      setApiError("");
    }
  }, [loadError]);

  const handleAddressSelect = async (address: string) => {
    try {
      const { result } = await geocodeAddress(address);
      setFormattedAddress(result.formatted_address);
      updateAddressFromGeocode(result, onChange as (field: string, value: string) => void, () => {
        if (searchInputRef) {
          searchInputRef.setValue(result.formatted_address, false);
          searchInputRef.clearSuggestions();
        }
      });
    } catch (error) {
      console.error("Error selecting address:", error);
      setApiError("Failed to geocode the selected address. Please try again.");
    }
  };

  const handleAddressClear = useCallback(() => {
    isClearingRef.current = true;
    setFormattedAddress("");
    onChange("streetAddress", "");
    onChange("urbanization", "");
    onChange("city", "");
    onChange("province", "");
    onChange("country", "");
    onChange("complex", "");
    if (searchInputRef) {
      searchInputRef.setValue("", false);
      searchInputRef.clearSuggestions();
    }
    setTimeout(() => {
      isClearingRef.current = false;
    }, 0);
  }, [onChange, searchInputRef]);

  const handleSearchInputRef = useCallback(
    (ref: {
      setValue: (value: string, shouldFetchData?: boolean) => void;
      clearSuggestions: () => void;
    }) => {
      setSearchInputRef(ref);
    },
    []
  );

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg bg-muted border border-border">
        <div className="text-center px-4">
          <AlertCircle className="mx-auto mb-2 text-destructive" size={24} />
          <p className="text-sm text-muted-foreground">
            Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in your environment.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg bg-muted">
        <Loader className="animate-spin text-primary" size={24} />
        <span className="ml-2 text-muted-foreground">Loading address search...</span>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-32 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-2 text-destructive" size={24} />
            <p className="text-destructive text-sm">{apiError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AddressSearchInput
        isLoaded={isLoaded}
        onAddressSelect={handleAddressSelect}
        onAddressClear={handleAddressClear}
        onSearchInputRef={handleSearchInputRef}
        currentAddress={formattedAddress}
      />
    </div>
  );
};

export default GoogleMapsAddressInput;
