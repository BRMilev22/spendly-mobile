/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}', // Match App.tsx
    './LoginScreen.{js,jsx,ts,tsx}', // Match LoginScreen.tsx
    './ReceiptScreen.{js,jsx,ts,tsx}', // Match ReceiptScreen.tsx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
