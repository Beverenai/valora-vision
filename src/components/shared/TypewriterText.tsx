import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  phrases: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export function TypewriterText({
  phrases,
  className,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseTime = 2000,
}: TypewriterTextProps) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting && text === currentPhrase) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      const speed = isDeleting ? deletingSpeed : typingSpeed;
      timeoutRef.current = setTimeout(() => {
        setText(
          isDeleting
            ? currentPhrase.substring(0, text.length - 1)
            : currentPhrase.substring(0, text.length + 1)
        );
      }, speed);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, phraseIndex, isDeleting, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={cn(className)}>
      {text}
      <span className="inline-block w-[2px] h-[1em] bg-current ml-0.5 animate-pulse align-middle" />
    </span>
  );
}
