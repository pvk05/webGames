<script>
    import Home from "./home.svelte";
	import TopPath from "./paths/top.svelte";
	import BottomPath from "./paths/bottom.svelte";
	import LeftPath from "./paths/left.svelte";
	import RightPath from "./paths/right.svelte";
    import Center from "./center.svelte";
	

</script>

<div id="board" class="board aspect-square h-board border-4 border-black m-4">
	<div class="h-[40%] w-full row-1">
		<Home player={1}/><!--
		--><TopPath player={2} /><!--
		--><Home player={2}/>
	</div>

	<div class="h-[20%] w-full row-2">
		<LeftPath player={1}
		/><Center
		/><RightPath player={3}
		/>
	</div>

	<div class="h-[40%] w-full row-3">
		<Home player={4}
		/><BottomPath player={4} 
		/><Home player={3}
		/>
	</div>
</div>