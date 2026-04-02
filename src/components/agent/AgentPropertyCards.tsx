import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface Sale {
  id: string;
  property_type: string | null;
  city: string | null;
  address_text: string | null;
  sale_price: number | null;
  show_price: boolean;
  sale_date: string | null;
  photo_url: string | null;
  bedrooms: number | null;
  built_size_sqm: number | null;
  verified: boolean;
}

interface AgentPropertyCardsProps {
  sales: Sale[];
  agentName: string;
  agencyName?: string | null;
  pageSize?: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
}

export default function AgentPropertyCards({
  sales,
  agentName,
  agencyName,
  pageSize = 6,
}: AgentPropertyCardsProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(sales.length / pageSize);

  const currentSales = useMemo(
    () => sales.slice(page * pageSize, (page + 1) * pageSize),
    [sales, page, pageSize]
  );

  if (sales.length === 0) return null;

  return (
    <section>
      <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6">
        PROPERTIES SOLD
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSales.map(sale => (
          <Card key={sale.id} className="overflow-hidden border-border/60">
            <div className="relative h-32 bg-muted">
              {sale.photo_url ? (
                <img src={sale.photo_url} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home size={20} className="text-muted-foreground/30" />
                </div>
              )}
              <Badge className="absolute top-2 left-2 bg-[#D4713B] text-white border-0 text-[0.6rem] uppercase tracking-wider font-semibold">
                Vendido
              </Badge>
              {sale.verified && (
                <Badge className="absolute top-2 right-2 bg-emerald-600 text-white border-0 text-[0.6rem] gap-1">
                  <CheckCircle2 size={10} /> Verificado
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              {sale.sale_date && (
                <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-1">
                  {formatDate(sale.sale_date)}
                </p>
              )}
              <p className="font-serif font-medium text-sm text-foreground capitalize">
                {sale.property_type || "Propiedad"}
                {sale.bedrooms != null && ` — ${sale.bedrooms} dormitorios`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sale.city || sale.address_text || "—"}
              </p>
              {sale.show_price && sale.sale_price && (
                <p className="text-sm font-semibold text-foreground mt-2">
                  €{sale.sale_price.toLocaleString("es-ES")}
                </p>
              )}
              <p className="text-[0.6rem] text-muted-foreground mt-2">
                Vendido por <span className="font-medium">{agentName}</span>
                {agencyName && <> de <span className="font-medium">{agencyName}</span></>}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-full"
          >
            <ChevronLeft size={14} className="mr-1" /> Anterior
          </Button>

          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={i === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(i)}
              className="rounded-full w-8 h-8 p-0"
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="rounded-full"
          >
            Siguiente <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      )}
    </section>
  );
}
