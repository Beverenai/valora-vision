import React, { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
  shape: "rectangle" | "circle" | "strip" | "star" | "heart";
  hasShimmer: boolean;
  animationType: "fall" | "fall-left" | "fall-right";
}

const COLORS = [
  "#FFD700", "#FF6B6B", "#4ECDC4", "#95E1D3", "#AA96DA", "#FCBAD3",
  "#F38181", "#45B7D1", "#FF9F43", "#26de81", "#a55eea", "#fd79a8",
];

const playCelebrationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playChime = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startTime + duration);
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };
    playChime(523.25, 0, 0.4);
    playChime(659.25, 0, 0.4);
    playChime(783.99, 0, 0.4);
    playChime(1046.50, 0.1, 0.5);
    playChime(1318.51, 0.2, 0.6);
    playChime(1567.98, 0.3, 0.7);
    playChime(2093, 0.5, 0.3);
    playChime(2349, 0.6, 0.3);
    playChime(2637, 0.7, 0.4);
  } catch (error) {
    console.log("Audio not supported:", error);
  }
};

const ConfettiAnimation: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    playCelebrationSound();
    const numPieces = window.innerWidth < 768 ? 100 : 150;
    const generatedPieces: ConfettiPiece[] = [];
    const shapes: ConfettiPiece["shape"][] = ["rectangle", "circle", "strip", "star", "heart"];

    for (let i = 0; i < numPieces; i++) {
      let delay: number;
      const wave = Math.random();
      if (wave < 0.4) delay = Math.random() * 0.3;
      else if (wave < 0.7) delay = 0.5 + Math.random() * 0.3;
      else delay = 1 + Math.random() * 0.5;

      let animationType: ConfettiPiece["animationType"] = "fall";
      let left = Math.random() * 100;
      const cannonChance = Math.random();
      if (cannonChance < 0.15) { animationType = "fall-left"; left = -5 + Math.random() * 10; }
      else if (cannonChance < 0.3) { animationType = "fall-right"; left = 95 + Math.random() * 10; }

      generatedPieces.push({
        id: i, left, delay,
        duration: 3 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 10 + Math.random() * 15,
        rotation: Math.random() * 360,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        hasShimmer: Math.random() < 0.3,
        animationType,
      });
    }
    setPieces(generatedPieces);
    const timer = setTimeout(() => setIsVisible(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const getAnimationClass = (type: string) => {
    switch (type) {
      case "fall-left": return "animate-confetti-fall-left";
      case "fall-right": return "animate-confetti-fall-right";
      default: return "animate-confetti-fall";
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute ${getAnimationClass(piece.animationType)}`}
          style={{ left: `${piece.left}%`, top: "-30px", animationDelay: `${piece.delay}s`, animationDuration: `${piece.duration}s` }}
        >
          <div
            className={`animate-confetti-sway ${piece.hasShimmer ? "animate-confetti-shimmer" : ""}`}
            style={{ animationDuration: `${0.4 + Math.random() * 0.4}s` }}
          >
            {piece.shape === "rectangle" && (
              <div style={{ width: `${piece.size}px`, height: `${piece.size * 0.6}px`, backgroundColor: piece.color, transform: `rotate(${piece.rotation}deg)`, borderRadius: "2px", boxShadow: piece.hasShimmer ? `0 0 6px ${piece.color}` : "none" }} />
            )}
            {piece.shape === "circle" && (
              <div style={{ width: `${piece.size * 0.8}px`, height: `${piece.size * 0.8}px`, backgroundColor: piece.color, borderRadius: "50%", boxShadow: piece.hasShimmer ? `0 0 8px ${piece.color}` : "none" }} />
            )}
            {piece.shape === "strip" && (
              <div style={{ width: `${piece.size * 1.8}px`, height: `${piece.size * 0.25}px`, backgroundColor: piece.color, transform: `rotate(${piece.rotation}deg)`, borderRadius: "2px" }} />
            )}
            {piece.shape === "star" && (
              <svg width={piece.size} height={piece.size} viewBox="0 0 24 24" fill={piece.color} style={{ transform: `rotate(${piece.rotation}deg)`, filter: piece.hasShimmer ? `drop-shadow(0 0 4px ${piece.color})` : "none" }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
            {piece.shape === "heart" && (
              <svg width={piece.size} height={piece.size} viewBox="0 0 24 24" fill={piece.color} style={{ transform: `rotate(${piece.rotation}deg)`, filter: piece.hasShimmer ? `drop-shadow(0 0 4px ${piece.color})` : "none" }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConfettiAnimation;
