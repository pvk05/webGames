<script>
	/** @type {{ data: import('./$types').PageData }} */
	let { data, players } = $props();
	import { player, betValue, game } from "./game.svelte.js";
	import Card from "$lib/card.svelte";

	function bet(num) {
		if ( !player.bet(num) ) return;
		betValue.value += num;
	}
</script>

<div>
	<h3>Chips: {player.getChips()}</h3>
	<button class="rounded-full px-6 py-2 bg-teal-600" onclick={() => bet(10)}>10</button>
	<button class="rounded-full px-6 py-2 bg-teal-600" onclick={() => bet(50)}>50</button>
	<button class="rounded-full px-6 py-2 bg-teal-600" onclick={() => bet(100)}>100</button>
	Bet: {betValue.value}
	<button class="rounded-full px-6 py-2 bg-teal-600" onclick={() => game.deal()}>BET</button>
</div>

<div>
	<h3>Hand</h3>
	{#each player.hand as card}
		<Card card={card} />
	{/each}
</div>
<div>
	<h3>Dealer</h3>
	{#each game.dealer.hand as card}
		<Card card={card} />
	{/each}
</div>