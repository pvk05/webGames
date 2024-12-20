<script>
	/** @type {{ data: import('./$types').PageData }} */
	let { data, players } = $props();
	import { player, betValue } from "./game.svelte.js";

	function bet(num) {
		if ( !player.bet(num) ) return;
		betValue.value += num;
	}
</script>

Game ID: {data.gameId}

<div>
	<h3>Chips: {player.getChips()}</h3>
	<button onclick={() => bet(10)}>10</button>
	<button onclick={() => bet(50)}>50</button>
	<button onclick={() => bet(100)}>100</button>
	Bet: {betValue.value}
</div>
