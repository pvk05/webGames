
<script>
    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();
    import { CardDeck } from "$lib/cardDeck.js";
    import Card from "$lib/card.svelte";
    import { goto } from "$app/navigation";

    var deck = new CardDeck();
    function start() {
        let id = Math.floor(Math.random() * 9999);
        goto(`/poker/blackjack/${id}`);
    }
</script>

<h1>Blackjack</h1>
<a href="/poker/blackjack/singleplayer">Alene</a>
<button onclick={() => start()}>New Game</button>
<div class="hidden">
{#each deck.deck as card}
    <Card card={card} />
{/each}
</div>