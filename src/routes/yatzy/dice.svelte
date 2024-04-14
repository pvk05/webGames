<script>
    import { Button } from "flowbite-svelte";

    import { dice } from "./game.js";
    import diceOne from "$lib/assets/dice-one-solid.svg";
    import diceTwo from "$lib/assets/dice-two-solid.svg";
    import diceThree from "$lib/assets/dice-three-solid.svg";
    import diceFour from "$lib/assets/dice-four-solid.svg";
    import diceFive from "$lib/assets/dice-five-solid.svg";
    import diceSix from "$lib/assets/dice-six-solid.svg";

    // array of dice images
    const diceImgs = ["", diceOne, diceTwo, diceThree, diceFour, diceFive, diceSix];

    function rollDice() {
        dice.update((data) => {
            data.forEach((die) => {
                if (!die.locked) {
                    die.value = Math.floor(Math.random() * 6) + 1;
                }
            });
            return data;
        });
    }

    function lockDie(die) {
        $dice[die].locked = !$dice[die].locked;
        document.getElementById("die" + (die+1)).classList.toggle("bg-red-800");
    }
</script>

<Button class=" !bg-emerald-600" on:click={rollDice}>Roll Dice</Button>

<div id="dice">
    <div>
        <div id="die1"><img src={diceImgs[$dice[0].value]} alt="dice" on:click={() => lockDie(0)}/></div>
    </div>
    <div id="die"></div>
    <div>
        <div id="die2"><img src={diceImgs[$dice[1].value]} alt="dice" on:click={() => lockDie(1)}/></div>
    </div>
    <div id="die"></div>
    <div>
        <div id="die3"><img src={diceImgs[$dice[2].value]} alt="dice" on:click={() => lockDie(2)}/></div>
    </div>
    <div id="die"></div>
    <div>
        <div id="die4"><img src={diceImgs[$dice[3].value]} alt="dice" on:click={() => lockDie(3)}/></div>
    </div>
    <div id="die"></div>
    <div>
        <div id="die5"><img src={diceImgs[$dice[4].value]} alt="dice" on:click={() => lockDie(4)}/></div>
    </div>
</div>

<style>
    #dice {
        border: 1px solid;
        display: grid;
        width: 189px;
        height: 192px;
        grid-template-columns: 63px 63px 63px;
        grid-template-rows: 64px 64px 64px;
    }

    #die {
        /*background-color: #555;
        border: 1px solid;*/
        margin-bottom: 1px;
    }
    #die1,
    #die2,
    #die3,
    #die4,
    #die5 {
        /*width: 43px;*/
        height: 62px;
        padding-left: 3px;
        padding-bottom: 2px;
    }
</style>
