import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--primary)",
        background: "var(--bg)",
        foreground: "var(--text)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-fg)",
          soft: "var(--primary-soft)",
          ink: "var(--primary-ink)",
        },
        muted: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--muted)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        semantic: {
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)",
        },
        kind: {
          folder: "#F5A524",
          image: "#3B82F6",
          video: "#8B5CF6",
          audio: "#EC4899",
          document: "#10B981",
          pdf: "#EF4444",
          spreadsheet: "#22C55E",
          archive: "#F59E0B",
          code: "#06B6D4",
          other: "#64748B",
        },
      },
      borderRadius: {
        btn: "8px",
        card: "14px",
        dialog: "20px",
      },
      lineHeight: {
        vietnamese: "1.5",
      },
      transitionTimingFunction: {
        cb: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      transitionDuration: {
        cb: "180ms",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 6px 16px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
