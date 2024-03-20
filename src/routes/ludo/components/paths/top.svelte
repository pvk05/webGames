<script>
	import Piece from "../piece.svelte";

	export let player;

	const color = "bg-player" + player;
</script>

<div class=" w-[20%] h-full inline-block bg-slate-600">

	<div class="row h-1/6 align-top flex">
		<div id="path-11" class="path w-1/3">
		</div><div id="path-12" class="path w-1/3">
		</div><div id="path-13" class="path w-1/3">
		</div>
	</div>
	<div class="row h-1/6 align-top flex">
		<div id="path-10" class="path w-1/3">
		</div><div id="p{player}-in-1" class="path w-1/3 {color}">
		</div><div id="path-14" class="path w-1/3 {color}">
		</div>
	</div>
	<div class="row h-1/6 align-top flex">
		<div id="path-9" class="path w-1/3">
		</div><div id="p{player}-in-2" class="path w-1/3 {color}">
		</div><div id="path-15" class="path w-1/3">
		</div>
	</div>
	<div class="row h-1/6 align-top flex">
		<div id="path-8" class="path w-1/3">
		</div><div id="p{player}-in-3" class="path w-1/3 {color}">
		</div><div id="path-16" class="path w-1/3">
		</div>
	</div>
	<div class="row h-1/6 align-top flex">
		<div id="path-7" class="path w-1/3">
		</div><div id="p{player}-in-4" class="path w-1/3 {color}">
		</div><div id="path-17" class="path w-1/3">
		</div>
	</div>
	<div class="row h-1/6 align-top flex">
		<div id="path-6" class="path w-1/3">
		</div><div id="p{player}-in-5" class="path w-1/3 {color}">
		</div><div id="path-18" class="path w-1/3">
		</div>
	</div>

</div>
