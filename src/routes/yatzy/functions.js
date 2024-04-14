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

function changeTurn() {
	turn.update((t) => t + 1);
	if (get(turn) >= get(pointData).length) {
		turn.set(0);
	}
}


function oneToSix(value) {
	if(get(pointData)[get(turn)].scores[value] !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	diceValues = diceValues.filter((die) => die === value);
	const sum = diceValues.reduce((partialSum, a) => partialSum + a, 0);
	pointData.update((data) => {
		data[get(turn)].scores[value] = sum;
		return data;
	});

	changeTurn();
}

function onePair() {
	if(get(pointData)[get(turn)].scores.onePair !== "") return;
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

	changeTurn();
}

function twoPairs() {
	if(get(pointData)[get(turn)].scores.twoPairs !== "") return;
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

		changeTurn();
	}
	if (pair1 === 0 || pair2 === 0) return;
	pointData.update((data) => {
		data[get(turn)].scores.twoPairs = pair1 * 2 + pair2 * 2;
		return data;
	});

}

function threeOfAKind() {
	if(get(pointData)[get(turn)].scores.threeOfAKind !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	diceValues.sort((a, b) => b - a);
	for (let i = 0; i < diceValues.length; i++) {
		if (diceValues[i] === diceValues[i + 1] && diceValues[i] === diceValues[i + 2]) {
			pointData.update((data) => {
				data[get(turn)].scores.threeOfAKind = diceValues[i] * 3;
				return data;
			});
			break;
		}
	}

	changeTurn();
}

function fourOfAKind() {
	if(get(pointData)[get(turn)].scores.fourOfAKind !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	diceValues.sort((a, b) => b - a);
	for (let i = 0; i < diceValues.length; i++) {
		if (diceValues[i] === diceValues[i + 1] &&
			diceValues[i] === diceValues[i + 2] &&
			diceValues[i] === diceValues[i + 3]) {
			pointData.update((data) => {
				data[get(turn)].scores.fourOfAKind = diceValues[i] * 4;
				return data;
			});
			break;
		}
	}

	changeTurn();
}

function smallStraight() {
	if(get(pointData)[get(turn)].scores.smallStraight !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	diceValues.sort((a, b) => b - a);
	if (diceValues[0] === 6) return;
	if (diceValues[0] !== 5) return;
	if (diceValues[1] !== 4) return;
	if (diceValues[2] !== 3) return;
	if (diceValues[3] !== 2) return;
	if (diceValues[4] !== 1) return;
	pointData.update((data) => {
		data[get(turn)].scores.smallStraight = 15;
		return data;
	});

	changeTurn();
}

function largeStraight() {
	if(get(pointData)[get(turn)].scores.largeStraight !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	diceValues.sort((a, b) => b - a);
	if (diceValues[0] !== 6) return;
	if (diceValues[1] !== 5) return;
	if (diceValues[2] !== 4) return;
	if (diceValues[3] !== 3) return;
	if (diceValues[4] !== 2) return;
	pointData.update((data) => {
		data[get(turn)].scores.largeStraight = 20;
		return data;
	});

	changeTurn();
}

function fullHouse() {
	if(get(pointData)[get(turn)].scores.fullHouse !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	diceValues.sort((a, b) => b - a);
	let pair = 0;
	let three = 0;
	for (let i = 0; i < diceValues.length; i++) {
		if (diceValues[i] === diceValues[i + 1] && diceValues[i] === diceValues[i + 2]) {
			three = diceValues[i];
			break;
		}
	}
	if (three === 0) return;
	for (let i = 0; i < diceValues.length; i++) {
		if (diceValues[i] === diceValues[i + 1] && diceValues[i] !== three) {
			pair = diceValues[i];
			break;
		}
	}
	if (pair === 0) return;
	pointData.update((data) => {
		data[get(turn)].scores.fullHouse = pair * 2 + three * 3;
		return data;
	});

	changeTurn();
}

function chance() {
	if(get(pointData)[get(turn)].scores.chance !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	diceValues.sort((a, b) => b - a);
	const sum = diceValues.reduce((partialSum, a) => partialSum + a, 0);
	pointData.update((data) => {
		data[get(turn)].scores.chance = sum;
		return data;
	});

	changeTurn();
}

function yatzy() {
	if(get(pointData)[get(turn)].scores.yatzy !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	if (!diceValues.every((val, i, arr) => val === arr[0])) return
	pointData.update((data) => {
		data[get(turn)].scores.yatzy = 50;
		return data;
	});

	changeTurn();
}
