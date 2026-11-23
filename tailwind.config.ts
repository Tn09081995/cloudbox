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
        sans: ["Google Sans", "var(--font-roboto)", "Roboto", "Arial", "sans-serif"],
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
          variant: "var(--surface-variant)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-fg)",
          soft: "var(--primary-soft)",
          ink: "var(--primary-ink)",
        },
        "nav-active": {
          DEFAULT: "var(--nav-active)",
          foreground: "var(--nav-active-fg)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted)",
          surface: "var(--surface-2)",
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
          image: "#1A73E8",
          video: "#9334E6",
          audio: "#E52592",
          document: "#1E8E3E",
          pdf: "#EA4335",
          spreadsheet: "#0F9D58",
          archive: "#F9AB00",
          code: "#12B5CB",
          other: "#5F6368",
        },
      },
      borderRadius: {
        pill: "9999px",
        btn: "9999px",
        content: "24px",
        card: "16px",
        chip: "12px",
        dialog: "28px",
      },
      lineHeight: {
        vietnamese: "1.5",
      },
      transitionTimingFunction: {
        cb: "cubic-bezier(0.2, 0, 0, 1)",
      },
      transitionDuration: {
        cb: "180ms",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.06)",
        card: "0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 3px 1px rgba(60,64,67,0.06)",
        "card-hover": "0 2px 6px 0 rgba(60,64,67,0.15), 0 4px 8px 3px rgba(60,64,67,0.08)",
        fab: "0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
