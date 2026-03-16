import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  { quote: "We sold our villa in Marbella for 12% above the initial asking price thanks to the accurate valuation.", name: "James & Sarah T.", location: "Marbella" },
  { quote: "The rental estimate was spot-on. We now earn €3,200/month from our apartment in Estepona.", name: "Carlos M.", location: "Estepona" },
  { quote: "Fast, free, and surprisingly accurate. Best property tool I've found for Spain.", name: "Anna K.", location: "Fuengirola" },
  { quote: "Used it to compare agents' prices. The valuation was within 3% of the final sale price.", name: "Robert D.", location: "Benalmádena" },
];

const TestimonialsSection = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-6 md:py-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-['DM_Serif_Display'] text-2xl md:text-4xl text-foreground mb-8">
            What property owners say
          </h2>
          <div className="relative min-h-[160px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-base md:text-lg text-muted-foreground italic max-w-lg leading-relaxed">
                  "{TESTIMONIALS[idx].quote}"
                </p>
                <p className="text-xs text-muted-foreground/50 mt-3">
                  — {TESTIMONIALS[idx].name}, {TESTIMONIALS[idx].location}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === idx ? "bg-primary w-5" : "bg-border w-1.5 hover:bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
