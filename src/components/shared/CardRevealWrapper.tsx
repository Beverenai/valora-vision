import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import ConfettiAnimation from "@/components/shared/ConfettiAnimation";
import { ChevronDown, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardRevealWrapperProps {
  children: React.ReactNode;
  accentType: "sell" | "rent";
  cardElement: React.ReactNode;
  loading?: boolean;
}

/* ── Sparkle Particle ── */
const SparkleParticle: React.FC<{ index: number; accentType: "sell" | "rent" }> = ({ index, accentType }) => {
  const angle = (index / 20) * Math.PI * 2 + Math.random() * 0.5;
  const distance = 80 + Math.random() * 180;
  const tx = Math.cos(angle) * distance;
  const ty = Math.sin(angle) * distance - 60;
  const size = 4 + Math.random() * 8;
  const colors = accentType === "sell"
    ? ["hsl(var(--primary))", "hsl(36 90% 55%)", "hsl(40 95% 65%)", "hsl(21 62% 63%)"]
    : ["hsl(var(--rent))", "hsl(152 55% 52%)", "hsl(40 95% 65%)", "hsl(152 40% 70%)"];
  const color = colors[index % colors.length];

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: "50%",
        top: "50%",
        boxShadow: `0 0 ${size}px ${color}`,
      }}
      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
      animate={{ scale: [0, 1.5, 0], x: tx, y: ty, opacity: [1, 1, 0] }}
      transition={{ duration: 0.8, delay: Math.random() * 0.2, ease: "easeOut" }}
    />
  );
};

/* ── Pop Bubble Particle ── */
const PopBubble: React.FC<{ index: number; accentType: "sell" | "rent" }> = ({ index, accentType }) => {
  const x = -120 + Math.random() * 240;
  const y = -80 + Math.random() * 160;
  const size = 8 + Math.random() * 18;
  const accentRgb = accentType === "sell" ? "212, 113, 59" : "60, 179, 113";

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "20%",
        border: `1.5px solid rgba(${accentRgb}, 0.4)`,
        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), rgba(${accentRgb}, 0.08))`,
      }}
      initial={{ scale: 0.3, x, y, opacity: 0.9 }}
      animate={{ scale: [0.3, 1.8, 2.5], opacity: [0.9, 0.5, 0] }}
      transition={{ duration: 0.5 + Math.random() * 0.3, delay: Math.random() * 0.3, ease: "easeOut" }}
    />
  );
};

/* ── Light Burst ── */
const LightBurst: React.FC<{ accentType: "sell" | "rent" }> = ({ accentType }) => {
  const color = accentType === "sell" ? "212, 113, 59" : "60, 179, 113";
  return (
    <motion.div
      className="absolute inset-0 z-10 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0] }}
      transition={{ duration: 0.8 }}
      style={{
        background: `radial-gradient(circle at 50% 50%, rgba(${color}, 0.4) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)`,
      }}
    />
  );
};

/* ── Bubble Texture Overlay ── */
const BubbleTexture: React.FC<{ accentRgba: (a: number) => string }> = ({ accentRgba }) => {
  // Generate deterministic bubble positions
  const bubbles = React.useMemo(() => {
    const result: Array<{ x: number; y: number; size: number; bright: boolean }> = [];
    for (let i = 0; i < 35; i++) {
      // Use deterministic pseudo-random based on index
      const seed = (i * 7 + 13) % 100;
      result.push({
        x: (seed * 3.7) % 100,
        y: (seed * 5.3 + i * 2.8) % 100,
        size: 6 + (seed % 10),
        bright: i % 5 === 0,
      });
    }
    return result;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,${b.bright ? 0.5 : 0.25}), ${accentRgba(0.04)})`,
            border: `1px solid ${accentRgba(b.bright ? 0.18 : 0.08)}`,
            boxShadow: b.bright
              ? `inset 0 -1px 2px ${accentRgba(0.06)}, 0 0 4px rgba(255,255,255,0.1)`
              : `inset 0 -1px 2px ${accentRgba(0.04)}`,
          }}
        />
      ))}
    </div>
  );
};

