// my-game.js
//import { Client } from 'boardgame.io/react';
import { Game } from 'boardgame.io/core';

const MyGame = Game({
    // Define your game state and rules here.
    // ...
    // The name of the game.
    name: 'tic-tac-toe',

    // Function that returns the initial value of G.
    // setupData is an optional custom object that is
    // passed through the Game Creation API.
    setup: ({ ctx, ...plugins }, setupData) => G,

    // Optional function to validate the setupData before
    // matches are created. If this returns a value,
    // an error will be reported to the user and match
    // creation is aborted.
    validateSetupData: (setupData, numPlayers) => 'setupData is not valid!',

    moves: {
        // short-form move.
        A: ({ G, ctx, playerID, events, random, ...plugins }, ...args) => { },

        // long-form move.
        B: {
            // The move function.
            move: ({ G, ctx, playerID, events, random, ...plugins }, ...args) => { },
            // Prevents undoing the move.
            // Can also be a function: ({ G, ctx }) => true/false
            undoable: false,
            // Prevents the move arguments from showing up in the log.
            redact: true,
            // Prevents the move from running on the client.
            client: false,
            // Prevents the move counting towards a player’s number of moves.
            noLimit: true,
            // Processes the move even if it was dispatched from an out-of-date client.
            // This can be risky; check the validity of the state update in your move.
            ignoreStaleStateID: true,
        },
    },

    // Everything below is OPTIONAL.
});

export { MyGame };
