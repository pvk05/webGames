
export default class Player {
	chips = $state(1000)
	hand = $state([])
	stands = $state(false)

	constructor() {
		this.hand = [];
	}

	get value() {
		let aces = 0;
		let value = 0;
		for (const card of this.hand) {
			if (card.value === "ace") {
				value += 11;
				aces++;
			}
			else if (["jack", "queen", "king"].includes(card.value)) {
				value += 10;
			}
			else {
				value += card.value;
			}
		}
		while (value > 21 && aces > 0) {
			value -= 10;
			aces--;
		}
		return value;
	}

	addCard(card) {
		this.hand.push(card);
	}

	resetHand() {
		this.hand = [];
		this.handValue = 0;
	}

	bet(amount) {
		if (amount > this.chips) {
			return false;
		}
		this.chips -= amount;
		return true;
	}
}
