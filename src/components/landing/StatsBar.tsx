import { motion } from "framer-motion";

const STATS = [
  { label: "Valuations", value: "12,400+" },
  { label: "Accuracy", value: "96%" },
  { label: "Time", value: "2 min" },
];

const StatsBar = () => (
  <section className="py-6 md:py-12">
    <div className="max-w-[1200px] mx-auto px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-card border border-border p-5 md:p-8"
      >
        <div className="flex items-center justify-around">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {i > 0 && (
                <div className="w-px h-10 bg-border mr-6 md:mr-10 lg:mr-16" />
              )}
              <div className="text-center">
                <p className="text-[0.65rem] md:text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-xl md:text-3xl lg:text-4xl font-light text-foreground tracking-tight">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default StatsBar;
