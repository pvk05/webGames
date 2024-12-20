
var pics = import.meta.glob('$lib/assets/cards/*.png', { eager: true })

const cardImages = Object.fromEntries(
	Object.entries(pics).map(([key, value]) => {
		const cardName = key.replace('/src/lib/assets/cards/', '').replace('.png', '');
		return [cardName, value.default]; // Eager mode gives the `default` path
	})
);
console.log(cardImages);

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"];

class CardDeck {
	constructor() {
		this.deck = [];
		this.reset();
	}
	shuffle() {
		for (let i = this.deck.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
		}
	}
	reset() {
		var deck = [];
		for (var suit of suits) {
			for (var value of values) {
				var card = new Card(suit, value);
				deck.push(card);
			}
		}
		this.deck = deck;
	}
	draw() {
		return this.deck.pop();
	}
}

class Card {
	constructor(suit, value) {
		this.suit = suit;
		this.value = value;
		this.imageKey = `${value}_of_${suit}`; // Match the file naming convention
	}
	get() {
		return `${this.value} of ${this.suit}`;
	}
	getPic() {
		return cardImages[this.imageKey] || null;
	}
}

export { CardDeck, Card };