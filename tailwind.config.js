/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        'dropdown': 'opacity, transform'
      },
      transitionDuration: {
        '200': '200ms'
      },
      fontSize: {
        sm: '0.875rem',   // 14px
        base: '1rem',      // 16px (medium)
        lg: '1.125rem',    // 18px
      },
    },
  },
  plugins: [],
}
