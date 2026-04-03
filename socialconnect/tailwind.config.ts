import type { Config } from "tailwindcss";

const config: Config = {
  // Tell Tailwind which files to scan for class names.
  // If a class isn't in these files, Tailwind removes it from the final CSS.
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"), // activates DaisyUI component classes
  ],
  daisyui: {
    themes: ["light", "dark"],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    logs: false, // disables DaisyUI version log in terminal
  },
};

export default config;
