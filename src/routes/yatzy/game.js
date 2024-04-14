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
					1: 0,
					2: 0,
					3: 0,
					4: 0,
					5: 0,
					6: 0,
					bonus: 0,
					onePair: 0,
					twoPairs: 0,
					threeOfAKind: 0,
					fourOfAKind: 0,
					smallStraight: 0,
					largeStraight: 0,
					fullHouse: 0,
					chance: 0,
					yatzy: 0,
					total: 0,
				},
			});
		}
		return data;
	});
	console.log(get(pointData));

	gameState.set("started");
}
