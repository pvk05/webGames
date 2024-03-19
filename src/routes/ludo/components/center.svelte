<script>
	import { points } from "../game.js";
</script>

<div class=" w-[20%] h-full inline-block bg-slate-800 overflow-hidden relative">
	<div class="win-box w-full h-full absolute origin-bottom-right p-[0.5%]" id="win-box1">
		<div class="win-pawn-box bg-player2 w-full h-full relative" id="win-p2"></div>
	</div>
	<div class="win-box w-full h-full absolute origin-bottom-right p-[0.5%]" id="win-box2">
		<div class="win-pawn-box bg-player3 w-full h-full relative" id="win-p3"></div>
	</div>
	<div class="win-box w-full h-full absolute origin-bottom-right p-[0.5%]" id="win-box3">
		<div class="win-pawn-box bg-player4 w-full h-full relative" id="win-p4"></div>
	</div>
	<div class="win-box w-full h-full absolute origin-bottom-right p-[0.5%]" id="win-box4">
		<div class="win-pawn-box bg-player1 w-full h-full relative" id="win-p1">
			<div class="" id="test">{$points[0]}</div>
		</div>
	</div>
</div>

<style>
	#win-box1 {
		transform: translate(-50%, -50%) rotate(45deg);
	}
	#win-box2 {
		transform: translate(-50%, -50%) rotate(135deg);
	}
	#win-box3 {
		transform: translate(-50%, -50%) rotate(225deg);
	}
	#win-box4 {
		transform: translate(-50%, -50%) rotate(315deg);
	}
	#test {
		transform: rotate(45deg);
	}
</style>