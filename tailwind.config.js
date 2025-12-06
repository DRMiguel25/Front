/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'pos-gold': '#ffc72c',
        'pos-gold-dark': '#daa520',
        'pos-red': '#da291c',
        'pos-green': '#27ae60',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#ffc72c",
          "primary-content": "#1a1a2e",
          "secondary": "#1a1a2e",
          "secondary-content": "#ffffff",
          "accent": "#27ae60",
          "accent-content": "#ffffff",
          "neutral": "#1a1a2e",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f5f5f5",
          "base-300": "#e0e0e0",
          "base-content": "#1a1a2e",
          "info": "#3b82f6",
          "success": "#27ae60",
          "warning": "#ffc72c",
          "error": "#da291c",
        },
        dark: {
          "primary": "#ffc72c",
          "primary-content": "#1a1a2e",
          "secondary": "#16213e",
          "secondary-content": "#ffffff",
          "accent": "#27ae60",
          "accent-content": "#ffffff",
          "neutral": "#16213e",
          "neutral-content": "#ffffff",
          "base-100": "#1a1a2e",
          "base-200": "#16213e",
          "base-300": "#0f1629",
          "base-content": "#ffffff",
          "info": "#3b82f6",
          "success": "#27ae60",
          "warning": "#ffc72c",
          "error": "#da291c",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  },
}