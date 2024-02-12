<script>
    import Path from "./path.svelte";
    import Home from "./home.svelte";
    import Blank from "./blank.svelte";
    import Wall from "./wall.svelte";
    import Center from "./center.svelte";

    let board = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 2, 3, 1, 1, 1, 1, 1, 3, 2, 2, 0],
        [0, 2, 2, 3, 1, 3, 1, 3, 1, 3, 2, 2, 0],
        [0, 3, 3, 3, 1, 3, 1, 3, 1, 3, 3, 3, 0],
        [0, 1, 1, 1, 1, 3, 1, 3, 1, 1, 1, 1, 0],
        [0, 1, 3, 3, 3, 4, 4, 4, 3, 3, 3, 1, 0],
        [0, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 0],
        [0, 1, 3, 3, 3, 4, 4, 4, 3, 3, 3, 1, 0],
        [0, 1, 1, 1, 1, 3, 1, 3, 1, 1, 1, 1, 0],
        [0, 3, 3, 3, 1, 3, 1, 3, 1, 3, 3, 3, 0],
        [0, 2, 2, 3, 1, 3, 1, 3, 1, 3, 2, 2, 0],
        [0, 2, 2, 3, 1, 1, 1, 1, 1, 3, 2, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    let home = 0
    const homeColors = ["yellow", "green", "red", "orange"]

    let homeOrder = [0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 3, 3, 2, 2, 3, 3]
    let homeNumOrder = [0, 1, 0, 1, 2, 3, 2, 3, 0, 1, 0, 1, 2, 3, 2, 3]
    
    function insertHome() {

        let data = {color: homeColors[homeOrder[home]], p: homeOrder[home], homeNumber: homeNumOrder[home]}
        console.log(data)
        home++
        return data

        /*
        if(home >= 4) {
            p++
            home = 0
        }

        let data = {color: homeColors[p], homeNumber: home}
        home++
        console.log(data)
        return data*/
    }
    
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
                {#if cell === 0}
                    <Wall />
                {:else if cell === 1}
                    <Path />
                {:else if cell === 2}
                    <Home data={insertHome()}/>
                {:else if cell === 3}
                    <Blank />
                {:else if cell === 4}
                    <Center />
                {/if}
            {/each}
        </div>
    {/each}
</div>