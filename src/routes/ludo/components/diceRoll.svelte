<script>
    import diceOne from "$lib/assets/dice-one-solid.svg";
    import diceTwo from "$lib/assets/dice-two-solid.svg";
    import diceThree from "$lib/assets/dice-three-solid.svg";
    import diceFour from "$lib/assets/dice-four-solid.svg";
    import diceFive from "$lib/assets/dice-five-solid.svg";
    import diceSix from "$lib/assets/dice-six-solid.svg";

    const diceImgs = [diceOne, diceTwo, diceThree, diceFour, diceFive, diceSix]

    function rollDice() {
        const dice = document.getElementById("diceImg");
        const roll = Math.floor(Math.random() * 6);
        dice.src = diceImgs[roll];
    }
</script>

<button on:click={rollDice}>Roll Dice</button>

<div id="diceRoll" class="aspect-square h-16 m-auto">
    <img id="diceImg" src={diceSix} alt="dice" class="w-full h-full" />
</div>