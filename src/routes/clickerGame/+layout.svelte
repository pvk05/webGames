<script>
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<!--<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.min.css">-->

{@render children?.()}