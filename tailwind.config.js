import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            default: {
              50: "#F9FAFB",
              100: "#F3F4F6",
              200: "#E5E7EB",
              300: "#D1D5DB",
              400: "#9CA3AF",
              500: "#6B7280",
              600: "#4B5563",
              700: "#374151",
              800: "#1F2937",
              900: "#111827",
              DEFAULT: "#E5E7EB",
              foreground: "#11181C",
            },
            primary: {
              50: "#EEF2FF",
              100: "#E0E7FF",
              200: "#C7D2FE",
              300: "#A5B4FC",
              400: "#818CF8",
              500: "#6366F1",
              600: "#4F46E5",
              700: "#4338CA",
              800: "#3730A3",
              900: "#312E81",
              DEFAULT: "#4F46E5",
              foreground: "#FFFFFF",
            },
            content1: "#FFFFFF",
            content2: "#F9FAFB",
            content3: "#F3F4F6",
            content4: "#E5E7EB",
          },
        },
      },
    }),
  ],
}

module.exports = config;