<script>
    import { move } from "../game.js";

    /** @type {{player: any, num: any}} */
    let { player, num } = $props();

    const color = "bg-player" + player;
</script>


<div id="p{player}piece#{num}" class="aspect-square w-2/3 m-auto {color} rounded-full border-2 border-black" onclick={() => move(player, num)} onkeydown={() => {}} role="button" tabindex="0">

</div>