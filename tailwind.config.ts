import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        accent: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          glow: "hsl(var(--primary-glow) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / <alpha-value>)",
          foreground: "hsl(var(--info-foreground) / <alpha-value>)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        // Depth scale for a dark surface: a deep neutral shadow paired with a
        // 1px inset top highlight (simulates a glass edge catching light) —
        // a plain drop-shadow alone barely reads against a dark background.
        xs: "0 1px 2px rgba(0, 0, 0, 0.4)",
        sm: "0 2px 8px -2px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)",
        md: "0 8px 24px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        lg: "0 16px 40px -12px rgba(0, 0, 0, 0.55), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)",
        floating: "0 24px 60px -16px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.07)",
        modal: "0 32px 80px -20px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        hero: "0 40px 100px -24px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04)",

        // Legacy names — kept so existing call sites don't need renaming,
        // values redefined for the dark palette.
        brand: "0 8px 24px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        "brand-sm": "0 2px 8px -2px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)",
        accent: "0 8px 24px -6px hsl(var(--accent) / 0.45)",
        card: "0 8px 24px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",

        // Glow variants for interactive primary/success/accent states.
        "glow-primary": "0 0 0 1px hsl(var(--primary) / 0.4), 0 8px 24px -6px hsl(var(--primary) / 0.5)",
        "glow-primary-lg": "0 0 0 1px hsl(var(--primary) / 0.5), 0 12px 32px -8px hsl(var(--primary) / 0.6)",
        "glow-accent": "0 8px 24px -6px hsl(var(--accent) / 0.45)",
        "glow-success": "0 8px 24px -6px hsl(var(--success) / 0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
