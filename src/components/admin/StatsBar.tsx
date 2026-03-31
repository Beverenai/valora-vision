import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatTile {
  key: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

interface StatsBarProps {
  tiles: StatTile[];
  onSelect?: (key: string) => void;
  activeKey?: string;
  dark?: boolean;
}

export function StatsBar({ tiles, onSelect, activeKey, dark }: StatsBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {tiles.map((tile) => {
        const isActive = activeKey === tile.key;
        return (
          <button
            key={tile.key}
            onClick={() => onSelect?.(tile.key)}
            className={cn(
              "flex-shrink-0 flex items-center gap-3 rounded-xl px-5 py-4 transition-all text-left min-w-[160px]",
              dark
                ? isActive
                  ? "bg-white/10 border border-white/20"
                  : "bg-white/5 border border-white/10 hover:bg-white/8"
                : isActive
                  ? "bg-primary/5 border border-primary/20 shadow-sm"
                  : "bg-card border border-border hover:border-primary/20 hover:shadow-sm"
            )}
          >
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
              dark ? "bg-white/10" : "bg-muted"
            )}>
              <tile.icon size={16} className={tile.color || (dark ? "text-white/70" : "text-muted-foreground")} />
            </div>
            <div>
              <p className={cn(
                "text-xl font-bold leading-none",
                dark ? "text-white" : "text-foreground"
              )}>
                {tile.value}
              </p>
              <p className={cn(
                "text-[0.65rem] uppercase tracking-wider mt-0.5",
                dark ? "text-white/50" : "text-muted-foreground"
              )}>
                {tile.label}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
