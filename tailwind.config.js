/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],

  prefix: "",

  theme: {
    container: {
      center: true,
      padding: "2rem",

      screens: {
        "2xl": "1400px"
      }
    },

    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"]
      },

      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },

        workspace: {
          DEFAULT: "#f8f9fa"
        },

        dark: {
          border: "#2b323b",
          input: "#1b293c",
          ring: "#688dea",
          background: "#0a0a0a",
          foreground: "#fafafa",

          primary: {
            DEFAULT: "#31509b",
            foreground: "#15273a"
          },

          secondary: {
            DEFAULT: "#5780a8",
            foreground: "#fafafa"
          },

          destructive: {
            DEFAULT: "#7f0000",
            foreground: "#15273a"
          },

          muted: {
            DEFAULT: "#1c2631",
            foreground: "#a6b0bf"
          },

          accent: {
            DEFAULT: "#4280bd",
            foreground: "#fafafa"
          },

          popover: {
            DEFAULT: "#141414",
            foreground: "#fafafa"
          },

          card: {
            DEFAULT: "#141414",
            foreground: "#fafafa"
          },

          workspace: {
            DEFAULT: "#202830"
          }
        }
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },

      keyframes: {
        "accordion-down": {
          from: {
            height: "0"
          },

          to: {
            height: "var(--radix-accordion-content-height)"
          }
        },

        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)"
          },

          to: {
            height: "0"
          }
        }
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },

  plugins: [require("tailwindcss-animate")],

  safelist: [{
    pattern: /^(bg|text|border|ring|shadow|outline|decoration|divide|placeholder|accent)-(border|input|ring|background|foreground|primary|primary-foreground|secondary|secondary-foreground|destructive|destructive-foreground|muted|muted-foreground|accent|accent-foreground|popover|popover-foreground|card|card-foreground|workspace)$/,

    variants: [
      "hover",
      "focus",
      "active",
      "disabled",
      "group-hover",
      "group-focus",
      "dark",
      "dark:hover",
      "dark:focus",
      "dark:active"
    ]
  }, {
    pattern: /^(bg|text|border|ring|shadow|outline|decoration|divide|placeholder|accent)-dark-(border|input|ring|background|foreground|primary|primary-foreground|secondary|secondary-foreground|destructive|destructive-foreground|muted|muted-foreground|accent|accent-foreground|popover|popover-foreground|card|card-foreground|workspace)$/,

    variants: [
      "hover",
      "focus",
      "active",
      "disabled",
      "group-hover",
      "group-focus",
      "dark",
      "dark:hover",
      "dark:focus",
      "dark:active"
    ]
  }, "dark"]
};
