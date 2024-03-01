<script>
    import { roll } from "../game.js";
    import diceOne from "$lib/assets/dice-one-solid.svg";
    import diceTwo from "$lib/assets/dice-two-solid.svg";
    import diceThree from "$lib/assets/dice-three-solid.svg";
    import diceFour from "$lib/assets/dice-four-solid.svg";
    import diceFive from "$lib/assets/dice-five-solid.svg";
    import diceSix from "$lib/assets/dice-six-solid.svg";

    const diceImgs = [diceOne, diceTwo, diceThree, diceFour, diceFive, diceSix]

    function rollFunc(e) {
        if(e.keyCode !== 82) return;

        roll.set(Math.floor(Math.random() * 6))
    }
</script>

<button on:click={() => roll.set(Math.floor(Math.random() * 6))}>Roll Dice</button>

<div id="diceRoll" class="aspect-square h-16 m-auto">
    <img id="diceImg" src={diceImgs[$roll]} alt="dice" class="w-full h-full" />
</div>

<svelte:window on:keydown|preventDefault={rollFunc} />