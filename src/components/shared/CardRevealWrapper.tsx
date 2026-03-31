import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import ConfettiAnimation from "@/components/shared/ConfettiAnimation";
import { ChevronLeft, ChevronUp, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardRevealWrapperProps {
  children: React.ReactNode;
  accentType: "sell" | "rent";
  cardElement: React.ReactNode;
  loading?: boolean;
}

const foilShineStyle = `
@keyframes foil-shine {
  0% { transform: translateX(-150%) rotate(25deg); }
  100% { transform: translateX(250%) rotate(25deg); }
}
`;

const SparkleParticle: React.FC<{ index: number; accentType: "sell" | "rent" }> = ({ index, accentType }) => {
  const angle = (index / 10) * Math.PI * 2 + (index * 0.3);
  const distance = 80 + (index * 17) % 160;
  const tx = Math.cos(angle) * distance;
  const ty = Math.sin(angle) * distance - 80;
  const size = 4 + (index * 3) % 8;
  const colors = accentType === "sell"
    ? ["#D4742B", "#E8A56E", "#FF8C00", "#C96A2C"]
    : ["#52B788", "#74C69D", "#40916C", "#95D5B2"];
  const color = colors[index % colors.length];

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size, height: size, backgroundColor: color,
        left: "50%", top: "35%",
        boxShadow: `0 0 ${size + 2}px ${color}`,
        willChange: "transform",
      }}
      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
      animate={{ scale: [0, 1.5, 0], x: tx, y: ty, opacity: [1, 1, 0] }}
      transition={{ duration: 0.7, delay: 0.2 + (index * 0.03), ease: "easeOut" }}
    />
  );
};

