/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}'
    ],
    safelist: [
      // ensure all background and text color utilities are generated
      { pattern: /^bg-/ },
      { pattern: /^text-/ },
      // other frequently used utilities
      { pattern: /^(container|mx-auto|px-4|py-4|px-6|py-2|min-h-screen|flex|flex-col|flex-grow|grid|grid-cols-1|md:grid-cols-2|gap-4|space-x-6|space-y-4|space-y-6|border|border-t|rounded|shadow|text-center|font-bold|font-medium|hover:text-blue-800)$/ },
    ],
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
