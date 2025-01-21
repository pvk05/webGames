
import { Player, Blackjack } from "./player.svelte.js";

let game = $state(new Blackjack());
console.log(game);

let player = game.players[0];
let betValue = $state({ value: 0});

export { player, betValue, game };