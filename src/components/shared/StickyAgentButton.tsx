import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";

export function StickyAgentButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const scrollToAgents = () => {
    const el = document.getElementById("matched-agents");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      onClick={scrollToAgents}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-xl hover:bg-primary/90 transition-all duration-200 animate-fade-in"
    >
      <Users className="h-5 w-5" />
      <span className="hidden sm:inline font-medium text-sm">Find your agent</span>
    </button>
  );
}
