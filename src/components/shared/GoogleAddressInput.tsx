import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader, AlertCircle, MapPin, Navigation, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { GOOGLE_MAPS_API_KEY } from "@/config/google-maps";

interface AddressData {
  streetAddress: string;
  urbanization: string;
  city: string;
  province: string;
  country: string;
  complex?: string;
  latitude?: number;
  longitude?: number;
}

interface GoogleAddressInputProps {
  addressData: AddressData;
  onChange: (field: keyof AddressData, value: string | number | undefined) => void;
  onLocationConfirmed?: () => void;
  onPhaseChange?: (phase: "search" | "verify") => void;
}

interface Suggestion {
  placeId: string;
  description: string;
}

let optionsSet = false;
function ensureOptions() {
  if (!optionsSet) {
    setOptions({ key: GOOGLE_MAPS_API_KEY });
    optionsSet = true;
  }
}

function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[],
  onChange: (field: keyof AddressData, value: string | number | undefined) => void
) {
  let streetNumber = "";
  let route = "";
  let city = "";
  let province = "";
  let country = "";
  let urbanization = "";

  for (const comp of components) {
    const types = comp.types;
    if (types.includes("street_number")) streetNumber = comp.long_name;
    else if (types.includes("route")) route = comp.long_name;
    else if (types.includes("locality")) city = comp.long_name;
    else if (types.includes("administrative_area_level_2")) {
      if (!city) city = comp.long_name;
    }
    else if (types.includes("administrative_area_level_1")) province = comp.long_name;
    else if (types.includes("country")) country = comp.long_name;
    else if (types.includes("neighborhood") || types.includes("sublocality") || types.includes("sublocality_level_1"))
      urbanization = comp.long_name;
  }

  const streetAddress = [route, streetNumber].filter(Boolean).join(" ");
  onChange("streetAddress", streetAddress);
  onChange("city", city);
  onChange("province", province);
  onChange("country", country || "Spain");
  onChange("urbanization", urbanization);
  onChange("complex", "");
}

