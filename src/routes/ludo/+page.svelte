<script>
    import Board from "./components/board.svelte";
    import DiceRoll from "./components/diceRoll.svelte";
    import { createGame } from "./game.js";

    import { Button } from "flowbite-svelte";
</script>

<h1 class=" h1">Ludo</h1>

<Button on:click={() => createGame(2)} class=" !bg-emerald-700">2p</Button>
<Button on:click={() => createGame(3)} class=" !bg-emerald-700">3p</Button>
<Button on:click={() => createGame(4)} class=" !bg-emerald-700">4p</Button>

<Board />

<DiceRoll />

<p class="bg-player1">Player 1</p>
<p class="bg-player2">Player 2</p>
<p class="bg-player3">Player 3</p>
<p class="bg-player4">Player 4</p>
