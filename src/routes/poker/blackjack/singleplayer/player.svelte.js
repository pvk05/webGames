import { CardDeck } from "$lib/cardDeck.js";

class Blackjack {
	constructor() {
		this.deck = new CardDeck();
		this.players = [new Player()];
		this.dealer = new House();
		this.deck.shuffle();
	}

	addPlayer(player) {
		this.players.push(player);
	}

	shuffleDeck() {
		this.deck.shuffle();
	}
	resetDeck() {
		this.deck = new CardDeck();
		this.deck.shuffle();
	}
	
	deal() {
		for (let i = 0; i < 2; i++) {
			this.players.forEach(player => {
				player.addCard(this.deck.draw());
			});
			this.dealer.addCard(this.deck.draw());
		}
	}
}

class Player {
	chips = $state(1000)
	hand = $state([])

	constructor() {
		this.hand = [];
	}

	getHandValue() {
		return this
	}

	getHand() {
		return this.hand;
	}

	addCard(card) {
		this.hand.push(card);
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

class House extends Player {
	hide2ndCard = $state(true)

	constructor() {
		super();
	}

	show2ndCard() {
		this.hide2ndCard = false;
	}
}

export { Player, Blackjack };