/* ── Sealed Wrapper ── */
const SealedWrapper: React.FC<{
  accentType: "sell" | "rent";
  dragProgress: number;
  onDragX: (x: number) => void;
  onTear: () => void;
}> = ({ accentType, dragProgress, onDragX, onTear }) => {
  const x = useMotionValue(0);
  const isSell = accentType === "sell";
  const tabColor = isSell ? "bg-primary" : "bg-[hsl(var(--rent))]";
  const embossedText = isSell ? "VALUED" : "ESTIMATED";

  const topHalfY = useTransform(() => -dragProgress * 25);
  const glowOpacity = useTransform(() => dragProgress * 2);

  // Accent colors
  const accentRgb = isSell ? "212, 113, 59" : "60, 179, 113";
  const accentRgba = (a: number) => `rgba(${accentRgb}, ${a})`;

  // Enhanced plastic wrap styles
  const plasticBg = `linear-gradient(135deg, ${accentRgba(0.05)} 0%, ${accentRgba(0.1)} 50%, ${accentRgba(0.05)} 100%)`;
  const plasticSheen = `linear-gradient(135deg, transparent 15%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.45) 48%, transparent 55%, rgba(255,255,255,0.15) 72%, transparent 85%)`;
  const plasticSheen2 = `linear-gradient(225deg, transparent 30%, rgba(255,255,255,0.12) 48%, rgba(255,255,255,0.3) 52%, transparent 65%)`;
  const crinkleTexture = `repeating-linear-gradient(62deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8.5px, transparent 9px), repeating-linear-gradient(-25deg, transparent, transparent 12px, ${accentRgba(0.03)} 12.5px, transparent 13px)`;

  return (
    <div
      className="relative w-[340px] h-[510px] sm:w-[380px] sm:h-[570px] mx-auto"
      style={{ perspective: "800px" }}
    >
      {/* Ground shadow for 3D depth */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-8 rounded-full blur-xl"
        style={{ background: accentRgba(0.15) }}
      />

      {/* Top half */}
      <motion.div
        className="absolute inset-x-0 top-0 bottom-[80%] z-20 overflow-hidden rounded-t-3xl"
        style={{
          background: plasticBg,
          backdropFilter: "blur(3px)",
          borderTop: `1.5px solid ${accentRgba(0.2)}`,
          borderLeft: `1.5px solid ${accentRgba(0.15)}`,
          borderRight: `1.5px solid ${accentRgba(0.15)}`,
          y: topHalfY,
        }}
      >
        {/* Sheen overlays */}
        <div className="absolute inset-0" style={{ backgroundImage: plasticSheen }} />
        <div className="absolute inset-0" style={{ backgroundImage: plasticSheen2 }} />
        <div className="absolute inset-0" style={{ backgroundImage: crinkleTexture }} />
        <BubbleTexture accentRgba={accentRgba} />
        <div className="h-full flex items-center justify-center">
          <span className="font-heading text-sm tracking-[0.3em] uppercase font-bold" style={{ color: accentRgba(0.4) }}>
            ValoraCasa
          </span>
        </div>
      </motion.div>

      {/* Main wrapper body with 3D tilt */}
      <motion.div
        className="absolute inset-0 rounded-3xl overflow-hidden"
        animate={{ rotateX: 3 + dragProgress * -3 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        style={{
          background: plasticBg,
          backdropFilter: "blur(3px)",
          border: `1.5px solid ${accentRgba(0.18)}`,
          boxShadow: `
            0 12px 40px ${accentRgba(0.12)},
            0 4px 16px ${accentRgba(0.08)},
            inset 0 0 60px ${accentRgba(0.04)},
            inset 0 1px 0 rgba(255,255,255,0.12)
          `,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Plastic sheen overlays */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: plasticSheen }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: plasticSheen2 }} />

        {/* Animated moving sheen */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 48%, rgba(255,255,255,0.35) 50%, transparent 55%)",
          }}
        />

        {/* Crinkle texture */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: crinkleTexture }} />

        {/* Bubble wrap texture */}
        <BubbleTexture accentRgba={accentRgba} />

        {/* Inner thickness edge */}
        <div
          className="absolute inset-[3px] rounded-[21px] pointer-events-none"
          style={{
            border: `1px solid ${accentRgba(0.06)}`,
            boxShadow: `inset 0 2px 8px ${accentRgba(0.04)}`,
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-between py-10 px-8 z-10">
          {/* Top brand */}
          <span className="font-heading text-base tracking-[0.3em] uppercase font-bold" style={{ color: accentRgba(0.35) }}>
            ValoraCasa
          </span>

          {/* Center: VALUED / ESTIMATED */}
          <div className="text-center">
            <h2
              className="font-heading text-5xl sm:text-6xl font-black tracking-[-2px] uppercase"
              style={{
                color: accentRgba(0.2),
                textShadow: `0 1px 2px ${accentRgba(0.08)}`,
              }}
            >
              {embossedText}
            </h2>
            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: accentRgba(0.2) }} />
              ))}
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-[0.6rem] tracking-[0.25em] uppercase font-semibold" style={{ color: accentRgba(0.35) }}>
            Property Valuation Report
          </p>
        </div>

        {/* Tear line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed"
          style={{ top: "20%", borderColor: accentRgba(0.3) }}
        />

        {/* Glow through tear */}
        <motion.div
          className="absolute left-0 right-0 h-6 pointer-events-none"
          style={{
            top: "calc(20% - 12px)",
            background: `radial-gradient(ellipse at center, ${accentRgba(0.4)} 0%, transparent 70%)`,
            opacity: glowOpacity,
          }}
        />
      </motion.div>

      {/* Pull tab */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -300, right: 0 }}
        dragElastic={0.1}
        onDrag={(_, info) => {
          const progress = Math.min(1, Math.abs(info.offset.x) / 200);
          onDragX(progress);
        }}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 100) {
            onTear();
          } else {
            onDragX(0);
          }
        }}
        style={{ x, top: "20%" }}
        className={cn(
          "absolute -right-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-r-xl cursor-grab active:cursor-grabbing shadow-lg",
          tabColor,
          "translate-y-[-50%]"
        )}
        whileHover={{ scale: 1.08 }}
      >
        <Scissors size={14} className="text-white/90" />
        <motion.div
          animate={{ x: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        >
          <ChevronDown size={14} className="text-white/90 -rotate-90" />
        </motion.div>
      </motion.div>

      {/* Slide instruction */}
      <motion.p
        className="absolute -bottom-12 left-0 right-0 text-center text-xs text-muted-foreground"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
      >
        ← Slide to open →
      </motion.p>
    </div>
  );
};

