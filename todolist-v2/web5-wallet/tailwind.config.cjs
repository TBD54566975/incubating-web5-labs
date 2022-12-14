/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./ui/index.html",
    "./ui/src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tbd: ['IBM Plex Mono', 'monospace']
      },
      colors: {
        'tbd-yellow': '#ffec19'
      },
      screens: {
        '-md': { max: '767px' },
        // => @media (max-width: 639px) {...}
        '-sm': { max: '639px' }
        // => @media (max-width: 639px) {...}
      }
    },
  },
  plugins: [],
}