import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COMPANIES = [
  "Engel & Völkers",
  "Sotheby's Realty",
  "Knight Frank",
  "Lucas Fox",
  "Savills",
  "Coldwell Banker",
  "Christie's International",
  "Keller Williams",
];

const CompanyLogos = () => (
  <section className="max-w-[1400px] mx-auto mb-12">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-6"
    >
      <p className="text-xs uppercase tracking-[0.15em] font-semibold text-primary mb-2">
        Trusted by Professionals
      </p>
      <h2 className="font-sans text-xl md:text-2xl font-medium text-foreground">
        Used daily by leading real estate companies
      </h2>
    </motion.div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1px] bg-border border border-border rounded-xl overflow-hidden">
      {COMPANIES.map((name) => (
        <div
          key={name}
          className="bg-card p-6 flex items-center justify-center"
        >
          <span className="text-sm font-semibold text-muted-foreground tracking-wide">
            {name}
          </span>
        </div>
      ))}
    </div>
  </section>
);

export default CompanyLogos;
