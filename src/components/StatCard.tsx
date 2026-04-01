import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
}

const StatCard = ({ icon: Icon, value, label }: StatCardProps) => (
  <div className="p-6 flex flex-col items-center gap-2 text-center">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="h-4 w-4 text-white/60" />
      <span className="text-[0.6rem] uppercase tracking-[0.15em] font-semibold text-white/60">{label}</span>
    </div>
    <span className="text-[2.5rem] font-bold tracking-[-0.02em] leading-none text-white">{value}</span>
  </div>
);

export default StatCard;
