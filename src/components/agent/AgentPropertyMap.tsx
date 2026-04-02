import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

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
}

interface AgentPropertyMapProps {
  sales: PropertyMarker[];
  centerLat?: number;
  centerLng?: number;
}

export default function AgentPropertyMap({ sales, centerLat, centerLng }: AgentPropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // Filter sales with coordinates
  const markers = sales.filter(s => s.latitude != null && s.longitude != null);

  useEffect(() => {
    if (!mapboxToken || !mapRef.current || markers.length === 0) {
      setMapError(true);
      return;
    }

    let map: any;

    async function initMap() {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        await import("mapbox-gl/dist/mapbox-gl.css");

        (mapboxgl as any).accessToken = mapboxToken;

        const defaultCenter: [number, number] = centerLng && centerLat
          ? [centerLng, centerLat]
          : [markers[0].longitude!, markers[0].latitude!];

        map = new mapboxgl.Map({
          container: mapRef.current!,
          style: "mapbox://styles/mapbox/light-v11",
          center: defaultCenter,
          zoom: 11,
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.on("load", () => {
          setMapLoaded(true);

          markers.forEach(sale => {
            const el = document.createElement("div");
            el.className = "w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[8px] font-bold text-white cursor-pointer";
            el.style.backgroundColor = "#D4713B";

            const priceHtml = sale.show_price && sale.sale_price
              ? `<p class="text-sm font-semibold">€${(sale.sale_price / 1000).toFixed(0)}k</p>`
              : "";

            const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "200px" }).setHTML(`
              <div class="text-xs">
                ${sale.photo_url ? `<img src="${sale.photo_url}" class="w-full h-20 object-cover rounded mb-1" />` : ""}
                <p class="font-semibold capitalize">${sale.property_type || "Propiedad"}</p>
                ${sale.bedrooms ? `<p>${sale.bedrooms} dormitorios</p>` : ""}
                ${sale.city ? `<p class="text-gray-500">${sale.city}</p>` : ""}
                ${priceHtml}
              </div>
            `);

            new mapboxgl.Marker(el)
              .setLngLat([sale.longitude!, sale.latitude!])
              .setPopup(popup)
              .addTo(map);
          });

          // Fit bounds if multiple markers
          if (markers.length > 1) {
            const bounds = new mapboxgl.LngLatBounds();
            markers.forEach(s => bounds.extend([s.longitude!, s.latitude!]));
            map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
          }
        });
      } catch {
        setMapError(true);
      }
    }

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, [mapboxToken, markers.length]);

  if (!mapboxToken || markers.length === 0) {
    // Fallback
    return (
      <section>
        <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6">
          UBICACIÓN DE VENTAS
        </p>
        <Card className="border-border/60">
          <CardContent className="p-8 text-center">
            <MapPin size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Mapa de propiedades disponible próximamente
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6">
        UBICACIÓN DE VENTAS
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
