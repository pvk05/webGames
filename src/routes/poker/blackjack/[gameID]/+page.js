import { Blackjack } from './player.svelte';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	startGame(params.gameID);
	return {
		gameId: params.gameID,
	}
}

function startGame(gameID) {
	// Start a new game
	new Blackjack(gameID);
	
}