const GoogleAddressInput: React.FC<GoogleAddressInputProps> = ({
  addressData,
  onChange,
  onLocationConfirmed,
  onPhaseChange,
}) => {
  const token = GOOGLE_MAPS_API_KEY;
  const [phase, setPhaseInternal] = useState<"search" | "verify">("search");

  const setPhase = useCallback((newPhase: "search" | "verify") => {
    setPhaseInternal(newPhase);
    onPhaseChange?.(newPhase);
  }, [onPhaseChange]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isLocating, setIsLocating] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const suppressFetchRef = useRef(false);

  // Load Google Maps SDK
  useEffect(() => {
    if (!token) return;
    ensureOptions();
    Promise.all([importLibrary("places"), importLibrary("maps")]).then(() => {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
      setGoogleReady(true);
    }).catch(err => console.error("Google Maps load error:", err));
  }, [token]);

  // Reconstruct display value on mount
  useEffect(() => {
    if (!query && (addressData.streetAddress || addressData.city)) {
      const parts = [
        addressData.streetAddress,
        addressData.urbanization,
        addressData.city,
        addressData.province,
        addressData.country,
      ].filter(Boolean);
      setQuery(parts.join(", "));
      suppressFetchRef.current = true;
      if (addressData.latitude && addressData.longitude) {
        setPhase("verify");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Initialize map when entering verify phase
  useEffect(() => {
    if (phase !== "verify" || !mapContainerRef.current || !googleReady) return;
    if (mapRef.current) return;

    const lat = addressData.latitude || 36.51;
    const lng = addressData.longitude || -4.88;

    const map = new google.maps.Map(mapContainerRef.current, {
      center: { lat, lng },
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
      ],
    });

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
    });

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (pos) {
        reverseGeocode(pos.lat(), pos.lng());
      }
    });

    mapRef.current = map;
    markerRef.current = marker;

    setTimeout(() => google.maps.event.trigger(map, "resize"), 100);

    return () => {
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, googleReady]);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!geocoderRef.current) return;
      try {
        const result = await geocoderRef.current.geocode({
          location: { lat, lng },
        });
        if (result.results?.[0]) {
          const place = result.results[0];
          parseAddressComponents(place.address_components, onChange);
          onChange("latitude", lat);
          onChange("longitude", lng);
          setQuery(place.formatted_address);
        } else {
          onChange("latitude", lat);
          onChange("longitude", lng);
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        onChange("latitude", lat);
        onChange("longitude", lng);
      }
    },
    [onChange]
  );

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (!autocompleteServiceRef.current || text.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await autocompleteServiceRef.current.getPlacePredictions({
          input: text,
          locationBias: new google.maps.Circle({
            center: { lat: 36.51, lng: -4.88 },
            radius: 50000,
          }),
          types: ["address"],
        });
        const results = (response?.predictions || []).map((p) => ({
          placeId: p.place_id,
          description: p.description,
        }));
        setSuggestions(results);
        setShowSuggestions(true);
        setHighlightIndex(-1);
      } catch (err) {
        console.error("Autocomplete error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    suppressFetchRef.current = false;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      if (!suppressFetchRef.current) fetchSuggestions(val);
    }, 300);
  };

  const handleSelect = async (suggestion: Suggestion) => {
    suppressFetchRef.current = true;
    setQuery(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);

    if (!geocoderRef.current) return;
    try {
      const result = await geocoderRef.current.geocode({ placeId: suggestion.placeId });
      if (result.results?.[0]) {
        const place = result.results[0];
        parseAddressComponents(place.address_components, onChange);
        const loc = place.geometry?.location;
        if (loc) {
          onChange("latitude", loc.lat());
          onChange("longitude", loc.lng());
        }
        setPhase("verify");
      }
    } catch (err) {
      console.error("Geocode error:", err);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }
    setIsLocating(true);
    setShowSuggestions(false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await reverseGeocode(latitude, longitude);
        setIsLocating(false);
        setPhase("verify");
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClear = () => {
    suppressFetchRef.current = true;
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setPhase("search");
    onChange("streetAddress", "");
    onChange("urbanization", "");
    onChange("city", "");
    onChange("province", "");
    onChange("country", "");
    onChange("complex", "");
    onChange("latitude", undefined);
    onChange("longitude", undefined);
    cleanupMap();
  };

  const cleanupMap = () => {
    if (markerRef.current) {
      google.maps.event.clearInstanceListeners(markerRef.current);
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    mapRef.current = null;
  };

  const handleBackToSearch = () => {
    setPhase("search");
    cleanupMap();
  };

  const handleConfirmLocation = () => {
    onLocationConfirmed?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    const totalItems = suggestions.length + 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      if (highlightIndex === 0) {
        handleUseCurrentLocation();
      } else {
        handleSelect(suggestions[highlightIndex - 1]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  if (!token) {
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

  // ─── PHASE 2: Verify on Map ───
  if (phase === "verify") {
    const displayAddress = [
      addressData.streetAddress,
      addressData.urbanization,
      addressData.city,
    ].filter(Boolean).join(", ") || query;

    return (
      <div ref={containerRef} className="space-y-3 max-w-full overflow-hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBackToSearch}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 border border-border">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm text-foreground truncate">{displayAddress}</span>
            <button
              type="button"
              onClick={handleClear}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-border">
          <div
            ref={mapContainerRef}
            className="w-full"
            style={{ height: "220px" }}
          />
          <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
            <p className="text-xs text-foreground/70 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 inline-block">
              Drag the pin to adjust location
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleConfirmLocation}
          className="w-full gap-2"
          size="sm"
        >
          <CheckCircle2 className="h-4 w-4" />
          Confirm Location
        </Button>
      </div>
    );
  }

  // ─── PHASE 1: Search ───
  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type your property address…"
          className="pl-9 pr-9 text-base"
          style={{ fontSize: "16px" }}
          autoComplete="off"
        />
        {(isLoading || isLocating) && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {!isLoading && !isLocating && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-60 overflow-auto">
          <li
            onClick={handleUseCurrentLocation}
            onMouseEnter={() => setHighlightIndex(0)}
            className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors border-b border-border/50 ${
              highlightIndex === 0 ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
            }`}
          >
            <Navigation className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-medium">Use my current location</span>
          </li>

          {suggestions.map((suggestion, idx) => (
            <li
              key={suggestion.placeId}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightIndex(idx + 1)}
              className={`flex items-start gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                idx + 1 === highlightIndex ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
              }`}
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="line-clamp-2">{suggestion.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoogleAddressInput;
