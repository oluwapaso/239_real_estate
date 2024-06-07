import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily:{
        nunito: ["Nunito Sans", "sans-serif"],
        Jost : ["Jost","sans-serif"]
      },
      colors:{
        "primary":"#222",
      },
      screens: {
        '2xs': '420px',
        'xs': '540px',
        'tab': '960px',
        'lgScrn': '1450px',
      },
    },
  },
  plugins: [],
};
export default config;
