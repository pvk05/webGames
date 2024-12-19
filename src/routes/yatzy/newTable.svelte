<script>
	import { pointData, pointDataTemplate } from './data.js';
	import { allFunctions } from './functions.js';
    import { gameState } from './game.js';
</script>

<table>
	<colgroup>
        <col span="2" style="background-color: #D6EEEE" />
    </colgroup>
	<tbody>
    	<tr>
    	    <th colspan="7">Yatzy</th>
    	</tr>
		<tr>
    	    <td colspan="2"></td>
    	    {#each $pointData as player}
				<td class="Player{player.name} p-2">{player.name}</td>
			{/each}
    	</tr>
		{#each pointDataTemplate as point, i}
			<tr>
				<td colspan="2">
					<button
						on:click={() => pointDataTemplate[i].function()}
						class="place p-1"
					>
						{point.name}
					</button>
				</td>
				{#each $pointData as player, i}
					<td class="{player.name} {point.name}">{player.scores[point.id]}</td>
				{/each}
			</tr>
		{/each}
		<tr>
			<td colspan="2">
				Total
			</td>
			{#each $pointData as player, i}
				<td class="{player.name} total">{#if $gameState=="ended"} { player.total } {/if}</td>
			{/each}
		</tr>
	</tbody>
</table>

<style>
    table {
        border: 1px solid;
    }

    td {
        border: 1px solid;
    }

    .fet,
    .sum,
    .totalSum {
        font-weight: bold;
    }
</style>
