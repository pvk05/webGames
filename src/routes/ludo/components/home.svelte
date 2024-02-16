<script>
    import Piece from "./piece.svelte";


	export let player;

	const color = "bg-player" + player;

	export function c(p) {
		console.log("createPieces", p);
		if(player != p) return;
		let pieces = [];
		for (let i = 1; i <= 4; i++) {
			pieces.push(`<Piece player={${player}} num={${i}} />`);
			document.getElementById("p" + player + "home#" + i).innerHTML = pieces[i - 1];
		}
		return pieces;
	}
</script>

<div id="home{player}" class="home w-[40%] h-full {color} inline-block align-top p-[5%]">

		<div class="row h-1/2 bg-white">
			<div class="w-1/2 h-full p-[10%] inline-block align-top">
				<div id="p{player}home#1" class=" w-full h-full {color} rounded-full grid content-center">
					
				</div>
			</div
			><div class="w-1/2 h-full p-[10%] inline-block align-top">
				<div id="p{player}home#2" class=" w-full h-full {color} rounded-full grid content-center">
					
				</div>
			</div>
		</div
		><div class="row h-1/2 bg-white">
			<div class="w-1/2 h-full p-[10%] inline-block align-top">
				<div id="p{player}home#3" class=" w-full h-full {color} rounded-full grid content-center">
					
				</div>
			</div
			><div class="w-1/2 h-full p-[10%] inline-block align-top">
				<div id="p{player}home#4" class=" w-full h-full {color} rounded-full grid content-center">

				</div>
			</div>
		</div>
		
</div>