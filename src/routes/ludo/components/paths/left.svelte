<script>
    import Piece from "../piece.svelte";

	/** @type {{player: any}} */
	let { player } = $props();

	const color = "bg-player" + player;
</script>

<div class=" w-[40%] h-full inline-block bg-slate-600">

	<div class="row1 h-1/3 align-top flex">
		<div id="path-52" class="path w-1/6">
		</div><div id="path-1" class="path w-1/6 {color}">
		</div><div id="path-2" class="path w-1/6">
		</div><div id="path-3" class="path w-1/6">
		</div><div id="path-4" class="path w-1/6">
		</div><div id="path-5" class="path w-1/6">
		</div>
	</div>
	<div class="row2 h-1/3 align-top flex">
		<div id="path-51" class="path w-1/6">
		</div><div id="p{player}-in-1" class="path w-1/6 {color}">
		</div><div id="p{player}-in-2" class="path w-1/6 {color}">
		</div><div id="p{player}-in-3" class="path w-1/6 {color}">
		</div><div id="p{player}-in-4" class="path w-1/6 {color}">
		</div><div id="p{player}-in-5" class="path w-1/6 {color}">
		</div>
	</div>
	<div class="row3 h-1/3 align-top flex">
		<div id="path-50" class="path w-1/6">
		</div><div id="path-49" class="path w-1/6">
		</div><div id="path-48" class="path w-1/6">
		</div><div id="path-47" class="path w-1/6">
		</div><div id="path-46" class="path w-1/6">
		</div><div id="path-45" class="path w-1/6">
		</div>
	</div>

</div>