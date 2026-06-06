const sharedConfig = require("../../libs/shared/theme/tailwind.config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...sharedConfig,
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../libs/shared/theme/src/**/*.{js,ts,jsx,tsx}",
    "../../libs/shared/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};
