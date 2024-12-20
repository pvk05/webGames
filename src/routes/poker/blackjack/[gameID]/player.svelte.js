import { CardDeck } from "$lib/cardDeck.js";

class Blackjack {
	constructor() {
		this.deck = new CardDeck();
		this.players = [new Player()];
	}

	addPlayer(player) {
		this.players.push(player);
	}

	
}

class Player {
	chips = $state(1000)

	constructor() {
		this.hand = [];
		this.handValue = 0;
	}

	getHandValue() {
		return this.handValue;
	}

	getHand() {
		return this.hand;
	}

	addCard(card) {
		this.hand.push(card);
		this.handValue += card.getValue();
	}

	resetHand() {
		this.hand = [];
		this.handValue = 0;
	}

	getChips() {
		return this.chips;
	}

	bet(amount) {
		if (amount > this.chips) {
			return false;
		}
		this.chips -= amount;
		return true;
	}
}

export { Player, Blackjack };