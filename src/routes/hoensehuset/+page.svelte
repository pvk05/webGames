<script>
    import Board from "./components/board.svelte";
    import { createGame, playerNames, numberOfPlayers } from "./game.js";

</script>

<h1>Hønsehuset</h1>

<form on:submit={createGame}>
    <input type="number" name="playersInp" id="playersInp" bind:value={$numberOfPlayers} min="2" max="4">
    
    {#each Array($numberOfPlayers) as _, i}
        <label for="player{i}">Spiller {i+1}:</label>
        <input type="text" id="player{i}" name="player{i}" bind:value={$playerNames[i]}>
    {/each}
    <input type="submit" value="Start spill">
</form>

<Board />