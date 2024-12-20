<script>
    /** @type {{ data: import('./$types').PageData }} */
    let { card } = $props();
</script>

<img src={card.getPic()} alt={card.get()} class="h-36 inline-flex border-4"/>