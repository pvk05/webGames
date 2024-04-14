import { dice, turn } from "./game.js";
import { get } from "svelte/store";
import { pointData } from "./data.js";


export const allFunctions = {
	oneToSix: oneToSix,
	onePair: onePair,
	twoPairs: twoPairs,
	threeOfAKind: threeOfAKind,
	fourOfAKind: fourOfAKind,
	smallStraight: smallStraight,
	largeStraight: largeStraight,
	fullHouse: fullHouse,
	chance: chance,
	yatzy: yatzy,
};


function oneToSix(value) {
	let diceValues = get(dice).map((die) => die.value);
	diceValues = diceValues.filter((die) => die === value);
	const sum = diceValues.reduce((partialSum, a) => partialSum + a, 0);
	pointData.update((data) => {
		data[get(turn)].scores[value] = sum;
		return data;
	});
}

function onePair() {
	let diceValues = get(dice).map((die) => die.value);
	diceValues.sort((a, b) => b - a);
	for (let i = 0; i < diceValues.length; i++) {
		if (diceValues[i] === diceValues[i + 1]) {
			pointData.update((data) => {
				data[get(turn)].scores.onePair = diceValues[i] * 2;
				return data;
			});
			break;
		}
	}
}

function twoPairs() {
	let diceValues = get(dice).map((die) => die.value);
	diceValues.sort((a, b) => b - a);
	let pair1 = 0;
	let pair2 = 0;
	for (let i = 0; i < diceValues.length; i++) {
		if (diceValues[i] === diceValues[i + 1]) {
			if (pair1 === 0) {
				pair1 = diceValues[i];
			} else if (pair1 !== diceValues[i]) {
				pair2 = diceValues[i];
				break;
			}
		}
	}
	if (pair1 === 0 || pair2 === 0) return;
	pointData.update((data) => {
		data[get(turn)].scores.twoPairs = pair1 * 2 + pair2 * 2;
		return data;
	});

}

function threeOfAKind() {
	console.log("threeOfAKind");
}

function fourOfAKind() {
	console.log("fourOfAKind");
}

function smallStraight() {
	console.log("smallStraight");
}

function largeStraight() {
	console.log("largeStraight");
}

function fullHouse() {
	console.log("fullHouse");
}

function chance() {
	console.log("chance");
}

function yatzy() {
	console.log("yatzy");
}
