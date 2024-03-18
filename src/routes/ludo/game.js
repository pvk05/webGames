import { browser } from "$app/environment";
import { get, writable } from "svelte/store";
import Piece from './components/piece.svelte';

// game state
export let gameState = writable("not started");

// player turn
export let playerTurn = writable(1);

// player start paths
const playerStartPaths = {
    1: 1,
    2: 14,
    3: 27,
    4: 40
}

// home elements
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


/**
 * Game class
 * @class Game
 * @param { Number } numOfPlayers - Number of players
 * @property { Array } players - Array of players
 * @property { Number } playerNumber - Number of players
 * @method addPlayer - Method to add player to game
 */
class Game {
    constructor(numOfPlayers) {
        this.players = [];
        this.playerNumber = numOfPlayers;
    }
    addPlayer(player) {
        this.players.push(player);
    }
}


/**
 * Player class
 * @class Player
 * @param { String } name - Player name
 * @param { String } homePath - Player home path
 * @property { Array } pawns - Array of pawns
 * @property { String } homePath - Player home path
 */
class Player {
    constructor(name, homePath) {
        this.name = name;
        this.pawns = [];
        this.homePath = homePath;
    }
}


/**
 * Function to create players
 * @param { String } name - Player name
 * @param { String } color - Player color
 * @returns 
 */
function createPlayer(name, color) {
    const player = new Player(name, color);
    console.log('Player created');
    return player;
}


/**
 * Pawn class
 * @class Pawn
 * @param { String } name - Pawn name
 * @param { Object } element - Pawn element
 * @param { String } pos - Pawn position
 */
class Pawn {
    constructor(name, element, pos) {
        this.name = name;
        this.element = element;
        this.pos = pos
        this.heading = 'out';
        this.steps = 0;
    }
}

let game; //game object


/**
 * Function to create game
 * @param { Number } players - Number of players
 * @returns 
 */
export function createGame(players) {
    if(get(gameState) !== "not started") return; //if game is already started, return
    game = new Game(players); //create game
    
    // create players
    for (let i = 0; i < players; i++) {
        game.addPlayer(createPlayer(`Player ${i}`)); //add player to game
        const player = game.players[i]; 
        
        // create pawns
        for (let j = 0; j < 4; j++) {
            // get home
            let home = homes[`p${i+1}`][j];

            // create pawn
            const pawn = new Pawn(
                `Pawn ${j}`, 
                new Piece({
                    props: {
                        player: i+1, 
                        num: j
                    },
                    target: home
                }), 
                'home'
            );

            player.pawns.push(pawn); //add pawn to player
        }
    }


    console.log('Game created');
    
    startGame(game) //start game
}


/**
 * Function to start game
 * @param { Object } game - The game object
 */
export function startGame(game) {
    gameState.set("started");
    console.log('Game started');
    console.log(game);
}


/**
 * Function to move pawn
 * @param { Number } player Player number
 * @param { Number } num Pawn number
 * @returns 
 */
export function move(player, num) {
    if(player !== get(playerTurn)) return; //if player is not current player, return
    if(!get(roll)) return; //if no roll, return
    console.log('move');
    const pawn = game.players[player-1].pawns[num]; //get pawn
    let newID; //new position

    if(pawn.pos === 'home') { //if pawn is in home
        if(get(roll) !== 6) return; //if roll is not 6, return

        newID = playerStartPaths[player]; //set new position to start path
    } else { //if pawn is on path
        newID = parseInt(pawn.pos) + get(roll); //set new position to current position + roll
    }

    if(newID > 52) newID -= 52; //if new position is greater than 52, set new position to new position - 52

    let newSpot = document.getElementById(`path-${newID}`); //get new position element
    while (newSpot.hasChildNodes()) { //if new position has child nodes
        let otherPlayer = parseInt(newSpot.childNodes[0].id[1]);
        if (otherPlayer === player) { //if other player is same as current player
            newID++; //increment new position
            newSpot = document.getElementById(`path-${newID}`); //get new position element
        } else { //if other player is different
            //send other pawn home
            let otherNum = parseInt(newSpot.childNodes[0].id[8]); //get pawn number
            let otherPawn = game.players[otherPlayer - 1].pawns[otherNum]; //get pawn
            otherPawn.element.$destroy(); //destroy pawn element
            otherPawn.pos = 'home'; //set pawn position to home
            otherPawn.element = new Piece({ //create new pawn element
                props: {
                    player: otherPlayer,
                    num: otherNum
                },
                target: homes[`p${otherPlayer}`][otherNum] //set target to home
            });
        }
    }

    pawn.element.$destroy(); //destroy pawn element
    pawn.element = new Piece({ //create new pawn element
        props: {
            player: player, 
            num: num
        },
        target: newSpot
    });
    pawn.pos = newID; //set pawn position to new position

    roll.set(null); //reset roll

    if( pawn.heading === 'out') return; //if pawn is heading out, return and do not change player turn
    else if (player === game.playerNumber) playerTurn.set(1); //if player is last player, set player turn to 1
    else playerTurn.update(n => n+1); //else increment player turn
}

// store for roll
export var roll = writable(null);