/* ── Holo Shine Overlay ── */
const HoloShine: React.FC<{ tiltX: number; tiltY: number }> = ({ tiltX, tiltY }) => {
  const angle = 135 + tiltY * 2 + tiltX;
  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none rounded-[24px] md:rounded-[32px]"
      style={{
        background: `linear-gradient(${angle}deg, transparent 0%, rgba(255,255,255,0.08) 25%, rgba(212,113,59,0.1) 35%, rgba(255,215,0,0.08) 45%, transparent 60%)`,
        mixBlendMode: "overlay",
      }}
    />
  );
};

/* ── Main Component ── */
const CardRevealWrapper: React.FC<CardRevealWrapperProps> = ({
  children,
  accentType,
  cardElement,
  loading = false,
}) => {
  const [phase, setPhase] = useState<"sealed" | "tearing" | "revealed">("sealed");
  const [dragProgress, setDragProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Gyroscope for mobile
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
      setPhase("revealed");
      setShowConfetti(true);
    }, 700);
  }, []);

  if (loading) return null;

  const accentRgb = accentType === "sell" ? "212, 113, 59" : "60, 179, 113";

  return (
    <div className="relative">
      {showConfetti && <ConfettiAnimation />}

      <AnimatePresence mode="wait">
        {phase === "sealed" && (
          <motion.div
            key="sealed"
            className="min-h-screen flex flex-col items-center justify-center px-4 pb-20"
            style={{
              background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)",
            }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <motion.p
              className="font-heading italic text-muted-foreground text-sm mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your valuation is ready
            </motion.p>

            {/* Floating idle animation */}
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
            {/* Top half flies up with 3D crumple */}
            <motion.div
              className="absolute w-[340px] sm:w-[380px] h-[100px] rounded-t-3xl z-20 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(${accentRgb}, 0.06) 0%, rgba(${accentRgb}, 0.1) 50%, rgba(${accentRgb}, 0.04) 100%)`,
                backdropFilter: "blur(3px)",
                top: "calc(50% - 180px)",
                transformStyle: "preserve-3d",
              }}
              initial={{ y: 0, opacity: 1, rotateX: 0, rotateZ: 0 }}
              animate={{ y: -280, opacity: 0, rotateX: -35, rotateZ: -8, scaleX: 0.85 }}
              transition={{ duration: 0.6, ease: "easeIn" }}
            />

            {/* Bottom half flies down with 3D crumple */}
            <motion.div
              className="absolute w-[340px] sm:w-[380px] h-[350px] rounded-b-3xl z-20 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(${accentRgb}, 0.08) 0%, rgba(${accentRgb}, 0.04) 50%, rgba(${accentRgb}, 0.06) 100%)`,
                backdropFilter: "blur(3px)",
                top: "calc(50% - 80px)",
                transformStyle: "preserve-3d",
              }}
              initial={{ y: 0, opacity: 1, rotateX: 0, rotateZ: 0 }}
              animate={{ y: 280, opacity: 0, rotateX: 30, rotateZ: 6, scaleX: 0.85 }}
              transition={{ duration: 0.6, ease: "easeIn" }}
            />

            {/* Light burst */}
            <LightBurst accentType={accentType} />

            {/* Pop bubbles */}
            {Array.from({ length: 15 }).map((_, i) => (
              <PopBubble key={`pop-${i}`} index={i} accentType={accentType} />
            ))}

            {/* Sparkles (increased) */}
            {Array.from({ length: 20 }).map((_, i) => (
              <SparkleParticle key={i} index={i} accentType={accentType} />
            ))}
          </motion.div>
        )}

        {phase === "revealed" && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Card reveal section */}
            <div
              className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12"
              style={{
                background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 50%, hsl(var(--background)) 100%)",
              }}
            >
              <motion.div
                ref={cardContainerRef}
                className="relative w-full max-w-[380px] md:max-w-[520px]"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  perspective: 1000,
                }}
              >
                {/* 3D tilt container */}
                <motion.div
                  animate={{ rotateX: cardTilt.x, rotateY: cardTilt.y }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                >
                  {/* Shine sweep on entrance */}
                  <motion.div
                    className="absolute inset-0 z-30 pointer-events-none rounded-[24px] md:rounded-[32px] overflow-hidden"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
                      }}
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
                    />
                  </motion.div>

                  <HoloShine tiltX={cardTilt.x} tiltY={cardTilt.y} />
                  {cardElement}
                </motion.div>
              </motion.div>

              {/* Scroll indicator */}
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
                  <ChevronDown size={20} className="text-muted-foreground" />
                </motion.div>
                <p className="text-xs text-muted-foreground">Scroll down for your full report</p>
              </motion.div>
            </div>

            {/* Report content below */}
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
