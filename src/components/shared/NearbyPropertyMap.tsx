import { useRef, useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NearbyPropertyMapProps {
  latitude: number;
  longitude: number;
  city?: string | null;
  radiusKm?: number;
}

interface SaleMarker {
  id: string;
  latitude: number;
  longitude: number;
  property_type: string | null;
  city: string | null;
  sale_price: number | null;
  show_price: boolean;
  photo_url: string | null;
  bedrooms: number | null;
  verified: boolean;
}

export default function NearbyPropertyMap({ latitude, longitude, city, radiusKm = 5 }: NearbyPropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [sales, setSales] = useState<SaleMarker[]>([]);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    async function fetchNearby() {
      const { data, error } = await supabase.rpc("find_nearby_agent_sales", {
        p_lat: latitude,
        p_lng: longitude,
        p_radius_km: radiusKm,
        p_limit: 50,
      });
      if (!error && data) {
        setSales(
          (data as any[])
            .filter((s) => s.latitude && s.longitude)
            .map((s) => ({
              id: s.id,
              latitude: Number(s.latitude),
              longitude: Number(s.longitude),
              property_type: s.property_type,
              city: s.city,
              sale_price: s.sale_price ? Number(s.sale_price) : null,
              show_price: s.show_price,
              photo_url: s.photo_url,
              bedrooms: s.bedrooms,
              verified: s.verified,
            }))
        );
      }
    }
    fetchNearby();
  }, [latitude, longitude, radiusKm]);

  useEffect(() => {
    if (!mapboxToken || !mapRef.current) {
      setMapError(true);
      return;
    }

    let map: any;

    async function initMap() {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        await import("mapbox-gl/dist/mapbox-gl.css");

        (mapboxgl as any).accessToken = mapboxToken;

        map = new mapboxgl.Map({
          container: mapRef.current!,
          style: "mapbox://styles/mapbox/light-v11",
          center: [longitude, latitude],
          zoom: 13,
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.on("load", () => {
          setMapLoaded(true);

          // User's property pin — distinct blue color
          const userEl = document.createElement("div");
          userEl.className = "w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center";
          userEl.style.backgroundColor = "#2563eb";
          userEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';

          new mapboxgl.Marker(userEl)
            .setLngLat([longitude, latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div class="text-xs font-semibold">Your Property</div>`
              )
            )
            .addTo(map);

          // Sale markers — terracotta
          sales.forEach((sale) => {
            const el = document.createElement("div");
            el.className = "w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer";
            el.style.backgroundColor = "#D4713B";

            const priceHtml =
              sale.show_price && sale.sale_price
                ? `<p class="text-sm font-semibold">€${(sale.sale_price / 1000).toFixed(0)}k</p>`
                : "";

            const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "200px" }).setHTML(`
              <div class="text-xs">
                ${sale.photo_url ? `<img src="${sale.photo_url}" class="w-full h-20 object-cover rounded mb-1" />` : ""}
                <p class="font-semibold capitalize">${sale.property_type || "Property"}</p>
                ${sale.bedrooms ? `<p>${sale.bedrooms} bedrooms</p>` : ""}
                ${sale.city ? `<p class="text-gray-500">${sale.city}</p>` : ""}
                ${priceHtml}
                ${sale.verified ? '<p class="text-green-600 text-[10px] font-medium mt-1">✓ Verified sale</p>' : ""}
              </div>
            `);

            new mapboxgl.Marker(el)
              .setLngLat([sale.longitude, sale.latitude])
              .setPopup(popup)
              .addTo(map);
          });
        });
      } catch {
        setMapError(true);
      }
    }

    initMap();
    return () => {
      if (map) map.remove();
    };
  }, [mapboxToken, sales, latitude, longitude]);

  if (!mapboxToken) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6">
          RECENT SALES NEARBY
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Properties recently sold by verified agents within {radiusKm}km of your location
          {city ? ` in ${city}` : ""}.
        </p>
        <div className="rounded-xl overflow-hidden border border-border/60 relative">
          <div ref={mapRef} className="h-[300px] md:h-[400px] w-full" />
          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
              <MapPin size={24} className="text-muted-foreground/30" />
            </div>
          )}
        </div>
        {sales.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {sales.length} sold {sales.length === 1 ? "property" : "properties"} found nearby
          </p>
        )}
      </div>
    </section>
  );
}
