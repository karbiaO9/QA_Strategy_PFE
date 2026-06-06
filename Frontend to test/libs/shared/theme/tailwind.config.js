import plugin from 'tailwindcss/plugin';
import { colors, gradients } from './src/config/colors';

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../apps/admin/**/*.{js,ts,jsx,tsx}",
    "../../apps/physio/**/*.{js,ts,jsx,tsx}",
    "../ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      colors: {
        "app-bg": "#e7f2f1",
        "app-surface": "#F9FBFA",
        ...colors,
      },
      backgroundImage: {
        'gradient-1': gradients[1],
        'gradient-2': gradients[2],
        'gradient-3': gradients[3],
        'gradient-4': gradients[4],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Automatically generate CSS Variables for globals.css
    plugin(function ({ addBase, theme }) {
      const extractColorVars = (colorObj, colorGroup = '') => {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey];
          
          // Omit 'DEFAULT' from the CSS variable name
          const cleanKey = colorKey === 'DEFAULT' ? '' : colorKey;
          
          // Build the variable name dynamically
          let cssVariable = '--color';
          if (colorGroup) cssVariable += `-${colorGroup}`;
          if (cleanKey) cssVariable += `-${cleanKey}`;

          if (typeof value === 'string') {
            vars[cssVariable] = value;
          } else {
            // Recursion for nested objects
            const nestedVars = extractColorVars(value, colorGroup ? `${colorGroup}-${colorKey}` : colorKey);
            Object.assign(vars, nestedVars);
          }
          return vars;
        }, {});
      };

      addBase({
        ':root': extractColorVars(theme('colors')),
      });
    }),
  ],
};
