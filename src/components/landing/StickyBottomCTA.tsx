import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface StickyBottomCTAProps {
  visible: boolean;
}

const StickyBottomCTA = ({ visible }: StickyBottomCTAProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t border-border rounded-t-2xl shadow-lg"
        >
          <div className="px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Free property valuation</p>
                <p className="text-sm font-semibold text-foreground truncate">Get your estimate now</p>
              </div>
              <button
                onClick={() => navigate("/sell/valuation")}
                className="shrink-0 rounded-2xl py-3 px-5 bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-transform"
              >
                Start
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyBottomCTA;
