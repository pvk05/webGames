/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      width: {
        board: "500px",
        home: "200px",
        100: "100px",
      },
      height: {
        board: "500px",
        home: "200px",
        100: "100px",
      },
      colors: {
        player1: "#FF0000",
        player2: "#0000FF",
        player3: "#00FF00",
        player4: "#FFFF00",
      },
      borderWidth: {
        1: "1px",
      },
    }
  },
  plugins: []
};