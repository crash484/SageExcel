/** @type {import('tailwindcss').Config} */
module.exports = {
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
      }
    },
  },
  plugins: [],
}
