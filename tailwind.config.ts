import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class", // (we'll only use light mode but leave compatibility)
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
        border: "#E5E5E5",
        input: "#E5E5E5",
        ring: "#000000",
        background: "#FFFFFF",
        foreground: "#000000",

        primary: { DEFAULT: "#000000", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#FF7A00", foreground: "#FFFFFF" },
        accent: { DEFAULT: "#8B5CF6", foreground: "#FFFFFF" },
        muted: { DEFAULT: "#F8F8F8", foreground: "#666666" },
        card: { DEFAULT: "#FFFFFF", foreground: "#000000" },
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
