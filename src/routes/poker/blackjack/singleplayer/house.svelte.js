import Player from "./player.svelte.js";

export default class House extends Player {
	hide2ndCard = $state(true)

	constructor() {
		super();
	}

	show2ndCard() {
		this.hide2ndCard = false;
	}
}
