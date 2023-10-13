<script>
    import { onMount } from "svelte";
    import * as PIXI from "pixi.js";

    onMount(() => {
        const container = document.getElementById("pixi-container");

        const app = new PIXI.Application({
            background: "#1099bb",
            resizeTo: container
        });

        container.appendChild(app.view);

        const bunny = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png')

        bunny.anchor.set(0.5)
        bunny.x = app.screen.width / 2
        bunny.y = app.screen.height / 2

        app.stage.addChild(bunny)
    });
</script>

<style>
    #pixi-container {
        width: 40%;
        aspect-ratio: 1/1;
        margin: auto;
    }
</style>

<div id="pixi-container" />
