<script>
    import Board from "./components/board.svelte";
    import DiceRoll from "./components/diceRoll.svelte";
    import { createGame } from "./game.js";


</script>

<h1 class=" h1">Ludo</h1>

<button on:click={() => createGame(2)}>2p</button>
<button on:click={() => createGame(3)}>3p</button>
<button on:click={() => createGame(4)}>4p</button>

<Board />

<DiceRoll />


<p class="bg-player1">Player 1</p>
<p class="bg-player2">Player 2</p>
<p class="bg-player3">Player 3</p>
<p class="bg-player4">Player 4</p>