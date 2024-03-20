<script>
	export let player;

	const color = "bg-player" + player;
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