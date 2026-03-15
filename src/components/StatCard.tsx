import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
}

const StatCard = ({ icon: Icon, value, label, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex flex-col items-center gap-2 text-center"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
      <Icon className="h-6 w-6 text-gold" />
    </div>
    <span className="font-heading text-3xl font-bold text-foreground">{value}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </motion.div>
);

export default StatCard;
