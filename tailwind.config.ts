import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        portfolio: {
          cream: "#F7FBFE",
          surface: "#EEF5FA",
          sky: "#B9DBF6",
          ink: "#202731",
          muted: "#58636E",
          line: "#DBE5ED",
        },
        paper: "#F7FBFE",
        ink: "#1C1B18",
        forest: "#223B30",
        "forest-light": "#2F5140",
        gold: "#B8912F",
        line: "#DBE5ED",
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
