import { writable } from "svelte/store";
import { allFunctions } from './functions.js'
import { gameState } from "./game.js";

// Store for the point data
export let pointData = writable([]);

pointData.subscribe((data) => {
	if (data.length < 1) return;
	console.log(data);
	for (let player in data) {
		for (let key in data[player].scores) {

			if (data[player].scores[key] === "") return;

		}
		allFunctions.total(player);
	}
	gameState.update(() => {
		"ended";
	});

});

// Template for the point data
// This template is used to create the initial point data
// The name is the name of the score
// The id is the id of the score
// The function is the function that is called when the score is selected
export const pointDataTemplate = [
	{
		name: "Ones",
		id: "1",
		function: () => allFunctions.oneToSix(1),
	},
	{
		name: "Twos",
		id: "2",
		function: () => allFunctions.oneToSix(2),
	},
	{
		name: "Threes",
		id: "3",
		function: () => allFunctions.oneToSix(3),
	},
	{
		name: "Fours",
		id: "4",
		function: () => allFunctions.oneToSix(4),
	},
	{
		name: "Fives",
		id: "5",
		function: () => allFunctions.oneToSix(5),
	},
	{
		name: "Sixes",
		id: "6",
		function: () => allFunctions.oneToSix(6),
	},
	{
		name: "Bonus",
		id: "bonus",
		function: null,
	},
	{
		name: "One Pair",
		id: "onePair",
		function: allFunctions.onePair,
	},
	{
		name: "Two Pairs",
		id: "twoPairs",
		function: allFunctions.twoPairs,
	},
	{
		name: "Three of a Kind",
		id: "threeOfAKind",
		function: allFunctions.threeOfAKind,
	},
	{
		name: "Four of a Kind",
		id: "fourOfAKind",
		function: allFunctions.fourOfAKind,
	},
	{
		name: "Small Straight",
		id: "smallStraight",
		function: allFunctions.smallStraight,
	},
	{
		name: "Large Straight",
		id: "largeStraight",
		function: allFunctions.largeStraight,
	},
	{
		name: "Full House",
		id: "fullHouse",
		function: allFunctions.fullHouse,
	},
	{
		name: "Chance",
		id: "chance",
		function: allFunctions.chance,
	},
	{
		name: "Yatzy",
		id: "yatzy",
		function: allFunctions.yatzy,
	}
];