const PopBubble: React.FC<{ index: number; accentType: "sell" | "rent" }> = ({ index, accentType }) => {
  const x = -60 + (index * 27) % 120;
  const y = -100 + (index * 19) % 200;
  const size = 6 + (index * 5) % 14;
  const color = accentType === "sell" ? "212, 116, 43" : "82, 183, 136";

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size, height: size, left: "50%", top: "35%",
        border: `1.5px solid rgba(${color}, 0.5)`,
        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7), rgba(${color}, 0.15))`,
        willChange: "transform",
      }}
      initial={{ scale: 0.3, x, y, opacity: 0.9 }}
      animate={{ scale: [0.3, 2, 2.8], opacity: [0.9, 0.4, 0] }}
      transition={{ duration: 0.45 + (index * 0.04), delay: (index * 0.04), ease: "easeOut" }}
    />
  );
};

const LightBurst: React.FC<{ accentType: "sell" | "rent" }> = ({ accentType }) => {
  const color = accentType === "sell" ? "212, 116, 43" : "82, 183, 136";
  return (
    <motion.div
      className="absolute inset-0 z-10 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.9, 0] }}
      transition={{ duration: 0.7, delay: 0.1 }}
      style={{
        background: `radial-gradient(ellipse at 50% 35%, rgba(${color}, 0.5) 0%, rgba(255,255,255,0.3) 30%, transparent 60%)`,
        willChange: "opacity",
      }}
    />
  );
};

const SealedWrapper: React.FC<{
  accentType: "sell" | "rent";
  dragProgress: number;
  onDragX: (x: number) => void;
  onTear: () => void;
  onTap: () => void;
  showTapHint: boolean;
}> = ({ accentType, dragProgress, onDragX, onTear, onTap, showTapHint }) => {
  const x = useMotionValue(0);
  const isSell = accentType === "sell";

  const foilGradient = isSell
    ? "linear-gradient(135deg, #8B4513 0%, hsl(21 62% 53%) 25%, #C96A2C 40%, #E8A56E 55%, #B85E1E 70%, hsl(21 62% 53%) 100%)"
    : "linear-gradient(135deg, #2D6A4F 0%, #52B788 25%, #40916C 40%, #74C69D 55%, #2D6A4F 70%, #52B788 100%)";

  const embossedText = isSell ? "VALUED" : "ESTIMATED";
  const tabColor = isSell ? "bg-primary" : "bg-[#52B788]";

  const diamondPattern = `
    repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px),
    repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px)
  `;

  const topStripY = useTransform(() => dragProgress * -15);
  const glowOpacity = useTransform(() => Math.min(1, dragProgress * 2.5));

  return (
    <div
      className="relative w-[320px] h-[480px] sm:w-[360px] sm:h-[540px] mx-auto cursor-pointer outline-none"
      style={{ perspective: "800px" }}
      tabIndex={0}
      role="button"
      aria-label="Open valuation"
      onClick={onTap}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(); } }}
    >
      <div
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[80%] h-6 rounded-full blur-xl"
        style={{ background: isSell ? "rgba(212,116,43,0.2)" : "rgba(82,183,136,0.2)" }}
      />

      {/* Top strip (tears away upward) — 35% height */}
      <motion.div
        className="absolute inset-x-0 top-0 z-20 overflow-hidden rounded-t-2xl"
        style={{
          height: "35%",
          background: foilGradient,
          y: topStripY,
          borderBottom: "2px dashed rgba(255,255,255,0.25)",
        }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: diamondPattern }} />
        <div className="h-full flex items-center justify-center">
          <span className="text-sm tracking-[0.3em] uppercase font-bold text-white/25">
            ValoraCasa
          </span>
        </div>
      </motion.div>

      {/* Main foil body */}
      <motion.div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        animate={{ rotateX: -3 + dragProgress * 2 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        style={{
          background: foilGradient,
          boxShadow: `
            0 10px 40px rgba(0,0,0,0.25),
            0 4px 12px rgba(0,0,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.2),
            inset 0 -1px 0 rgba(0,0,0,0.1)
          `,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: diamondPattern }} />

        <div className="absolute inset-0 pointer-events-none" style={{ overflow: "hidden" }}>
          <div
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 48%, rgba(255,255,255,0.4) 50%, transparent 55%)",
              animation: "foil-shine 4s ease-in-out infinite",
              animationDelay: "1s",
              willChange: "transform",
            }}
          />
        </div>

        <div
          className="absolute inset-[2px] rounded-[14px] pointer-events-none"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
          }}
        />

        {/* Content below the cut line */}
        <div className="relative h-full flex flex-col items-center justify-end pb-10 px-8 z-10" style={{ paddingTop: "40%" }}>
          <div className="text-center flex-1 flex flex-col items-center justify-center">
            <h2
              className="font-heading text-5xl sm:text-6xl font-black tracking-[-2px] uppercase text-white/15"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
            >
              {embossedText}
            </h2>
            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-white/15" />
              ))}
            </div>
          </div>

          <p className="text-[0.6rem] tracking-[0.25em] uppercase font-semibold text-white/25">
            Property Valuation Report
          </p>
        </div>

        {/* Horizontal tear line at 35% */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-white/20"
          style={{ top: "35%" }}
        />

        {/* Glow through tear line */}
        <motion.div
          className="absolute left-0 right-0 h-6 pointer-events-none"
          style={{
            top: "calc(35% - 12px)",
            background: `radial-gradient(ellipse at center, ${isSell ? "rgba(255,140,0,0.5)" : "rgba(82,183,136,0.5)"} 0%, transparent 70%)`,
            opacity: glowOpacity,
          }}
        />
      </motion.div>

      {/* Pull tab — RIGHT EDGE at 35%, drag LEFT across card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -280, right: 0 }}
        dragElastic={0.05}
        onDrag={(_, info) => {
          const progress = Math.min(1, Math.max(0, Math.abs(info.offset.x)) / 200);
          onDragX(progress);
        }}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 100) {
            onTear();
          } else {
            onDragX(0);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        style={{ x, right: "0px", top: "35%" }}
        className={cn(
          "absolute z-30 flex items-center gap-1.5 px-3 py-2 rounded-l-xl cursor-grab active:cursor-grabbing shadow-lg -translate-y-1/2",
          tabColor,
        )}
        whileHover={{ scale: 1.08 }}
      >
        <motion.div
          animate={{ x: [3, -3, 3] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        >
          <ChevronLeft size={14} className="text-white/90" />
        </motion.div>
        <Scissors size={14} className="text-white/90" />
      </motion.div>

      {/* Instruction */}
      <motion.p
        className="absolute -bottom-10 left-0 right-0 text-center text-xs text-muted-foreground"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
      >
        {showTapHint ? "Tap or slide to reveal" : "← Slide to open"}
      </motion.p>
    </div>
  );
};

const HoloShine: React.FC<{ tiltX: number; tiltY: number }> = ({ tiltX, tiltY }) => {
  const angle = 135 + tiltY * 3 + tiltX * 2;
  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none rounded-[inherit] overflow-hidden"
      style={{
        background: `
          linear-gradient(${angle}deg,
            transparent 0%,
            rgba(255,100,100,0.12) 15%,
            rgba(255,200,50,0.15) 25%,
            rgba(100,255,100,0.12) 35%,
            rgba(50,200,255,0.15) 45%,
            rgba(200,100,255,0.12) 55%,
            transparent 65%
          )
        `,
        mixBlendMode: "overlay",
        opacity: 0.7 + Math.abs(tiltX + tiltY) * 0.02,
      }}
    />
  );
};

const CardRevealWrapper: React.FC<CardRevealWrapperProps> = ({
  children,
  accentType,
  cardElement,
  loading = false,
}) => {
  const [phase, setPhase] = useState<"sealed" | "tearing" | "sliding" | "revealed">("sealed");
  const [dragProgress, setDragProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);

  useEffect(() => {
    if (phase !== "sealed") return;
    const timer = setTimeout(() => setShowTapHint(true), 3000);
    return () => clearTimeout(timer);
  }, [phase]);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const isSell = accentType === "sell";
  const accentRgb = isSell ? "212, 116, 43" : "82, 183, 136";
  const foilGradient = isSell
    ? "linear-gradient(135deg, #8B4513 0%, #D4742B 25%, #C96A2C 40%, #E8A56E 55%, #B85E1E 70%, #D4742B 100%)"
    : "linear-gradient(135deg, #2D6A4F 0%, #52B788 25%, #40916C 40%, #74C69D 55%, #2D6A4F 70%, #52B788 100%)";

  useEffect(() => {
    if (phase !== "revealed") return;
    const handler = (e: DeviceOrientationEvent) => {
      if (e.gamma != null && e.beta != null) {
        setCardTilt({
          x: Math.max(-15, Math.min(15, e.beta - 40)),
          y: Math.max(-15, Math.min(15, e.gamma)),
        });
      }
    };
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [phase]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (phase !== "revealed" || !cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setCardTilt({ x: y, y: x });
  }, [phase]);

  const handleMouseLeave = useCallback(() => {
    setCardTilt({ x: 0, y: 0 });
  }, []);

  const triggerReveal = useCallback(() => {
    setPhase("tearing");
    setTimeout(() => {
      setPhase("sliding");
      setTimeout(() => {
        setPhase("revealed");
        setShowConfetti(true);
      }, 800);
    }, 600);
  }, []);

  if (loading) return null;

  return (
    <div className="relative">
      <style>{foilShineStyle}</style>

      {showConfetti && <ConfettiAnimation />}

      <AnimatePresence mode="wait">
        {phase === "sealed" && (
          <motion.div
            key="sealed"
            className="min-h-screen flex flex-col items-center justify-center px-4 pb-20"
            style={{
              background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)",
            }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <motion.p
              className="font-heading italic text-muted-foreground text-sm mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your valuation is ready
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
              transition={{
                opacity: { duration: 0.6 },
                scale: { duration: 0.6 },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
              }}
            >
              <SealedWrapper
                accentType={accentType}
                dragProgress={dragProgress}
                onDragX={setDragProgress}
                onTear={triggerReveal}
                onTap={triggerReveal}
                showTapHint={showTapHint}
              />
            </motion.div>
          </motion.div>
        )}

        {phase === "tearing" && (
          <motion.div
            key="tearing"
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)",
              perspective: "800px",
            }}
          >
            {/* Top strip flies UPWARD */}
            <motion.div
              className="absolute rounded-t-2xl z-20 overflow-hidden"
              style={{
                width: "320px",
                height: "168px",
                background: foilGradient,
                left: "calc(50% - 160px)",
                top: "calc(50% - 240px)",
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
              initial={{ y: 0, opacity: 1, rotateX: 0 }}
              animate={{ y: -300, opacity: 0, rotateX: 25, scaleX: 0.9 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
            />

            {/* Bottom section stays briefly */}
            <motion.div
              className="absolute rounded-b-2xl z-10 overflow-hidden"
              style={{
                width: "320px",
                height: "312px",
                background: foilGradient,
                left: "calc(50% - 160px)",
                top: "calc(50% - 72px)",
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
            />

            <LightBurst accentType={accentType} />

            {Array.from({ length: 8 }).map((_, i) => (
              <PopBubble key={`pop-${i}`} index={i} accentType={accentType} />
            ))}

            {Array.from({ length: 10 }).map((_, i) => (
              <SparkleParticle key={`spark-${i}`} index={i} accentType={accentType} />
            ))}
          </motion.div>
        )}

        {phase === "sliding" && (
          <motion.div
            key="sliding"
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)",
              perspective: "1000px",
            }}
          >
            {/* Bottom section drops downward */}
            <motion.div
              className="absolute rounded-b-2xl z-5 overflow-hidden"
              style={{
                width: "320px",
                height: "312px",
                background: foilGradient,
                left: "calc(50% - 160px)",
                top: "calc(50% - 72px)",
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
              initial={{ y: 0, opacity: 1, rotateX: 0 }}
              animate={{ y: 300, opacity: 0, rotateX: -15, scaleX: 0.85 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeIn" }}
            />

            {/* Card slides UP out of wrapper */}
            <motion.div
              className="relative z-10 w-full max-w-[380px] md:max-w-[520px]"
              style={{ willChange: "transform" }}
              initial={{ y: 200, opacity: 0, rotateZ: 2 }}
              animate={{ y: 0, opacity: 1, rotateZ: 0 }}
              transition={{
                type: "spring",
                damping: 18,
                stiffness: 180,
                delay: 0.05,
              }}
            >
              <motion.div
                className="absolute inset-0 z-30 pointer-events-none rounded-[24px] md:rounded-[32px] overflow-hidden"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
                    willChange: "transform",
                  }}
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 0.7, delay: 0.4, ease: "easeInOut" }}
                />
              </motion.div>
              {cardElement}
            </motion.div>
          </motion.div>
        )}

        {phase === "revealed" && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12"
              style={{
                background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 50%, hsl(var(--background)) 100%)",
              }}
            >
              <motion.div
                ref={cardContainerRef}
                className="relative w-full max-w-[380px] md:max-w-[520px]"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ perspective: 1000 }}
              >
                <motion.div
                  animate={{ rotateX: cardTilt.x, rotateY: cardTilt.y }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                >
                  <HoloShine tiltX={cardTilt.x} tiltY={cardTilt.y} />
                  {cardElement}
                </motion.div>

                <div
                  className="absolute -bottom-4 left-[10%] right-[10%] h-8 rounded-full blur-2xl"
                  style={{
                    background: `rgba(${accentRgb}, 0.2)`,
                    transform: `translateX(${cardTilt.y * 0.5}px)`,
                  }}
                />
              </motion.div>

              <motion.div
                className="mt-10 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ChevronUp size={20} className="text-muted-foreground rotate-180" />
                </motion.div>
                <p className="text-xs text-muted-foreground">Scroll down for your full report</p>
              </motion.div>
            </div>

            <div ref={reportRef}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardRevealWrapper;
