<script>
    import Dice from "./dice.svelte";
    import NewTable from "./newTable.svelte";
    //import { actplayers, turn } from "./yatzy.js";
    import { gameState, start, turn } from "./game.js";
    
</script>

<div id="game" class=" m-auto w-fit">

    <button id="start" class=" border-slate-800 border-1 p-1 rounded-lg my-3 bg-emerald-500" onclick={() => start(1)}>1 player</button>
    <button id="start" class=" border-slate-800 border-1 p-1 rounded-lg my-3 bg-emerald-500" onclick={() => start(2)}>2 players</button>
    <button id="start" class=" border-slate-800 border-1 p-1 rounded-lg my-3 bg-emerald-500" onclick={() => start(3)}>3 players</button>

    {#if $gameState != "notStarted"}
        <NewTable />
        <Dice />
    {/if}


    <h3 id="whosTurn">Player {$turn+1}</h3>
</div>
