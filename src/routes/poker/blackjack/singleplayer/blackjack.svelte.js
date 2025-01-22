import { CardDeck } from "$lib/cardDeck.js";
import House from "./house.svelte.js";

export default class Blackjack {
	bets = $state({});
	activeRound = $state(false)
	turn = $state(0)

	constructor() {
		this.deck = new CardDeck();
		this.players = [];
		this.dealer = new House();
		this.deck.shuffle();
		this.bets = {};
		this.activeRound = false;
		this.turn = 0;
	}

	nextTurn() {
		this.turn++;
		if (this.turn >= this.players.length) {
			this.turn = 0;
			this.dealersTurn();
		}
	}

	dealersTurn() {
		this.dealer.show2ndCard();
		while (this.dealer.value < 17) {
			this.dealer.addCard(this.deck.draw());
		}
		this.endRound();
	}

	endRound() {
		if (this.dealer.value > 21) {
			this.players.forEach(player => {
				if (player.value <= 21) {
					player.chips += this.bets[player] * 2;
				}
			});
		}
		else {
			this.players.forEach(player => {
				if (player.value > this.dealer.value && player.value <= 21) {
					player.chips += this.bets[player] * 2;
				}
			});
		}
		this.activeRound = false;
		this.bets = {};
	}

	addPlayer(player) {
		this.players.push(player);
	}

	addBet(player, amount) {
		if (player.bet(amount)) {
			if (!this.bets[player]) {
				this.bets[player] = 0;
			}
			this.bets[player] += amount;
			return true;
		}
		return false;
	}

	get turnPlayer() {
		return this.players[this.turn];
	}

	getBet(player) {
		return this.bets[player];
	}

	startRound() {
		this.activeRound = true;
		this.players.forEach(player => {
			player.resetHand();
			player.stands = false;
		});
		this.dealer.resetHand();
		this.dealer.hide2ndCard = true;
		this.turn = 0;
		this.resetDeck();
	}

	shuffleDeck() {
		this.deck.shuffle();
	}
	resetDeck() {
		this.deck = new CardDeck();
		this.deck.shuffle();
	}
	
	deal() {
		this.startRound();
		for (const player of this.players) {
			if (!this.bets[player]) return;
		}
		for (let i = 0; i < 2; i++) {
			this.players.forEach(player => {
				player.addCard(this.deck.draw());
			});
			this.dealer.addCard(this.deck.draw());
		}
	}

	hit(player) {
		if (!this.activeRound) return;
		if (player.value > 21) return;
		if (this.players[this.turn] !== player) return;
		player.addCard(this.deck.draw());
		if (player.value >= 21) {
			this.stand(player);
		}
	}

	stand(player) {
		if (!this.activeRound) return;
		if (this.players[this.turn] !== player) return;
		this.nextTurn();
		player.stands = true;
	}
}
