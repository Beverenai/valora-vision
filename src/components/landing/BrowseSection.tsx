import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PROPERTIES = [
  {
    id: "1",
    title: "Beachfront Penthouse",
    desc: "Panoramic sea views from every room in the heart of Marbella.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    badges: ["3 Bed", "Beachfront"],
    city: "Marbella",
  },
  {
    id: "2",
    title: "Hillside Villa",
    desc: "Modern architecture with infinity pool overlooking the coast.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    badges: ["5 Bed", "Pool"],
    city: "Estepona",
  },
  {
    id: "3",
    title: "Garden Apartment",
    desc: "Charming ground-floor unit with private garden terrace.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    badges: ["2 Bed", "Garden"],
    city: "Fuengirola",
  },
];

const BrowseSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-6 md:py-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-['DM_Serif_Display'] text-xl md:text-2xl text-foreground">
            Recent Valuations
          </h2>
          <button
            onClick={() => navigate("/sell")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            See all <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {PROPERTIES.map((prop, i) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              onClick={() =>
                navigate("/sell/valuation", {
                  state: {
                    addressData: {
                      streetAddress: "",
                      urbanization: "",
                      city: prop.city,
                      province: "Málaga",
                      country: "Spain",
                      complex: "",
                    },
                  },
                })
              }
              className="min-w-[280px] md:min-w-0 snap-start rounded-2xl bg-card overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-base">{prop.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {prop.desc}
                </p>
                {prop.badges.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {prop.badges.map((b) => (
                      <span
                        key={b}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrowseSection;
