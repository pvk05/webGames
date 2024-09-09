import { dice, diceRolls, turn } from "./game.js";
import { get } from "svelte/store";
import { pointData } from "./data.js";

// Exported object containing all functions for the scores
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
	total: total,
};

// Function to change turn
// This function increments the turn by one and resets it to 0 if it reaches the end of the player list
function changeTurn() {
	turn.update((t) => t + 1);
	if (get(turn) >= get(pointData).length) {
		turn.set(0);
	}
	resetDice()
}

function resetDice() {
	dice.update((data) => {
		let n = 0
		data.forEach((die) => {
			die.value = 0
			n++
			if (die.locked) {
				die.locked = false
				document.getElementById("die" + (n)).classList.toggle("bg-red-800");
			}
		});
		return data;
	})
	diceRolls.set(0)
}

// Functions for one to six
// This function filters the dice values for the selected number and then sums them
// The sum is then set as the score for the selected number and the turn is changed
function oneToSix(value) {
	if (get(pointData)[get(turn)].scores[value] !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	diceValues = diceValues.filter((die) => die === value);
	const sum = diceValues.reduce((partialSum, a) => partialSum + a, 0);
	pointData.update((data) => {
		data[get(turn)].scores[value] = sum;
		return data;
	});

	changeTurn();
}

// Function for one pair
// This function sorts the dice values in descending order and then checks for pairs
// The first pair found is set as the score and the turn is changed
function onePair() {
	if (get(pointData)[get(turn)].scores.onePair !== "") return;
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

// Function for two pairs
// This function sorts the dice values in descending order and then checks for two pairs
// The first two different pairs found are set as the score and the turn is changed
function twoPairs() {
	if (get(pointData)[get(turn)].scores.twoPairs !== "") return;
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

	changeTurn();
}

// Function for three of a kind
// This function sorts the dice values in descending order and then checks for three of a kind
// If three of a kind is found, the score is set and the turn is changed
function threeOfAKind() {
	if (get(pointData)[get(turn)].scores.threeOfAKind !== "") return;
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

// Function for four of a kind
// This function sorts the dice values in descending order and then checks for four of a kind
// If four of a kind is found, the score is set and the turn is changed
function fourOfAKind() {
	if (get(pointData)[get(turn)].scores.fourOfAKind !== "") return;
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

// Function for small straight
// This function sorts the dice values in descending order and then checks for a small straight
// Checks for a sequence of 5, 4, 3, 2, 1
// If a small straight is found, the score is set and the turn is changed
function smallStraight() {
	if (get(pointData)[get(turn)].scores.smallStraight !== "") return;
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

// Function for large straight
// This function sorts the dice values in descending order and then checks for a large straight
// Checks for a sequence of 6, 5, 4, 3, 2
// If a large straight is found, the score is set and the turn is changed
function largeStraight() {
	if (get(pointData)[get(turn)].scores.largeStraight !== "") return;
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

// Function for full house
// This function sorts the dice values in descending order and then checks for a full house
// Checks for a three of a kind and a pair, 
// if both are found, the score is set and the turn is changed
function fullHouse() {
	if (get(pointData)[get(turn)].scores.fullHouse !== "") return;
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

// Function for chance
// This function sums all dice values and sets the sum as the score for chance
function chance() {
	if (get(pointData)[get(turn)].scores.chance !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	diceValues.sort((a, b) => b - a);
	const sum = diceValues.reduce((partialSum, a) => partialSum + a, 0);
	pointData.update((data) => {
		data[get(turn)].scores.chance = sum;
		return data;
	});

	changeTurn();
}

// Function for yatzy
// This function checks if all dice values are the same
// If they are, the score is set to 50 and the turn is changed
function yatzy() {
	if (get(pointData)[get(turn)].scores.yatzy !== "") return;
	let diceValues = get(dice).map((die) => die.value);
	if (!diceValues.every((val, i, arr) => val === arr[0])) return
	pointData.update((data) => {
		data[get(turn)].scores.yatzy = 50;
		return data;
	});

	changeTurn();
}

function total(player) {
	if(get(pointData)[player].total !== null) return;
	let sum = 0;
	let bonus = 0;
	const points = get(pointData)[player];
	for (let i = 1; i < 7; i++) {
		bonus += get(pointData)[player].scores[i];
	}
	if (bonus >= 63) {
		points.scores.bonus = 50;
	} else {
		points.scores.bonus = 0;
	}
	for (let key in points.scores) {
		if (points.scores[key] === "") return;
		sum += points.scores[key];
	}
	pointData.update((data) => {
		data[get(turn)].total = sum;
		return data;
	});
}
