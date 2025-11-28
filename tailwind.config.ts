import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "#2a2a2a",
        input: "#2a2a2a",
        ring: "#ffffff",
        background: "#0a0a0a",
        foreground: "#ffffff",

        primary: { DEFAULT: "#ffffff", foreground: "#0a0a0a" },
        secondary: { DEFAULT: "#FF7A00", foreground: "#ffffff" },
        accent: { DEFAULT: "#8B5CF6", foreground: "#ffffff" },
        muted: { DEFAULT: "#1a1a1a", foreground: "#a0a0a0" },
        card: { DEFAULT: "#1a1a1a", foreground: "#ffffff" },
        destructive: { DEFAULT: "#EF4444", foreground: "#FFFFFF" },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["'Hubot Sans'", "Inter", "sans-serif"],
        hubot: ["'Hubot Sans'", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
