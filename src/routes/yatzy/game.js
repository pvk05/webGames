import { get, writable } from "svelte/store";
import { pointData } from "./data.js";


export let gameState = writable("notStarted");

export let turn = writable(0);

export let dice = writable([
	{ value: 1, locked: false },
	{ value: 2, locked: false },
	{ value: 3, locked: false },
	{ value: 4, locked: false },
	{ value: 5, locked: false },
]);

export function start(playerCount) {
	if( get(gameState) == "started" ) return; 
	pointData.update((data) => {
		for (let i = 0; i < playerCount; i++) {
			data.push({
				name: `P${i + 1}`,
				scores: {
					1: "",
					2: "",
					3: "",
					4: "",
					5: "",
					6: "",
					bonus: "",
					onePair: "",
					twoPairs: "",
					threeOfAKind: "",
					fourOfAKind: "",
					smallStraight: "",
					largeStraight: "",
					fullHouse: "",
					chance: "",
					yatzy: "",
					total: "",
				},
			});
		}
		return data;
	});
	console.log(get(pointData));

	gameState.set("started");
}
