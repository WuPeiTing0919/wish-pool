/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
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
        // 許願瓶溫柔呼吸動畫
        "bottle-breathe": {
          "0%, 100%": {
            transform: "translateX(-50%) translateY(0px)",
            filter: "brightness(1)",
          },
          "50%": {
            transform: "translateX(-50%) translateY(-3px)",
            filter: "brightness(1.1)",
          },
        },
        // 光暈溫柔呼吸
        "aura-breathe": {
          "0%, 100%": {
            opacity: "0.2",
            transform: "translateX(-50%) scale(1)",
          },
          "50%": {
            opacity: "0.4",
            transform: "translateX(-50%) scale(1.05)",
          },
        },
        // 內部發光脈動
        "glow-pulse": {
          "0%, 100%": {
            opacity: "0.3",
            filter: "brightness(1)",
          },
          "50%": {
            opacity: "0.6",
            filter: "brightness(1.2)",
          },
        },
        // 月亮溫柔發光
        "moon-glow": {
          "0%, 100%": {
            filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))",
          },
          "50%": {
            filter: "drop-shadow(0 0 12px rgba(251, 191, 36, 0.6))",
          },
        },
        // 星光飄散動畫 - 更溫柔
        "sparkle-float": {
          "0%, 100%": {
            transform: "translateY(0px) scale(1)",
            opacity: "0.4",
          },
          "50%": {
            transform: "translateY(-2px) scale(1.1)",
            opacity: "0.8",
          },
        },
        "sparkle-drift": {
          "0%, 100%": {
            transform: "translateX(0px) translateY(0px) scale(1)",
            opacity: "0.3",
          },
          "50%": {
            transform: "translateX(1px) translateY(-1px) scale(1.2)",
            opacity: "0.7",
          },
        },
        "sparkle-twinkle": {
          "0%, 100%": {
            opacity: "0.2",
            transform: "scale(0.8)",
          },
          "50%": {
            opacity: "0.6",
            transform: "scale(1.1)",
          },
        },
        "sparkle-gentle": {
          "0%, 100%": {
            opacity: "0.3",
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            opacity: "0.6",
            transform: "translateY(-1px) rotate(180deg)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // 許願瓶動畫 - 更慢更溫柔
        "bottle-breathe": "bottle-breathe 6s ease-in-out infinite",
        "aura-breathe": "aura-breathe 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "moon-glow": "moon-glow 8s ease-in-out infinite",
        // 星光動畫 - 更慢更溫柔
        "sparkle-float": "sparkle-float 8s ease-in-out infinite",
        "sparkle-drift": "sparkle-drift 10s ease-in-out infinite",
        "sparkle-twinkle": "sparkle-twinkle 5s ease-in-out infinite",
        "sparkle-gentle": "sparkle-gentle 12s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
