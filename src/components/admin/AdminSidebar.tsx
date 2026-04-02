import { Users, Database, Zap, Activity, ChevronDown, Globe, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export type AdminSection = "leads" | "zones" | "jobs" | "resales" | "health" | "map";

const groups = [
  {
    label: "Leads",
    items: [
      { key: "leads" as AdminSection, label: "All Leads", icon: Users },
    ],
  },
  {
    label: "Data",
    items: [
      { key: "zones" as AdminSection, label: "Zones", icon: Database },
      { key: "jobs" as AdminSection, label: "Scrape Jobs", icon: Zap },
      { key: "resales" as AdminSection, label: "Resales Online", icon: Globe },
    ],
  },
  {
    label: "System",
    items: [
      { key: "health" as AdminSection, label: "Health", icon: Activity },
    ],
  },
];

const allItems = groups.flatMap((g) => g.items);

interface AdminSidebarProps {
  active: AdminSection;
  onNav: (s: AdminSection) => void;
  dark?: boolean;
  badges?: Partial<Record<AdminSection, number>>;
}

export function AdminSidebar({ active, onNav, dark, badges }: AdminSidebarProps) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = allItems.find((i) => i.key === active);

  if (isMobile) {
    return (
      <div className="relative">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
            dark
              ? "bg-white/5 border border-white/10 text-white"
              : "bg-card border border-border text-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            {activeItem && <activeItem.icon size={16} />}
            {activeItem?.label}
          </span>
          <ChevronDown size={16} className={cn("transition-transform", mobileOpen && "rotate-180")} />
        </button>
        {mobileOpen && (
          <div className={cn(
            "absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-lg z-50 py-1",
            dark ? "bg-[hsl(220,18%,12%)] border-white/10" : "bg-card border-border"
          )}>
            {groups.map((group) => (
              <div key={group.label}>
                <p className={cn(
                  "px-4 py-1.5 text-[0.6rem] uppercase tracking-widest font-semibold",
                  dark ? "text-white/30" : "text-muted-foreground"
                )}>
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { onNav(item.key); setMobileOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                      active === item.key
                        ? dark
                          ? "text-white bg-white/10"
                          : "text-primary bg-primary/5"
                        : dark
                          ? "text-white/60 hover:text-white hover:bg-white/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <item.icon size={15} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {badges?.[item.key] ? (
                      <span className={cn(
                        "text-[0.6rem] px-1.5 py-0.5 rounded-full font-medium",
                        dark ? "bg-white/10 text-white/60" : "bg-muted text-muted-foreground"
                      )}>
                        {badges[item.key]}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside className={cn(
      "w-56 shrink-0 border-r flex flex-col py-4",
      dark ? "border-white/10 bg-[hsl(220,18%,7%)]" : "border-border bg-card"
    )}>
      {groups.map((group) => (
        <div key={group.label} className="mb-2">
          <p className={cn(
            "px-5 py-1.5 text-[0.6rem] uppercase tracking-widest font-semibold",
            dark ? "text-white/30" : "text-muted-foreground"
          )}>
            {group.label}
          </p>
          {group.items.map((item) => (
            <button
              key={item.key}
              onClick={() => onNav(item.key)}
              className={cn(
                "w-full flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors",
                active === item.key
                  ? dark
                    ? "text-white bg-white/10 border-l-2 border-primary"
                    : "text-primary bg-primary/5 border-l-2 border-primary"
                  : dark
                    ? "text-white/50 hover:text-white hover:bg-white/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon size={15} />
              <span className="flex-1 text-left">{item.label}</span>
              {badges?.[item.key] ? (
                <span className={cn(
                  "text-[0.6rem] px-1.5 py-0.5 rounded-full font-medium",
                  dark ? "bg-white/10 text-white/60" : "bg-muted text-muted-foreground"
                )}>
                  {badges[item.key]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
