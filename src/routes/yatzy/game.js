import { get, writable } from "svelte/store";
import { pointData } from "./data.js";

// Store for the game state
export let gameState = writable("notStarted");

// Store for the turn
export let turn = writable(0);

// Store for the dice
export let dice = writable([
	{ value: 0, locked: false },
	{ value: 0, locked: false },
	{ value: 0, locked: false },
	{ value: 0, locked: false },
	{ value: 0, locked: false },
]);

export let diceRolls = writable(0)

// Function to start the game
// This function creates the point data for the players
// It sets the game state to started
export function start(playerCount) {
	if( get(gameState) == "started" ) return; 
	pointData.update((data) => {
		for (let i = 0; i < playerCount; i++) {
			data.push(
				new Player(`P${i+1}`)
				);
		}
		return data;
	});
	console.log(get(pointData));

	gameState.set("started");
}

class Player {
	constructor(name) {
		this.name = name;
		this.scores = {
			1: "",
			2: "",
			3: "",
			4: "",
			5: "",
			6: "",
			bonus: " ",
			onePair: "",
			twoPairs: "",
			threeOfAKind: "",
			fourOfAKind: "",
			smallStraight: "",
			largeStraight: "",
			fullHouse: "",
			chance: "",
			yatzy: "",
		};
		this.total = null;
	}
}