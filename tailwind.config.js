/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      width: {
        board: "85vh",
        home: "200px",
        100: "100px",
      },
      height: {
        board: "85vh",
        home: "200px",
        100: "100px",
      },
      colors: {
        player3: "#FF0000",
        player4: "orange",
        player2: "#00FF00",
        player1: "#fff033",
      },
      borderWidth: {
        1: "1px",
      },
    }
  },
  plugins: []
};