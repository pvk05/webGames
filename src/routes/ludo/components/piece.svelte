<script>
    import { move } from "../game.js";

    export let player;
    export let num;

    const color = "bg-player" + player;
</script>


<div id="p{player}piece#{num}" class="aspect-square w-2/3 m-auto {color} rounded-full border-2 border-black" on:click={() => move(player, num)} on:keydown={() => {}} role="button" tabindex="0">

</div>