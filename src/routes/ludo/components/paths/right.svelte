<script>
    import Piece from "../piece.svelte";

	export let player;

	const color = "bg-player" + player;
</script>

<div class=" w-[40%] h-full inline-block bg-slate-600">
	
	<div class="row1 h-1/3 align-top flex">
		<div id="path-19" class="path w-1/6">
		</div><div id="path-20" class="path w-1/6">
		</div><div id="path-21" class="path w-1/6">
		</div><div id="path-22" class="path w-1/6">
		</div><div id="path-23" class="path w-1/6">
		</div><div id="path-24" class="path w-1/6">
		</div>
	</div>
	<div class="row2 h-1/3 align-top flex">
		<div id="p{player}-in-5" class="path w-1/6 {color}">
		</div><div id="p{player}-in-4" class="path w-1/6 {color}">
		</div><div id="p{player}-in-3" class="path w-1/6 {color}">
		</div><div id="p{player}-in-2" class="path w-1/6 {color}">
		</div><div id="p{player}-in-1" class="path w-1/6 {color}">
		</div><div id="path-25" class="path w-1/6">
		</div>
	</div>
	<div class="row3 h-1/3 align-top flex">
		<div id="path-31" class="path w-1/6">
		</div><div id="path-30" class="path w-1/6">
		</div><div id="path-29" class="path w-1/6">
		</div><div id="path-28" class="path w-1/6">
		</div><div id="path-27" class="path w-1/6 {color}">
		</div><div id="path-26" class="path w-1/6">
		</div>
	</div>

</div>