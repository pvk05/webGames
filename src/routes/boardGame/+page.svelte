<!-- Game.svelte -->
<script>
    import { Client } from "boardgame.io/client";
    //import { MyGame } from "./my-game";

    const App = Client({
        game: MyGame,
        board: MyBoardComponent,
        debug: true,
    });
</script>

<main>
    <h1>My Board Game</h1>
    <App />
</main>
