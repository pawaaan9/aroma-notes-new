/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#f88512",
        "background-light": "#f8f7f5",
        "background-dark": "#23190f",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
        smooch: ["var(--font-smooch)", "Smooch Sans", "sans-serif"],
        heading: ["var(--font-smooch)", "Smooch Sans", "sans-serif"],
        saira: ["var(--font-saira)", "Saira", "sans-serif"],
        exo2: ["var(--font-exo2)", "Exo 2", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
    },
  },
  plugins: [],
}
