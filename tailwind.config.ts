import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '400px',
      'tablet': '900px',
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "serif"],
        "ticket-cursive": ["'Italianno'", "cursive"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        navy: {
          DEFAULT: "hsl(var(--navy))",
          deep: "hsl(var(--navy-deep))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          dark: "hsl(var(--gold-dark))",
        },
        teal: {
          DEFAULT: "hsl(var(--teal))",
          light: "hsl(var(--teal-light))",
        },
        slate: "hsl(var(--slate))",
        "soft-blue": "hsl(var(--soft-blue))",
        amber: "hsl(var(--amber))",
        rose: "hsl(var(--rose))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        "confetti-fall-left": {
          "0%": { transform: "translateY(0) translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) translateX(200px) rotate(720deg)", opacity: "0" },
        },
        "confetti-fall-right": {
          "0%": { transform: "translateY(0) translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) translateX(-200px) rotate(720deg)", opacity: "0" },
        },
        "confetti-sway": {
          "0%, 100%": { transform: "rotateY(0deg) rotateX(0deg)" },
          "25%": { transform: "rotateY(90deg) rotateX(20deg)" },
          "50%": { transform: "rotateY(180deg) rotateX(-20deg)" },
          "75%": { transform: "rotateY(270deg) rotateX(20deg)" },
        },
        "confetti-shimmer": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "ticket-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "ticket-dash": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 15px 2px hsl(var(--gold) / 0.3)" },
          "50%": { boxShadow: "0 0 25px 6px hsl(var(--gold) / 0.5)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "count-up": "count-up 0.6s ease-out forwards",
        "confetti-fall": "confetti-fall linear forwards",
        "confetti-fall-left": "confetti-fall-left linear forwards",
        "confetti-fall-right": "confetti-fall-right linear forwards",
        "confetti-sway": "confetti-sway ease-in-out infinite",
        "confetti-shimmer": "confetti-shimmer ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "ticket-float": "ticket-float 6s ease-in-out infinite",
        "ticket-dash": "ticket-dash 20s linear infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        marquee: "marquee 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
