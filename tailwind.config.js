/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'ios-blue': '#007AFF',
        'ios-gray': '#8E8E93',
        'ios-light-gray': '#F2F2F7',
        'ios-dark-gray': '#1C1C1E',
        'ios-green': '#34C759',
        'ios-red': '#FF3B30',
        'dark-bg': '#000000',
        'dark-card': '#1C1C1E',
        'dark-gray': '#2C2C2E',
        'dark-text': '#FFFFFF',
        'dark-secondary': '#8E8E93'
      },
      borderRadius: {
        'ios': '12px'
      }
    }
  },
  plugins: []
}
