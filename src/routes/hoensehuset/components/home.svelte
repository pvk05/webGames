<script>
    import Piece from "./piece.svelte";

    export let data;
</script>

<style>
    .home {
        border: 1px solid black;
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>

<div class="home" id="home_p{data.p}_{data.homeNumber}" style="background-color: {data.color};">
    <Piece />
</div>