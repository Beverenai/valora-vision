import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { GOOGLE_MAPS_API_KEY } from "@/config/google-maps";

interface PropertyMarker {
  id: string;
  latitude: number | null;
  longitude: number | null;
  property_type: string | null;
  city: string | null;
  sale_price: number | null;
  show_price: boolean;
  photo_url: string | null;
  bedrooms: number | null;
  verified: boolean;
  sale_date: string | null;
  address_text?: string | null;
}

interface AgentPropertyMapProps {
  sales: PropertyMarker[];
  centerLat?: number;
  centerLng?: number;
}

function formatSaleDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

let optionsSet = false;
function ensureOptions() {
  if (!optionsSet) {
    setOptions({ key: GOOGLE_MAPS_API_KEY });
    optionsSet = true;
  }
}

// Simple client-side geocoder with in-memory cache
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

async function geocodeAddress(address: string, city: string | null): Promise<{ lat: number; lng: number } | null> {
  const query = [address, city, "Spain"].filter(Boolean).join(", ");
  if (geocodeCache.has(query)) return geocodeCache.get(query) ?? null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "OK" && data.results?.length > 0) {
      const loc = data.results[0].geometry.location;
      const result = { lat: loc.lat, lng: loc.lng };
      geocodeCache.set(query, result);
      return result;
    }
    geocodeCache.set(query, null);
    return null;
  } catch {
    return null;
  }
}

export default function AgentPropertyMap({ sales, centerLat, centerLng }: AgentPropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [resolvedMarkers, setResolvedMarkers] = useState<(PropertyMarker & { latitude: number; longitude: number })[]>([]);

  // Resolve coordinates: use existing ones or geocode from address
  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      const results: (PropertyMarker & { latitude: number; longitude: number })[] = [];

      for (const sale of sales) {
        if (sale.latitude != null && sale.longitude != null) {
          results.push(sale as PropertyMarker & { latitude: number; longitude: number });
        } else if (sale.address_text || sale.city) {
          const coords = await geocodeAddress(sale.address_text || "", sale.city);
          if (coords && !cancelled) {
            results.push({ ...sale, latitude: coords.lat, longitude: coords.lng });
          }
        }
      }

      if (!cancelled) setResolvedMarkers(results);
    }

    resolve();
    return () => { cancelled = true; };
  }, [sales]);

  useEffect(() => {
    if (!mapRef.current || resolvedMarkers.length === 0) {
      if (resolvedMarkers.length === 0 && sales.length > 0) return; // still resolving
      setMapError(true);
      return;
    }

    let map: google.maps.Map | null = null;

    async function initMap() {
      try {
        ensureOptions();
        const { Map: GoogleMap } = await importLibrary("maps") as google.maps.MapsLibrary;
        await importLibrary("marker");

        const defaultCenter = centerLat && centerLng
          ? { lat: centerLat, lng: centerLng }
          : { lat: resolvedMarkers[0].latitude, lng: resolvedMarkers[0].longitude };

        map = new GoogleMap(mapRef.current!, {
          center: defaultCenter,
          zoom: 11,
          mapId: "agent-sales-map",
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });

        const infoWindow = new google.maps.InfoWindow();
        const bounds = new google.maps.LatLngBounds();

        resolvedMarkers.forEach(sale => {
          const position = { lat: sale.latitude, lng: sale.longitude };
          bounds.extend(position);

          const pin = document.createElement("div");
          pin.className = "w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer";
          pin.style.backgroundColor = "#D4713B";

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content: pin,
          });

          const priceHtml = sale.show_price && sale.sale_price
            ? `<p style="font-size:13px;font-weight:600;margin:2px 0">€${(sale.sale_price / 1000).toFixed(0)}k</p>`
            : "";

          const dateHtml = sale.sale_date
            ? `<p style="color:#9ca3af;font-size:10px">Sold: ${formatSaleDate(sale.sale_date)}</p>`
            : "";

          marker.addListener("click", () => {
            infoWindow.setContent(`
              <div style="font-size:12px;max-width:200px">
                ${sale.photo_url ? `<img src="${sale.photo_url}" style="width:100%;height:80px;object-fit:cover;border-radius:4px;margin-bottom:4px" />` : ""}
                <p style="font-weight:600;text-transform:capitalize">${sale.property_type || "Property"}</p>
                ${sale.bedrooms ? `<p>${sale.bedrooms} bedrooms</p>` : ""}
                ${sale.city ? `<p style="color:#6b7280">${sale.city}</p>` : ""}
                ${priceHtml}
                ${dateHtml}
              </div>
            `);
            infoWindow.open(map, marker);
          });
        });

        if (resolvedMarkers.length > 1) {
          map.fitBounds(bounds, 50);
        }

        setMapLoaded(true);
      } catch {
        setMapError(true);
      }
    }

    initMap();

    return () => {
      if (map) map = null;
    };
  }, [resolvedMarkers, centerLat, centerLng]);

  if (sales.length === 0) {
    return (
      <section>
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6">
          SALES LOCATIONS
        </p>
        <Card className="border-border/60">
          <CardContent className="p-8 text-center">
            <MapPin size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Property map available soon
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6">
        SALES LOCATIONS
      </p>
      <div className="rounded-xl overflow-hidden border border-border/60 relative">
        <div ref={mapRef} className="h-[300px] md:h-[400px] w-full" />
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <MapPin size={24} className="text-muted-foreground/30" />
          </div>
        )}
      </div>
    </section>
  );
}
