<script>
    /** @type {{children?: import('svelte').Snippet}} */
    let { children } = $props();
    /** @type {import('./$types').LayoutData} */
    //export let data;
</script>

<style lang="postcss">
    :global(body) {
      @apply bg-slate-600;
    }
</style>

{@render children?.()}