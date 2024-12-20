
<script>
    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();
    import { CardDeck } from "$lib/cardDeck.js";
    import Card from "$lib/card.svelte";
    import Game from "./game.svelte";

    var deck = new CardDeck();
</script>

<h1>Blackjack</h1>

<Game />

{#each deck.deck as card}
    <Card card={card} />
{/each}