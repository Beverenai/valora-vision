import { Moon, Sun, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  dark: boolean;
  onToggleDark: () => void;
}

export function AdminHeader({ dark, onToggleDark }: AdminHeaderProps) {
  return (
    <header className={cn(
      "flex items-center justify-between px-6 py-3 border-b shrink-0",
      dark ? "border-white/10 bg-[hsl(220,18%,9%)]" : "border-border bg-card"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          dark ? "bg-primary/20" : "bg-primary/10"
        )}>
          <Shield size={16} className="text-primary" />
        </div>
        <div>
          <h1 className={cn(
            "font-serif text-lg font-semibold leading-none",
            dark ? "text-white" : "text-foreground"
          )}>
            ValoraCasa Admin
          </h1>
          <p className={cn(
            "text-[0.6rem] uppercase tracking-widest mt-0.5",
            dark ? "text-white/40" : "text-muted-foreground"
          )}>
            Control Panel
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleDark}
        className={cn(
          "h-8 w-8 rounded-lg",
          dark ? "text-white/60 hover:text-white hover:bg-white/10" : ""
        )}
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
      </Button>
    </header>
  );
}
