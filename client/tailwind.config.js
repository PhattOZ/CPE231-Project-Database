const colors = require("tailwindcss/colors");

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: { kanit: ["Kanit"] },
      colors: {
        cyan: {
          lightest: "#A9CCE3",
          lighter: "#7FB3D5",
          light: "#5499C7",
          normal: "#2980B9",
          dark: "#2471A3",
          darker: "#1F618D",
          darkest: "#1A5276",
          lightblack: "#0F344C",
          black: "#072234",
          blackest: "#041F30",
        },
        fuchsia: colors.fuchsia,
      },
    },
  },
  variants: {
    extend: { animation: ["motion-safe"], backgroundColor: ["active"] },
  },
  plugins: [],
};
