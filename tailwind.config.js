/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'color-text-primary': '#000',
        'color-text-secondary': '#666',
        'color-background-primary': '#fff',
        'color-background-secondary': '#f5f5f5',
        'color-background-tertiary': '#fafafa',
        'color-border-secondary': '#e0e0e0',
        'color-border-tertiary': '#f0f0f0',
        g: '#2d6a4f',
        g1: '#1f4d36',
        gl: '#eaf5ee',
        gm: '#c8e6d5',
        am: '#c07a2a',
        al: '#fdf5ec',
        bd: 'rgba(0,0,0,0.09)',
      },
    },
  },
  plugins: [],
}