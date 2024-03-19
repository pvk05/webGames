<script>
    import { get } from "svelte/store";
    import Board from "./components/board.svelte";
    import DiceRoll from "./components/diceRoll.svelte";
    import { createGame, points, gameState, game } from "./game.js";

    import { Button } from "flowbite-svelte";
</script>

<h1 class=" h1">Ludo</h1>

{#if $gameState === "not started"}
    <div class=" m-auto w-fit">
        <Button on:click={() => createGame(2)} class=" !bg-emerald-700">2p</Button>
        <Button on:click={() => createGame(3)} class=" !bg-emerald-700">3p</Button>
        <Button on:click={() => createGame(4)} class=" !bg-emerald-700">4p</Button>
    </div>
{:else}
    <div class="flex content-center w-fit m-auto">
        <div class="bg-player1 w-fit p-3 rounded-xl">Player 1: {$points[0]}</div>
        <div class="bg-player2 w-fit p-3 rounded-xl">Player 2: {$points[1]}</div>
        {#if game.playerNumber > 2}
            <div class="bg-player3 w-fit p-3 rounded-xl">Player 3: {$points[2]}</div>
        {/if}
        {#if game.playerNumber > 3}
            <div class="bg-player4 w-fit p-3 rounded-xl">Player 4: {$points[3]}</div>
        {/if}
    </div>
{/if}


<div class=" w-full flex justify-center align-baseline">
    <Board />

    <DiceRoll />
</div>


