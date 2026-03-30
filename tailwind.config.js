/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", // 30% blue
        dark: "#0F172A", // 10% near-black
        surface: "#F8F9FA", // 60% light bg
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        bold: ["Inter_700Bold"],
      },
      fontSize: {
        base: ["16px", { lineHeight: "24px" }],
      },
    },
  },
  plugins: [],
};
