import { browser } from "$app/environment";
let homes;
if(browser) {
    homes = {
    p1: [
        document.getElementById('p1home#1'),
        document.getElementById('p1home#2'),
        document.getElementById('p1home#3'),
        document.getElementById('p1home#4')
    ],
    p2: [
        document.getElementById('p2home#1'),
        document.getElementById('p2home#2'),
        document.getElementById('p2home#3'),
        document.getElementById('p2home#4')
    ],
    p3: [
        document.getElementById('p3home#1'),
        document.getElementById('p3home#2'),
        document.getElementById('p3home#3'),
        document.getElementById('p3home#4')
    ],
    p4: [
        document.getElementById('p4home#1'),
        document.getElementById('p4home#2'),
        document.getElementById('p4home#3'),
        document.getElementById('p4home#4')
    ]
}
}


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
        this.pawns = [];
    }
}

function createPlayer(name, color) {
    const player = new Player(name, color);
    console.log('Player created');
    return player;
}

class Pawn {
    constructor(name, element) {
        this.name = name;
        this.element = element;
    }
}

function createPawn(name) {
    const pawn = new Pawn(name);
    console.log('Pawn created');
    return pawn;
}

export function createGame(players) {
    const game = new Game(players);
    //let pieces = createPieces(1);
    for (let i = 0; i < players; i++) {
        game.addPlayer(createPlayer(`Player ${i}`));
        
        for (let j = 0; j < 4; j++) {
            let home = homes[`p${i+1}`][j];
            home.innerHTML = `<Piece player={${i+1}} num={${j+1}} />`
            game.players[i].pawns.push(createPawn(`Pawn ${j}`));
            game.players[i].pawns[j].element = document.getElementById(`p${i+1}piece#${j+1}`);
        }
    }


    console.log('Game created');
    
    startGame(game)
}

export function startGame(game) {
    console.log('Game started');
    console.log(game);
}