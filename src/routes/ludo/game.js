import { browser } from "$app/environment";
import { get, writable } from "svelte/store";
import Piece from './components/piece.svelte';

// game state
export let gameState = writable("not started");

// player turn
export let playerTurn = writable(1);

export let points = writable([0, 0, 0, 0]);

// store for roll
export var roll = writable(null);

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
 * @returns { Object } - Player object
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
 * @property { String } name - Pawn name
 * @property { Object } element - Pawn element
 * @property { String } pos - Pawn position
 * @property { Number } steps - Pawn steps
 */
class Pawn {
    constructor(name, element, pos) {
        this.name = name;
        this.element = element;
        this.pos = pos;
        this.steps = 0;
    }
}

// game object
export let game;


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
    const pawn = game.players[player-1].pawns[num]; //get pawn
    let newID; //new position
    let newSpot; //new position element

    if(pawn.pos === 'home') { //if pawn is in home
        if(get(roll) !== 6) return; //if roll is not 6, return

        moveOut(pawn, player, num); //move pawn out

        roll.set(null); //reset roll

        return;

    } 

    // function to loop through steps
    function loop(i) { 
        setTimeout(function () {   

            newID = pawn.pos + 1; //new position
            pawn.steps++; //add steps

            if(newID > 52) newID -= 52; //if new position is greater than 52, set new position to new position - 52

            // if pawn is finished
            if(pawn.steps > 57) { //if steps is greater than 52
                points.update(n => {
                    n[player-1] += 1;
                    return n;
                });
                console.log(points);
                pawn.element.$destroy(); //destroy pawn
                roll.set(null); //reset roll
                return;
            }
            // if pawn is on finish path
            else if ( pawn.steps > 52 ) {
                moveIn(pawn, player, num, pawn.steps - 52); //move pawn in to finish
            }
            // if pawn is on normal path
            else {
                newSpot = document.getElementById(`path-${newID}`); //get new position element

                movePawn(pawn, newID, newSpot, player, num); //move pawn
            }

            if (--i) loop(i); // iteration counter
            else checkForOtherPieces(newSpot, player, pawn, newID, num); //check for other pieces
        }, 300) // delay
    }
    loop(get(roll)); // iterations count 

    roll.set(null); //reset roll

    if (player === game.playerNumber) playerTurn.set(1); //if player is last player, set player turn to 1
    else playerTurn.update(n => n+1); //else increment player turn
}

/**
 * Function to move the pawn to new position
 * @param { Object } pawn - Pawn object
 * @param { * } newPos - New position
 * @param { Element } newTarget - New position element
 * @param { Number } player - Player number
 * @param { Number } num - Pawn number
 * @returns 
 */
function movePawn(pawn, newPos, newTarget, player, num) {
    // destroy pawn
    pawn.element.$destroy();
    // create new pawn
    pawn.element = new Piece({
        props: {
            player: player,
            num: num
        },
        target: newTarget
    });
    // set new position
    pawn.pos = newPos;
    return;
}

/**
 * Function to move pawn out of home
 * @param { Object } pawn - Pawn object
 * @param { Number } player - Player number
 * @param { Number } num - Pawn number
 * @returns 
 */
function moveOut(pawn, player, num) {
    // destroy pawn
    pawn.element.$destroy();
    // create new pawn
    pawn.element = new Piece({
        props: {
            player: player,
            num: num
        },
        target: document.getElementById(`path-${playerStartPaths[player]}`)
    });
    // set new position
    pawn.pos = playerStartPaths[player];

    // check for other pieces
    checkForOtherPieces(document.getElementById(`path-${playerStartPaths[player]}`), player, pawn, playerStartPaths[player], num);

    return;
}

/**
 * Function to move pawn in to finish
 * @param { Object } pawn - Pawn object
 * @param { Number} player - Player number
 * @param { Number } num - Pawn number
 * @param { Number } newID - New position
 * @returns 
 */
function moveIn(pawn, player, num, newID) {
    // destroy pawn
    pawn.element.$destroy();
    // create new pawn
    pawn.element = new Piece({ 
        props: {
            player: player,
            num: num
        },
        target: document.getElementById(`p${player}-in-${newID}`)
    });
    // set new position
    pawn.pos = 'in-' + newID;
    return;
}

/**
 * Function to check for other pieces
 * @param { Element } newSpot - New position element
 * @param { Number } player - Player number
 * @param { Number} pawn - Pawn object
 * @param { Number } newID - New position
 * @param { Number } num - Pawn number
 */
function checkForOtherPieces(newSpot, player, pawn, newID, num) {
    // if new position has more than one child
    if (newSpot.childNodes.length > 2) { //if new position has more than one child

        // loop through children
        for (let i = 0; i < newSpot.childNodes.length; i++) {
            let element = newSpot.childNodes[i];

            if (!element.id) continue; //if element has no id, continue

            let otherPiecePlayer = parseInt(element.id[1]); //get other piece player number
            //if other piece player number is equal to player number
            if(otherPiecePlayer === player) { 
                newID++; // increment new position
                pawn.steps++; // increment steps
                newSpot = document.getElementById(`path-${newID}`); // get new position element
                movePawn(pawn, newID, newSpot, player, num); // move pawn
            } 
            //if other piece player number is not equal to player number
            else {
                let otherNum = parseInt(element.id[8]); // get other piece number
                let otherPawn = game.players[otherPiecePlayer - 1].pawns[otherNum]; // get other piece
                otherPawn.steps = 0; // reset other piece steps
                movePawn(otherPawn, 'home', homes[`p${otherPiecePlayer}`][otherNum], otherPiecePlayer, otherNum); // move other piece to home
            }
        }
    }
}

// subscribe to points
points.subscribe(value => {
    // check for winner
    // if any player has 4 points, set game state to won
    if(value[0] === 4) {
        gameState.set("p1 won"); //set game state to p1 won
    }
    else if(value[1] === 4) {
        gameState.set("p2 won"); //set game state to p2 won
    }
    else if(value[2] === 4) {
        gameState.set("p3 won"); //set game state to p3 won
    }
    else if(value[3] === 4) {
        gameState.set("p4 won"); //set game state to p4 won
    }
});

// subscribe to game state
gameState.subscribe(value => {
    // if game state is won, set roll to null and alert winner
    if(value === "p1 won" || value === "p2 won" || value === "p3 won" || value === "p4 won") {
        roll.set(null);
        alert(value.toUpperCase());
    }
});