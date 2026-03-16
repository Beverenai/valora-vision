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
  const angle = (index / 10) * Math.PI * 2 + Math.random() * 0.5;
  const distance = 80 + Math.random() * 160;
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

  const topHalfY = useTransform(() => -dragProgress * 20);
  const glowOpacity = useTransform(() => dragProgress * 2);

  return (
    <div className="relative w-[340px] h-[510px] sm:w-[380px] sm:h-[570px] mx-auto">
      {/* Top half */}
      <motion.div
        className="absolute inset-x-0 top-0 bottom-[80%] z-20 overflow-hidden rounded-t-3xl"
        style={{
          background: "linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 25%, #A0A0A0 50%, #D4D4D4 75%, #B0B0B0 100%)",
          y: topHalfY,
        }}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, currentColor 20px, currentColor 21px)`,
          color: "#666",
        }} />
        <div className="h-full flex items-center justify-center">
          <span className="font-heading text-sm tracking-[0.3em] uppercase text-[#888] font-bold">
            ValoraCasa
          </span>
        </div>
      </motion.div>

      {/* Main wrapper body */}
      <motion.div
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 25%, #A0A0A0 50%, #D4D4D4 75%, #B0B0B0 100%)",
        }}
      >
        {/* VC pattern texture */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ctext x='10' y='35' font-size='14' font-family='serif' fill='%23666' opacity='0.6'%3EVC%3C/text%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }} />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-between py-10 px-8">
          {/* Top brand */}
          <span className="font-heading text-base tracking-[0.3em] uppercase font-bold" style={{ color: "rgba(180,180,180,0.8)" }}>
            ValoraCasa
          </span>

          {/* Center: Embossed VALUED */}
          <div className="text-center">
            <h2
              className="font-heading text-5xl sm:text-6xl font-black tracking-[-2px] uppercase"
              style={{
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(160,160,160,0.5)",
                textShadow: "2px 2px 4px rgba(255,255,255,0.3), -1px -1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {embossedText}
            </h2>
            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: "rgba(160,160,160,0.4)" }} />
              ))}
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-[0.6rem] tracking-[0.25em] uppercase font-semibold" style={{ color: "rgba(140,140,140,0.7)" }}>
            Property Valuation Report
          </p>
        </div>

        {/* Tear line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed"
          style={{ top: "20%", borderColor: "rgba(120,120,120,0.4)" }}
        />

        {/* Glow through tear */}
        <motion.div
          className="absolute left-0 right-0 h-4 pointer-events-none"
          style={{
            top: "calc(20% - 8px)",
            background: isSell
              ? "radial-gradient(ellipse at center, rgba(212,113,59,0.3) 0%, transparent 70%)"
              : "radial-gradient(ellipse at center, rgba(60,179,113,0.3) 0%, transparent 70%)",
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
        whileHover={{ scale: 1.05 }}
      >
        <Scissors size={14} className="text-white/90" />
        <motion.div
          animate={{ x: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown size={14} className="text-white/90 -rotate-90" />
        </motion.div>
      </motion.div>

      {/* Slide instruction */}
      <motion.p
        className="absolute -bottom-10 left-0 right-0 text-center text-xs text-muted-foreground"
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

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
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
            }}
          >
            {/* Top half flies up */}
            <motion.div
              className="absolute w-[340px] sm:w-[380px] h-[100px] rounded-t-3xl z-20"
              style={{
                background: "linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 25%, #A0A0A0 50%)",
                top: "calc(50% - 180px)",
              }}
              initial={{ y: 0, opacity: 1, rotateX: 0 }}
              animate={{ y: -250, opacity: 0, rotateX: -25 }}
              transition={{ duration: 0.6, ease: "easeIn" }}
            />

            {/* Bottom half flies down */}
            <motion.div
              className="absolute w-[340px] sm:w-[380px] h-[350px] rounded-b-3xl z-20"
              style={{
                background: "linear-gradient(135deg, #A0A0A0 50%, #D4D4D4 75%, #B0B0B0 100%)",
                top: "calc(50% - 80px)",
              }}
              initial={{ y: 0, opacity: 1, rotateX: 0 }}
              animate={{ y: 250, opacity: 0, rotateX: 25 }}
              transition={{ duration: 0.6, ease: "easeIn" }}
            />

            {/* Light burst */}
            <LightBurst accentType={accentType} />

            {/* Sparkles */}
            {Array.from({ length: 12 }).map((_, i) => (
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
