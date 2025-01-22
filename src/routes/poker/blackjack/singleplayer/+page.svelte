<script>
	/** @type {{ data: import('./$types').PageData }} */
	let { data, players } = $props();
	import { player, game } from "./game.svelte.js";
	import Card from "$lib/card.svelte";
	import { Card as CardClass } from "$lib/cardDeck.js";

	let backCard = new CardClass("back", "back");

</script>

<div>
	<h3>Chips: {player.chips}</h3>
	<button disabled={game.activeRound} class="rounded-full px-6 py-2 bg-teal-500 my-1" onclick={() => game.addBet(player, 10)}>10</button>
	<button disabled={game.activeRound} class="rounded-full px-6 py-2 bg-teal-500 my-1" onclick={() => game.addBet(player, 50)}>50</button>
	<button disabled={game.activeRound} class="rounded-full px-6 py-2 bg-teal-500 my-1" onclick={() => game.addBet(player, 100)}>100</button>
	Bet: {game.getBet(player)}
	<br>
	<button disabled={game.activeRound} class="rounded-full px-6 py-2 bg-teal-500 my-1" onclick={() => game.deal()}>BET</button>
</div>

<br>
<h4>Turn: {game.turn}</h4>
<div>
	<h3>Dealer
		{#if game.dealer.hide2ndCard}
			- ?
		{:else}
			- {game.dealer.value}
		{/if}
	</h3>
	{#each game.dealer.hand as card, index}
		{#if index == 1 && game.dealer.hide2ndCard}
			<Card card={backCard} />
		{:else}
			<Card card={card} />
		{/if}
	{/each}
</div>
<br>
<div>
	<h3>Hand: {player.value} 
		{#if player.value>21}
			Bust!
		{:else if player.value==21}
			Blackjack!
		{/if}
	</h3>
	{#each player.hand as card}
		<Card card={card} />
	{/each}
</div>

<br>
<button disabled={!game.activeRound || game.turnPlayer !== player || player.stands} class="rounded-full px-6 py-2 bg-teal-500" onclick={() => game.hit(player)}>Hit</button>
<button disabled={!game.activeRound || game.turnPlayer !== player || player.stands} class="rounded-full px-6 py-2 bg-teal-500" onclick={() => game.stand(player)}>Stand</button>
