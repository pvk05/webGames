<script>
    import Path from "./path.svelte";
    import Home from "./home.svelte";
    import Blank from "./blank.svelte";
    import Wall from "./wall.svelte";
    import Center from "./center.svelte";

    let board = [
        [Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall],
        [Wall, Home, Home, Blank, Path, Path, Path, Path, Path, Blank, Home, Home, Wall],
        [Wall, Home, Home, Blank, Path, Blank, Path, Blank, Path, Blank, Home, Home, Wall],
        [Wall, Blank, Blank, Blank, Path, Blank, Path, Blank, Path, Blank, Blank, Blank, Wall],
        [Wall, Path, Path, Path, Path, Blank, Path, Blank, Path, Path, Path, Path, Wall],
        [Wall, Path, Blank, Blank, Blank, Center, Center, Center, Blank, Blank, Blank, Path, Wall],
        [Wall, Path, Path, Path, Path, Center, Center, Center, Path, Path, Path, Path, Wall],
        [Wall, Path, Blank, Blank, Blank, Center, Center, Center, Blank, Blank, Blank, Path, Wall],
        [Wall, Path, Path, Path, Path, Blank, Path, Blank, Path, Path, Path, Path, Wall],
        [Wall, Blank, Blank, Blank, Path, Blank, Path, Blank, Path, Blank, Blank, Blank, Wall],
        [Wall, Home, Home, Blank, Path, Blank, Path, Blank, Path, Blank, Home, Home, Wall],
        [Wall, Home, Home, Blank, Path, Path, Path, Path, Path, Blank, Home, Home, Wall],
        [Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall, Wall],
    ];

    
</script>

<style>
    #board {
        border: 1px solid black;
        display: grid;
        grid-template-columns: repeat(13, 50px);
        grid-template-rows: repeat(13, 50px);
        height: fit-content;
        width: fit-content;
    }
</style>

<div id="board">
    {#each board as row}
        <div>
            {#each row as cell}
                <svelte:component this={cell} />
            {/each}
        </div>
    {/each}
</div>