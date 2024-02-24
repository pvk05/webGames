import PlayerHand from './playerHand.svelte';

// Define the Card class
class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
}

// Define the Player class
class Player {
    constructor(name) {
        this.name = name;
        this.id = this.name.toLowerCase().replace(' ', '');
        this.hand = [];
        this.secretCards = [];
        this.topCards = [];
    }
    addToHand(card) {
        return this.hand.push(card);
    }
    addToSecret(card) {
        return this.secretCards.push(card);
    }
    addToTop(card) {
        return this.topCards.push(card);
    }
    removeFromHand(card) {
        return this.hand.splice(this.hand.indexOf(card), 1);
    }
    removeFromSecret(card) {
        return this.secretCards.splice(this.secretCards.indexOf(card), 1);
    }
    removeFromTop(card) {
        return this.topCards.splice(this.topCards.indexOf(card), 1);
    }
}

// Create a deck of cards
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];

// Function to create a deck of cards
function createDeck() {
    const deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push(new Card(suit, value));
        }
    }
    return deck;
}

// Function to shuffle the deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Function to start the game
export function startGame() {

    // Create players
    const players = [];

    const handText = document.createElement('h4');
    handText.innerText = 'Hand: ';

    const secretText = document.createElement('h4');
    secretText.innerText = 'Secret: ';

    const topText = document.createElement('h4');
    topText.innerText = 'Top: ';

    for (let i = 0; i < 2; i++) {
        // Create a player object
        const player = new Player('Player ' + (i + 1));
        players.push(player);

        // Create a player element
        const playerElement = document.createElement('div');
        playerElement.id = player.id;

        // Create a player name element
        const playerNameElement = document.createElement('h3');
        playerNameElement.innerText = player.name;
        playerElement.appendChild(playerNameElement);

        // Create a player hand element
        playerElement.appendChild(handText.cloneNode(true));
        const playerHandElement = document.createElement('div');
        playerHandElement.id = player.id + '_hand';
        playerElement.appendChild(playerHandElement);

        // Create a player secret element
        playerElement.appendChild(secretText.cloneNode(true));
        const playerSecretElement = document.createElement('div');
        playerSecretElement.id = player.id + '_secret';
        playerElement.appendChild(playerSecretElement);

        // Create a player top element
        playerElement.appendChild(topText.cloneNode(true));
        const playerTopElement = document.createElement('div');
        playerTopElement.id = player.id + '_top';
        playerElement.appendChild(playerTopElement);

        // Add the player element to the page
        document.getElementById('players').appendChild((PlayerHand.arguments));

    }
    console.log(players);


    // Create a deck of cards
    const deck = createDeck();
    
    // Shuffle the deck
    shuffleDeck(deck);

    dealCards(players, deck);

    // Print the hands
    console.log('Player 1 hand:', players[0].hand);
    console.log('Player 2 hand:', players[1].hand);
}

function dealCards(players, deck) {
    for (let i = 0; i < 3; i++) {
        for (const player of players) {
            const playerHandElement = document.getElementById(player.id + '_hand');
            const playerSecretElement = document.getElementById(player.id + '_secret');
            const playerTopElement = document.getElementById(player.id + '_top');

            // Add the card to the player's hand
            player.addToHand(deck.pop());
            const cardElement = createCard(player.hand[player.hand.length - 1]);
            playerHandElement.appendChild(cardElement);

            // Add the card to the player's secret
            player.addToSecret(deck.pop());
            const secretElement = createCard(player.secretCards[player.secretCards.length - 1]);
            playerSecretElement.appendChild(secretElement);

            // Add the card to the player's top
            player.addToTop(deck.pop());
            const topElement = createCard(player.topCards[player.topCards.length - 1]);
            playerTopElement.appendChild(topElement);
            
        }
    }
}

function createCard(card) {
    const cardElement = document.createElement('div');
    cardElement.innerText = card.value + ' of ' + card.suit;
    return cardElement;
}