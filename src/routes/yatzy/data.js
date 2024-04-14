import { writable } from "svelte/store";
import { allFunctions } from './functions.js'


export let pointData = writable([]);

pointData.subscribe((data) => {
	console.log(data);
});

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
	},
	{
		name: "Total",
		id: "total",
		function: null,
	},
];