<style>
	#leftcolumn {
    	width: 350px;
    	float: left;
	}

	table {
    	width: 100%;
	}

	tr {
    	height: 50px;
    	border: 2px solid black;
	}
</style>

<div id="leftcolumn">
	<table id="resourceSelector">
		<tr onclick="clickedResource('resource')">
			<td style="border: none; vertical-align:middle; text-align:center; width: 50px;">
				<i class="fa-brands fa-github fa-2x"></i>
			</td>
			<td style="border: none; vertical-align:middle; text-align:center; width: 100px;">
				<span>Resource</span>
			</td>
			<td style="border: none; vertical-align:middle; text-align:center;">
				<span id="resourcePSec">0</span>/Sec
			</td>
			<td style="border: none; vertical-align:middle; text-align:center;">
				<span id="resourceAmount">
					0
				</span>
				/
				<span id="resourceStorage">
					64
				</span>
			</td>
		</tr>
		<tr onclick="clickedResource('energy')">
			<td style="border: none; vertical-align:middle; text-align:center; width: 50px;">
				<i class="fa-solid fa-bolt fa-2x"></i>
			</td>
			<td style="border: none; vertical-align:middle; text-align:center;">
				<span>Energy</span>
			</td>
			<td style="border: none; vertical-align:middle; text-align:center;">
				<span id="energyPSec">0</span>/Sec
			</td>
			<td style="border: none; vertical-align:middle; text-align:center;">
				<span id="energyAmount">
					0
				</span>
				/
				<span id="energyStorage">
					64
				</span>
			</td>
		</tr>
		<tr onclick="clickedResource('wood')">
			<td style="border: none; vertical-align:middle; text-align:center; width: 50px;">
				<i class="fa-solid fa-tree fa-2x"></i>
			</td>
			<td style="border: none; vertical-align:middle; text-align:center; width: 100px;">
				<span>Wood</span>
			</td>
			<td style="border: none; vertical-align:middle; text-align:center;">
				<span id="woodPSec">0</span>/Sec
			</td>
			<td style="border: none; vertical-align:middle; text-align:center;">
				<span id="woodAmount">
					0
				</span>
				/
				<span id="woodStorage">
					64
				</span>
			</td>
		</tr>
		<tr onclick="clickedResource('water')">
			<td style="border: none; vertical-align:middle; text-align:center; width: 50px;">
				<i class="fa-solid fa-droplet fa-2x"></i>
			</td>
			<td style="border: none; vertical-align:middle; text-align:center;">
				<span>Water</span>
			</td>
			<td style="border: none; vertical-align:middle; text-align:center;">
				<span id="waterPSec">0</span>/Sec
			</td>
			<td style="border: none; vertical-align:middle; text-align:center;">
				<span id="waterAmount">
					0
				</span>
				/
				<span id="waterStorage">
					64
				</span>
			</td>
		</tr>
	</table>
</div>