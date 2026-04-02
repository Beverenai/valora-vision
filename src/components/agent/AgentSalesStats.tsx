import { useMemo, useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Home } from "lucide-react";

interface Sale {
  sale_price: number | null;
  show_price: boolean;
  property_type: string | null;
  sale_date: string | null;
}

interface AgentSalesStatsProps {
  sales: Sale[];
  agentName: string;
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{display.toLocaleString("es-ES")}{suffix}
    </span>
  );
}

function formatPrice(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return value.toLocaleString("es-ES");
}

export default function AgentSalesStats({ sales, agentName }: AgentSalesStatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const stats = useMemo(() => {
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

    const recentSales = sales.filter(s => {
      if (!s.sale_date) return true; // include sales without date
      return new Date(s.sale_date) >= twoYearsAgo;
    });

    const totalSold = recentSales.length;

    // Median price from sales with show_price and sale_price
    const prices = recentSales
      .filter(s => s.show_price && s.sale_price != null && s.sale_price > 0)
      .map(s => s.sale_price!)
      .sort((a, b) => a - b);

    const medianPrice = prices.length > 0
      ? prices.length % 2 === 0
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)]
      : null;

    // Breakdown by property type
    const typeMap: Record<string, { count: number; prices: number[] }> = {};
    recentSales.forEach(s => {
      const type = s.property_type || "Otro";
      if (!typeMap[type]) typeMap[type] = { count: 0, prices: [] };
      typeMap[type].count++;
      if (s.show_price && s.sale_price) typeMap[type].prices.push(s.sale_price);
    });

    const typeBreakdown = Object.entries(typeMap)
      .map(([type, data]) => ({
        type,
        count: data.count,
        medianPrice: data.prices.length > 0
          ? data.prices.sort((a, b) => a - b)[Math.floor(data.prices.length / 2)]
          : null,
      }))
      .sort((a, b) => b.count - a.count);

    return { totalSold, medianPrice, typeBreakdown };
  }, [sales]);

  if (stats.totalSold === 0) return null;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-6">
        ESTADÍSTICAS DE VENTA
      </p>

      {/* Summary text */}
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        En los últimos 24 meses, <span className="font-semibold text-foreground">{agentName}</span> vendió{" "}
        <span className="font-semibold text-foreground">{stats.totalSold}</span> propiedades
        {stats.medianPrice && (
          <>
            {" "}con un precio de venta mediano de{" "}
            <span className="font-semibold text-foreground">€{formatPrice(stats.medianPrice)}</span>
          </>
        )}
        .
      </p>

      {/* Stat boxes */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-[#D4713B]/20 bg-[#D4713B]/5">
          <CardContent className="p-5 text-center">
            <Home size={20} className="mx-auto text-[#D4713B] mb-2" />
            <p className="text-3xl font-serif font-bold text-foreground">
              <AnimatedNumber value={stats.totalSold} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">Propiedades vendidas</p>
          </CardContent>
        </Card>

        {stats.medianPrice && (
          <Card className="border-[#D4713B]/20 bg-[#D4713B]/5">
            <CardContent className="p-5 text-center">
              <TrendingUp size={20} className="mx-auto text-[#D4713B] mb-2" />
              <p className="text-3xl font-serif font-bold text-foreground">
                €<AnimatedNumber value={Math.round(stats.medianPrice / 1000)} suffix="k" />
              </p>
              <p className="text-xs text-muted-foreground mt-1">Precio mediano</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Type breakdown */}
      {stats.typeBreakdown.length > 0 && (
        <div className="space-y-2">
          {stats.typeBreakdown.map(({ type, count, medianPrice }) => (
            <div key={type} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4713B]" />
                <span className="text-sm text-foreground capitalize">{type}</span>
                <span className="text-xs text-muted-foreground">({count})</span>
              </div>
              {medianPrice && (
                <span className="text-sm font-medium text-foreground">€{formatPrice(medianPrice)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
