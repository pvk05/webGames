<script>
    import { startGame } from "../game.js"
</script>

<style>
    #piece {
        border: 1px solid black;
        width: 60%;
        height: 60%;
        background-color: blue;
        z-index: 1;
    }
</style>

<div id="piece" on:click={startGame} role="button" tabindex="0" on:keypress={startGame}>

</div>