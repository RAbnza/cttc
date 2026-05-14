/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f5f7",
          100: "#e7e4ea",
          200: "#c9c3d1",
          300: "#a39ab5",
          400: "#6f6788",
          500: "#4a4565",
          600: "#35314b",
          700: "#232136",
          800: "#171523",
          900: "#0d0c14"
        },
        mint: {
          100: "#e6f5f1",
          300: "#b6e3d6",
          500: "#67cbb4",
          700: "#2c8e7a"
        }
      },
      boxShadow: {
        glass: "0 18px 45px -35px rgba(15, 23, 42, 0.45)",
        soft: "0 24px 60px -40px rgba(15, 23, 42, 0.5)",
        insetGlow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)"
      },
      borderRadius: {
        xl: "22px",
        "2xl": "28px"
      },
      fontFamily: {
        sans: ["Bahnschrift", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Segoe UI Variable Display", "Bahnschrift", "Segoe UI", "system-ui"]
      }
    },
  },
  plugins: [],
}

