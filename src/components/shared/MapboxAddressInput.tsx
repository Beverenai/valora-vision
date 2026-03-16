import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader, AlertCircle, MapPin, Navigation, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface MapboxAddressInputProps {
  addressData: AddressData;
  onChange: (field: keyof AddressData, value: string | number | undefined) => void;
  onLocationConfirmed?: () => void;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  context?: { id: string; text: string }[];
}

const MAPBOX_GEOCODING_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const PROXIMITY = "-4.88,36.51"; // Marbella bias

function parseMapboxFeature(
  feature: MapboxFeature,
  onChange: (field: keyof AddressData, value: string | number | undefined) => void
) {
  let city = "";
  let province = "";
  let country = "";
  let urbanization = "";

  if (feature.context) {
    for (const ctx of feature.context) {
      if (ctx.id.startsWith("place.")) city = ctx.text;
      else if (ctx.id.startsWith("region.")) province = ctx.text;
      else if (ctx.id.startsWith("country.")) country = ctx.text;
      else if (ctx.id.startsWith("neighborhood.") || ctx.id.startsWith("locality."))
        urbanization = ctx.text;
    }
  }

  onChange("streetAddress", feature.text || "");
  onChange("city", city);
  onChange("province", province);
  onChange("country", country || "Spain");
  onChange("urbanization", urbanization);
  onChange("complex", "");
  onChange("latitude", feature.center[1]);
  onChange("longitude", feature.center[0]);
}

const MapboxAddressInput: React.FC<MapboxAddressInputProps> = ({
  addressData,
  onChange,
  onLocationConfirmed,
}) => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
  const [phase, setPhase] = useState<"search" | "verify">("search");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isLocating, setIsLocating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const suppressFetchRef = useRef(false);

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

      // If we already have coordinates, go to verify phase
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
    if (phase !== "verify" || !mapContainerRef.current || !token) return;
    if (mapRef.current) return; // already initialized

    const lat = addressData.latitude || 36.51;
    const lng = addressData.longitude || -4.88;

    import("mapbox-gl").then((mapboxgl) => {
      import("mapbox-gl/dist/mapbox-gl.css");

      (mapboxgl as any).accessToken = token;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: 15,
      });

      const marker = new mapboxgl.Marker({
        draggable: true,
        color: "hsl(21, 62%, 53%)",
      })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        reverseGeocode(lngLat.lng, lngLat.lat);
      });

      mapRef.current = map;
      markerRef.current = marker;

      // Resize after render
      setTimeout(() => map.resize(), 100);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, token]);

  const reverseGeocode = useCallback(
    async (lng: number, lat: number) => {
      if (!token) return;
      try {
        const res = await fetch(
          `${MAPBOX_GEOCODING_URL}/${lng},${lat}.json?access_token=${token}&types=address&limit=1&language=en,es`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.features?.length > 0) {
          const feature = data.features[0] as MapboxFeature;
          feature.center = [lng, lat]; // use exact pin position
          parseMapboxFeature(feature, onChange);
          const parts = [feature.text, ...(feature.context?.filter(c => c.id.startsWith("place.")).map(c => c.text) || [])].filter(Boolean);
          setQuery(feature.place_name || parts.join(", "));
        } else {
          onChange("latitude", lat);
          onChange("longitude", lng);
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
      }
    },
    [token, onChange]
  );

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (!token || text.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const encoded = encodeURIComponent(text);
        const res = await fetch(
          `${MAPBOX_GEOCODING_URL}/${encoded}.json?access_token=${token}&proximity=${PROXIMITY}&types=address,poi&limit=5&language=en,es`
        );
        if (!res.ok) throw new Error("Mapbox API error");
        const data = await res.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
        setHighlightIndex(-1);
      } catch (err) {
        console.error("Mapbox geocoding error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
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

  const handleSelect = (feature: MapboxFeature) => {
    suppressFetchRef.current = true;
    setQuery(feature.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
    parseMapboxFeature(feature, onChange);
    // Move to verify phase
    setPhase("verify");
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
        await reverseGeocode(longitude, latitude);
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
    // Clean up map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  };

  const handleBackToSearch = () => {
    setPhase("search");
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  };

  const handleConfirmLocation = () => {
    onLocationConfirmed?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    // Account for "Use current location" as index 0
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
            Mapbox access token not configured. Set VITE_MAPBOX_ACCESS_TOKEN in your environment.
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
      <div ref={containerRef} className="space-y-3">
        {/* Confirmed address header */}
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

        {/* Map */}
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

        {/* Confirm button */}
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
          onFocus={() => {
            // Always show dropdown on focus (with current location option)
            setShowSuggestions(true);
          }}
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
          {/* Current location option — always first */}
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

          {suggestions.map((feature, idx) => (
            <li
              key={feature.id}
              onClick={() => handleSelect(feature)}
              onMouseEnter={() => setHighlightIndex(idx + 1)}
              className={`flex items-start gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                idx + 1 === highlightIndex ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
              }`}
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="line-clamp-2">{feature.place_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MapboxAddressInput;
