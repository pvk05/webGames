import { get, writable } from "svelte/store";

export let playerNames = writable(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
export let numberOfPlayers = writable(2);

class Game {
    constructor(numOfPlayers) {
        this.players = [];
        this.playerNumber = numOfPlayers;
    }
    addPlayer(player) {
        this.players.push(player);
    }
}

class Player {
    constructor(name) {
        this.name = name;
    }
}

function createPlayer(name, color) {
    const player = new Player(name, color);
    console.log('Player created');
    return player;
}

export function createGame() {
    const game = new Game(get(numberOfPlayers));

    for (let i = 0; i < get(numberOfPlayers); i++) {
        const player = createPlayer(get(playerNames)[i]);
        game.addPlayer(player);
    }


    console.log('Game created');
    
    startGame(game)
}

export function startGame(game) {
    console.log('Game started');
    console.log(game);
}