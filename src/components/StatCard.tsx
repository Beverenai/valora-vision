import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
}

const StatCard = ({ icon: Icon, value, label }: StatCardProps) => (
  <div className="bg-card p-6 flex flex-col items-center gap-2 text-center">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="h-4 w-4 text-gold" />
      <span className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-muted-foreground">{label}</span>
    </div>
    <span className="text-[2.5rem] font-light tracking-[-0.02em] leading-none text-foreground">{value}</span>
  </div>
);

export default StatCard;