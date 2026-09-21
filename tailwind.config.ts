import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        portfolio: {
          cream: "#FFF9F1",
          surface: "#F6F3EC",
          sky: "#B9DBF6",
          ink: "#202731",
          muted: "#58636E",
          line: "#DDD9D0",
        },
        paper: "#F6F3EC",
        ink: "#1C1B18",
        forest: "#223B30",
        "forest-light": "#2F5140",
        gold: "#B8912F",
        line: "#DCD5C4",
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
