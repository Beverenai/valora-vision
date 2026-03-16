import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader, AlertCircle, MapPin } from "lucide-react";

interface AddressData {
  streetAddress: string;
  urbanization: string;
  city: string;
  province: string;
  country: string;
  complex?: string;
}

interface MapboxAddressInputProps {
  addressData: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  context?: { id: string; text: string }[];
}

const MAPBOX_GEOCODING_URL =
  "https://api.mapbox.com/geocoding/v5/mapbox.places";

// Marbella proximity bias
const PROXIMITY = "-4.88,36.51";

function parseMapboxFeature(
  feature: MapboxFeature,
  onChange: (field: keyof AddressData, value: string) => void
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
}

const MapboxAddressInput: React.FC<MapboxAddressInputProps> = ({
  addressData,
  onChange,
}) => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suppressFetchRef = useRef(false);

  // Reconstruct display value from addressData on mount
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
          `${MAPBOX_GEOCODING_URL}/${encoded}.json?access_token=${token}&country=es&proximity=${PROXIMITY}&types=address,poi&limit=5&language=en,es`
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
  };

  const handleClear = () => {
    suppressFetchRef.current = true;
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onChange("streetAddress", "");
    onChange("urbanization", "");
    onChange("city", "");
    onChange("province", "");
    onChange("country", "");
    onChange("complex", "");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]);
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

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Type your property address…"
          className="pl-9 pr-9 text-base"
          style={{ fontSize: "16px" }}
          autoComplete="off"
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {!isLoading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-60 overflow-auto">
          {suggestions.map((feature, idx) => (
            <li
              key={feature.id}
              onClick={() => handleSelect(feature)}
              onMouseEnter={() => setHighlightIndex(idx)}
              className={`flex items-start gap-2 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                idx === highlightIndex ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
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
