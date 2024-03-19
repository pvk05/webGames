import { browser } from "$app/environment";
import { get, writable } from "svelte/store";
import Piece from './components/piece.svelte';

// game state
export let gameState = writable("not started");

// player turn
export let playerTurn = writable(1);

export let points = writable([0, 0, 0, 0]);

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

export let game; //game object


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
    console.log(game.players[player-1].pawns, num, pawn)
    let newID; //new position
    let newSpot; //new position element

    if(pawn.pos === 'home') { //if pawn is in home
        if(get(roll) !== 6) return; //if roll is not 6, return

        moveOut(pawn, player, num); //move pawn out

        roll.set(null); //reset roll

        return;

    } 

    function loop(i) { 
        setTimeout(function () {   
     
            console.log("step"+i); // your code

            newID = pawn.pos + 1; //new position
            pawn.steps++; //add steps

            if(newID > 52) newID -= 52; //if new position is greater than 52, set new position to new position - 52

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
            else if ( pawn.steps > 52 ) {
                moveIn(pawn, player, num, pawn.steps - 52); //move pawn in to finish
            }
            else {
                newSpot = document.getElementById(`path-${newID}`); //get new position element

                movePawn(pawn, newID, newSpot, player, num); //move pawn
            }

            


            if (--i) loop(i); // iteration counter
        }, 300) // delay
    }
    loop(get(roll)); // iterations count 

    //checkForOtherPieces(newSpot, player, pawn, newID, num); //check for other pieces

    roll.set(null); //reset roll

    console.log(pawn);

    if (player === game.playerNumber) playerTurn.set(1); //if player is last player, set player turn to 1
    else playerTurn.update(n => n+1); //else increment player turn
}

// store for roll
export var roll = writable(null);

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
    console.log("movePawn", pawn, newPos, newTarget, player, num)
    pawn.element.$destroy();
    pawn.element = new Piece({
        props: {
            player: player,
            num: num
        },
        target: newTarget
    });
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
    pawn.element.$destroy();
    pawn.element = new Piece({
        props: {
            player: player,
            num: num
        },
        target: document.getElementById(`path-${playerStartPaths[player]}`)
    });
    pawn.pos = playerStartPaths[player];

    //checkForOtherPieces(document.getElementById(`path-${playerStartPaths[player]}`), player, pawn, playerStartPaths[player], num);

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
    console.log("moveIn", pawn, player, num, newID)
    pawn.element.$destroy();
    pawn.element = new Piece({
        props: {
            player: player,
            num: num
        },
        target: document.getElementById(`p${player}-in-${newID}`)
    });
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
    while (newSpot.hasChildNodes()) { //if new position has child nodes
        let otherPlayer = parseInt(newSpot.childNodes[0].id[1]);

        if (otherPlayer === player) { //if other player is same as current player
            newID++; //increment new position
            pawn.steps++; //add steps
            newSpot = document.getElementById(`path-${newID}`); //get new position element
            movePawn( 
                pawn, 
                newID, 
                newSpot, 
                player, 
                num
            ); //move pawn
        } 
        else { //if other player is different
            //send other pawn home
            let otherNum = parseInt(newSpot.childNodes[0].id[8]); //get pawn number
            let otherPawn = game.players[otherPlayer - 1].pawns[otherNum]; //get pawn

            movePawn(
                otherPawn, 
                'home', 
                homes[`p${otherPlayer}`][otherNum], 
                otherPlayer, 
                otherNum
            );
        }
    }
}

points.subscribe(value => {
    if(value[0] === 4) {
        gameState.set("p1 won");
    }
    else if(value[1] === 4) {
        gameState.set("p2 won");
    }
    else if(value[2] === 4) {
        gameState.set("p3 won");
    }
    else if(value[3] === 4) {
        gameState.set("p4 won");
    }
});

gameState.subscribe(value => {
    if(value === "p1 won" || value === "p2 won" || value === "p3 won" || value === "p4 won") {
        roll.set(null);
        alert(value.toUpperCase());
    }
});