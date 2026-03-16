import { motion } from "framer-motion";

const DiscoverySection = () => (
  <section className="py-6 md:py-12">
    <div className="max-w-[1200px] mx-auto px-4 md:px-8">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Image card with overlay chips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden aspect-[4/3] md:w-1/2"
        >
          <img
            src="https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80"
            alt="Artisan Mediterranean interior"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2 mb-3">
              <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
                AI Valuation
              </span>
              <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
                Market Report
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed max-w-xs">
              Where accurate data meets local expertise — discover what your property is truly worth.
            </p>
          </div>
        </motion.div>

        {/* Editorial text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl bg-secondary p-6 md:p-8 flex flex-col justify-center md:w-1/2"
        >
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Explore detailed valuation reports designed for clarity, not complexity. 
            Get comparable sales, rental projections, and matched agents — all in one beautifully simple report.
          </p>
          <div className="h-px bg-border my-5" />
          <div className="space-y-3">
            {["Estimated Market Value", "Rental Income Potential", "Comparable Properties", "Agent Recommendations"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default DiscoverySection;
