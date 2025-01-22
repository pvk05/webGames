
import Blackjack from './blackjack.svelte.js';
import Player from './player.svelte.js';

let game = $state(new Blackjack());
console.log(game);

let player = new Player();
game.addPlayer(player);

export { player, game };