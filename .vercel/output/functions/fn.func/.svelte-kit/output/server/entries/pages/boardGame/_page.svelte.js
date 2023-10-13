import { c as create_ssr_component, v as validate_component } from "../../../chunks/ssr.js";
import { nanoid } from "nanoid";
import produce from "immer";
import isPlainObject from "lodash.isplainobject";
import { applyPatch } from "rfc6902";
import { stringify, parse } from "flatted";
import { applyMiddleware, compose, createStore } from "redux";
const MAKE_MOVE = "MAKE_MOVE";
const GAME_EVENT = "GAME_EVENT";
const REDO = "REDO";
const RESET = "RESET";
const SYNC = "SYNC";
const UNDO = "UNDO";
const UPDATE = "UPDATE";
const PATCH = "PATCH";
const PLUGIN = "PLUGIN";
const STRIP_TRANSIENTS = "STRIP_TRANSIENTS";
const makeMove = (type, args, playerID, credentials) => ({
  type: MAKE_MOVE,
  payload: { type, args, playerID, credentials }
});
const gameEvent = (type, args, playerID, credentials) => ({
  type: GAME_EVENT,
  payload: { type, args, playerID, credentials }
});
const automaticGameEvent = (type, args, playerID, credentials) => ({
  type: GAME_EVENT,
  payload: { type, args, playerID, credentials },
  automatic: true
});
const sync = (info2) => ({
  type: SYNC,
  state: info2.state,
  log: info2.log,
  initialState: info2.initialState,
  clientOnly: true
});
const patch = (prevStateID, stateID, patch2, deltalog) => ({
  type: PATCH,
  prevStateID,
  stateID,
  patch: patch2,
  deltalog,
  clientOnly: true
});
const update$1 = (state, deltalog) => ({
  type: UPDATE,
  state,
  deltalog,
  clientOnly: true
});
const reset = (state) => ({
  type: RESET,
  state,
  clientOnly: true
});
const undo = (playerID, credentials) => ({
  type: UNDO,
  payload: { type: null, args: null, playerID, credentials }
});
const redo = (playerID, credentials) => ({
  type: REDO,
  payload: { type: null, args: null, playerID, credentials }
});
const plugin = (type, args, playerID, credentials) => ({
  type: PLUGIN,
  payload: { type, args, playerID, credentials }
});
const stripTransients = () => ({
  type: STRIP_TRANSIENTS
});
var ActionCreators = /* @__PURE__ */ Object.freeze({
  makeMove,
  gameEvent,
  automaticGameEvent,
  sync,
  patch,
  update: update$1,
  reset,
  undo,
  redo,
  plugin,
  stripTransients
});
const INVALID_MOVE = "INVALID_MOVE";
const ImmerPlugin = {
  name: "plugin-immer",
  fnWrap: (move) => (G, ctx, ...args) => {
    let isInvalid = false;
    const newG = produce(G, (G2) => {
      const result = move(G2, ctx, ...args);
      if (result === INVALID_MOVE) {
        isInvalid = true;
        return;
      }
      return result;
    });
    if (isInvalid)
      return INVALID_MOVE;
    return newG;
  }
};
class Alea {
  constructor(seed) {
    const mash = Mash();
    this.c = 1;
    this.s0 = mash(" ");
    this.s1 = mash(" ");
    this.s2 = mash(" ");
    this.s0 -= mash(seed);
    if (this.s0 < 0) {
      this.s0 += 1;
    }
    this.s1 -= mash(seed);
    if (this.s1 < 0) {
      this.s1 += 1;
    }
    this.s2 -= mash(seed);
    if (this.s2 < 0) {
      this.s2 += 1;
    }
  }
  next() {
    const t = 2091639 * this.s0 + this.c * 23283064365386963e-26;
    this.s0 = this.s1;
    this.s1 = this.s2;
    return this.s2 = t - (this.c = Math.trunc(t));
  }
}
function Mash() {
  let n = 4022871197;
  const mash = function(data) {
    const str = data.toString();
    for (let i = 0; i < str.length; i++) {
      n += str.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 4294967296;
    }
    return (n >>> 0) * 23283064365386963e-26;
  };
  return mash;
}
function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}
function alea(seed, state) {
  const xg = new Alea(seed);
  const prng = xg.next.bind(xg);
  if (state)
    copy(state, xg);
  prng.state = () => copy(xg, {});
  return prng;
}
class Random {
  /**
   * constructor
   * @param {object} ctx - The ctx object to initialize from.
   */
  constructor(state) {
    this.state = state || { seed: "0" };
    this.used = false;
  }
  /**
   * Generates a new seed from the current date / time.
   */
  static seed() {
    return Date.now().toString(36).slice(-10);
  }
  isUsed() {
    return this.used;
  }
  getState() {
    return this.state;
  }
  /**
   * Generate a random number.
   */
  _random() {
    this.used = true;
    const R = this.state;
    const seed = R.prngstate ? "" : R.seed;
    const rand = alea(seed, R.prngstate);
    const number = rand();
    this.state = {
      ...R,
      prngstate: rand.state()
    };
    return number;
  }
  api() {
    const random = this._random.bind(this);
    const SpotValue = {
      D4: 4,
      D6: 6,
      D8: 8,
      D10: 10,
      D12: 12,
      D20: 20
    };
    const predefined = {};
    for (const key in SpotValue) {
      const spotvalue = SpotValue[key];
      predefined[key] = (diceCount) => {
        return diceCount === void 0 ? Math.floor(random() * spotvalue) + 1 : [...new Array(diceCount).keys()].map(() => Math.floor(random() * spotvalue) + 1);
      };
    }
    function Die(spotvalue = 6, diceCount) {
      return diceCount === void 0 ? Math.floor(random() * spotvalue) + 1 : [...new Array(diceCount).keys()].map(() => Math.floor(random() * spotvalue) + 1);
    }
    return {
      /**
       * Similar to Die below, but with fixed spot values.
       * Supports passing a diceCount
       *    if not defined, defaults to 1 and returns the value directly.
       *    if defined, returns an array containing the random dice values.
       *
       * D4: (diceCount) => value
       * D6: (diceCount) => value
       * D8: (diceCount) => value
       * D10: (diceCount) => value
       * D12: (diceCount) => value
       * D20: (diceCount) => value
       */
      ...predefined,
      /**
       * Roll a die of specified spot value.
       *
       * @param {number} spotvalue - The die dimension (default: 6).
       * @param {number} diceCount - number of dice to throw.
       *                             if not defined, defaults to 1 and returns the value directly.
       *                             if defined, returns an array containing the random dice values.
       */
      Die,
      /**
       * Generate a random number between 0 and 1.
       */
      Number: () => {
        return random();
      },
      /**
       * Shuffle an array.
       *
       * @param {Array} deck - The array to shuffle. Does not mutate
       *                       the input, but returns the shuffled array.
       */
      Shuffle: (deck) => {
        const clone = deck.slice(0);
        let srcIndex = deck.length;
        let dstIndex = 0;
        const shuffled = new Array(srcIndex);
        while (srcIndex) {
          const randIndex = Math.trunc(srcIndex * random());
          shuffled[dstIndex++] = clone[randIndex];
          clone[randIndex] = clone[--srcIndex];
        }
        return shuffled;
      },
      _obj: this
    };
  }
}
const RandomPlugin = {
  name: "random",
  noClient: ({ api }) => {
    return api._obj.isUsed();
  },
  flush: ({ api }) => {
    return api._obj.getState();
  },
  api: ({ data }) => {
    const random = new Random(data);
    return random.api();
  },
  setup: ({ game }) => {
    let { seed } = game;
    if (seed === void 0) {
      seed = Random.seed();
    }
    return { seed };
  },
  playerView: () => void 0
};
class Events {
  constructor(flow, playerID) {
    this.flow = flow;
    this.playerID = playerID;
    this.dispatch = [];
  }
  /**
   * Attaches the Events API to ctx.
   * @param {object} ctx - The ctx object to attach to.
   */
  api(ctx) {
    const events = {
      _obj: this
    };
    const { phase, turn } = ctx;
    for (const key of this.flow.eventNames) {
      events[key] = (...args) => {
        this.dispatch.push({ key, args, phase, turn });
      };
    }
    return events;
  }
  isUsed() {
    return this.dispatch.length > 0;
  }
  /**
   * Updates ctx with the triggered events.
   * @param {object} state - The state object { G, ctx }.
   */
  update(state) {
    for (let i = 0; i < this.dispatch.length; i++) {
      const item = this.dispatch[i];
      if (item.key === "endTurn" && item.turn !== state.ctx.turn) {
        continue;
      }
      if ((item.key === "endPhase" || item.key === "setPhase") && item.phase !== state.ctx.phase) {
        continue;
      }
      const action = automaticGameEvent(item.key, item.args, this.playerID);
      state = {
        ...state,
        ...this.flow.processEvent(state, action)
      };
    }
    return state;
  }
}
const EventsPlugin = {
  name: "events",
  noClient: ({ api }) => {
    return api._obj.isUsed();
  },
  dangerouslyFlushRawState: ({ state, api }) => {
    return api._obj.update(state);
  },
  api: ({ game, playerID, ctx }) => {
    return new Events(game.flow, playerID).api(ctx);
  }
};
const LogPlugin = {
  name: "log",
  flush: () => ({}),
  api: ({ data }) => {
    return {
      setMetadata: (metadata) => {
        data.metadata = metadata;
      }
    };
  },
  setup: () => ({})
};
function isSerializable(value) {
  if (value === void 0 || value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return true;
  }
  if (!isPlainObject(value) && !Array.isArray(value)) {
    return false;
  }
  for (const key in value) {
    if (!isSerializable(value[key]))
      return false;
  }
  return true;
}
const SerializablePlugin = {
  name: "plugin-serializable",
  fnWrap: (move) => (G, ctx, ...args) => {
    const result = move(G, ctx, ...args);
    if (process.env.NODE_ENV !== "production" && !isSerializable(result)) {
      throw new Error("Move state is not JSON-serialiazable.\nSee https://boardgame.io/documentation/#/?id=state for more information.");
    }
    return result;
  }
};
const CORE_PLUGINS = [ImmerPlugin, RandomPlugin, LogPlugin, SerializablePlugin];
const DEFAULT_PLUGINS = [...CORE_PLUGINS, EventsPlugin];
const ProcessAction = (state, action, opts) => {
  opts.game.plugins.filter((plugin2) => plugin2.action !== void 0).filter((plugin2) => plugin2.name === action.payload.type).forEach((plugin2) => {
    const name = plugin2.name;
    const pluginState = state.plugins[name] || { data: {} };
    const data = plugin2.action(pluginState.data, action.payload);
    state = {
      ...state,
      plugins: {
        ...state.plugins,
        [name]: { ...pluginState, data }
      }
    };
  });
  return state;
};
const EnhanceCtx = (state) => {
  const ctx = { ...state.ctx };
  const plugins = state.plugins || {};
  Object.entries(plugins).forEach(([name, { api }]) => {
    ctx[name] = api;
  });
  return ctx;
};
const FnWrap = (fn, plugins) => {
  const reducer = (acc, { fnWrap }) => fnWrap(acc);
  return [...DEFAULT_PLUGINS, ...plugins].filter((plugin2) => plugin2.fnWrap !== void 0).reduce(reducer, fn);
};
const Setup = (state, opts) => {
  [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.setup !== void 0).forEach((plugin2) => {
    const name = plugin2.name;
    const data = plugin2.setup({
      G: state.G,
      ctx: state.ctx,
      game: opts.game
    });
    state = {
      ...state,
      plugins: {
        ...state.plugins,
        [name]: { data }
      }
    };
  });
  return state;
};
const Enhance = (state, opts) => {
  [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.api !== void 0).forEach((plugin2) => {
    const name = plugin2.name;
    const pluginState = state.plugins[name] || { data: {} };
    const api = plugin2.api({
      G: state.G,
      ctx: state.ctx,
      data: pluginState.data,
      game: opts.game,
      playerID: opts.playerID
    });
    state = {
      ...state,
      plugins: {
        ...state.plugins,
        [name]: { ...pluginState, api }
      }
    };
  });
  return state;
};
const Flush = (state, opts) => {
  [...CORE_PLUGINS, ...opts.game.plugins, EventsPlugin].reverse().forEach((plugin2) => {
    const name = plugin2.name;
    const pluginState = state.plugins[name] || { data: {} };
    if (plugin2.flush) {
      const newData = plugin2.flush({
        G: state.G,
        ctx: state.ctx,
        game: opts.game,
        api: pluginState.api,
        data: pluginState.data
      });
      state = {
        ...state,
        plugins: {
          ...state.plugins,
          [plugin2.name]: { data: newData }
        }
      };
    } else if (plugin2.dangerouslyFlushRawState) {
      state = plugin2.dangerouslyFlushRawState({
        state,
        game: opts.game,
        api: pluginState.api,
        data: pluginState.data
      });
      const data = state.plugins[name].data;
      state = {
        ...state,
        plugins: {
          ...state.plugins,
          [plugin2.name]: { data }
        }
      };
    }
  });
  return state;
};
const NoClient = (state, opts) => {
  return [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.noClient !== void 0).map((plugin2) => {
    const name = plugin2.name;
    const pluginState = state.plugins[name];
    if (pluginState) {
      return plugin2.noClient({
        G: state.G,
        ctx: state.ctx,
        game: opts.game,
        api: pluginState.api,
        data: pluginState.data
      });
    }
    return false;
  }).some((value) => value === true);
};
const PlayerView = ({ G, ctx, plugins = {} }, { game, playerID }) => {
  [...DEFAULT_PLUGINS, ...game.plugins].forEach(({ name, playerView }) => {
    if (!playerView)
      return;
    const { data } = plugins[name] || { data: {} };
    const newData = playerView({ G, ctx, game, data, playerID });
    plugins = {
      ...plugins,
      [name]: { data: newData }
    };
  });
  return plugins;
};
const production = process.env.NODE_ENV === "production";
const logfn = production ? () => {
} : (...msg) => console.log(...msg);
const errorfn = (...msg) => console.error(...msg);
function info(msg) {
  logfn(`INFO: ${msg}`);
}
function error(error2) {
  errorfn("ERROR:", error2);
}
function SetActivePlayersEvent(state, _playerID, arg) {
  return { ...state, ctx: SetActivePlayers(state.ctx, arg) };
}
function SetActivePlayers(ctx, arg) {
  let { _prevActivePlayers } = ctx;
  let activePlayers = {};
  let _nextActivePlayers = null;
  let _activePlayersMoveLimit = {};
  if (Array.isArray(arg)) {
    const value = {};
    arg.forEach((v) => value[v] = Stage.NULL);
    activePlayers = value;
  } else {
    if (arg.next) {
      _nextActivePlayers = arg.next;
    }
    _prevActivePlayers = arg.revert ? _prevActivePlayers.concat({
      activePlayers: ctx.activePlayers,
      _activePlayersMoveLimit: ctx._activePlayersMoveLimit,
      _activePlayersNumMoves: ctx._activePlayersNumMoves
    }) : [];
    if (arg.currentPlayer !== void 0) {
      ApplyActivePlayerArgument(activePlayers, _activePlayersMoveLimit, ctx.currentPlayer, arg.currentPlayer);
    }
    if (arg.others !== void 0) {
      for (let i = 0; i < ctx.playOrder.length; i++) {
        const id = ctx.playOrder[i];
        if (id !== ctx.currentPlayer) {
          ApplyActivePlayerArgument(activePlayers, _activePlayersMoveLimit, id, arg.others);
        }
      }
    }
    if (arg.all !== void 0) {
      for (let i = 0; i < ctx.playOrder.length; i++) {
        const id = ctx.playOrder[i];
        ApplyActivePlayerArgument(activePlayers, _activePlayersMoveLimit, id, arg.all);
      }
    }
    if (arg.value) {
      for (const id in arg.value) {
        ApplyActivePlayerArgument(activePlayers, _activePlayersMoveLimit, id, arg.value[id]);
      }
    }
    if (arg.moveLimit) {
      for (const id in activePlayers) {
        if (_activePlayersMoveLimit[id] === void 0) {
          _activePlayersMoveLimit[id] = arg.moveLimit;
        }
      }
    }
  }
  if (Object.keys(activePlayers).length == 0) {
    activePlayers = null;
  }
  if (Object.keys(_activePlayersMoveLimit).length == 0) {
    _activePlayersMoveLimit = null;
  }
  const _activePlayersNumMoves = {};
  for (const id in activePlayers) {
    _activePlayersNumMoves[id] = 0;
  }
  return {
    ...ctx,
    activePlayers,
    _activePlayersMoveLimit,
    _activePlayersNumMoves,
    _prevActivePlayers,
    _nextActivePlayers
  };
}
function UpdateActivePlayersOnceEmpty(ctx) {
  let { activePlayers, _activePlayersMoveLimit, _activePlayersNumMoves, _prevActivePlayers } = ctx;
  if (activePlayers && Object.keys(activePlayers).length == 0) {
    if (ctx._nextActivePlayers) {
      ctx = SetActivePlayers(ctx, ctx._nextActivePlayers);
      ({
        activePlayers,
        _activePlayersMoveLimit,
        _activePlayersNumMoves,
        _prevActivePlayers
      } = ctx);
    } else if (_prevActivePlayers.length > 0) {
      const lastIndex = _prevActivePlayers.length - 1;
      ({
        activePlayers,
        _activePlayersMoveLimit,
        _activePlayersNumMoves
      } = _prevActivePlayers[lastIndex]);
      _prevActivePlayers = _prevActivePlayers.slice(0, lastIndex);
    } else {
      activePlayers = null;
      _activePlayersMoveLimit = null;
    }
  }
  return {
    ...ctx,
    activePlayers,
    _activePlayersMoveLimit,
    _activePlayersNumMoves,
    _prevActivePlayers
  };
}
function ApplyActivePlayerArgument(activePlayers, _activePlayersMoveLimit, playerID, arg) {
  if (typeof arg !== "object" || arg === Stage.NULL) {
    arg = { stage: arg };
  }
  if (arg.stage !== void 0) {
    activePlayers[playerID] = arg.stage;
    if (arg.moveLimit)
      _activePlayersMoveLimit[playerID] = arg.moveLimit;
  }
}
function getCurrentPlayer(playOrder, playOrderPos) {
  return playOrder[playOrderPos] + "";
}
function InitTurnOrderState(state, turn) {
  let { G, ctx } = state;
  const ctxWithAPI = EnhanceCtx(state);
  const order = turn.order;
  let playOrder = [...new Array(ctx.numPlayers)].map((_, i) => i + "");
  if (order.playOrder !== void 0) {
    playOrder = order.playOrder(G, ctxWithAPI);
  }
  const playOrderPos = order.first(G, ctxWithAPI);
  const posType = typeof playOrderPos;
  if (posType !== "number") {
    error(`invalid value returned by turn.order.first — expected number got ${posType} “${playOrderPos}”.`);
  }
  const currentPlayer = getCurrentPlayer(playOrder, playOrderPos);
  ctx = { ...ctx, currentPlayer, playOrderPos, playOrder };
  ctx = SetActivePlayers(ctx, turn.activePlayers || {});
  return ctx;
}
function UpdateTurnOrderState(state, currentPlayer, turn, endTurnArg) {
  const order = turn.order;
  let { G, ctx } = state;
  let playOrderPos = ctx.playOrderPos;
  let endPhase = false;
  if (endTurnArg && endTurnArg !== true) {
    if (typeof endTurnArg !== "object") {
      error(`invalid argument to endTurn: ${endTurnArg}`);
    }
    Object.keys(endTurnArg).forEach((arg) => {
      switch (arg) {
        case "remove":
          currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
          break;
        case "next":
          playOrderPos = ctx.playOrder.indexOf(endTurnArg.next);
          currentPlayer = endTurnArg.next;
          break;
        default:
          error(`invalid argument to endTurn: ${arg}`);
      }
    });
  } else {
    const ctxWithAPI = EnhanceCtx(state);
    const t = order.next(G, ctxWithAPI);
    const type = typeof t;
    if (t !== void 0 && type !== "number") {
      error(`invalid value returned by turn.order.next — expected number or undefined got ${type} “${t}”.`);
    }
    if (t === void 0) {
      endPhase = true;
    } else {
      playOrderPos = t;
      currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
    }
  }
  ctx = {
    ...ctx,
    playOrderPos,
    currentPlayer
  };
  return { endPhase, ctx };
}
const TurnOrder = {
  /**
   * DEFAULT
   *
   * The default round-robin turn order.
   */
  DEFAULT: {
    first: (G, ctx) => ctx.turn === 0 ? ctx.playOrderPos : (ctx.playOrderPos + 1) % ctx.playOrder.length,
    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length
  },
  /**
   * RESET
   *
   * Similar to DEFAULT, but starts from 0 each time.
   */
  RESET: {
    first: () => 0,
    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length
  },
  /**
   * CONTINUE
   *
   * Similar to DEFAULT, but starts with the player who ended the last phase.
   */
  CONTINUE: {
    first: (G, ctx) => ctx.playOrderPos,
    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length
  },
  /**
   * ONCE
   *
   * Another round-robin turn order, but goes around just once.
   * The phase ends after all players have played.
   */
  ONCE: {
    first: () => 0,
    next: (G, ctx) => {
      if (ctx.playOrderPos < ctx.playOrder.length - 1) {
        return ctx.playOrderPos + 1;
      }
    }
  },
  /**
   * CUSTOM
   *
   * Identical to DEFAULT, but also sets playOrder at the
   * beginning of the phase.
   *
   * @param {Array} playOrder - The play order.
   */
  CUSTOM: (playOrder) => ({
    playOrder: () => playOrder,
    first: () => 0,
    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length
  }),
  /**
   * CUSTOM_FROM
   *
   * Identical to DEFAULT, but also sets playOrder at the
   * beginning of the phase to a value specified by a field
   * in G.
   *
   * @param {string} playOrderField - Field in G.
   */
  CUSTOM_FROM: (playOrderField) => ({
    playOrder: (G) => G[playOrderField],
    first: () => 0,
    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length
  })
};
const Stage = {
  NULL: null
};
function Flow({ moves, phases, endIf, onEnd, turn, events, plugins }) {
  if (moves === void 0) {
    moves = {};
  }
  if (events === void 0) {
    events = {};
  }
  if (plugins === void 0) {
    plugins = [];
  }
  if (phases === void 0) {
    phases = {};
  }
  if (!endIf)
    endIf = () => void 0;
  if (!onEnd)
    onEnd = (G) => G;
  if (!turn)
    turn = {};
  const phaseMap = { ...phases };
  if ("" in phaseMap) {
    error("cannot specify phase with empty name");
  }
  phaseMap[""] = {};
  const moveMap = {};
  const moveNames = /* @__PURE__ */ new Set();
  let startingPhase = null;
  Object.keys(moves).forEach((name) => moveNames.add(name));
  const HookWrapper = (fn) => {
    const withPlugins = FnWrap(fn, plugins);
    return (state) => {
      const ctxWithAPI = EnhanceCtx(state);
      return withPlugins(state.G, ctxWithAPI);
    };
  };
  const TriggerWrapper = (endIf2) => {
    return (state) => {
      const ctxWithAPI = EnhanceCtx(state);
      return endIf2(state.G, ctxWithAPI);
    };
  };
  const wrapped = {
    onEnd: HookWrapper(onEnd),
    endIf: TriggerWrapper(endIf)
  };
  for (const phase in phaseMap) {
    const conf = phaseMap[phase];
    if (conf.start === true) {
      startingPhase = phase;
    }
    if (conf.moves !== void 0) {
      for (const move of Object.keys(conf.moves)) {
        moveMap[phase + "." + move] = conf.moves[move];
        moveNames.add(move);
      }
    }
    if (conf.endIf === void 0) {
      conf.endIf = () => void 0;
    }
    if (conf.onBegin === void 0) {
      conf.onBegin = (G) => G;
    }
    if (conf.onEnd === void 0) {
      conf.onEnd = (G) => G;
    }
    if (conf.turn === void 0) {
      conf.turn = turn;
    }
    if (conf.turn.order === void 0) {
      conf.turn.order = TurnOrder.DEFAULT;
    }
    if (conf.turn.onBegin === void 0) {
      conf.turn.onBegin = (G) => G;
    }
    if (conf.turn.onEnd === void 0) {
      conf.turn.onEnd = (G) => G;
    }
    if (conf.turn.endIf === void 0) {
      conf.turn.endIf = () => false;
    }
    if (conf.turn.onMove === void 0) {
      conf.turn.onMove = (G) => G;
    }
    if (conf.turn.stages === void 0) {
      conf.turn.stages = {};
    }
    for (const stage in conf.turn.stages) {
      const stageConfig = conf.turn.stages[stage];
      const moves2 = stageConfig.moves || {};
      for (const move of Object.keys(moves2)) {
        const key = phase + "." + stage + "." + move;
        moveMap[key] = moves2[move];
        moveNames.add(move);
      }
    }
    conf.wrapped = {
      onBegin: HookWrapper(conf.onBegin),
      onEnd: HookWrapper(conf.onEnd),
      endIf: TriggerWrapper(conf.endIf)
    };
    conf.turn.wrapped = {
      onMove: HookWrapper(conf.turn.onMove),
      onBegin: HookWrapper(conf.turn.onBegin),
      onEnd: HookWrapper(conf.turn.onEnd),
      endIf: TriggerWrapper(conf.turn.endIf)
    };
  }
  function GetPhase(ctx) {
    return ctx.phase ? phaseMap[ctx.phase] : phaseMap[""];
  }
  function OnMove(s) {
    return s;
  }
  function Process(state, events2) {
    const phasesEnded = /* @__PURE__ */ new Set();
    const turnsEnded = /* @__PURE__ */ new Set();
    for (let i = 0; i < events2.length; i++) {
      const { fn, arg, ...rest } = events2[i];
      if (fn === EndPhase) {
        turnsEnded.clear();
        const phase = state.ctx.phase;
        if (phasesEnded.has(phase)) {
          const ctx = { ...state.ctx, phase: null };
          return { ...state, ctx };
        }
        phasesEnded.add(phase);
      }
      const next = [];
      state = fn(state, {
        ...rest,
        arg,
        next
      });
      if (fn === EndGame) {
        break;
      }
      const shouldEndGame = ShouldEndGame(state);
      if (shouldEndGame) {
        events2.push({
          fn: EndGame,
          arg: shouldEndGame,
          turn: state.ctx.turn,
          phase: state.ctx.phase,
          automatic: true
        });
        continue;
      }
      const shouldEndPhase = ShouldEndPhase(state);
      if (shouldEndPhase) {
        events2.push({
          fn: EndPhase,
          arg: shouldEndPhase,
          turn: state.ctx.turn,
          phase: state.ctx.phase,
          automatic: true
        });
        continue;
      }
      if (fn === OnMove) {
        const shouldEndTurn = ShouldEndTurn(state);
        if (shouldEndTurn) {
          events2.push({
            fn: EndTurn,
            arg: shouldEndTurn,
            turn: state.ctx.turn,
            phase: state.ctx.phase,
            automatic: true
          });
          continue;
        }
      }
      events2.push(...next);
    }
    return state;
  }
  function StartGame(state, { next }) {
    next.push({ fn: StartPhase });
    return state;
  }
  function StartPhase(state, { next }) {
    let { G, ctx } = state;
    const conf = GetPhase(ctx);
    G = conf.wrapped.onBegin(state);
    next.push({ fn: StartTurn });
    return { ...state, G, ctx };
  }
  function StartTurn(state, { currentPlayer }) {
    let { G, ctx } = state;
    const conf = GetPhase(ctx);
    if (currentPlayer) {
      ctx = { ...ctx, currentPlayer };
      if (conf.turn.activePlayers) {
        ctx = SetActivePlayers(ctx, conf.turn.activePlayers);
      }
    } else {
      ctx = InitTurnOrderState(state, conf.turn);
    }
    const turn2 = ctx.turn + 1;
    ctx = { ...ctx, turn: turn2, numMoves: 0, _prevActivePlayers: [] };
    G = conf.turn.wrapped.onBegin({ ...state, G, ctx });
    return { ...state, G, ctx, _undo: [], _redo: [] };
  }
  function UpdatePhase(state, { arg, next, phase }) {
    const conf = GetPhase({ phase });
    let { ctx } = state;
    if (arg && arg.next) {
      if (arg.next in phaseMap) {
        ctx = { ...ctx, phase: arg.next };
      } else {
        error("invalid phase: " + arg.next);
        return state;
      }
    } else if (conf.next !== void 0) {
      ctx = { ...ctx, phase: conf.next };
    } else {
      ctx = { ...ctx, phase: null };
    }
    state = { ...state, ctx };
    next.push({ fn: StartPhase });
    return state;
  }
  function UpdateTurn(state, { arg, currentPlayer, next }) {
    let { G, ctx } = state;
    const conf = GetPhase(ctx);
    const { endPhase, ctx: newCtx } = UpdateTurnOrderState(state, currentPlayer, conf.turn, arg);
    ctx = newCtx;
    state = { ...state, G, ctx };
    if (endPhase) {
      next.push({ fn: EndPhase, turn: ctx.turn, phase: ctx.phase });
    } else {
      next.push({ fn: StartTurn, currentPlayer: ctx.currentPlayer });
    }
    return state;
  }
  function UpdateStage(state, { arg, playerID }) {
    if (typeof arg === "string" || arg === Stage.NULL) {
      arg = { stage: arg };
    }
    let { ctx } = state;
    let { activePlayers, _activePlayersMoveLimit, _activePlayersNumMoves } = ctx;
    if (arg.stage !== void 0) {
      if (activePlayers === null) {
        activePlayers = {};
      }
      activePlayers[playerID] = arg.stage;
      _activePlayersNumMoves[playerID] = 0;
      if (arg.moveLimit) {
        if (_activePlayersMoveLimit === null) {
          _activePlayersMoveLimit = {};
        }
        _activePlayersMoveLimit[playerID] = arg.moveLimit;
      }
    }
    ctx = {
      ...ctx,
      activePlayers,
      _activePlayersMoveLimit,
      _activePlayersNumMoves
    };
    return { ...state, ctx };
  }
  function ShouldEndGame(state) {
    return wrapped.endIf(state);
  }
  function ShouldEndPhase(state) {
    const conf = GetPhase(state.ctx);
    return conf.wrapped.endIf(state);
  }
  function ShouldEndTurn(state) {
    const conf = GetPhase(state.ctx);
    const currentPlayerMoves = state.ctx.numMoves || 0;
    if (conf.turn.moveLimit && currentPlayerMoves >= conf.turn.moveLimit) {
      return true;
    }
    return conf.turn.wrapped.endIf(state);
  }
  function EndGame(state, { arg, phase }) {
    state = EndPhase(state, { phase });
    if (arg === void 0) {
      arg = true;
    }
    state = { ...state, ctx: { ...state.ctx, gameover: arg } };
    const G = wrapped.onEnd(state);
    return { ...state, G };
  }
  function EndPhase(state, { arg, next, turn: turn2, automatic }) {
    state = EndTurn(state, { turn: turn2, force: true, automatic: true });
    let G = state.G;
    let ctx = state.ctx;
    if (next) {
      next.push({ fn: UpdatePhase, arg, phase: ctx.phase });
    }
    if (ctx.phase === null) {
      return state;
    }
    const conf = GetPhase(ctx);
    G = conf.wrapped.onEnd(state);
    ctx = { ...ctx, phase: null };
    const action = gameEvent("endPhase", arg);
    const logEntry = {
      action,
      _stateID: state._stateID,
      turn: state.ctx.turn,
      phase: state.ctx.phase
    };
    if (automatic) {
      logEntry.automatic = true;
    }
    const deltalog = [...state.deltalog || [], logEntry];
    return { ...state, G, ctx, deltalog };
  }
  function EndTurn(state, { arg, next, turn: turn2, force, automatic, playerID }) {
    if (turn2 !== state.ctx.turn) {
      return state;
    }
    let { G, ctx } = state;
    const conf = GetPhase(ctx);
    const currentPlayerMoves = ctx.numMoves || 0;
    if (!force && conf.turn.moveLimit && currentPlayerMoves < conf.turn.moveLimit) {
      info(`cannot end turn before making ${conf.turn.moveLimit} moves`);
      return state;
    }
    G = conf.turn.wrapped.onEnd(state);
    if (next) {
      next.push({ fn: UpdateTurn, arg, currentPlayer: ctx.currentPlayer });
    }
    ctx = { ...ctx, activePlayers: null };
    if (arg && arg.remove) {
      playerID = playerID || ctx.currentPlayer;
      const playOrder = ctx.playOrder.filter((i) => i != playerID);
      const playOrderPos = ctx.playOrderPos > playOrder.length - 1 ? 0 : ctx.playOrderPos;
      ctx = { ...ctx, playOrder, playOrderPos };
      if (playOrder.length === 0) {
        next.push({ fn: EndPhase, turn: ctx.turn, phase: ctx.phase });
        return state;
      }
    }
    const action = gameEvent("endTurn", arg);
    const logEntry = {
      action,
      _stateID: state._stateID,
      turn: state.ctx.turn,
      phase: state.ctx.phase
    };
    if (automatic) {
      logEntry.automatic = true;
    }
    const deltalog = [...state.deltalog || [], logEntry];
    return { ...state, G, ctx, deltalog, _undo: [], _redo: [] };
  }
  function EndStage(state, { arg, next, automatic, playerID }) {
    playerID = playerID || state.ctx.currentPlayer;
    let { ctx } = state;
    let { activePlayers, _activePlayersMoveLimit } = ctx;
    const playerInStage = activePlayers !== null && playerID in activePlayers;
    if (!arg && playerInStage) {
      const conf = GetPhase(ctx);
      const stage = conf.turn.stages[activePlayers[playerID]];
      if (stage && stage.next)
        arg = stage.next;
    }
    if (next && arg !== void 0) {
      next.push({ fn: UpdateStage, arg, playerID });
    }
    if (!playerInStage)
      return state;
    activePlayers = Object.keys(activePlayers).filter((id) => id !== playerID).reduce((obj, key) => {
      obj[key] = activePlayers[key];
      return obj;
    }, {});
    if (_activePlayersMoveLimit) {
      _activePlayersMoveLimit = Object.keys(_activePlayersMoveLimit).filter((id) => id !== playerID).reduce((obj, key) => {
        obj[key] = _activePlayersMoveLimit[key];
        return obj;
      }, {});
    }
    ctx = UpdateActivePlayersOnceEmpty({
      ...ctx,
      activePlayers,
      _activePlayersMoveLimit
    });
    const action = gameEvent("endStage", arg);
    const logEntry = {
      action,
      _stateID: state._stateID,
      turn: state.ctx.turn,
      phase: state.ctx.phase
    };
    if (automatic) {
      logEntry.automatic = true;
    }
    const deltalog = [...state.deltalog || [], logEntry];
    return { ...state, ctx, deltalog };
  }
  function GetMove(ctx, name, playerID) {
    const conf = GetPhase(ctx);
    const stages = conf.turn.stages;
    const { activePlayers } = ctx;
    if (activePlayers && activePlayers[playerID] !== void 0 && activePlayers[playerID] !== Stage.NULL && stages[activePlayers[playerID]] !== void 0 && stages[activePlayers[playerID]].moves !== void 0) {
      const stage = stages[activePlayers[playerID]];
      const moves2 = stage.moves;
      if (name in moves2) {
        return moves2[name];
      }
    } else if (conf.moves) {
      if (name in conf.moves) {
        return conf.moves[name];
      }
    } else if (name in moves) {
      return moves[name];
    }
    return null;
  }
  function ProcessMove(state, action) {
    const conf = GetPhase(state.ctx);
    const move = GetMove(state.ctx, action.type, action.playerID);
    const shouldCount = !move || typeof move === "function" || move.noLimit !== true;
    const { ctx } = state;
    const { _activePlayersNumMoves } = ctx;
    const { playerID } = action;
    let numMoves = state.ctx.numMoves;
    if (shouldCount) {
      if (playerID == state.ctx.currentPlayer) {
        numMoves++;
      }
      if (ctx.activePlayers)
        _activePlayersNumMoves[playerID]++;
    }
    state = {
      ...state,
      ctx: {
        ...ctx,
        numMoves,
        _activePlayersNumMoves
      }
    };
    if (ctx._activePlayersMoveLimit && _activePlayersNumMoves[playerID] >= ctx._activePlayersMoveLimit[playerID]) {
      state = EndStage(state, { playerID, automatic: true });
    }
    const G = conf.turn.wrapped.onMove(state);
    state = { ...state, G };
    const events2 = [{ fn: OnMove }];
    return Process(state, events2);
  }
  function SetStageEvent(state, playerID, arg) {
    return Process(state, [{ fn: EndStage, arg, playerID }]);
  }
  function EndStageEvent(state, playerID) {
    return Process(state, [{ fn: EndStage, playerID }]);
  }
  function SetPhaseEvent(state, _playerID, newPhase) {
    return Process(state, [
      {
        fn: EndPhase,
        phase: state.ctx.phase,
        turn: state.ctx.turn,
        arg: { next: newPhase }
      }
    ]);
  }
  function EndPhaseEvent(state) {
    return Process(state, [
      { fn: EndPhase, phase: state.ctx.phase, turn: state.ctx.turn }
    ]);
  }
  function EndTurnEvent(state, _playerID, arg) {
    return Process(state, [
      { fn: EndTurn, turn: state.ctx.turn, phase: state.ctx.phase, arg }
    ]);
  }
  function PassEvent(state, _playerID, arg) {
    return Process(state, [
      {
        fn: EndTurn,
        turn: state.ctx.turn,
        phase: state.ctx.phase,
        force: true,
        arg
      }
    ]);
  }
  function EndGameEvent(state, _playerID, arg) {
    return Process(state, [
      { fn: EndGame, turn: state.ctx.turn, phase: state.ctx.phase, arg }
    ]);
  }
  const eventHandlers = {
    endStage: EndStageEvent,
    setStage: SetStageEvent,
    endTurn: EndTurnEvent,
    pass: PassEvent,
    endPhase: EndPhaseEvent,
    setPhase: SetPhaseEvent,
    endGame: EndGameEvent,
    setActivePlayers: SetActivePlayersEvent
  };
  const enabledEventNames = [];
  if (events.endTurn !== false) {
    enabledEventNames.push("endTurn");
  }
  if (events.pass !== false) {
    enabledEventNames.push("pass");
  }
  if (events.endPhase !== false) {
    enabledEventNames.push("endPhase");
  }
  if (events.setPhase !== false) {
    enabledEventNames.push("setPhase");
  }
  if (events.endGame !== false) {
    enabledEventNames.push("endGame");
  }
  if (events.setActivePlayers !== false) {
    enabledEventNames.push("setActivePlayers");
  }
  if (events.endStage !== false) {
    enabledEventNames.push("endStage");
  }
  if (events.setStage !== false) {
    enabledEventNames.push("setStage");
  }
  function ProcessEvent(state, action) {
    const { type, playerID, args } = action.payload;
    if (Object.prototype.hasOwnProperty.call(eventHandlers, type)) {
      const eventArgs = [state, playerID].concat(args);
      return eventHandlers[type].apply({}, eventArgs);
    }
    return state;
  }
  function IsPlayerActive(_G, ctx, playerID) {
    if (ctx.activePlayers) {
      return playerID in ctx.activePlayers;
    }
    return ctx.currentPlayer === playerID;
  }
  return {
    ctx: (numPlayers) => ({
      numPlayers,
      turn: 0,
      currentPlayer: "0",
      playOrder: [...new Array(numPlayers)].map((_d, i) => i + ""),
      playOrderPos: 0,
      phase: startingPhase,
      activePlayers: null
    }),
    init: (state) => {
      return Process(state, [{ fn: StartGame }]);
    },
    isPlayerActive: IsPlayerActive,
    eventHandlers,
    eventNames: Object.keys(eventHandlers),
    enabledEventNames,
    moveMap,
    moveNames: [...moveNames.values()],
    processMove: ProcessMove,
    processEvent: ProcessEvent,
    getMove: GetMove
  };
}
function IsProcessed(game) {
  return game.processMove !== void 0;
}
function ProcessGameConfig(game) {
  if (IsProcessed(game)) {
    return game;
  }
  if (game.name === void 0)
    game.name = "default";
  if (game.deltaState === void 0)
    game.deltaState = false;
  if (game.disableUndo === void 0)
    game.disableUndo = false;
  if (game.setup === void 0)
    game.setup = () => ({});
  if (game.moves === void 0)
    game.moves = {};
  if (game.playerView === void 0)
    game.playerView = (G) => G;
  if (game.plugins === void 0)
    game.plugins = [];
  game.plugins.forEach((plugin2) => {
    if (plugin2.name === void 0) {
      throw new Error("Plugin missing name attribute");
    }
    if (plugin2.name.includes(" ")) {
      throw new Error(plugin2.name + ": Plugin name must not include spaces");
    }
  });
  if (game.name.includes(" ")) {
    throw new Error(game.name + ": Game name must not include spaces");
  }
  const flow = Flow(game);
  return {
    ...game,
    flow,
    moveNames: flow.moveNames,
    pluginNames: game.plugins.map((p) => p.name),
    processMove: (state, action) => {
      let moveFn = flow.getMove(state.ctx, action.type, action.playerID);
      if (IsLongFormMove(moveFn)) {
        moveFn = moveFn.move;
      }
      if (moveFn instanceof Function) {
        const fn = FnWrap(moveFn, game.plugins);
        const ctxWithAPI = {
          ...EnhanceCtx(state),
          playerID: action.playerID
        };
        let args = [];
        if (action.args !== void 0) {
          args = args.concat(action.args);
        }
        return fn(state.G, ctxWithAPI, ...args);
      }
      error(`invalid move object: ${action.type}`);
      return state.G;
    }
  };
}
function IsLongFormMove(move) {
  return move instanceof Object && move.move !== void 0;
}
var UpdateErrorType;
(function(UpdateErrorType2) {
  UpdateErrorType2["UnauthorizedAction"] = "update/unauthorized_action";
  UpdateErrorType2["MatchNotFound"] = "update/match_not_found";
  UpdateErrorType2["PatchFailed"] = "update/patch_failed";
})(UpdateErrorType || (UpdateErrorType = {}));
var ActionErrorType;
(function(ActionErrorType2) {
  ActionErrorType2["StaleStateId"] = "action/stale_state_id";
  ActionErrorType2["UnavailableMove"] = "action/unavailable_move";
  ActionErrorType2["InvalidMove"] = "action/invalid_move";
  ActionErrorType2["InactivePlayer"] = "action/inactive_player";
  ActionErrorType2["GameOver"] = "action/gameover";
  ActionErrorType2["ActionDisabled"] = "action/action_disabled";
  ActionErrorType2["ActionInvalid"] = "action/action_invalid";
})(ActionErrorType || (ActionErrorType = {}));
const actionHasPlayerID = (action) => action.payload.playerID !== null && action.payload.playerID !== void 0;
const CanUndoMove = (G, ctx, move) => {
  function HasUndoable(move2) {
    return move2.undoable !== void 0;
  }
  function IsFunction(undoable) {
    return undoable instanceof Function;
  }
  if (!HasUndoable(move)) {
    return true;
  }
  if (IsFunction(move.undoable)) {
    return move.undoable(G, ctx);
  }
  return move.undoable;
};
function updateUndoRedoState(state, opts) {
  if (opts.game.disableUndo)
    return state;
  const undoEntry = {
    G: state.G,
    ctx: state.ctx,
    plugins: state.plugins,
    playerID: opts.action.payload.playerID || state.ctx.currentPlayer
  };
  if (opts.action.type === "MAKE_MOVE") {
    undoEntry.moveType = opts.action.payload.type;
  }
  return {
    ...state,
    _undo: [...state._undo, undoEntry],
    // Always reset redo stack when making a move or event
    _redo: []
  };
}
function initializeDeltalog(state, action, move) {
  const logEntry = {
    action,
    _stateID: state._stateID,
    turn: state.ctx.turn,
    phase: state.ctx.phase
  };
  const pluginLogMetadata = state.plugins.log.data.metadata;
  if (pluginLogMetadata !== void 0) {
    logEntry.metadata = pluginLogMetadata;
  }
  if (typeof move === "object" && move.redact === true) {
    logEntry.redact = true;
  }
  return {
    ...state,
    deltalog: [logEntry]
  };
}
function ExtractTransients(transientState) {
  if (!transientState) {
    return [null, void 0];
  }
  const { transients, ...state } = transientState;
  return [state, transients];
}
function WithError(state, errorType, payload) {
  const error2 = {
    type: errorType,
    payload
  };
  return {
    ...state,
    transients: {
      error: error2
    }
  };
}
const TransientHandlingMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case STRIP_TRANSIENTS: {
      return result;
    }
    default: {
      const [, transients] = ExtractTransients(store.getState());
      if (typeof transients !== "undefined") {
        store.dispatch(stripTransients());
        return {
          ...result,
          transients
        };
      }
      return result;
    }
  }
};
function CreateGameReducer({ game, isClient }) {
  game = ProcessGameConfig(game);
  return (stateWithTransients = null, action) => {
    let [
      state
      /*, transients */
    ] = ExtractTransients(stateWithTransients);
    switch (action.type) {
      case STRIP_TRANSIENTS: {
        return state;
      }
      case GAME_EVENT: {
        state = { ...state, deltalog: [] };
        if (isClient) {
          return state;
        }
        if (state.ctx.gameover !== void 0) {
          error(`cannot call event after game end`);
          return WithError(state, ActionErrorType.GameOver);
        }
        if (actionHasPlayerID(action) && !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)) {
          error(`disallowed event: ${action.payload.type}`);
          return WithError(state, ActionErrorType.InactivePlayer);
        }
        state = Enhance(state, {
          game,
          isClient: false,
          playerID: action.payload.playerID
        });
        let newState = game.flow.processEvent(state, action);
        newState = Flush(newState, { game, isClient: false });
        newState = updateUndoRedoState(newState, { game, action });
        return { ...newState, _stateID: state._stateID + 1 };
      }
      case MAKE_MOVE: {
        state = { ...state, deltalog: [] };
        const move = game.flow.getMove(state.ctx, action.payload.type, action.payload.playerID || state.ctx.currentPlayer);
        if (move === null) {
          error(`disallowed move: ${action.payload.type}`);
          return WithError(state, ActionErrorType.UnavailableMove);
        }
        if (isClient && move.client === false) {
          return state;
        }
        if (state.ctx.gameover !== void 0) {
          error(`cannot make move after game end`);
          return WithError(state, ActionErrorType.GameOver);
        }
        if (actionHasPlayerID(action) && !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)) {
          error(`disallowed move: ${action.payload.type}`);
          return WithError(state, ActionErrorType.InactivePlayer);
        }
        state = Enhance(state, {
          game,
          isClient,
          playerID: action.payload.playerID
        });
        const G = game.processMove(state, action.payload);
        if (G === INVALID_MOVE) {
          error(`invalid move: ${action.payload.type} args: ${action.payload.args}`);
          return WithError(state, ActionErrorType.InvalidMove);
        }
        const newState = { ...state, G };
        if (isClient && NoClient(newState, { game })) {
          return state;
        }
        state = newState;
        if (isClient) {
          state = Flush(state, {
            game,
            isClient: true
          });
          return {
            ...state,
            _stateID: state._stateID + 1
          };
        }
        state = initializeDeltalog(state, action, move);
        state = game.flow.processMove(state, action.payload);
        state = Flush(state, { game });
        state = updateUndoRedoState(state, { game, action });
        return {
          ...state,
          _stateID: state._stateID + 1
        };
      }
      case RESET:
      case UPDATE:
      case SYNC: {
        return action.state;
      }
      case UNDO: {
        state = { ...state, deltalog: [] };
        if (game.disableUndo) {
          error("Undo is not enabled");
          return WithError(state, ActionErrorType.ActionDisabled);
        }
        const { _undo, _redo } = state;
        if (_undo.length < 2) {
          error(`No moves to undo`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        const last = _undo[_undo.length - 1];
        const restore = _undo[_undo.length - 2];
        if (actionHasPlayerID(action) && action.payload.playerID !== last.playerID) {
          error(`Cannot undo other players' moves`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        if (last.moveType) {
          const lastMove = game.flow.getMove(restore.ctx, last.moveType, last.playerID);
          if (!CanUndoMove(state.G, state.ctx, lastMove)) {
            error(`Move cannot be undone`);
            return WithError(state, ActionErrorType.ActionInvalid);
          }
        }
        state = initializeDeltalog(state, action);
        return {
          ...state,
          G: restore.G,
          ctx: restore.ctx,
          plugins: restore.plugins,
          _stateID: state._stateID + 1,
          _undo: _undo.slice(0, -1),
          _redo: [last, ..._redo]
        };
      }
      case REDO: {
        state = { ...state, deltalog: [] };
        if (game.disableUndo) {
          error("Redo is not enabled");
          return WithError(state, ActionErrorType.ActionDisabled);
        }
        const { _undo, _redo } = state;
        if (_redo.length == 0) {
          error(`No moves to redo`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        const first = _redo[0];
        if (actionHasPlayerID(action) && action.payload.playerID !== first.playerID) {
          error(`Cannot redo other players' moves`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        state = initializeDeltalog(state, action);
        return {
          ...state,
          G: first.G,
          ctx: first.ctx,
          plugins: first.plugins,
          _stateID: state._stateID + 1,
          _undo: [..._undo, first],
          _redo: _redo.slice(1)
        };
      }
      case PLUGIN: {
        return ProcessAction(state, action, { game });
      }
      case PATCH: {
        const oldState = state;
        const newState = JSON.parse(JSON.stringify(oldState));
        const patchError = applyPatch(newState, action.patch);
        const hasError = patchError.some((entry) => entry !== null);
        if (hasError) {
          error(`Patch ${JSON.stringify(action.patch)} apply failed`);
          return WithError(oldState, UpdateErrorType.PatchFailed, patchError);
        } else {
          return newState;
        }
      }
      default: {
        return state;
      }
    }
  };
}
class Bot {
  constructor({ enumerate, seed }) {
    this.enumerateFn = enumerate;
    this.seed = seed;
    this.iterationCounter = 0;
    this._opts = {};
  }
  addOpt({ key, range, initial }) {
    this._opts[key] = {
      range,
      value: initial
    };
  }
  getOpt(key) {
    return this._opts[key].value;
  }
  setOpt(key, value) {
    if (key in this._opts) {
      this._opts[key].value = value;
    }
  }
  opts() {
    return this._opts;
  }
  enumerate(G, ctx, playerID) {
    const actions = this.enumerateFn(G, ctx, playerID);
    return actions.map((a) => {
      if ("payload" in a) {
        return a;
      }
      if ("move" in a) {
        return makeMove(a.move, a.args, playerID);
      }
      if ("event" in a) {
        return gameEvent(a.event, a.args, playerID);
      }
    });
  }
  random(arg) {
    let number;
    if (this.seed !== void 0) {
      const seed = this.prngstate ? "" : this.seed;
      const rand = alea(seed, this.prngstate);
      number = rand();
      this.prngstate = rand.state();
    } else {
      number = Math.random();
    }
    if (arg) {
      if (Array.isArray(arg)) {
        const id = Math.floor(number * arg.length);
        return arg[id];
      } else {
        return Math.floor(number * arg);
      }
    }
    return number;
  }
}
const CHUNK_SIZE = 25;
class MCTSBot extends Bot {
  constructor({ enumerate, seed, objectives, game, iterations, playoutDepth, iterationCallback }) {
    super({ enumerate, seed });
    if (objectives === void 0) {
      objectives = () => ({});
    }
    this.objectives = objectives;
    this.iterationCallback = iterationCallback || (() => {
    });
    this.reducer = CreateGameReducer({ game });
    this.iterations = iterations;
    this.playoutDepth = playoutDepth;
    this.addOpt({
      key: "async",
      initial: false
    });
    this.addOpt({
      key: "iterations",
      initial: typeof iterations === "number" ? iterations : 1e3,
      range: { min: 1, max: 2e3 }
    });
    this.addOpt({
      key: "playoutDepth",
      initial: typeof playoutDepth === "number" ? playoutDepth : 50,
      range: { min: 1, max: 100 }
    });
  }
  createNode({ state, parentAction, parent, playerID }) {
    const { G, ctx } = state;
    let actions = [];
    let objectives = [];
    if (playerID !== void 0) {
      actions = this.enumerate(G, ctx, playerID);
      objectives = this.objectives(G, ctx, playerID);
    } else if (ctx.activePlayers) {
      for (const playerID2 in ctx.activePlayers) {
        actions = actions.concat(this.enumerate(G, ctx, playerID2));
        objectives = objectives.concat(this.objectives(G, ctx, playerID2));
      }
    } else {
      actions = actions.concat(this.enumerate(G, ctx, ctx.currentPlayer));
      objectives = objectives.concat(this.objectives(G, ctx, ctx.currentPlayer));
    }
    return {
      state,
      parent,
      parentAction,
      actions,
      objectives,
      children: [],
      visits: 0,
      value: 0
    };
  }
  select(node) {
    if (node.actions.length > 0) {
      return node;
    }
    if (node.children.length == 0) {
      return node;
    }
    let selectedChild = null;
    let best = 0;
    for (const child of node.children) {
      const childVisits = child.visits + Number.EPSILON;
      const uct = child.value / childVisits + Math.sqrt(2 * Math.log(node.visits) / childVisits);
      if (selectedChild == null || uct > best) {
        best = uct;
        selectedChild = child;
      }
    }
    return this.select(selectedChild);
  }
  expand(node) {
    const actions = node.actions;
    if (actions.length == 0 || node.state.ctx.gameover !== void 0) {
      return node;
    }
    const id = this.random(actions.length);
    const action = actions[id];
    node.actions.splice(id, 1);
    const childState = this.reducer(node.state, action);
    const childNode = this.createNode({
      state: childState,
      parentAction: action,
      parent: node
    });
    node.children.push(childNode);
    return childNode;
  }
  playout({ state }) {
    let playoutDepth = this.getOpt("playoutDepth");
    if (typeof this.playoutDepth === "function") {
      playoutDepth = this.playoutDepth(state.G, state.ctx);
    }
    for (let i = 0; i < playoutDepth && state.ctx.gameover === void 0; i++) {
      const { G, ctx } = state;
      let playerID = ctx.currentPlayer;
      if (ctx.activePlayers) {
        playerID = Object.keys(ctx.activePlayers)[0];
      }
      const moves = this.enumerate(G, ctx, playerID);
      const objectives = this.objectives(G, ctx, playerID);
      const score = Object.keys(objectives).reduce((score2, key) => {
        const objective = objectives[key];
        if (objective.checker(G, ctx)) {
          return score2 + objective.weight;
        }
        return score2;
      }, 0);
      if (score > 0) {
        return { score };
      }
      if (!moves || moves.length == 0) {
        return void 0;
      }
      const id = this.random(moves.length);
      const childState = this.reducer(state, moves[id]);
      state = childState;
    }
    return state.ctx.gameover;
  }
  backpropagate(node, result = {}) {
    node.visits++;
    if (result.score !== void 0) {
      node.value += result.score;
    }
    if (result.draw === true) {
      node.value += 0.5;
    }
    if (node.parentAction && result.winner === node.parentAction.payload.playerID) {
      node.value++;
    }
    if (node.parent) {
      this.backpropagate(node.parent, result);
    }
  }
  play(state, playerID) {
    const root = this.createNode({ state, playerID });
    let numIterations = this.getOpt("iterations");
    if (typeof this.iterations === "function") {
      numIterations = this.iterations(state.G, state.ctx);
    }
    const getResult = () => {
      let selectedChild = null;
      for (const child of root.children) {
        if (selectedChild == null || child.visits > selectedChild.visits) {
          selectedChild = child;
        }
      }
      const action = selectedChild && selectedChild.parentAction;
      const metadata = root;
      return { action, metadata };
    };
    return new Promise((resolve) => {
      const iteration = () => {
        for (let i = 0; i < CHUNK_SIZE && this.iterationCounter < numIterations; i++) {
          const leaf = this.select(root);
          const child = this.expand(leaf);
          const result = this.playout(child);
          this.backpropagate(child, result);
          this.iterationCounter++;
        }
        this.iterationCallback({
          iterationCounter: this.iterationCounter,
          numIterations,
          metadata: root
        });
      };
      this.iterationCounter = 0;
      if (this.getOpt("async")) {
        const asyncIteration = () => {
          if (this.iterationCounter < numIterations) {
            iteration();
            setTimeout(asyncIteration, 0);
          } else {
            resolve(getResult());
          }
        };
        asyncIteration();
      } else {
        while (this.iterationCounter < numIterations) {
          iteration();
        }
        resolve(getResult());
      }
    });
  }
}
class RandomBot extends Bot {
  play({ G, ctx }, playerID) {
    const moves = this.enumerate(G, ctx, playerID);
    return Promise.resolve({ action: this.random(moves) });
  }
}
async function Step(client, bot) {
  const state = client.store.getState();
  let playerID = state.ctx.currentPlayer;
  if (state.ctx.activePlayers) {
    playerID = Object.keys(state.ctx.activePlayers)[0];
  }
  const { action, metadata } = await bot.play(state, playerID);
  if (action) {
    const a = {
      ...action,
      payload: {
        ...action.payload,
        metadata
      }
    };
    client.store.dispatch(a);
    return a;
  }
}
function noop() {
}
const identity = (x) => x;
function assign(tar, src) {
  for (const k in src)
    tar[k] = src[k];
  return tar;
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
  component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
  if (definition) {
    const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
    return definition[0](slot_ctx);
  }
}
function get_slot_context(definition, ctx, $$scope, fn) {
  return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
  if (definition[2] && fn) {
    const lets = definition[2](fn(dirty));
    if ($$scope.dirty === void 0) {
      return lets;
    }
    if (typeof lets === "object") {
      const merged = [];
      const len = Math.max($$scope.dirty.length, lets.length);
      for (let i = 0; i < len; i += 1) {
        merged[i] = $$scope.dirty[i] | lets[i];
      }
      return merged;
    }
    return $$scope.dirty | lets;
  }
  return $$scope.dirty;
}
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
  const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
  if (slot_changes) {
    const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
    slot.p(slot_context, slot_changes);
  }
}
function exclude_internal_props(props) {
  const result = {};
  for (const k in props)
    if (k[0] !== "$")
      result[k] = props[k];
  return result;
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
function append(target, node) {
  target.appendChild(node);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i])
      iterations[i].d(detaching);
  }
}
function element(name) {
  return document.createElement(name);
}
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function stop_propagation(fn) {
  return function(event) {
    event.stopPropagation();
    return fn.call(this, event);
  };
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function to_number(value) {
  return value === "" ? void 0 : +value;
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
function set_input_value(input, value) {
  input.value = value == null ? "" : value;
}
function select_option(select, value) {
  for (let i = 0; i < select.options.length; i += 1) {
    const option = select.options[i];
    if (option.__value === value) {
      option.selected = true;
      return;
    }
  }
}
function select_value(select) {
  const selected_option = select.querySelector(":checked") || select.options[0];
  return selected_option && selected_option.__value;
}
function toggle_class(element2, name, toggle) {
  element2.classList[toggle ? "add" : "remove"](name);
}
function custom_event(type, detail) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, false, false, detail);
  return e;
}
const active_docs = /* @__PURE__ */ new Set();
let active = 0;
function hash(str) {
  let hash2 = 5381;
  let i = str.length;
  while (i--)
    hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
  return hash2 >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
  const step = 16.666 / duration;
  let keyframes = "{\n";
  for (let p = 0; p <= 1; p += step) {
    const t = a + (b - a) * ease(p);
    keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
  }
  const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
  const name = `__svelte_${hash(rule)}_${uid}`;
  const doc = node.ownerDocument;
  active_docs.add(doc);
  const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element("style")).sheet);
  const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
  if (!current_rules[name]) {
    current_rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
  active += 1;
  return name;
}
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(
    name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1
    // remove all Svelte animations
  );
  const deleted = previous.length - next.length;
  if (deleted) {
    node.style.animation = next.join(", ");
    active -= deleted;
    if (!active)
      clear_rules();
  }
}
function clear_rules() {
  raf(() => {
    if (active)
      return;
    active_docs.forEach((doc) => {
      const stylesheet = doc.__svelte_stylesheet;
      let i = stylesheet.cssRules.length;
      while (i--)
        stylesheet.deleteRule(i);
      doc.__svelte_rules = {};
    });
    active_docs.clear();
  });
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error(`Function called outside component initialization`);
  return current_component;
}
function afterUpdate(fn) {
  get_current_component().$$.after_update.push(fn);
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
function bubble(component, event) {
  const callbacks = component.$$.callbacks[event.type];
  if (callbacks) {
    callbacks.slice().forEach((fn) => fn(event));
  }
}
const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = /* @__PURE__ */ new Set();
function flush() {
  if (flushing)
    return;
  flushing = true;
  do {
    for (let i = 0; i < dirty_components.length; i += 1) {
      const component = dirty_components[i];
      set_current_component(component);
      update(component.$$);
    }
    dirty_components.length = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  flushing = false;
  seen_callbacks.clear();
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
let promise;
function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(() => {
      promise = null;
    });
  }
  return promise;
}
function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
}
const outroing = /* @__PURE__ */ new Set();
let outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
    // parent group
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  }
}
const null_transition = { duration: 0 };
function create_bidirectional_transition(node, fn, params, intro) {
  let config = fn(node, params);
  let t = intro ? 0 : 1;
  let running_program = null;
  let pending_program = null;
  let animation_name = null;
  function clear_animation() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function init2(program, duration) {
    const d = program.b - t;
    duration *= Math.abs(d);
    return {
      a: t,
      b: program.b,
      d,
      duration,
      start: program.start,
      end: program.start + duration,
      group: program.group
    };
  }
  function go(b) {
    const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
    const program = {
      start: now() + delay,
      b
    };
    if (!b) {
      program.group = outros;
      outros.r += 1;
    }
    if (running_program) {
      pending_program = program;
    } else {
      if (css) {
        clear_animation();
        animation_name = create_rule(node, t, b, duration, delay, easing, css);
      }
      if (b)
        tick(0, 1);
      running_program = init2(program, duration);
      add_render_callback(() => dispatch(node, b, "start"));
      loop((now2) => {
        if (pending_program && now2 > pending_program.start) {
          running_program = init2(pending_program, duration);
          pending_program = null;
          dispatch(node, running_program.b, "start");
          if (css) {
            clear_animation();
            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
          }
        }
        if (running_program) {
          if (now2 >= running_program.end) {
            tick(t = running_program.b, 1 - t);
            dispatch(node, running_program.b, "end");
            if (!pending_program) {
              if (running_program.b) {
                clear_animation();
              } else {
                if (!--running_program.group.r)
                  run_all(running_program.group.c);
              }
            }
            running_program = null;
          } else if (now2 >= running_program.start) {
            const p = now2 - running_program.start;
            t = running_program.a + running_program.d * easing(p / running_program.duration);
            tick(t, 1 - t);
          }
        }
        return !!(running_program || pending_program);
      });
    }
  }
  return {
    run(b) {
      if (is_function(config)) {
        wait().then(() => {
          config = config();
          go(b);
        });
      } else {
        go(b);
      }
    },
    end() {
      clear_animation();
      running_program = pending_program = null;
    }
  };
}
const globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
function get_spread_update(levels, updates) {
  const update2 = {};
  const to_null_out = {};
  const accounted_for = { $$scope: 1 };
  let i = levels.length;
  while (i--) {
    const o = levels[i];
    const n = updates[i];
    if (n) {
      for (const key in o) {
        if (!(key in n))
          to_null_out[key] = 1;
      }
      for (const key in n) {
        if (!accounted_for[key]) {
          update2[key] = n[key];
          accounted_for[key] = 1;
        }
      }
      levels[i] = n;
    } else {
      for (const key in o) {
        accounted_for[key] = 1;
      }
    }
  }
  for (const key in to_null_out) {
    if (!(key in update2))
      update2[key] = void 0;
  }
  return update2;
}
function get_spread_object(spread_props) {
  return typeof spread_props === "object" && spread_props !== null ? spread_props : {};
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor) {
  const { fragment, on_mount, on_destroy, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  add_render_callback(() => {
    const new_on_destroy = on_mount.map(run).filter(is_function);
    if (on_destroy) {
      on_destroy.push(...new_on_destroy);
    } else {
      run_all(new_on_destroy);
    }
    component.$$.on_mount = [];
  });
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const prop_values = options.props || {};
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    // state
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    before_update: [],
    after_update: [],
    context: new Map(parent_component ? parent_component.$$.context : []),
    // everything else
    callbacks: blank_object(),
    dirty
  };
  let ready = false;
  $$.ctx = instance2 ? instance2(component, prop_values, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if ($$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor);
    flush();
  }
  set_current_component(parent_component);
}
class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set() {
  }
}
const subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s = subscribers[i];
          s[1]();
          subscriber_queue.push(s, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update2(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      const index = subscribers.indexOf(subscriber);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update: update2, subscribe: subscribe2 };
}
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - od * u}`
  };
}
function add_css() {
  var style = element("style");
  style.id = "svelte-14p9tpy-style";
  style.textContent = ".menu.svelte-14p9tpy{display:flex;margin-top:-10px;flex-direction:row-reverse;border:1px solid #ccc;border-radius:5px 5px 0 0;height:25px;line-height:25px;margin-right:-500px;transform-origin:bottom right;transform:rotate(-90deg) translate(0, -500px)}.menu-item.svelte-14p9tpy{line-height:25px;cursor:pointer;border:0;background:#fefefe;color:#555;padding-left:15px;padding-right:15px;text-align:center}.menu-item.svelte-14p9tpy:first-child{border-radius:0 5px 0 0}.menu-item.svelte-14p9tpy:last-child{border-radius:5px 0 0 0}.menu-item.active.svelte-14p9tpy{cursor:default;font-weight:bold;background:#ddd;color:#555}.menu-item.svelte-14p9tpy:hover,.menu-item.svelte-14p9tpy:focus{background:#eee;color:#555}";
  append(document.head, style);
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i][0];
  child_ctx[5] = list[i][1].label;
  return child_ctx;
}
function create_each_block(ctx) {
  let button;
  let t0_value = (
    /*label*/
    ctx[5] + ""
  );
  let t0;
  let t1;
  let mounted;
  let dispose;
  function click_handler(...args) {
    return (
      /*click_handler*/
      ctx[3](
        /*key*/
        ctx[4],
        ...args
      )
    );
  }
  return {
    c() {
      button = element("button");
      t0 = text(t0_value);
      t1 = space();
      attr(button, "class", "menu-item svelte-14p9tpy");
      toggle_class(
        button,
        "active",
        /*pane*/
        ctx[0] == /*key*/
        ctx[4]
      );
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t0);
      append(button, t1);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*panes*/
      2 && t0_value !== (t0_value = /*label*/
      ctx[5] + ""))
        set_data(t0, t0_value);
      if (dirty & /*pane, Object, panes*/
      3) {
        toggle_class(
          button,
          "active",
          /*pane*/
          ctx[0] == /*key*/
          ctx[4]
        );
      }
    },
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment(ctx) {
  let nav;
  let each_value = Object.entries(
    /*panes*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      nav = element("nav");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(nav, "class", "menu svelte-14p9tpy");
    },
    m(target, anchor) {
      insert(target, nav, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(nav, null);
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*pane, Object, panes, dispatch*/
      7) {
        each_value = Object.entries(
          /*panes*/
          ctx2[1]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(nav, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(nav);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let { pane } = $$props;
  let { panes } = $$props;
  const dispatch2 = createEventDispatcher();
  const click_handler = (key) => dispatch2("change", key);
  $$self.$set = ($$props2) => {
    if ("pane" in $$props2)
      $$invalidate(0, pane = $$props2.pane);
    if ("panes" in $$props2)
      $$invalidate(1, panes = $$props2.panes);
  };
  return [pane, panes, dispatch2, click_handler];
}
class Menu extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-14p9tpy-style"))
      add_css();
    init(this, options, instance, create_fragment, safe_not_equal, { pane: 0, panes: 1 });
  }
}
var contextKey = {};
function add_css$1() {
  var style = element("style");
  style.id = "svelte-1vyml86-style";
  style.textContent = ".container.svelte-1vyml86{display:inline-block;cursor:pointer;transform:translate(calc(0px - var(--li-identation)), -50%);position:absolute;top:50%;padding-right:100%}.arrow.svelte-1vyml86{transform-origin:25% 50%;position:relative;line-height:1.1em;font-size:0.75em;margin-left:0;transition:150ms;color:var(--arrow-sign);user-select:none;font-family:'Courier New', Courier, monospace}.expanded.svelte-1vyml86{transform:rotateZ(90deg) translateX(-3px)}";
  append(document.head, style);
}
function create_fragment$1(ctx) {
  let div1;
  let div0;
  let mounted;
  let dispose;
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      div0.textContent = `${"▶"}`;
      attr(div0, "class", "arrow svelte-1vyml86");
      toggle_class(
        div0,
        "expanded",
        /*expanded*/
        ctx[0]
      );
      attr(div1, "class", "container svelte-1vyml86");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      if (!mounted) {
        dispose = listen(
          div1,
          "click",
          /*click_handler*/
          ctx[1]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*expanded*/
      1) {
        toggle_class(
          div0,
          "expanded",
          /*expanded*/
          ctx2[0]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div1);
      mounted = false;
      dispose();
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let { expanded } = $$props;
  function click_handler(event) {
    bubble($$self, event);
  }
  $$self.$set = ($$props2) => {
    if ("expanded" in $$props2)
      $$invalidate(0, expanded = $$props2.expanded);
  };
  return [expanded, click_handler];
}
class JSONArrow extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1vyml86-style"))
      add_css$1();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, { expanded: 0 });
  }
}
function add_css$2() {
  var style = element("style");
  style.id = "svelte-1vlbacg-style";
  style.textContent = "label.svelte-1vlbacg{display:inline-block;color:var(--label-color);padding:0}.spaced.svelte-1vlbacg{padding-right:var(--li-colon-space)}";
  append(document.head, style);
}
function create_if_block(ctx) {
  let label;
  let span;
  let t0;
  let t1;
  let mounted;
  let dispose;
  return {
    c() {
      label = element("label");
      span = element("span");
      t0 = text(
        /*key*/
        ctx[0]
      );
      t1 = text(
        /*colon*/
        ctx[2]
      );
      attr(label, "class", "svelte-1vlbacg");
      toggle_class(
        label,
        "spaced",
        /*isParentExpanded*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, label, anchor);
      append(label, span);
      append(span, t0);
      append(span, t1);
      if (!mounted) {
        dispose = listen(
          label,
          "click",
          /*click_handler*/
          ctx[5]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*key*/
      1)
        set_data(
          t0,
          /*key*/
          ctx2[0]
        );
      if (dirty & /*colon*/
      4)
        set_data(
          t1,
          /*colon*/
          ctx2[2]
        );
      if (dirty & /*isParentExpanded*/
      2) {
        toggle_class(
          label,
          "spaced",
          /*isParentExpanded*/
          ctx2[1]
        );
      }
    },
    d(detaching) {
      if (detaching)
        detach(label);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$2(ctx) {
  let if_block_anchor;
  let if_block = (
    /*showKey*/
    ctx[3] && /*key*/
    ctx[0] && create_if_block(ctx)
  );
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (
        /*showKey*/
        ctx2[3] && /*key*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let { key } = $$props, { isParentExpanded } = $$props, { isParentArray = false } = $$props, { colon = ":" } = $$props;
  function click_handler(event) {
    bubble($$self, event);
  }
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(0, key = $$props2.key);
    if ("isParentExpanded" in $$props2)
      $$invalidate(1, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2)
      $$invalidate(4, isParentArray = $$props2.isParentArray);
    if ("colon" in $$props2)
      $$invalidate(2, colon = $$props2.colon);
  };
  let showKey;
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*isParentExpanded, isParentArray, key*/
    19) {
      $$invalidate(3, showKey = isParentExpanded || !isParentArray || key != +key);
    }
  };
  return [key, isParentExpanded, colon, showKey, isParentArray, click_handler];
}
class JSONKey extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1vlbacg-style"))
      add_css$2();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {
      key: 0,
      isParentExpanded: 1,
      isParentArray: 4,
      colon: 2
    });
  }
}
function add_css$3() {
  var style = element("style");
  style.id = "svelte-rwxv37-style";
  style.textContent = "label.svelte-rwxv37{display:inline-block}.indent.svelte-rwxv37{padding-left:var(--li-identation)}.collapse.svelte-rwxv37{--li-display:inline;display:inline;font-style:italic}.comma.svelte-rwxv37{margin-left:-0.5em;margin-right:0.5em}label.svelte-rwxv37{position:relative}";
  append(document.head, style);
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[12] = list[i];
  child_ctx[20] = i;
  return child_ctx;
}
function create_if_block_3(ctx) {
  let jsonarrow;
  let current;
  jsonarrow = new JSONArrow({ props: { expanded: (
    /*expanded*/
    ctx[0]
  ) } });
  jsonarrow.$on(
    "click",
    /*toggleExpand*/
    ctx[15]
  );
  return {
    c() {
      create_component(jsonarrow.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonarrow, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const jsonarrow_changes = {};
      if (dirty & /*expanded*/
      1)
        jsonarrow_changes.expanded = /*expanded*/
        ctx2[0];
      jsonarrow.$set(jsonarrow_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonarrow.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonarrow.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonarrow, detaching);
    }
  };
}
function create_else_block(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "…";
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(span);
    }
  };
}
function create_if_block$1(ctx) {
  let ul;
  let t;
  let current;
  let mounted;
  let dispose;
  let each_value = (
    /*slicedKeys*/
    ctx[13]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  let if_block = (
    /*slicedKeys*/
    ctx[13].length < /*previewKeys*/
    ctx[7].length && create_if_block_1()
  );
  return {
    c() {
      ul = element("ul");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t = space();
      if (if_block)
        if_block.c();
      attr(ul, "class", "svelte-rwxv37");
      toggle_class(ul, "collapse", !/*expanded*/
      ctx[0]);
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(ul, null);
      }
      append(ul, t);
      if (if_block)
        if_block.m(ul, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          ul,
          "click",
          /*expand*/
          ctx[16]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*expanded, previewKeys, getKey, slicedKeys, isArray, getValue, getPreviewValue*/
      10129) {
        each_value = /*slicedKeys*/
        ctx2[13];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(ul, t);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      if (
        /*slicedKeys*/
        ctx2[13].length < /*previewKeys*/
        ctx2[7].length
      ) {
        if (if_block)
          ;
        else {
          if_block = create_if_block_1();
          if_block.c();
          if_block.m(ul, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*expanded*/
      1) {
        toggle_class(ul, "collapse", !/*expanded*/
        ctx2[0]);
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(ul);
      destroy_each(each_blocks, detaching);
      if (if_block)
        if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_2(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = ",";
      attr(span, "class", "comma svelte-rwxv37");
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    d(detaching) {
      if (detaching)
        detach(span);
    }
  };
}
function create_each_block$1(ctx) {
  let jsonnode;
  let t;
  let if_block_anchor;
  let current;
  jsonnode = new JSONNode({
    props: {
      key: (
        /*getKey*/
        ctx[8](
          /*key*/
          ctx[12]
        )
      ),
      isParentExpanded: (
        /*expanded*/
        ctx[0]
      ),
      isParentArray: (
        /*isArray*/
        ctx[4]
      ),
      value: (
        /*expanded*/
        ctx[0] ? (
          /*getValue*/
          ctx[9](
            /*key*/
            ctx[12]
          )
        ) : (
          /*getPreviewValue*/
          ctx[10](
            /*key*/
            ctx[12]
          )
        )
      )
    }
  });
  let if_block = !/*expanded*/
  ctx[0] && /*index*/
  ctx[20] < /*previewKeys*/
  ctx[7].length - 1 && create_if_block_2();
  return {
    c() {
      create_component(jsonnode.$$.fragment);
      t = space();
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      mount_component(jsonnode, target, anchor);
      insert(target, t, anchor);
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const jsonnode_changes = {};
      if (dirty & /*getKey, slicedKeys*/
      8448)
        jsonnode_changes.key = /*getKey*/
        ctx2[8](
          /*key*/
          ctx2[12]
        );
      if (dirty & /*expanded*/
      1)
        jsonnode_changes.isParentExpanded = /*expanded*/
        ctx2[0];
      if (dirty & /*isArray*/
      16)
        jsonnode_changes.isParentArray = /*isArray*/
        ctx2[4];
      if (dirty & /*expanded, getValue, slicedKeys, getPreviewValue*/
      9729)
        jsonnode_changes.value = /*expanded*/
        ctx2[0] ? (
          /*getValue*/
          ctx2[9](
            /*key*/
            ctx2[12]
          )
        ) : (
          /*getPreviewValue*/
          ctx2[10](
            /*key*/
            ctx2[12]
          )
        );
      jsonnode.$set(jsonnode_changes);
      if (!/*expanded*/
      ctx2[0] && /*index*/
      ctx2[20] < /*previewKeys*/
      ctx2[7].length - 1) {
        if (if_block)
          ;
        else {
          if_block = create_if_block_2();
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonnode.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnode.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnode, detaching);
      if (detaching)
        detach(t);
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_if_block_1(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "…";
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    d(detaching) {
      if (detaching)
        detach(span);
    }
  };
}
function create_fragment$3(ctx) {
  let li;
  let label_1;
  let t0;
  let jsonkey;
  let t1;
  let span1;
  let span0;
  let t2;
  let t3;
  let t4;
  let current_block_type_index;
  let if_block1;
  let t5;
  let span2;
  let t6;
  let current;
  let mounted;
  let dispose;
  let if_block0 = (
    /*expandable*/
    ctx[11] && /*isParentExpanded*/
    ctx[2] && create_if_block_3(ctx)
  );
  jsonkey = new JSONKey({
    props: {
      key: (
        /*key*/
        ctx[12]
      ),
      colon: (
        /*context*/
        ctx[14].colon
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[2]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[3]
      )
    }
  });
  jsonkey.$on(
    "click",
    /*toggleExpand*/
    ctx[15]
  );
  const if_block_creators = [create_if_block$1, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*isParentExpanded*/
      ctx2[2]
    )
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      li = element("li");
      label_1 = element("label");
      if (if_block0)
        if_block0.c();
      t0 = space();
      create_component(jsonkey.$$.fragment);
      t1 = space();
      span1 = element("span");
      span0 = element("span");
      t2 = text(
        /*label*/
        ctx[1]
      );
      t3 = text(
        /*bracketOpen*/
        ctx[5]
      );
      t4 = space();
      if_block1.c();
      t5 = space();
      span2 = element("span");
      t6 = text(
        /*bracketClose*/
        ctx[6]
      );
      attr(label_1, "class", "svelte-rwxv37");
      attr(li, "class", "svelte-rwxv37");
      toggle_class(
        li,
        "indent",
        /*isParentExpanded*/
        ctx[2]
      );
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, label_1);
      if (if_block0)
        if_block0.m(label_1, null);
      append(label_1, t0);
      mount_component(jsonkey, label_1, null);
      append(label_1, t1);
      append(label_1, span1);
      append(span1, span0);
      append(span0, t2);
      append(span1, t3);
      append(li, t4);
      if_blocks[current_block_type_index].m(li, null);
      append(li, t5);
      append(li, span2);
      append(span2, t6);
      current = true;
      if (!mounted) {
        dispose = listen(
          span1,
          "click",
          /*toggleExpand*/
          ctx[15]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*expandable*/
        ctx2[11] && /*isParentExpanded*/
        ctx2[2]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & /*expandable, isParentExpanded*/
          2052) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_3(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(label_1, t0);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      const jsonkey_changes = {};
      if (dirty & /*key*/
      4096)
        jsonkey_changes.key = /*key*/
        ctx2[12];
      if (dirty & /*isParentExpanded*/
      4)
        jsonkey_changes.isParentExpanded = /*isParentExpanded*/
        ctx2[2];
      if (dirty & /*isParentArray*/
      8)
        jsonkey_changes.isParentArray = /*isParentArray*/
        ctx2[3];
      jsonkey.$set(jsonkey_changes);
      if (!current || dirty & /*label*/
      2)
        set_data(
          t2,
          /*label*/
          ctx2[1]
        );
      if (!current || dirty & /*bracketOpen*/
      32)
        set_data(
          t3,
          /*bracketOpen*/
          ctx2[5]
        );
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block1 = if_blocks[current_block_type_index];
        if (!if_block1) {
          if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block1.c();
        }
        transition_in(if_block1, 1);
        if_block1.m(li, t5);
      }
      if (!current || dirty & /*bracketClose*/
      64)
        set_data(
          t6,
          /*bracketClose*/
          ctx2[6]
        );
      if (dirty & /*isParentExpanded*/
      4) {
        toggle_class(
          li,
          "indent",
          /*isParentExpanded*/
          ctx2[2]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(jsonkey.$$.fragment, local);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(jsonkey.$$.fragment, local);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(li);
      if (if_block0)
        if_block0.d();
      destroy_component(jsonkey);
      if_blocks[current_block_type_index].d();
      mounted = false;
      dispose();
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let { key } = $$props, { keys } = $$props, { colon = ":" } = $$props, { label = "" } = $$props, { isParentExpanded } = $$props, { isParentArray } = $$props, { isArray = false } = $$props, { bracketOpen } = $$props, { bracketClose } = $$props;
  let { previewKeys = keys } = $$props;
  let { getKey: getKey2 = (key2) => key2 } = $$props;
  let { getValue: getValue2 = (key2) => key2 } = $$props;
  let { getPreviewValue = getValue2 } = $$props;
  let { expanded = false } = $$props, { expandable = true } = $$props;
  const context = getContext(contextKey);
  setContext(contextKey, { ...context, colon });
  function toggleExpand() {
    $$invalidate(0, expanded = !expanded);
  }
  function expand() {
    $$invalidate(0, expanded = true);
  }
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(12, key = $$props2.key);
    if ("keys" in $$props2)
      $$invalidate(17, keys = $$props2.keys);
    if ("colon" in $$props2)
      $$invalidate(18, colon = $$props2.colon);
    if ("label" in $$props2)
      $$invalidate(1, label = $$props2.label);
    if ("isParentExpanded" in $$props2)
      $$invalidate(2, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2)
      $$invalidate(3, isParentArray = $$props2.isParentArray);
    if ("isArray" in $$props2)
      $$invalidate(4, isArray = $$props2.isArray);
    if ("bracketOpen" in $$props2)
      $$invalidate(5, bracketOpen = $$props2.bracketOpen);
    if ("bracketClose" in $$props2)
      $$invalidate(6, bracketClose = $$props2.bracketClose);
    if ("previewKeys" in $$props2)
      $$invalidate(7, previewKeys = $$props2.previewKeys);
    if ("getKey" in $$props2)
      $$invalidate(8, getKey2 = $$props2.getKey);
    if ("getValue" in $$props2)
      $$invalidate(9, getValue2 = $$props2.getValue);
    if ("getPreviewValue" in $$props2)
      $$invalidate(10, getPreviewValue = $$props2.getPreviewValue);
    if ("expanded" in $$props2)
      $$invalidate(0, expanded = $$props2.expanded);
    if ("expandable" in $$props2)
      $$invalidate(11, expandable = $$props2.expandable);
  };
  let slicedKeys;
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*isParentExpanded*/
    4) {
      if (!isParentExpanded) {
        $$invalidate(0, expanded = false);
      }
    }
    if ($$self.$$.dirty & /*expanded, keys, previewKeys*/
    131201) {
      $$invalidate(13, slicedKeys = expanded ? keys : previewKeys.slice(0, 5));
    }
  };
  return [
    expanded,
    label,
    isParentExpanded,
    isParentArray,
    isArray,
    bracketOpen,
    bracketClose,
    previewKeys,
    getKey2,
    getValue2,
    getPreviewValue,
    expandable,
    key,
    slicedKeys,
    context,
    toggleExpand,
    expand,
    keys,
    colon
  ];
}
class JSONNested extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-rwxv37-style"))
      add_css$3();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {
      key: 12,
      keys: 17,
      colon: 18,
      label: 1,
      isParentExpanded: 2,
      isParentArray: 3,
      isArray: 4,
      bracketOpen: 5,
      bracketClose: 6,
      previewKeys: 7,
      getKey: 8,
      getValue: 9,
      getPreviewValue: 10,
      expanded: 0,
      expandable: 11
    });
  }
}
function create_fragment$4(ctx) {
  let jsonnested;
  let current;
  jsonnested = new JSONNested({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      expanded: (
        /*expanded*/
        ctx[4]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[1]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[2]
      ),
      keys: (
        /*keys*/
        ctx[5]
      ),
      previewKeys: (
        /*keys*/
        ctx[5]
      ),
      getValue: (
        /*getValue*/
        ctx[6]
      ),
      label: (
        /*nodeType*/
        ctx[3] + " "
      ),
      bracketOpen: "{",
      bracketClose: "}"
    }
  });
  return {
    c() {
      create_component(jsonnested.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonnested, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnested_changes = {};
      if (dirty & /*key*/
      1)
        jsonnested_changes.key = /*key*/
        ctx2[0];
      if (dirty & /*expanded*/
      16)
        jsonnested_changes.expanded = /*expanded*/
        ctx2[4];
      if (dirty & /*isParentExpanded*/
      2)
        jsonnested_changes.isParentExpanded = /*isParentExpanded*/
        ctx2[1];
      if (dirty & /*isParentArray*/
      4)
        jsonnested_changes.isParentArray = /*isParentArray*/
        ctx2[2];
      if (dirty & /*keys*/
      32)
        jsonnested_changes.keys = /*keys*/
        ctx2[5];
      if (dirty & /*keys*/
      32)
        jsonnested_changes.previewKeys = /*keys*/
        ctx2[5];
      if (dirty & /*nodeType*/
      8)
        jsonnested_changes.label = /*nodeType*/
        ctx2[3] + " ";
      jsonnested.$set(jsonnested_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonnested.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnested.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnested, detaching);
    }
  };
}
function instance$4($$self, $$props, $$invalidate) {
  let { key } = $$props, { value } = $$props, { isParentExpanded } = $$props, { isParentArray } = $$props, { nodeType } = $$props;
  let { expanded = true } = $$props;
  function getValue2(key2) {
    return value[key2];
  }
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2)
      $$invalidate(7, value = $$props2.value);
    if ("isParentExpanded" in $$props2)
      $$invalidate(1, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2)
      $$invalidate(2, isParentArray = $$props2.isParentArray);
    if ("nodeType" in $$props2)
      $$invalidate(3, nodeType = $$props2.nodeType);
    if ("expanded" in $$props2)
      $$invalidate(4, expanded = $$props2.expanded);
  };
  let keys;
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    128) {
      $$invalidate(5, keys = Object.getOwnPropertyNames(value));
    }
  };
  return [
    key,
    isParentExpanded,
    isParentArray,
    nodeType,
    expanded,
    keys,
    getValue2,
    value
  ];
}
class JSONObjectNode extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, {
      key: 0,
      value: 7,
      isParentExpanded: 1,
      isParentArray: 2,
      nodeType: 3,
      expanded: 4
    });
  }
}
function create_fragment$5(ctx) {
  let jsonnested;
  let current;
  jsonnested = new JSONNested({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      expanded: (
        /*expanded*/
        ctx[4]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[2]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[3]
      ),
      isArray: true,
      keys: (
        /*keys*/
        ctx[5]
      ),
      previewKeys: (
        /*previewKeys*/
        ctx[6]
      ),
      getValue: (
        /*getValue*/
        ctx[7]
      ),
      label: "Array(" + /*value*/
      ctx[1].length + ")",
      bracketOpen: "[",
      bracketClose: "]"
    }
  });
  return {
    c() {
      create_component(jsonnested.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonnested, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnested_changes = {};
      if (dirty & /*key*/
      1)
        jsonnested_changes.key = /*key*/
        ctx2[0];
      if (dirty & /*expanded*/
      16)
        jsonnested_changes.expanded = /*expanded*/
        ctx2[4];
      if (dirty & /*isParentExpanded*/
      4)
        jsonnested_changes.isParentExpanded = /*isParentExpanded*/
        ctx2[2];
      if (dirty & /*isParentArray*/
      8)
        jsonnested_changes.isParentArray = /*isParentArray*/
        ctx2[3];
      if (dirty & /*keys*/
      32)
        jsonnested_changes.keys = /*keys*/
        ctx2[5];
      if (dirty & /*previewKeys*/
      64)
        jsonnested_changes.previewKeys = /*previewKeys*/
        ctx2[6];
      if (dirty & /*value*/
      2)
        jsonnested_changes.label = "Array(" + /*value*/
        ctx2[1].length + ")";
      jsonnested.$set(jsonnested_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonnested.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnested.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnested, detaching);
    }
  };
}
function instance$5($$self, $$props, $$invalidate) {
  let { key } = $$props, { value } = $$props, { isParentExpanded } = $$props, { isParentArray } = $$props;
  let { expanded = JSON.stringify(value).length < 1024 } = $$props;
  const filteredKey = /* @__PURE__ */ new Set(["length"]);
  function getValue2(key2) {
    return value[key2];
  }
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2)
      $$invalidate(1, value = $$props2.value);
    if ("isParentExpanded" in $$props2)
      $$invalidate(2, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2)
      $$invalidate(3, isParentArray = $$props2.isParentArray);
    if ("expanded" in $$props2)
      $$invalidate(4, expanded = $$props2.expanded);
  };
  let keys;
  let previewKeys;
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    2) {
      $$invalidate(5, keys = Object.getOwnPropertyNames(value));
    }
    if ($$self.$$.dirty & /*keys*/
    32) {
      $$invalidate(6, previewKeys = keys.filter((key2) => !filteredKey.has(key2)));
    }
  };
  return [
    key,
    value,
    isParentExpanded,
    isParentArray,
    expanded,
    keys,
    previewKeys,
    getValue2
  ];
}
class JSONArrayNode extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, {
      key: 0,
      value: 1,
      isParentExpanded: 2,
      isParentArray: 3,
      expanded: 4
    });
  }
}
function create_fragment$6(ctx) {
  let jsonnested;
  let current;
  jsonnested = new JSONNested({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[1]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[2]
      ),
      keys: (
        /*keys*/
        ctx[4]
      ),
      getKey,
      getValue,
      isArray: true,
      label: (
        /*nodeType*/
        ctx[3] + "(" + /*keys*/
        ctx[4].length + ")"
      ),
      bracketOpen: "{",
      bracketClose: "}"
    }
  });
  return {
    c() {
      create_component(jsonnested.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonnested, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnested_changes = {};
      if (dirty & /*key*/
      1)
        jsonnested_changes.key = /*key*/
        ctx2[0];
      if (dirty & /*isParentExpanded*/
      2)
        jsonnested_changes.isParentExpanded = /*isParentExpanded*/
        ctx2[1];
      if (dirty & /*isParentArray*/
      4)
        jsonnested_changes.isParentArray = /*isParentArray*/
        ctx2[2];
      if (dirty & /*keys*/
      16)
        jsonnested_changes.keys = /*keys*/
        ctx2[4];
      if (dirty & /*nodeType, keys*/
      24)
        jsonnested_changes.label = /*nodeType*/
        ctx2[3] + "(" + /*keys*/
        ctx2[4].length + ")";
      jsonnested.$set(jsonnested_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonnested.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnested.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnested, detaching);
    }
  };
}
function getKey(key) {
  return String(key[0]);
}
function getValue(key) {
  return key[1];
}
function instance$6($$self, $$props, $$invalidate) {
  let { key } = $$props, { value } = $$props, { isParentExpanded } = $$props, { isParentArray } = $$props, { nodeType } = $$props;
  let keys = [];
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2)
      $$invalidate(5, value = $$props2.value);
    if ("isParentExpanded" in $$props2)
      $$invalidate(1, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2)
      $$invalidate(2, isParentArray = $$props2.isParentArray);
    if ("nodeType" in $$props2)
      $$invalidate(3, nodeType = $$props2.nodeType);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    32) {
      {
        let result = [];
        let i = 0;
        for (const entry of value) {
          result.push([i++, entry]);
        }
        $$invalidate(4, keys = result);
      }
    }
  };
  return [key, isParentExpanded, isParentArray, nodeType, keys, value];
}
class JSONIterableArrayNode extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, {
      key: 0,
      value: 5,
      isParentExpanded: 1,
      isParentArray: 2,
      nodeType: 3
    });
  }
}
class MapEntry {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}
function create_fragment$7(ctx) {
  let jsonnested;
  let current;
  jsonnested = new JSONNested({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[1]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[2]
      ),
      keys: (
        /*keys*/
        ctx[4]
      ),
      getKey: getKey$1,
      getValue: getValue$1,
      label: (
        /*nodeType*/
        ctx[3] + "(" + /*keys*/
        ctx[4].length + ")"
      ),
      colon: "",
      bracketOpen: "{",
      bracketClose: "}"
    }
  });
  return {
    c() {
      create_component(jsonnested.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonnested, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnested_changes = {};
      if (dirty & /*key*/
      1)
        jsonnested_changes.key = /*key*/
        ctx2[0];
      if (dirty & /*isParentExpanded*/
      2)
        jsonnested_changes.isParentExpanded = /*isParentExpanded*/
        ctx2[1];
      if (dirty & /*isParentArray*/
      4)
        jsonnested_changes.isParentArray = /*isParentArray*/
        ctx2[2];
      if (dirty & /*keys*/
      16)
        jsonnested_changes.keys = /*keys*/
        ctx2[4];
      if (dirty & /*nodeType, keys*/
      24)
        jsonnested_changes.label = /*nodeType*/
        ctx2[3] + "(" + /*keys*/
        ctx2[4].length + ")";
      jsonnested.$set(jsonnested_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonnested.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnested.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnested, detaching);
    }
  };
}
function getKey$1(entry) {
  return entry[0];
}
function getValue$1(entry) {
  return entry[1];
}
function instance$7($$self, $$props, $$invalidate) {
  let { key } = $$props, { value } = $$props, { isParentExpanded } = $$props, { isParentArray } = $$props, { nodeType } = $$props;
  let keys = [];
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2)
      $$invalidate(5, value = $$props2.value);
    if ("isParentExpanded" in $$props2)
      $$invalidate(1, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2)
      $$invalidate(2, isParentArray = $$props2.isParentArray);
    if ("nodeType" in $$props2)
      $$invalidate(3, nodeType = $$props2.nodeType);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    32) {
      {
        let result = [];
        let i = 0;
        for (const entry of value) {
          result.push([i++, new MapEntry(entry[0], entry[1])]);
        }
        $$invalidate(4, keys = result);
      }
    }
  };
  return [key, isParentExpanded, isParentArray, nodeType, keys, value];
}
class JSONIterableMapNode extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$7, create_fragment$7, safe_not_equal, {
      key: 0,
      value: 5,
      isParentExpanded: 1,
      isParentArray: 2,
      nodeType: 3
    });
  }
}
function create_fragment$8(ctx) {
  let jsonnested;
  let current;
  jsonnested = new JSONNested({
    props: {
      expanded: (
        /*expanded*/
        ctx[4]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[2]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[3]
      ),
      key: (
        /*isParentExpanded*/
        ctx[2] ? String(
          /*key*/
          ctx[0]
        ) : (
          /*value*/
          ctx[1].key
        )
      ),
      keys: (
        /*keys*/
        ctx[5]
      ),
      getValue: (
        /*getValue*/
        ctx[6]
      ),
      label: (
        /*isParentExpanded*/
        ctx[2] ? "Entry " : "=> "
      ),
      bracketOpen: "{",
      bracketClose: "}"
    }
  });
  return {
    c() {
      create_component(jsonnested.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonnested, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnested_changes = {};
      if (dirty & /*expanded*/
      16)
        jsonnested_changes.expanded = /*expanded*/
        ctx2[4];
      if (dirty & /*isParentExpanded*/
      4)
        jsonnested_changes.isParentExpanded = /*isParentExpanded*/
        ctx2[2];
      if (dirty & /*isParentArray*/
      8)
        jsonnested_changes.isParentArray = /*isParentArray*/
        ctx2[3];
      if (dirty & /*isParentExpanded, key, value*/
      7)
        jsonnested_changes.key = /*isParentExpanded*/
        ctx2[2] ? String(
          /*key*/
          ctx2[0]
        ) : (
          /*value*/
          ctx2[1].key
        );
      if (dirty & /*isParentExpanded*/
      4)
        jsonnested_changes.label = /*isParentExpanded*/
        ctx2[2] ? "Entry " : "=> ";
      jsonnested.$set(jsonnested_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonnested.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnested.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnested, detaching);
    }
  };
}
function instance$8($$self, $$props, $$invalidate) {
  let { key } = $$props, { value } = $$props, { isParentExpanded } = $$props, { isParentArray } = $$props;
  let { expanded = false } = $$props;
  const keys = ["key", "value"];
  function getValue2(key2) {
    return value[key2];
  }
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2)
      $$invalidate(1, value = $$props2.value);
    if ("isParentExpanded" in $$props2)
      $$invalidate(2, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2)
      $$invalidate(3, isParentArray = $$props2.isParentArray);
    if ("expanded" in $$props2)
      $$invalidate(4, expanded = $$props2.expanded);
  };
  return [key, value, isParentExpanded, isParentArray, expanded, keys, getValue2];
}
class JSONMapEntryNode extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$8, create_fragment$8, safe_not_equal, {
      key: 0,
      value: 1,
      isParentExpanded: 2,
      isParentArray: 3,
      expanded: 4
    });
  }
}
function add_css$4() {
  var style = element("style");
  style.id = "svelte-3bjyvl-style";
  style.textContent = "li.svelte-3bjyvl{user-select:text;word-wrap:break-word;word-break:break-all}.indent.svelte-3bjyvl{padding-left:var(--li-identation)}.String.svelte-3bjyvl{color:var(--string-color)}.Date.svelte-3bjyvl{color:var(--date-color)}.Number.svelte-3bjyvl{color:var(--number-color)}.Boolean.svelte-3bjyvl{color:var(--boolean-color)}.Null.svelte-3bjyvl{color:var(--null-color)}.Undefined.svelte-3bjyvl{color:var(--undefined-color)}.Function.svelte-3bjyvl{color:var(--function-color);font-style:italic}.Symbol.svelte-3bjyvl{color:var(--symbol-color)}";
  append(document.head, style);
}
function create_fragment$9(ctx) {
  let li;
  let jsonkey;
  let t0;
  let span;
  let t1_value = (
    /*valueGetter*/
    (ctx[2] ? (
      /*valueGetter*/
      ctx[2](
        /*value*/
        ctx[1]
      )
    ) : (
      /*value*/
      ctx[1]
    )) + ""
  );
  let t1;
  let span_class_value;
  let current;
  jsonkey = new JSONKey({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      colon: (
        /*colon*/
        ctx[6]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[3]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[4]
      )
    }
  });
  return {
    c() {
      li = element("li");
      create_component(jsonkey.$$.fragment);
      t0 = space();
      span = element("span");
      t1 = text(t1_value);
      attr(span, "class", span_class_value = null_to_empty(
        /*nodeType*/
        ctx[5]
      ) + " svelte-3bjyvl");
      attr(li, "class", "svelte-3bjyvl");
      toggle_class(
        li,
        "indent",
        /*isParentExpanded*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert(target, li, anchor);
      mount_component(jsonkey, li, null);
      append(li, t0);
      append(li, span);
      append(span, t1);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonkey_changes = {};
      if (dirty & /*key*/
      1)
        jsonkey_changes.key = /*key*/
        ctx2[0];
      if (dirty & /*isParentExpanded*/
      8)
        jsonkey_changes.isParentExpanded = /*isParentExpanded*/
        ctx2[3];
      if (dirty & /*isParentArray*/
      16)
        jsonkey_changes.isParentArray = /*isParentArray*/
        ctx2[4];
      jsonkey.$set(jsonkey_changes);
      if ((!current || dirty & /*valueGetter, value*/
      6) && t1_value !== (t1_value = /*valueGetter*/
      (ctx2[2] ? (
        /*valueGetter*/
        ctx2[2](
          /*value*/
          ctx2[1]
        )
      ) : (
        /*value*/
        ctx2[1]
      )) + ""))
        set_data(t1, t1_value);
      if (!current || dirty & /*nodeType*/
      32 && span_class_value !== (span_class_value = null_to_empty(
        /*nodeType*/
        ctx2[5]
      ) + " svelte-3bjyvl")) {
        attr(span, "class", span_class_value);
      }
      if (dirty & /*isParentExpanded*/
      8) {
        toggle_class(
          li,
          "indent",
          /*isParentExpanded*/
          ctx2[3]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonkey.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonkey.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(li);
      destroy_component(jsonkey);
    }
  };
}
function instance$9($$self, $$props, $$invalidate) {
  let { key } = $$props, { value } = $$props, { valueGetter = null } = $$props, { isParentExpanded } = $$props, { isParentArray } = $$props, { nodeType } = $$props;
  const { colon } = getContext(contextKey);
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2)
      $$invalidate(1, value = $$props2.value);
    if ("valueGetter" in $$props2)
      $$invalidate(2, valueGetter = $$props2.valueGetter);
    if ("isParentExpanded" in $$props2)
      $$invalidate(3, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2)
      $$invalidate(4, isParentArray = $$props2.isParentArray);
    if ("nodeType" in $$props2)
      $$invalidate(5, nodeType = $$props2.nodeType);
  };
  return [key, value, valueGetter, isParentExpanded, isParentArray, nodeType, colon];
}
class JSONValueNode extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-3bjyvl-style"))
      add_css$4();
    init(this, options, instance$9, create_fragment$9, safe_not_equal, {
      key: 0,
      value: 1,
      valueGetter: 2,
      isParentExpanded: 3,
      isParentArray: 4,
      nodeType: 5
    });
  }
}
function add_css$5() {
  var style = element("style");
  style.id = "svelte-1ca3gb2-style";
  style.textContent = "li.svelte-1ca3gb2{user-select:text;word-wrap:break-word;word-break:break-all}.indent.svelte-1ca3gb2{padding-left:var(--li-identation)}.collapse.svelte-1ca3gb2{--li-display:inline;display:inline;font-style:italic}";
  append(document.head, style);
}
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i];
  child_ctx[10] = i;
  return child_ctx;
}
function create_if_block_2$1(ctx) {
  let jsonarrow;
  let current;
  jsonarrow = new JSONArrow({ props: { expanded: (
    /*expanded*/
    ctx[0]
  ) } });
  jsonarrow.$on(
    "click",
    /*toggleExpand*/
    ctx[7]
  );
  return {
    c() {
      create_component(jsonarrow.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonarrow, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const jsonarrow_changes = {};
      if (dirty & /*expanded*/
      1)
        jsonarrow_changes.expanded = /*expanded*/
        ctx2[0];
      jsonarrow.$set(jsonarrow_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonarrow.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonarrow.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonarrow, detaching);
    }
  };
}
function create_if_block$2(ctx) {
  let ul;
  let current;
  let if_block = (
    /*expanded*/
    ctx[0] && create_if_block_1$1(ctx)
  );
  return {
    c() {
      ul = element("ul");
      if (if_block)
        if_block.c();
      attr(ul, "class", "svelte-1ca3gb2");
      toggle_class(ul, "collapse", !/*expanded*/
      ctx[0]);
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      if (if_block)
        if_block.m(ul, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*expanded*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*expanded*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_1$1(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(ul, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      if (dirty & /*expanded*/
      1) {
        toggle_class(ul, "collapse", !/*expanded*/
        ctx2[0]);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(ul);
      if (if_block)
        if_block.d();
    }
  };
}
function create_if_block_1$1(ctx) {
  let jsonnode;
  let t0;
  let li;
  let jsonkey;
  let t1;
  let span;
  let current;
  jsonnode = new JSONNode({
    props: {
      key: "message",
      value: (
        /*value*/
        ctx[2].message
      )
    }
  });
  jsonkey = new JSONKey({
    props: {
      key: "stack",
      colon: ":",
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[3]
      )
    }
  });
  let each_value = (
    /*stack*/
    ctx[5]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  }
  return {
    c() {
      create_component(jsonnode.$$.fragment);
      t0 = space();
      li = element("li");
      create_component(jsonkey.$$.fragment);
      t1 = space();
      span = element("span");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(li, "class", "svelte-1ca3gb2");
    },
    m(target, anchor) {
      mount_component(jsonnode, target, anchor);
      insert(target, t0, anchor);
      insert(target, li, anchor);
      mount_component(jsonkey, li, null);
      append(li, t1);
      append(li, span);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(span, null);
      }
      current = true;
    },
    p(ctx2, dirty) {
      const jsonnode_changes = {};
      if (dirty & /*value*/
      4)
        jsonnode_changes.value = /*value*/
        ctx2[2].message;
      jsonnode.$set(jsonnode_changes);
      const jsonkey_changes = {};
      if (dirty & /*isParentExpanded*/
      8)
        jsonkey_changes.isParentExpanded = /*isParentExpanded*/
        ctx2[3];
      jsonkey.$set(jsonkey_changes);
      if (dirty & /*stack*/
      32) {
        each_value = /*stack*/
        ctx2[5];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$2(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(span, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonnode.$$.fragment, local);
      transition_in(jsonkey.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnode.$$.fragment, local);
      transition_out(jsonkey.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnode, detaching);
      if (detaching)
        detach(t0);
      if (detaching)
        detach(li);
      destroy_component(jsonkey);
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block$2(ctx) {
  let span;
  let t_value = (
    /*line*/
    ctx[8] + ""
  );
  let t;
  let br;
  return {
    c() {
      span = element("span");
      t = text(t_value);
      br = element("br");
      attr(span, "class", "svelte-1ca3gb2");
      toggle_class(
        span,
        "indent",
        /*index*/
        ctx[10] > 0
      );
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
      insert(target, br, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*stack*/
      32 && t_value !== (t_value = /*line*/
      ctx2[8] + ""))
        set_data(t, t_value);
    },
    d(detaching) {
      if (detaching)
        detach(span);
      if (detaching)
        detach(br);
    }
  };
}
function create_fragment$a(ctx) {
  let li;
  let t0;
  let jsonkey;
  let t1;
  let span;
  let t2;
  let t3_value = (
    /*expanded*/
    (ctx[0] ? "" : (
      /*value*/
      ctx[2].message
    )) + ""
  );
  let t3;
  let t4;
  let current;
  let mounted;
  let dispose;
  let if_block0 = (
    /*isParentExpanded*/
    ctx[3] && create_if_block_2$1(ctx)
  );
  jsonkey = new JSONKey({
    props: {
      key: (
        /*key*/
        ctx[1]
      ),
      colon: (
        /*context*/
        ctx[6].colon
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[3]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[4]
      )
    }
  });
  let if_block1 = (
    /*isParentExpanded*/
    ctx[3] && create_if_block$2(ctx)
  );
  return {
    c() {
      li = element("li");
      if (if_block0)
        if_block0.c();
      t0 = space();
      create_component(jsonkey.$$.fragment);
      t1 = space();
      span = element("span");
      t2 = text("Error: ");
      t3 = text(t3_value);
      t4 = space();
      if (if_block1)
        if_block1.c();
      attr(li, "class", "svelte-1ca3gb2");
      toggle_class(
        li,
        "indent",
        /*isParentExpanded*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert(target, li, anchor);
      if (if_block0)
        if_block0.m(li, null);
      append(li, t0);
      mount_component(jsonkey, li, null);
      append(li, t1);
      append(li, span);
      append(span, t2);
      append(span, t3);
      append(li, t4);
      if (if_block1)
        if_block1.m(li, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          span,
          "click",
          /*toggleExpand*/
          ctx[7]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*isParentExpanded*/
        ctx2[3]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & /*isParentExpanded*/
          8) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_2$1(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(li, t0);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      const jsonkey_changes = {};
      if (dirty & /*key*/
      2)
        jsonkey_changes.key = /*key*/
        ctx2[1];
      if (dirty & /*isParentExpanded*/
      8)
        jsonkey_changes.isParentExpanded = /*isParentExpanded*/
        ctx2[3];
      if (dirty & /*isParentArray*/
      16)
        jsonkey_changes.isParentArray = /*isParentArray*/
        ctx2[4];
      jsonkey.$set(jsonkey_changes);
      if ((!current || dirty & /*expanded, value*/
      5) && t3_value !== (t3_value = /*expanded*/
      (ctx2[0] ? "" : (
        /*value*/
        ctx2[2].message
      )) + ""))
        set_data(t3, t3_value);
      if (
        /*isParentExpanded*/
        ctx2[3]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*isParentExpanded*/
          8) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block$2(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(li, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (dirty & /*isParentExpanded*/
      8) {
        toggle_class(
          li,
          "indent",
          /*isParentExpanded*/
          ctx2[3]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(jsonkey.$$.fragment, local);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(jsonkey.$$.fragment, local);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(li);
      if (if_block0)
        if_block0.d();
      destroy_component(jsonkey);
      if (if_block1)
        if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$a($$self, $$props, $$invalidate) {
  let { key } = $$props, { value } = $$props, { isParentExpanded } = $$props, { isParentArray } = $$props;
  let { expanded = false } = $$props;
  const context = getContext(contextKey);
  setContext(contextKey, { ...context, colon: ":" });
  function toggleExpand() {
    $$invalidate(0, expanded = !expanded);
  }
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(1, key = $$props2.key);
    if ("value" in $$props2)
      $$invalidate(2, value = $$props2.value);
    if ("isParentExpanded" in $$props2)
      $$invalidate(3, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2)
      $$invalidate(4, isParentArray = $$props2.isParentArray);
    if ("expanded" in $$props2)
      $$invalidate(0, expanded = $$props2.expanded);
  };
  let stack;
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    4) {
      $$invalidate(5, stack = value.stack.split("\n"));
    }
    if ($$self.$$.dirty & /*isParentExpanded*/
    8) {
      if (!isParentExpanded) {
        $$invalidate(0, expanded = false);
      }
    }
  };
  return [
    expanded,
    key,
    value,
    isParentExpanded,
    isParentArray,
    stack,
    context,
    toggleExpand
  ];
}
class ErrorNode extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1ca3gb2-style"))
      add_css$5();
    init(this, options, instance$a, create_fragment$a, safe_not_equal, {
      key: 1,
      value: 2,
      isParentExpanded: 3,
      isParentArray: 4,
      expanded: 0
    });
  }
}
function objType(obj) {
  const type = Object.prototype.toString.call(obj).slice(8, -1);
  if (type === "Object") {
    if (typeof obj[Symbol.iterator] === "function") {
      return "Iterable";
    }
    return obj.constructor.name;
  }
  return type;
}
function create_fragment$b(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  var switch_value = (
    /*componentType*/
    ctx[5]
  );
  function switch_props(ctx2) {
    return {
      props: {
        key: (
          /*key*/
          ctx2[0]
        ),
        value: (
          /*value*/
          ctx2[1]
        ),
        isParentExpanded: (
          /*isParentExpanded*/
          ctx2[2]
        ),
        isParentArray: (
          /*isParentArray*/
          ctx2[3]
        ),
        nodeType: (
          /*nodeType*/
          ctx2[4]
        ),
        valueGetter: (
          /*valueGetter*/
          ctx2[6]
        )
      }
    };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
  }
  return {
    c() {
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      switch_instance_anchor = empty();
    },
    m(target, anchor) {
      if (switch_instance) {
        mount_component(switch_instance, target, anchor);
      }
      insert(target, switch_instance_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const switch_instance_changes = {};
      if (dirty & /*key*/
      1)
        switch_instance_changes.key = /*key*/
        ctx2[0];
      if (dirty & /*value*/
      2)
        switch_instance_changes.value = /*value*/
        ctx2[1];
      if (dirty & /*isParentExpanded*/
      4)
        switch_instance_changes.isParentExpanded = /*isParentExpanded*/
        ctx2[2];
      if (dirty & /*isParentArray*/
      8)
        switch_instance_changes.isParentArray = /*isParentArray*/
        ctx2[3];
      if (dirty & /*nodeType*/
      16)
        switch_instance_changes.nodeType = /*nodeType*/
        ctx2[4];
      if (dirty & /*valueGetter*/
      64)
        switch_instance_changes.valueGetter = /*valueGetter*/
        ctx2[6];
      if (switch_value !== (switch_value = /*componentType*/
      ctx2[5])) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx2));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i(local) {
      if (current)
        return;
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(switch_instance_anchor);
      if (switch_instance)
        destroy_component(switch_instance, detaching);
    }
  };
}
function instance$b($$self, $$props, $$invalidate) {
  let { key } = $$props, { value } = $$props, { isParentExpanded } = $$props, { isParentArray } = $$props;
  function getComponent(nodeType2) {
    switch (nodeType2) {
      case "Object":
        return JSONObjectNode;
      case "Error":
        return ErrorNode;
      case "Array":
        return JSONArrayNode;
      case "Iterable":
      case "Map":
      case "Set":
        return typeof value.set === "function" ? JSONIterableMapNode : JSONIterableArrayNode;
      case "MapEntry":
        return JSONMapEntryNode;
      default:
        return JSONValueNode;
    }
  }
  function getValueGetter(nodeType2) {
    switch (nodeType2) {
      case "Object":
      case "Error":
      case "Array":
      case "Iterable":
      case "Map":
      case "Set":
      case "MapEntry":
      case "Number":
        return void 0;
      case "String":
        return (raw) => `"${raw}"`;
      case "Boolean":
        return (raw) => raw ? "true" : "false";
      case "Date":
        return (raw) => raw.toISOString();
      case "Null":
        return () => "null";
      case "Undefined":
        return () => "undefined";
      case "Function":
      case "Symbol":
        return (raw) => raw.toString();
      default:
        return () => `<${nodeType2}>`;
    }
  }
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2)
      $$invalidate(1, value = $$props2.value);
    if ("isParentExpanded" in $$props2)
      $$invalidate(2, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2)
      $$invalidate(3, isParentArray = $$props2.isParentArray);
  };
  let nodeType;
  let componentType;
  let valueGetter;
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    2) {
      $$invalidate(4, nodeType = objType(value));
    }
    if ($$self.$$.dirty & /*nodeType*/
    16) {
      $$invalidate(5, componentType = getComponent(nodeType));
    }
    if ($$self.$$.dirty & /*nodeType*/
    16) {
      $$invalidate(6, valueGetter = getValueGetter(nodeType));
    }
  };
  return [
    key,
    value,
    isParentExpanded,
    isParentArray,
    nodeType,
    componentType,
    valueGetter
  ];
}
class JSONNode extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$b, create_fragment$b, safe_not_equal, {
      key: 0,
      value: 1,
      isParentExpanded: 2,
      isParentArray: 3
    });
  }
}
function add_css$6() {
  var style = element("style");
  style.id = "svelte-773n60-style";
  style.textContent = "ul.svelte-773n60{--string-color:var(--json-tree-string-color, #cb3f41);--symbol-color:var(--json-tree-symbol-color, #cb3f41);--boolean-color:var(--json-tree-boolean-color, #112aa7);--function-color:var(--json-tree-function-color, #112aa7);--number-color:var(--json-tree-number-color, #3029cf);--label-color:var(--json-tree-label-color, #871d8f);--arrow-color:var(--json-tree-arrow-color, #727272);--null-color:var(--json-tree-null-color, #8d8d8d);--undefined-color:var(--json-tree-undefined-color, #8d8d8d);--date-color:var(--json-tree-date-color, #8d8d8d);--li-identation:var(--json-tree-li-indentation, 1em);--li-line-height:var(--json-tree-li-line-height, 1.3);--li-colon-space:0.3em;font-size:var(--json-tree-font-size, 12px);font-family:var(--json-tree-font-family, 'Courier New', Courier, monospace)}ul.svelte-773n60 li{line-height:var(--li-line-height);display:var(--li-display, list-item);list-style:none}ul.svelte-773n60,ul.svelte-773n60 ul{padding:0;margin:0}";
  append(document.head, style);
}
function create_fragment$c(ctx) {
  let ul;
  let jsonnode;
  let current;
  jsonnode = new JSONNode({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      value: (
        /*value*/
        ctx[1]
      ),
      isParentExpanded: true,
      isParentArray: false
    }
  });
  return {
    c() {
      ul = element("ul");
      create_component(jsonnode.$$.fragment);
      attr(ul, "class", "svelte-773n60");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      mount_component(jsonnode, ul, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnode_changes = {};
      if (dirty & /*key*/
      1)
        jsonnode_changes.key = /*key*/
        ctx2[0];
      if (dirty & /*value*/
      2)
        jsonnode_changes.value = /*value*/
        ctx2[1];
      jsonnode.$set(jsonnode_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(jsonnode.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnode.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(ul);
      destroy_component(jsonnode);
    }
  };
}
function instance$c($$self, $$props, $$invalidate) {
  setContext(contextKey, {});
  let { key = "" } = $$props, { value } = $$props;
  $$self.$set = ($$props2) => {
    if ("key" in $$props2)
      $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2)
      $$invalidate(1, value = $$props2.value);
  };
  return [key, value];
}
class Root extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-773n60-style"))
      add_css$6();
    init(this, options, instance$c, create_fragment$c, safe_not_equal, { key: 0, value: 1 });
  }
}
const { document: document_1 } = globals;
function add_css$7() {
  var style = element("style");
  style.id = "svelte-jvfq3i-style";
  style.textContent = ".svelte-jvfq3i{box-sizing:border-box}section.switcher.svelte-jvfq3i{position:sticky;bottom:0;transform:translateY(20px);margin:40px -20px 0;border-top:1px solid #999;padding:20px;background:#fff}label.svelte-jvfq3i{display:flex;align-items:baseline;gap:5px;font-weight:bold}select.svelte-jvfq3i{min-width:140px}";
  append(document_1.head, style);
}
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i];
  child_ctx[9] = i;
  return child_ctx;
}
function create_if_block$3(ctx) {
  let section;
  let label;
  let t;
  let select;
  let mounted;
  let dispose;
  let each_value = (
    /*debuggableClients*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
  }
  return {
    c() {
      section = element("section");
      label = element("label");
      t = text("Client\n      \n      ");
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(select, "id", selectId);
      attr(select, "class", "svelte-jvfq3i");
      if (
        /*selected*/
        ctx[2] === void 0
      )
        add_render_callback(() => (
          /*select_change_handler*/
          ctx[4].call(select)
        ));
      attr(label, "class", "svelte-jvfq3i");
      attr(section, "class", "switcher svelte-jvfq3i");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, label);
      append(label, t);
      append(label, select);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select, null);
      }
      select_option(
        select,
        /*selected*/
        ctx[2]
      );
      if (!mounted) {
        dispose = [
          listen(
            select,
            "change",
            /*handleSelection*/
            ctx[3]
          ),
          listen(
            select,
            "change",
            /*select_change_handler*/
            ctx[4]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*debuggableClients, JSON*/
      2) {
        each_value = /*debuggableClients*/
        ctx2[1];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$3(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$3(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & /*selected*/
      4) {
        select_option(
          select,
          /*selected*/
          ctx2[2]
        );
      }
    },
    d(detaching) {
      if (detaching)
        detach(section);
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block$3(ctx) {
  let option;
  let t0;
  let t1;
  let t2_value = JSON.stringify(
    /*clientOption*/
    ctx[7].playerID
  ) + "";
  let t2;
  let t3;
  let t4_value = JSON.stringify(
    /*clientOption*/
    ctx[7].matchID
  ) + "";
  let t4;
  let t5;
  let t6_value = (
    /*clientOption*/
    ctx[7].game.name + ""
  );
  let t6;
  let t7;
  return {
    c() {
      option = element("option");
      t0 = text(
        /*index*/
        ctx[9]
      );
      t1 = text(" —\n            playerID: ");
      t2 = text(t2_value);
      t3 = text(",\n            matchID: ");
      t4 = text(t4_value);
      t5 = text("\n            (");
      t6 = text(t6_value);
      t7 = text(")\n          ");
      option.__value = /*index*/
      ctx[9];
      option.value = option.__value;
      attr(option, "class", "svelte-jvfq3i");
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t0);
      append(option, t1);
      append(option, t2);
      append(option, t3);
      append(option, t4);
      append(option, t5);
      append(option, t6);
      append(option, t7);
    },
    p(ctx2, dirty) {
      if (dirty & /*debuggableClients*/
      2 && t2_value !== (t2_value = JSON.stringify(
        /*clientOption*/
        ctx2[7].playerID
      ) + ""))
        set_data(t2, t2_value);
      if (dirty & /*debuggableClients*/
      2 && t4_value !== (t4_value = JSON.stringify(
        /*clientOption*/
        ctx2[7].matchID
      ) + ""))
        set_data(t4, t4_value);
      if (dirty & /*debuggableClients*/
      2 && t6_value !== (t6_value = /*clientOption*/
      ctx2[7].game.name + ""))
        set_data(t6, t6_value);
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
function create_fragment$d(ctx) {
  let if_block_anchor;
  let if_block = (
    /*debuggableClients*/
    ctx[1].length > 1 && create_if_block$3(ctx)
  );
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (
        /*debuggableClients*/
        ctx2[1].length > 1
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$3(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
const selectId = "bgio-debug-select-client";
function instance$d($$self, $$props, $$invalidate) {
  let $clientManager, $$unsubscribe_clientManager = noop, $$subscribe_clientManager = () => ($$unsubscribe_clientManager(), $$unsubscribe_clientManager = subscribe(clientManager, ($$value) => $$invalidate(6, $clientManager = $$value)), clientManager);
  $$self.$$.on_destroy.push(() => $$unsubscribe_clientManager());
  let { clientManager } = $$props;
  $$subscribe_clientManager();
  const handleSelection = (e) => {
    const selectedClient = debuggableClients[e.target.value];
    clientManager.switchToClient(selectedClient);
    const select = document.getElementById(selectId);
    if (select)
      select.focus();
  };
  function select_change_handler() {
    selected = select_value(this);
    $$invalidate(2, selected), $$invalidate(1, debuggableClients), $$invalidate(5, client), $$invalidate(6, $clientManager);
  }
  $$self.$set = ($$props2) => {
    if ("clientManager" in $$props2)
      $$subscribe_clientManager($$invalidate(0, clientManager = $$props2.clientManager));
  };
  let client;
  let debuggableClients;
  let selected;
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$clientManager*/
    64) {
      $$invalidate(5, { client, debuggableClients } = $clientManager, client, ($$invalidate(1, debuggableClients), $$invalidate(6, $clientManager)));
    }
    if ($$self.$$.dirty & /*debuggableClients, client*/
    34) {
      $$invalidate(2, selected = debuggableClients.indexOf(client));
    }
  };
  return [
    clientManager,
    debuggableClients,
    selected,
    handleSelection,
    select_change_handler
  ];
}
class ClientSwitcher extends SvelteComponent {
  constructor(options) {
    super();
    if (!document_1.getElementById("svelte-jvfq3i-style"))
      add_css$7();
    init(this, options, instance$d, create_fragment$d, safe_not_equal, { clientManager: 0 });
  }
}
function add_css$8() {
  var style = element("style");
  style.id = "svelte-1vfj1mn-style";
  style.textContent = ".key.svelte-1vfj1mn.svelte-1vfj1mn{display:flex;flex-direction:row;align-items:center}button.svelte-1vfj1mn.svelte-1vfj1mn{cursor:pointer;min-width:10px;padding-left:5px;padding-right:5px;height:20px;line-height:20px;text-align:center;border:1px solid #ccc;box-shadow:1px 1px 1px #888;background:#eee;color:#444}button.svelte-1vfj1mn.svelte-1vfj1mn:hover{background:#ddd}.key.active.svelte-1vfj1mn button.svelte-1vfj1mn{background:#ddd;border:1px solid #999;box-shadow:none}label.svelte-1vfj1mn.svelte-1vfj1mn{margin-left:10px}";
  append(document.head, style);
}
function create_if_block$4(ctx) {
  let label_1;
  let t0;
  let t1;
  let span;
  let t2_value = `(shortcut: ${/*value*/
  ctx[0]})`;
  let t2;
  return {
    c() {
      label_1 = element("label");
      t0 = text(
        /*label*/
        ctx[1]
      );
      t1 = space();
      span = element("span");
      t2 = text(t2_value);
      attr(span, "class", "screen-reader-only");
      attr(
        label_1,
        "for",
        /*id*/
        ctx[5]
      );
      attr(label_1, "class", "svelte-1vfj1mn");
    },
    m(target, anchor) {
      insert(target, label_1, anchor);
      append(label_1, t0);
      append(label_1, t1);
      append(label_1, span);
      append(span, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*label*/
      2)
        set_data(
          t0,
          /*label*/
          ctx2[1]
        );
      if (dirty & /*value*/
      1 && t2_value !== (t2_value = `(shortcut: ${/*value*/
      ctx2[0]})`))
        set_data(t2, t2_value);
    },
    d(detaching) {
      if (detaching)
        detach(label_1);
    }
  };
}
function create_fragment$e(ctx) {
  let div;
  let button;
  let t0;
  let t1;
  let mounted;
  let dispose;
  let if_block = (
    /*label*/
    ctx[1] && create_if_block$4(ctx)
  );
  return {
    c() {
      div = element("div");
      button = element("button");
      t0 = text(
        /*value*/
        ctx[0]
      );
      t1 = space();
      if (if_block)
        if_block.c();
      attr(
        button,
        "id",
        /*id*/
        ctx[5]
      );
      button.disabled = /*disable*/
      ctx[2];
      attr(button, "class", "svelte-1vfj1mn");
      attr(div, "class", "key svelte-1vfj1mn");
      toggle_class(
        div,
        "active",
        /*active*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, button);
      append(button, t0);
      append(div, t1);
      if (if_block)
        if_block.m(div, null);
      if (!mounted) {
        dispose = [
          listen(
            window,
            "keydown",
            /*Keypress*/
            ctx[7]
          ),
          listen(
            button,
            "click",
            /*Activate*/
            ctx[6]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*value*/
      1)
        set_data(
          t0,
          /*value*/
          ctx2[0]
        );
      if (dirty & /*disable*/
      4) {
        button.disabled = /*disable*/
        ctx2[2];
      }
      if (
        /*label*/
        ctx2[1]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$4(ctx2);
          if_block.c();
          if_block.m(div, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*active*/
      8) {
        toggle_class(
          div,
          "active",
          /*active*/
          ctx2[3]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block)
        if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$e($$self, $$props, $$invalidate) {
  let $disableHotkeys;
  let { value } = $$props;
  let { onPress = null } = $$props;
  let { label = null } = $$props;
  let { disable = false } = $$props;
  const { disableHotkeys } = getContext("hotkeys");
  component_subscribe($$self, disableHotkeys, (value2) => $$invalidate(9, $disableHotkeys = value2));
  let active2 = false;
  let id = `key-${value}`;
  function Deactivate() {
    $$invalidate(3, active2 = false);
  }
  function Activate() {
    $$invalidate(3, active2 = true);
    setTimeout(Deactivate, 200);
    if (onPress) {
      setTimeout(onPress, 1);
    }
  }
  function Keypress(e) {
    if (!$disableHotkeys && !disable && !e.ctrlKey && !e.metaKey && e.key == value) {
      e.preventDefault();
      Activate();
    }
  }
  $$self.$set = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("onPress" in $$props2)
      $$invalidate(8, onPress = $$props2.onPress);
    if ("label" in $$props2)
      $$invalidate(1, label = $$props2.label);
    if ("disable" in $$props2)
      $$invalidate(2, disable = $$props2.disable);
  };
  return [value, label, disable, active2, disableHotkeys, id, Activate, Keypress, onPress];
}
class Hotkey extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1vfj1mn-style"))
      add_css$8();
    init(this, options, instance$e, create_fragment$e, safe_not_equal, {
      value: 0,
      onPress: 8,
      label: 1,
      disable: 2
    });
  }
}
function add_css$9() {
  var style = element("style");
  style.id = "svelte-1mppqmp-style";
  style.textContent = ".move.svelte-1mppqmp{display:flex;flex-direction:row;cursor:pointer;margin-left:10px;color:#666}.move.svelte-1mppqmp:hover{color:#333}.move.active.svelte-1mppqmp{color:#111;font-weight:bold}.arg-field.svelte-1mppqmp{outline:none;font-family:monospace}";
  append(document.head, style);
}
function create_fragment$f(ctx) {
  let div;
  let span0;
  let t0;
  let t1;
  let span1;
  let t3;
  let span2;
  let t4;
  let span3;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      span0 = element("span");
      t0 = text(
        /*name*/
        ctx[2]
      );
      t1 = space();
      span1 = element("span");
      span1.textContent = "(";
      t3 = space();
      span2 = element("span");
      t4 = space();
      span3 = element("span");
      span3.textContent = ")";
      attr(span2, "class", "arg-field svelte-1mppqmp");
      attr(span2, "contenteditable", "");
      attr(div, "class", "move svelte-1mppqmp");
      toggle_class(
        div,
        "active",
        /*active*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, span0);
      append(span0, t0);
      append(div, t1);
      append(div, span1);
      append(div, t3);
      append(div, span2);
      ctx[6](span2);
      append(div, t4);
      append(div, span3);
      if (!mounted) {
        dispose = [
          listen(span2, "focus", function() {
            if (is_function(
              /*Activate*/
              ctx[0]
            ))
              ctx[0].apply(this, arguments);
          }),
          listen(span2, "blur", function() {
            if (is_function(
              /*Deactivate*/
              ctx[1]
            ))
              ctx[1].apply(this, arguments);
          }),
          listen(span2, "keypress", stop_propagation(keypress_handler)),
          listen(
            span2,
            "keydown",
            /*OnKeyDown*/
            ctx[5]
          ),
          listen(div, "click", function() {
            if (is_function(
              /*Activate*/
              ctx[0]
            ))
              ctx[0].apply(this, arguments);
          })
        ];
        mounted = true;
      }
    },
    p(new_ctx, [dirty]) {
      ctx = new_ctx;
      if (dirty & /*name*/
      4)
        set_data(
          t0,
          /*name*/
          ctx[2]
        );
      if (dirty & /*active*/
      8) {
        toggle_class(
          div,
          "active",
          /*active*/
          ctx[3]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
      ctx[6](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
const keypress_handler = () => {
};
function instance$f($$self, $$props, $$invalidate) {
  let { Activate } = $$props;
  let { Deactivate } = $$props;
  let { name } = $$props;
  let { active: active2 } = $$props;
  let span;
  const dispatch2 = createEventDispatcher();
  function Submit() {
    try {
      const value = span.innerText;
      let argArray = new Function(`return [${value}]`)();
      dispatch2("submit", argArray);
    } catch (error2) {
      dispatch2("error", error2);
    }
    $$invalidate(4, span.innerText = "", span);
  }
  function OnKeyDown(e) {
    if (e.key == "Enter") {
      e.preventDefault();
      Submit();
    }
    if (e.key == "Escape") {
      e.preventDefault();
      Deactivate();
    }
  }
  afterUpdate(() => {
    if (active2) {
      span.focus();
    } else {
      span.blur();
    }
  });
  function span2_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      span = $$value;
      $$invalidate(4, span);
    });
  }
  $$self.$set = ($$props2) => {
    if ("Activate" in $$props2)
      $$invalidate(0, Activate = $$props2.Activate);
    if ("Deactivate" in $$props2)
      $$invalidate(1, Deactivate = $$props2.Deactivate);
    if ("name" in $$props2)
      $$invalidate(2, name = $$props2.name);
    if ("active" in $$props2)
      $$invalidate(3, active2 = $$props2.active);
  };
  return [Activate, Deactivate, name, active2, span, OnKeyDown, span2_binding];
}
class InteractiveFunction extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1mppqmp-style"))
      add_css$9();
    init(this, options, instance$f, create_fragment$f, safe_not_equal, {
      Activate: 0,
      Deactivate: 1,
      name: 2,
      active: 3
    });
  }
}
function add_css$a() {
  var style = element("style");
  style.id = "svelte-smqssc-style";
  style.textContent = ".move-error.svelte-smqssc{color:#a00;font-weight:bold}.wrapper.svelte-smqssc{display:flex;flex-direction:row;align-items:center}";
  append(document.head, style);
}
function create_if_block$5(ctx) {
  let span;
  let t;
  return {
    c() {
      span = element("span");
      t = text(
        /*error*/
        ctx[2]
      );
      attr(span, "class", "move-error svelte-smqssc");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*error*/
      4)
        set_data(
          t,
          /*error*/
          ctx2[2]
        );
    },
    d(detaching) {
      if (detaching)
        detach(span);
    }
  };
}
function create_fragment$g(ctx) {
  let div1;
  let div0;
  let hotkey;
  let t0;
  let interactivefunction;
  let t1;
  let current;
  hotkey = new Hotkey({
    props: {
      value: (
        /*shortcut*/
        ctx[0]
      ),
      onPress: (
        /*Activate*/
        ctx[4]
      )
    }
  });
  interactivefunction = new InteractiveFunction({
    props: {
      Activate: (
        /*Activate*/
        ctx[4]
      ),
      Deactivate: (
        /*Deactivate*/
        ctx[5]
      ),
      name: (
        /*name*/
        ctx[1]
      ),
      active: (
        /*active*/
        ctx[3]
      )
    }
  });
  interactivefunction.$on(
    "submit",
    /*Submit*/
    ctx[6]
  );
  interactivefunction.$on(
    "error",
    /*Error*/
    ctx[7]
  );
  let if_block = (
    /*error*/
    ctx[2] && create_if_block$5(ctx)
  );
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      create_component(hotkey.$$.fragment);
      t0 = space();
      create_component(interactivefunction.$$.fragment);
      t1 = space();
      if (if_block)
        if_block.c();
      attr(div0, "class", "wrapper svelte-smqssc");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      mount_component(hotkey, div0, null);
      append(div0, t0);
      mount_component(interactivefunction, div0, null);
      append(div1, t1);
      if (if_block)
        if_block.m(div1, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      const hotkey_changes = {};
      if (dirty & /*shortcut*/
      1)
        hotkey_changes.value = /*shortcut*/
        ctx2[0];
      hotkey.$set(hotkey_changes);
      const interactivefunction_changes = {};
      if (dirty & /*name*/
      2)
        interactivefunction_changes.name = /*name*/
        ctx2[1];
      if (dirty & /*active*/
      8)
        interactivefunction_changes.active = /*active*/
        ctx2[3];
      interactivefunction.$set(interactivefunction_changes);
      if (
        /*error*/
        ctx2[2]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$5(ctx2);
          if_block.c();
          if_block.m(div1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(hotkey.$$.fragment, local);
      transition_in(interactivefunction.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(hotkey.$$.fragment, local);
      transition_out(interactivefunction.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div1);
      destroy_component(hotkey);
      destroy_component(interactivefunction);
      if (if_block)
        if_block.d();
    }
  };
}
function instance$g($$self, $$props, $$invalidate) {
  let { shortcut } = $$props;
  let { name } = $$props;
  let { fn } = $$props;
  const { disableHotkeys } = getContext("hotkeys");
  let error$1 = "";
  let active2 = false;
  function Activate() {
    disableHotkeys.set(true);
    $$invalidate(3, active2 = true);
  }
  function Deactivate() {
    disableHotkeys.set(false);
    $$invalidate(2, error$1 = "");
    $$invalidate(3, active2 = false);
  }
  function Submit(e) {
    $$invalidate(2, error$1 = "");
    Deactivate();
    fn.apply(this, e.detail);
  }
  function Error2(e) {
    $$invalidate(2, error$1 = e.detail);
    error(e.detail);
  }
  $$self.$set = ($$props2) => {
    if ("shortcut" in $$props2)
      $$invalidate(0, shortcut = $$props2.shortcut);
    if ("name" in $$props2)
      $$invalidate(1, name = $$props2.name);
    if ("fn" in $$props2)
      $$invalidate(8, fn = $$props2.fn);
  };
  return [shortcut, name, error$1, active2, Activate, Deactivate, Submit, Error2, fn];
}
class Move extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-smqssc-style"))
      add_css$a();
    init(this, options, instance$g, create_fragment$g, safe_not_equal, { shortcut: 0, name: 1, fn: 8 });
  }
}
function add_css$b() {
  var style = element("style");
  style.id = "svelte-c3lavh-style";
  style.textContent = "ul.svelte-c3lavh{padding-left:0}li.svelte-c3lavh{list-style:none;margin:none;margin-bottom:5px}";
  append(document.head, style);
}
function create_fragment$h(ctx) {
  let ul;
  let li0;
  let hotkey0;
  let t0;
  let li1;
  let hotkey1;
  let t1;
  let li2;
  let hotkey2;
  let t2;
  let li3;
  let hotkey3;
  let current;
  hotkey0 = new Hotkey({
    props: {
      value: "1",
      onPress: (
        /*client*/
        ctx[0].reset
      ),
      label: "reset"
    }
  });
  hotkey1 = new Hotkey({
    props: {
      value: "2",
      onPress: (
        /*Save*/
        ctx[1]
      ),
      label: "save"
    }
  });
  hotkey2 = new Hotkey({
    props: {
      value: "3",
      onPress: (
        /*Restore*/
        ctx[2]
      ),
      label: "restore"
    }
  });
  hotkey3 = new Hotkey({
    props: { value: ".", disable: true, label: "hide" }
  });
  return {
    c() {
      ul = element("ul");
      li0 = element("li");
      create_component(hotkey0.$$.fragment);
      t0 = space();
      li1 = element("li");
      create_component(hotkey1.$$.fragment);
      t1 = space();
      li2 = element("li");
      create_component(hotkey2.$$.fragment);
      t2 = space();
      li3 = element("li");
      create_component(hotkey3.$$.fragment);
      attr(li0, "class", "svelte-c3lavh");
      attr(li1, "class", "svelte-c3lavh");
      attr(li2, "class", "svelte-c3lavh");
      attr(li3, "class", "svelte-c3lavh");
      attr(ul, "id", "debug-controls");
      attr(ul, "class", "controls svelte-c3lavh");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      append(ul, li0);
      mount_component(hotkey0, li0, null);
      append(ul, t0);
      append(ul, li1);
      mount_component(hotkey1, li1, null);
      append(ul, t1);
      append(ul, li2);
      mount_component(hotkey2, li2, null);
      append(ul, t2);
      append(ul, li3);
      mount_component(hotkey3, li3, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      const hotkey0_changes = {};
      if (dirty & /*client*/
      1)
        hotkey0_changes.onPress = /*client*/
        ctx2[0].reset;
      hotkey0.$set(hotkey0_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(hotkey0.$$.fragment, local);
      transition_in(hotkey1.$$.fragment, local);
      transition_in(hotkey2.$$.fragment, local);
      transition_in(hotkey3.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(hotkey0.$$.fragment, local);
      transition_out(hotkey1.$$.fragment, local);
      transition_out(hotkey2.$$.fragment, local);
      transition_out(hotkey3.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(ul);
      destroy_component(hotkey0);
      destroy_component(hotkey1);
      destroy_component(hotkey2);
      destroy_component(hotkey3);
    }
  };
}
function instance$h($$self, $$props, $$invalidate) {
  let { client } = $$props;
  function Save() {
    const state = client.getState();
    const json = stringify({
      ...state,
      _undo: [],
      _redo: [],
      deltalog: []
    });
    window.localStorage.setItem("gamestate", json);
    window.localStorage.setItem("initialState", stringify(client.initialState));
  }
  function Restore() {
    const gamestateJSON = window.localStorage.getItem("gamestate");
    const initialStateJSON = window.localStorage.getItem("initialState");
    if (gamestateJSON !== null && initialStateJSON !== null) {
      const gamestate = parse(gamestateJSON);
      const initialState = parse(initialStateJSON);
      client.store.dispatch(sync({ state: gamestate, initialState }));
    }
  }
  $$self.$set = ($$props2) => {
    if ("client" in $$props2)
      $$invalidate(0, client = $$props2.client);
  };
  return [client, Save, Restore];
}
class Controls extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-c3lavh-style"))
      add_css$b();
    init(this, options, instance$h, create_fragment$h, safe_not_equal, { client: 0 });
  }
}
function add_css$c() {
  var style = element("style");
  style.id = "svelte-19aan9p-style";
  style.textContent = ".player-box.svelte-19aan9p{display:flex;flex-direction:row}.player.svelte-19aan9p{cursor:pointer;text-align:center;width:30px;height:30px;line-height:30px;background:#eee;border:3px solid #fefefe;box-sizing:content-box;padding:0}.player.current.svelte-19aan9p{background:#555;color:#eee;font-weight:bold}.player.active.svelte-19aan9p{border:3px solid #ff7f50}";
  append(document.head, style);
}
function get_each_context$4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i];
  return child_ctx;
}
function create_each_block$4(ctx) {
  let button;
  let t0_value = (
    /*player*/
    ctx[7] + ""
  );
  let t0;
  let t1;
  let button_aria_label_value;
  let mounted;
  let dispose;
  function click_handler(...args) {
    return (
      /*click_handler*/
      ctx[5](
        /*player*/
        ctx[7],
        ...args
      )
    );
  }
  return {
    c() {
      button = element("button");
      t0 = text(t0_value);
      t1 = space();
      attr(button, "class", "player svelte-19aan9p");
      attr(button, "aria-label", button_aria_label_value = /*playerLabel*/
      ctx[4](
        /*player*/
        ctx[7]
      ));
      toggle_class(
        button,
        "current",
        /*player*/
        ctx[7] == /*ctx*/
        ctx[0].currentPlayer
      );
      toggle_class(
        button,
        "active",
        /*player*/
        ctx[7] == /*playerID*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t0);
      append(button, t1);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*players*/
      4 && t0_value !== (t0_value = /*player*/
      ctx[7] + ""))
        set_data(t0, t0_value);
      if (dirty & /*players*/
      4 && button_aria_label_value !== (button_aria_label_value = /*playerLabel*/
      ctx[4](
        /*player*/
        ctx[7]
      ))) {
        attr(button, "aria-label", button_aria_label_value);
      }
      if (dirty & /*players, ctx*/
      5) {
        toggle_class(
          button,
          "current",
          /*player*/
          ctx[7] == /*ctx*/
          ctx[0].currentPlayer
        );
      }
      if (dirty & /*players, playerID*/
      6) {
        toggle_class(
          button,
          "active",
          /*player*/
          ctx[7] == /*playerID*/
          ctx[1]
        );
      }
    },
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$i(ctx) {
  let div;
  let each_value = (
    /*players*/
    ctx[2]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
  }
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div, "class", "player-box svelte-19aan9p");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div, null);
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*playerLabel, players, ctx, playerID, OnClick*/
      31) {
        each_value = /*players*/
        ctx2[2];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$4(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$4(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$i($$self, $$props, $$invalidate) {
  let { ctx } = $$props;
  let { playerID } = $$props;
  const dispatch2 = createEventDispatcher();
  function OnClick(player) {
    if (player == playerID) {
      dispatch2("change", { playerID: null });
    } else {
      dispatch2("change", { playerID: player });
    }
  }
  function playerLabel(player) {
    const properties = [];
    if (player == ctx.currentPlayer)
      properties.push("current");
    if (player == playerID)
      properties.push("active");
    let label = `Player ${player}`;
    if (properties.length)
      label += ` (${properties.join(", ")})`;
    return label;
  }
  let players;
  const click_handler = (player) => OnClick(player);
  $$self.$set = ($$props2) => {
    if ("ctx" in $$props2)
      $$invalidate(0, ctx = $$props2.ctx);
    if ("playerID" in $$props2)
      $$invalidate(1, playerID = $$props2.playerID);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*ctx*/
    1) {
      $$invalidate(2, players = ctx ? [...Array(ctx.numPlayers).keys()].map((i) => i.toString()) : []);
    }
  };
  return [ctx, playerID, players, OnClick, playerLabel, click_handler];
}
class PlayerInfo extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-19aan9p-style"))
      add_css$c();
    init(this, options, instance$i, create_fragment$i, safe_not_equal, { ctx: 0, playerID: 1 });
  }
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;
  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it)
        o = it;
      var i = 0;
      var F = function() {
      };
      return {
        s: F,
        n: function() {
          if (i >= o.length)
            return {
              done: true
            };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function(e) {
          throw e;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true, didErr = false, err;
  return {
    s: function() {
      it = o[Symbol.iterator]();
    },
    n: function() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function(e) {
      didErr = true;
      err = e;
    },
    f: function() {
      try {
        if (!normalCompletion && it.return != null)
          it.return();
      } finally {
        if (didErr)
          throw err;
      }
    }
  };
}
function AssignShortcuts(moveNames, blacklist) {
  var shortcuts = {};
  var taken = {};
  var _iterator = _createForOfIteratorHelper(blacklist), _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var c = _step.value;
      taken[c] = true;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var t = taken;
  var canUseFirstChar = true;
  for (var name in moveNames) {
    var shortcut = name[0];
    if (t[shortcut]) {
      canUseFirstChar = false;
      break;
    }
    t[shortcut] = true;
    shortcuts[name] = shortcut;
  }
  if (canUseFirstChar) {
    return shortcuts;
  }
  t = taken;
  var next = 97;
  shortcuts = {};
  for (var _name in moveNames) {
    var _shortcut = String.fromCharCode(next);
    while (t[_shortcut]) {
      next++;
      _shortcut = String.fromCharCode(next);
    }
    t[_shortcut] = true;
    shortcuts[_name] = _shortcut;
  }
  return shortcuts;
}
function add_css$d() {
  var style = element("style");
  style.id = "svelte-146sq5f-style";
  style.textContent = ".tree.svelte-146sq5f{--json-tree-font-family:monospace;--json-tree-font-size:14px;--json-tree-null-color:#757575}.label.svelte-146sq5f{margin-bottom:0;text-transform:none}h3.svelte-146sq5f{text-transform:uppercase}ul.svelte-146sq5f{padding-left:0}li.svelte-146sq5f{list-style:none;margin:0;margin-bottom:5px}";
  append(document.head, style);
}
function get_each_context$5(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i][0];
  child_ctx[10] = list[i][1];
  return child_ctx;
}
function create_each_block$5(ctx) {
  let li;
  let move;
  let t;
  let current;
  move = new Move({
    props: {
      shortcut: (
        /*shortcuts*/
        ctx[7][
          /*name*/
          ctx[9]
        ]
      ),
      fn: (
        /*fn*/
        ctx[10]
      ),
      name: (
        /*name*/
        ctx[9]
      )
    }
  });
  return {
    c() {
      li = element("li");
      create_component(move.$$.fragment);
      t = space();
      attr(li, "class", "svelte-146sq5f");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      mount_component(move, li, null);
      append(li, t);
      current = true;
    },
    p(ctx2, dirty) {
      const move_changes = {};
      if (dirty & /*moves*/
      8)
        move_changes.shortcut = /*shortcuts*/
        ctx2[7][
          /*name*/
          ctx2[9]
        ];
      if (dirty & /*moves*/
      8)
        move_changes.fn = /*fn*/
        ctx2[10];
      if (dirty & /*moves*/
      8)
        move_changes.name = /*name*/
        ctx2[9];
      move.$set(move_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(move.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(move.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(li);
      destroy_component(move);
    }
  };
}
function create_if_block_2$2(ctx) {
  let li;
  let move;
  let current;
  move = new Move({
    props: {
      name: "endStage",
      shortcut: 7,
      fn: (
        /*events*/
        ctx[4].endStage
      )
    }
  });
  return {
    c() {
      li = element("li");
      create_component(move.$$.fragment);
      attr(li, "class", "svelte-146sq5f");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      mount_component(move, li, null);
      current = true;
    },
    p(ctx2, dirty) {
      const move_changes = {};
      if (dirty & /*events*/
      16)
        move_changes.fn = /*events*/
        ctx2[4].endStage;
      move.$set(move_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(move.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(move.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(li);
      destroy_component(move);
    }
  };
}
function create_if_block_1$2(ctx) {
  let li;
  let move;
  let current;
  move = new Move({
    props: {
      name: "endTurn",
      shortcut: 8,
      fn: (
        /*events*/
        ctx[4].endTurn
      )
    }
  });
  return {
    c() {
      li = element("li");
      create_component(move.$$.fragment);
      attr(li, "class", "svelte-146sq5f");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      mount_component(move, li, null);
      current = true;
    },
    p(ctx2, dirty) {
      const move_changes = {};
      if (dirty & /*events*/
      16)
        move_changes.fn = /*events*/
        ctx2[4].endTurn;
      move.$set(move_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(move.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(move.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(li);
      destroy_component(move);
    }
  };
}
function create_if_block$6(ctx) {
  let li;
  let move;
  let current;
  move = new Move({
    props: {
      name: "endPhase",
      shortcut: 9,
      fn: (
        /*events*/
        ctx[4].endPhase
      )
    }
  });
  return {
    c() {
      li = element("li");
      create_component(move.$$.fragment);
      attr(li, "class", "svelte-146sq5f");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      mount_component(move, li, null);
      current = true;
    },
    p(ctx2, dirty) {
      const move_changes = {};
      if (dirty & /*events*/
      16)
        move_changes.fn = /*events*/
        ctx2[4].endPhase;
      move.$set(move_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(move.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(move.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(li);
      destroy_component(move);
    }
  };
}
function create_fragment$j(ctx) {
  let section0;
  let h30;
  let t1;
  let controls;
  let t2;
  let section1;
  let h31;
  let t4;
  let playerinfo;
  let t5;
  let section2;
  let h32;
  let t7;
  let ul0;
  let t8;
  let section3;
  let h33;
  let t10;
  let ul1;
  let t11;
  let t12;
  let t13;
  let section4;
  let h34;
  let t15;
  let jsontree0;
  let t16;
  let section5;
  let h35;
  let t18;
  let jsontree1;
  let t19;
  let clientswitcher;
  let current;
  controls = new Controls({ props: { client: (
    /*client*/
    ctx[0]
  ) } });
  playerinfo = new PlayerInfo({
    props: {
      ctx: (
        /*ctx*/
        ctx[5]
      ),
      playerID: (
        /*playerID*/
        ctx[2]
      )
    }
  });
  playerinfo.$on(
    "change",
    /*change_handler*/
    ctx[8]
  );
  let each_value = Object.entries(
    /*moves*/
    ctx[3]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  let if_block0 = (
    /*ctx*/
    ctx[5].activePlayers && /*events*/
    ctx[4].endStage && create_if_block_2$2(ctx)
  );
  let if_block1 = (
    /*events*/
    ctx[4].endTurn && create_if_block_1$2(ctx)
  );
  let if_block2 = (
    /*ctx*/
    ctx[5].phase && /*events*/
    ctx[4].endPhase && create_if_block$6(ctx)
  );
  jsontree0 = new Root({ props: { value: (
    /*G*/
    ctx[6]
  ) } });
  jsontree1 = new Root({
    props: { value: SanitizeCtx(
      /*ctx*/
      ctx[5]
    ) }
  });
  clientswitcher = new ClientSwitcher({
    props: { clientManager: (
      /*clientManager*/
      ctx[1]
    ) }
  });
  return {
    c() {
      section0 = element("section");
      h30 = element("h3");
      h30.textContent = "Controls";
      t1 = space();
      create_component(controls.$$.fragment);
      t2 = space();
      section1 = element("section");
      h31 = element("h3");
      h31.textContent = "Players";
      t4 = space();
      create_component(playerinfo.$$.fragment);
      t5 = space();
      section2 = element("section");
      h32 = element("h3");
      h32.textContent = "Moves";
      t7 = space();
      ul0 = element("ul");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t8 = space();
      section3 = element("section");
      h33 = element("h3");
      h33.textContent = "Events";
      t10 = space();
      ul1 = element("ul");
      if (if_block0)
        if_block0.c();
      t11 = space();
      if (if_block1)
        if_block1.c();
      t12 = space();
      if (if_block2)
        if_block2.c();
      t13 = space();
      section4 = element("section");
      h34 = element("h3");
      h34.textContent = "G";
      t15 = space();
      create_component(jsontree0.$$.fragment);
      t16 = space();
      section5 = element("section");
      h35 = element("h3");
      h35.textContent = "ctx";
      t18 = space();
      create_component(jsontree1.$$.fragment);
      t19 = space();
      create_component(clientswitcher.$$.fragment);
      attr(h30, "class", "svelte-146sq5f");
      attr(h31, "class", "svelte-146sq5f");
      attr(h32, "class", "svelte-146sq5f");
      attr(ul0, "class", "svelte-146sq5f");
      attr(h33, "class", "svelte-146sq5f");
      attr(ul1, "class", "svelte-146sq5f");
      attr(h34, "class", "label svelte-146sq5f");
      attr(section4, "class", "tree svelte-146sq5f");
      attr(h35, "class", "label svelte-146sq5f");
      attr(section5, "class", "tree svelte-146sq5f");
    },
    m(target, anchor) {
      insert(target, section0, anchor);
      append(section0, h30);
      append(section0, t1);
      mount_component(controls, section0, null);
      insert(target, t2, anchor);
      insert(target, section1, anchor);
      append(section1, h31);
      append(section1, t4);
      mount_component(playerinfo, section1, null);
      insert(target, t5, anchor);
      insert(target, section2, anchor);
      append(section2, h32);
      append(section2, t7);
      append(section2, ul0);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(ul0, null);
      }
      insert(target, t8, anchor);
      insert(target, section3, anchor);
      append(section3, h33);
      append(section3, t10);
      append(section3, ul1);
      if (if_block0)
        if_block0.m(ul1, null);
      append(ul1, t11);
      if (if_block1)
        if_block1.m(ul1, null);
      append(ul1, t12);
      if (if_block2)
        if_block2.m(ul1, null);
      insert(target, t13, anchor);
      insert(target, section4, anchor);
      append(section4, h34);
      append(section4, t15);
      mount_component(jsontree0, section4, null);
      insert(target, t16, anchor);
      insert(target, section5, anchor);
      append(section5, h35);
      append(section5, t18);
      mount_component(jsontree1, section5, null);
      insert(target, t19, anchor);
      mount_component(clientswitcher, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const controls_changes = {};
      if (dirty & /*client*/
      1)
        controls_changes.client = /*client*/
        ctx2[0];
      controls.$set(controls_changes);
      const playerinfo_changes = {};
      if (dirty & /*ctx*/
      32)
        playerinfo_changes.ctx = /*ctx*/
        ctx2[5];
      if (dirty & /*playerID*/
      4)
        playerinfo_changes.playerID = /*playerID*/
        ctx2[2];
      playerinfo.$set(playerinfo_changes);
      if (dirty & /*shortcuts, Object, moves*/
      136) {
        each_value = Object.entries(
          /*moves*/
          ctx2[3]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$5(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$5(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(ul0, null);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      if (
        /*ctx*/
        ctx2[5].activePlayers && /*events*/
        ctx2[4].endStage
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & /*ctx, events*/
          48) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_2$2(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(ul1, t11);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (
        /*events*/
        ctx2[4].endTurn
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*events*/
          16) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_1$2(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(ul1, t12);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (
        /*ctx*/
        ctx2[5].phase && /*events*/
        ctx2[4].endPhase
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty & /*ctx, events*/
          48) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block$6(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(ul1, null);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      const jsontree0_changes = {};
      if (dirty & /*G*/
      64)
        jsontree0_changes.value = /*G*/
        ctx2[6];
      jsontree0.$set(jsontree0_changes);
      const jsontree1_changes = {};
      if (dirty & /*ctx*/
      32)
        jsontree1_changes.value = SanitizeCtx(
          /*ctx*/
          ctx2[5]
        );
      jsontree1.$set(jsontree1_changes);
      const clientswitcher_changes = {};
      if (dirty & /*clientManager*/
      2)
        clientswitcher_changes.clientManager = /*clientManager*/
        ctx2[1];
      clientswitcher.$set(clientswitcher_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(controls.$$.fragment, local);
      transition_in(playerinfo.$$.fragment, local);
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(if_block2);
      transition_in(jsontree0.$$.fragment, local);
      transition_in(jsontree1.$$.fragment, local);
      transition_in(clientswitcher.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(controls.$$.fragment, local);
      transition_out(playerinfo.$$.fragment, local);
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(if_block2);
      transition_out(jsontree0.$$.fragment, local);
      transition_out(jsontree1.$$.fragment, local);
      transition_out(clientswitcher.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(section0);
      destroy_component(controls);
      if (detaching)
        detach(t2);
      if (detaching)
        detach(section1);
      destroy_component(playerinfo);
      if (detaching)
        detach(t5);
      if (detaching)
        detach(section2);
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach(t8);
      if (detaching)
        detach(section3);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
      if (detaching)
        detach(t13);
      if (detaching)
        detach(section4);
      destroy_component(jsontree0);
      if (detaching)
        detach(t16);
      if (detaching)
        detach(section5);
      destroy_component(jsontree1);
      if (detaching)
        detach(t19);
      destroy_component(clientswitcher, detaching);
    }
  };
}
function SanitizeCtx(ctx) {
  let r = {};
  for (const key in ctx) {
    if (!key.startsWith("_")) {
      r[key] = ctx[key];
    }
  }
  return r;
}
function instance$j($$self, $$props, $$invalidate) {
  let { client } = $$props;
  let { clientManager } = $$props;
  const shortcuts = AssignShortcuts(client.moves, "mlia");
  let { playerID, moves, events } = client;
  let ctx = {};
  let G = {};
  client.subscribe((state) => {
    if (state)
      $$invalidate(6, { G, ctx } = state, G, $$invalidate(5, ctx));
    $$invalidate(2, { playerID, moves, events } = client, playerID, $$invalidate(3, moves), $$invalidate(4, events));
  });
  const change_handler = (e) => clientManager.switchPlayerID(e.detail.playerID);
  $$self.$set = ($$props2) => {
    if ("client" in $$props2)
      $$invalidate(0, client = $$props2.client);
    if ("clientManager" in $$props2)
      $$invalidate(1, clientManager = $$props2.clientManager);
  };
  return [
    client,
    clientManager,
    playerID,
    moves,
    events,
    ctx,
    G,
    shortcuts,
    change_handler
  ];
}
class Main extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-146sq5f-style"))
      add_css$d();
    init(this, options, instance$j, create_fragment$j, safe_not_equal, { client: 0, clientManager: 1 });
  }
}
function add_css$e() {
  var style = element("style");
  style.id = "svelte-13qih23-style";
  style.textContent = ".item.svelte-13qih23.svelte-13qih23{padding:10px}.item.svelte-13qih23.svelte-13qih23:not(:first-child){border-top:1px dashed #aaa}.item.svelte-13qih23 div.svelte-13qih23{float:right;text-align:right}";
  append(document.head, style);
}
function create_fragment$k(ctx) {
  let div1;
  let strong;
  let t0;
  let t1;
  let div0;
  let t2_value = JSON.stringify(
    /*value*/
    ctx[1]
  ) + "";
  let t2;
  return {
    c() {
      div1 = element("div");
      strong = element("strong");
      t0 = text(
        /*name*/
        ctx[0]
      );
      t1 = space();
      div0 = element("div");
      t2 = text(t2_value);
      attr(div0, "class", "svelte-13qih23");
      attr(div1, "class", "item svelte-13qih23");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, strong);
      append(strong, t0);
      append(div1, t1);
      append(div1, div0);
      append(div0, t2);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*name*/
      1)
        set_data(
          t0,
          /*name*/
          ctx2[0]
        );
      if (dirty & /*value*/
      2 && t2_value !== (t2_value = JSON.stringify(
        /*value*/
        ctx2[1]
      ) + ""))
        set_data(t2, t2_value);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div1);
    }
  };
}
function instance$k($$self, $$props, $$invalidate) {
  let { name } = $$props;
  let { value } = $$props;
  $$self.$set = ($$props2) => {
    if ("name" in $$props2)
      $$invalidate(0, name = $$props2.name);
    if ("value" in $$props2)
      $$invalidate(1, value = $$props2.value);
  };
  return [name, value];
}
class Item extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-13qih23-style"))
      add_css$e();
    init(this, options, instance$k, create_fragment$k, safe_not_equal, { name: 0, value: 1 });
  }
}
function add_css$f() {
  var style = element("style");
  style.id = "svelte-1yzq5o8-style";
  style.textContent = ".gameinfo.svelte-1yzq5o8{padding:10px}";
  append(document.head, style);
}
function create_if_block$7(ctx) {
  let item;
  let current;
  item = new Item({
    props: {
      name: "isConnected",
      value: (
        /*$client*/
        ctx[1].isConnected
      )
    }
  });
  return {
    c() {
      create_component(item.$$.fragment);
    },
    m(target, anchor) {
      mount_component(item, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const item_changes = {};
      if (dirty & /*$client*/
      2)
        item_changes.value = /*$client*/
        ctx2[1].isConnected;
      item.$set(item_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(item.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(item.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(item, detaching);
    }
  };
}
function create_fragment$l(ctx) {
  let section;
  let item0;
  let t0;
  let item1;
  let t1;
  let item2;
  let t2;
  let current;
  item0 = new Item({
    props: {
      name: "matchID",
      value: (
        /*client*/
        ctx[0].matchID
      )
    }
  });
  item1 = new Item({
    props: {
      name: "playerID",
      value: (
        /*client*/
        ctx[0].playerID
      )
    }
  });
  item2 = new Item({
    props: {
      name: "isActive",
      value: (
        /*$client*/
        ctx[1].isActive
      )
    }
  });
  let if_block = (
    /*client*/
    ctx[0].multiplayer && create_if_block$7(ctx)
  );
  return {
    c() {
      section = element("section");
      create_component(item0.$$.fragment);
      t0 = space();
      create_component(item1.$$.fragment);
      t1 = space();
      create_component(item2.$$.fragment);
      t2 = space();
      if (if_block)
        if_block.c();
      attr(section, "class", "gameinfo svelte-1yzq5o8");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      mount_component(item0, section, null);
      append(section, t0);
      mount_component(item1, section, null);
      append(section, t1);
      mount_component(item2, section, null);
      append(section, t2);
      if (if_block)
        if_block.m(section, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      const item0_changes = {};
      if (dirty & /*client*/
      1)
        item0_changes.value = /*client*/
        ctx2[0].matchID;
      item0.$set(item0_changes);
      const item1_changes = {};
      if (dirty & /*client*/
      1)
        item1_changes.value = /*client*/
        ctx2[0].playerID;
      item1.$set(item1_changes);
      const item2_changes = {};
      if (dirty & /*$client*/
      2)
        item2_changes.value = /*$client*/
        ctx2[1].isActive;
      item2.$set(item2_changes);
      if (
        /*client*/
        ctx2[0].multiplayer
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*client*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$7(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(section, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(item0.$$.fragment, local);
      transition_in(item1.$$.fragment, local);
      transition_in(item2.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(item0.$$.fragment, local);
      transition_out(item1.$$.fragment, local);
      transition_out(item2.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(section);
      destroy_component(item0);
      destroy_component(item1);
      destroy_component(item2);
      if (if_block)
        if_block.d();
    }
  };
}
function instance$l($$self, $$props, $$invalidate) {
  let $client, $$unsubscribe_client = noop, $$subscribe_client = () => ($$unsubscribe_client(), $$unsubscribe_client = subscribe(client, ($$value) => $$invalidate(1, $client = $$value)), client);
  $$self.$$.on_destroy.push(() => $$unsubscribe_client());
  let { client } = $$props;
  $$subscribe_client();
  let { clientManager } = $$props;
  $$self.$set = ($$props2) => {
    if ("client" in $$props2)
      $$subscribe_client($$invalidate(0, client = $$props2.client));
    if ("clientManager" in $$props2)
      $$invalidate(2, clientManager = $$props2.clientManager);
  };
  return [client, $client, clientManager];
}
class Info extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1yzq5o8-style"))
      add_css$f();
    init(this, options, instance$l, create_fragment$l, safe_not_equal, { client: 0, clientManager: 2 });
  }
}
function add_css$g() {
  var style = element("style");
  style.id = "svelte-6eza86-style";
  style.textContent = ".turn-marker.svelte-6eza86{display:flex;justify-content:center;align-items:center;grid-column:1;background:#555;color:#eee;text-align:center;font-weight:bold;border:1px solid #888}";
  append(document.head, style);
}
function create_fragment$m(ctx) {
  let div;
  let t;
  return {
    c() {
      div = element("div");
      t = text(
        /*turn*/
        ctx[0]
      );
      attr(div, "class", "turn-marker svelte-6eza86");
      attr(
        div,
        "style",
        /*style*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*turn*/
      1)
        set_data(
          t,
          /*turn*/
          ctx2[0]
        );
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function instance$m($$self, $$props, $$invalidate) {
  let { turn } = $$props;
  let { numEvents } = $$props;
  const style = `grid-row: span ${numEvents}`;
  $$self.$set = ($$props2) => {
    if ("turn" in $$props2)
      $$invalidate(0, turn = $$props2.turn);
    if ("numEvents" in $$props2)
      $$invalidate(2, numEvents = $$props2.numEvents);
  };
  return [turn, style, numEvents];
}
class TurnMarker extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-6eza86-style"))
      add_css$g();
    init(this, options, instance$m, create_fragment$m, safe_not_equal, { turn: 0, numEvents: 2 });
  }
}
function add_css$h() {
  var style = element("style");
  style.id = "svelte-1t4xap-style";
  style.textContent = ".phase-marker.svelte-1t4xap{grid-column:3;background:#555;border:1px solid #888;color:#eee;text-align:center;font-weight:bold;padding-top:10px;padding-bottom:10px;text-orientation:sideways;writing-mode:vertical-rl;line-height:30px;width:100%}";
  append(document.head, style);
}
function create_fragment$n(ctx) {
  let div;
  let t_value = (
    /*phase*/
    (ctx[0] || "") + ""
  );
  let t;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      attr(div, "class", "phase-marker svelte-1t4xap");
      attr(
        div,
        "style",
        /*style*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*phase*/
      1 && t_value !== (t_value = /*phase*/
      (ctx2[0] || "") + ""))
        set_data(t, t_value);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function instance$n($$self, $$props, $$invalidate) {
  let { phase } = $$props;
  let { numEvents } = $$props;
  const style = `grid-row: span ${numEvents}`;
  $$self.$set = ($$props2) => {
    if ("phase" in $$props2)
      $$invalidate(0, phase = $$props2.phase);
    if ("numEvents" in $$props2)
      $$invalidate(2, numEvents = $$props2.numEvents);
  };
  return [phase, style, numEvents];
}
class PhaseMarker extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1t4xap-style"))
      add_css$h();
    init(this, options, instance$n, create_fragment$n, safe_not_equal, { phase: 0, numEvents: 2 });
  }
}
function create_fragment$o(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${/*renderedMetadata*/
      ctx[0]}`;
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function instance$o($$self, $$props, $$invalidate) {
  let { metadata } = $$props;
  const renderedMetadata = metadata !== void 0 ? JSON.stringify(metadata, null, 4) : "";
  $$self.$set = ($$props2) => {
    if ("metadata" in $$props2)
      $$invalidate(1, metadata = $$props2.metadata);
  };
  return [renderedMetadata, metadata];
}
class LogMetadata extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$o, create_fragment$o, safe_not_equal, { metadata: 1 });
  }
}
function add_css$i() {
  var style = element("style");
  style.id = "svelte-vajd9z-style";
  style.textContent = ".log-event.svelte-vajd9z{grid-column:2;cursor:pointer;overflow:hidden;display:flex;flex-direction:column;justify-content:center;background:#fff;border:1px dotted #ccc;border-left:5px solid #ccc;padding:5px;text-align:center;color:#666;font-size:14px;min-height:25px;line-height:25px}.log-event.svelte-vajd9z:hover,.log-event.svelte-vajd9z:focus{border-style:solid;background:#eee}.log-event.pinned.svelte-vajd9z{border-style:solid;background:#eee;opacity:1}.args.svelte-vajd9z{text-align:left;white-space:pre-wrap}.player0.svelte-vajd9z{border-left-color:#ff851b}.player1.svelte-vajd9z{border-left-color:#7fdbff}.player2.svelte-vajd9z{border-left-color:#0074d9}.player3.svelte-vajd9z{border-left-color:#39cccc}.player4.svelte-vajd9z{border-left-color:#3d9970}.player5.svelte-vajd9z{border-left-color:#2ecc40}.player6.svelte-vajd9z{border-left-color:#01ff70}.player7.svelte-vajd9z{border-left-color:#ffdc00}.player8.svelte-vajd9z{border-left-color:#001f3f}.player9.svelte-vajd9z{border-left-color:#ff4136}.player10.svelte-vajd9z{border-left-color:#85144b}.player11.svelte-vajd9z{border-left-color:#f012be}.player12.svelte-vajd9z{border-left-color:#b10dc9}.player13.svelte-vajd9z{border-left-color:#111111}.player14.svelte-vajd9z{border-left-color:#aaaaaa}.player15.svelte-vajd9z{border-left-color:#dddddd}";
  append(document.head, style);
}
function create_else_block$1(ctx) {
  let logmetadata;
  let current;
  logmetadata = new LogMetadata({ props: { metadata: (
    /*metadata*/
    ctx[2]
  ) } });
  return {
    c() {
      create_component(logmetadata.$$.fragment);
    },
    m(target, anchor) {
      mount_component(logmetadata, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const logmetadata_changes = {};
      if (dirty & /*metadata*/
      4)
        logmetadata_changes.metadata = /*metadata*/
        ctx2[2];
      logmetadata.$set(logmetadata_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(logmetadata.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(logmetadata.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(logmetadata, detaching);
    }
  };
}
function create_if_block$8(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  var switch_value = (
    /*metadataComponent*/
    ctx[3]
  );
  function switch_props(ctx2) {
    return { props: { metadata: (
      /*metadata*/
      ctx2[2]
    ) } };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
  }
  return {
    c() {
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      switch_instance_anchor = empty();
    },
    m(target, anchor) {
      if (switch_instance) {
        mount_component(switch_instance, target, anchor);
      }
      insert(target, switch_instance_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const switch_instance_changes = {};
      if (dirty & /*metadata*/
      4)
        switch_instance_changes.metadata = /*metadata*/
        ctx2[2];
      if (switch_value !== (switch_value = /*metadataComponent*/
      ctx2[3])) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx2));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i(local) {
      if (current)
        return;
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(switch_instance_anchor);
      if (switch_instance)
        destroy_component(switch_instance, detaching);
    }
  };
}
function create_fragment$p(ctx) {
  let button;
  let div;
  let t0;
  let t1;
  let t2;
  let t3;
  let t4;
  let current_block_type_index;
  let if_block;
  let current;
  let mounted;
  let dispose;
  const if_block_creators = [create_if_block$8, create_else_block$1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*metadataComponent*/
      ctx2[3]
    )
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      button = element("button");
      div = element("div");
      t0 = text(
        /*actionType*/
        ctx[4]
      );
      t1 = text("(");
      t2 = text(
        /*renderedArgs*/
        ctx[6]
      );
      t3 = text(")");
      t4 = space();
      if_block.c();
      attr(div, "class", "args svelte-vajd9z");
      attr(button, "class", "log-event player" + /*playerID*/
      ctx[7] + " svelte-vajd9z");
      toggle_class(
        button,
        "pinned",
        /*pinned*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, div);
      append(div, t0);
      append(div, t1);
      append(div, t2);
      append(div, t3);
      append(button, t4);
      if_blocks[current_block_type_index].m(button, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            button,
            "click",
            /*click_handler*/
            ctx[9]
          ),
          listen(
            button,
            "mouseenter",
            /*mouseenter_handler*/
            ctx[10]
          ),
          listen(
            button,
            "focus",
            /*focus_handler*/
            ctx[11]
          ),
          listen(
            button,
            "mouseleave",
            /*mouseleave_handler*/
            ctx[12]
          ),
          listen(
            button,
            "blur",
            /*blur_handler*/
            ctx[13]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (!current || dirty & /*actionType*/
      16)
        set_data(
          t0,
          /*actionType*/
          ctx2[4]
        );
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        }
        transition_in(if_block, 1);
        if_block.m(button, null);
      }
      if (dirty & /*pinned*/
      2) {
        toggle_class(
          button,
          "pinned",
          /*pinned*/
          ctx2[1]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(button);
      if_blocks[current_block_type_index].d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$p($$self, $$props, $$invalidate) {
  let { logIndex } = $$props;
  let { action } = $$props;
  let { pinned } = $$props;
  let { metadata } = $$props;
  let { metadataComponent } = $$props;
  const dispatch2 = createEventDispatcher();
  const args = action.payload.args;
  const renderedArgs = Array.isArray(args) ? args.map((arg) => JSON.stringify(arg, null, 2)).join(",") : JSON.stringify(args, null, 2) || "";
  const playerID = action.payload.playerID;
  let actionType;
  switch (action.type) {
    case "UNDO":
      actionType = "undo";
      break;
    case "REDO":
      actionType = "redo";
    case "GAME_EVENT":
    case "MAKE_MOVE":
    default:
      actionType = action.payload.type;
      break;
  }
  const click_handler = () => dispatch2("click", { logIndex });
  const mouseenter_handler = () => dispatch2("mouseenter", { logIndex });
  const focus_handler = () => dispatch2("mouseenter", { logIndex });
  const mouseleave_handler = () => dispatch2("mouseleave");
  const blur_handler = () => dispatch2("mouseleave");
  $$self.$set = ($$props2) => {
    if ("logIndex" in $$props2)
      $$invalidate(0, logIndex = $$props2.logIndex);
    if ("action" in $$props2)
      $$invalidate(8, action = $$props2.action);
    if ("pinned" in $$props2)
      $$invalidate(1, pinned = $$props2.pinned);
    if ("metadata" in $$props2)
      $$invalidate(2, metadata = $$props2.metadata);
    if ("metadataComponent" in $$props2)
      $$invalidate(3, metadataComponent = $$props2.metadataComponent);
  };
  return [
    logIndex,
    pinned,
    metadata,
    metadataComponent,
    actionType,
    dispatch2,
    renderedArgs,
    playerID,
    action,
    click_handler,
    mouseenter_handler,
    focus_handler,
    mouseleave_handler,
    blur_handler
  ];
}
class LogEvent extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-vajd9z-style"))
      add_css$i();
    init(this, options, instance$p, create_fragment$p, safe_not_equal, {
      logIndex: 0,
      action: 8,
      pinned: 1,
      metadata: 2,
      metadataComponent: 3
    });
  }
}
function add_css$j() {
  var style = element("style");
  style.id = "svelte-c8tyih-style";
  style.textContent = "svg.svelte-c8tyih{stroke:currentColor;fill:currentColor;stroke-width:0;width:100%;height:auto;max-height:100%}";
  append(document.head, style);
}
function create_if_block$9(ctx) {
  let title_1;
  let t;
  return {
    c() {
      title_1 = svg_element("title");
      t = text(
        /*title*/
        ctx[0]
      );
    },
    m(target, anchor) {
      insert(target, title_1, anchor);
      append(title_1, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*title*/
      1)
        set_data(
          t,
          /*title*/
          ctx2[0]
        );
    },
    d(detaching) {
      if (detaching)
        detach(title_1);
    }
  };
}
function create_fragment$q(ctx) {
  let svg;
  let if_block_anchor;
  let current;
  let if_block = (
    /*title*/
    ctx[0] && create_if_block$9(ctx)
  );
  const default_slot_template = (
    /*$$slots*/
    ctx[3].default
  );
  const default_slot = create_slot(
    default_slot_template,
    ctx,
    /*$$scope*/
    ctx[2],
    null
  );
  return {
    c() {
      svg = svg_element("svg");
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      if (default_slot)
        default_slot.c();
      attr(svg, "xmlns", "http://www.w3.org/2000/svg");
      attr(
        svg,
        "viewBox",
        /*viewBox*/
        ctx[1]
      );
      attr(svg, "class", "svelte-c8tyih");
    },
    m(target, anchor) {
      insert(target, svg, anchor);
      if (if_block)
        if_block.m(svg, null);
      append(svg, if_block_anchor);
      if (default_slot) {
        default_slot.m(svg, null);
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (
        /*title*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$9(ctx2);
          if_block.c();
          if_block.m(svg, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (default_slot) {
        if (default_slot.p && dirty & /*$$scope*/
        4) {
          update_slot(
            default_slot,
            default_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[2],
            dirty,
            null,
            null
          );
        }
      }
      if (!current || dirty & /*viewBox*/
      2) {
        attr(
          svg,
          "viewBox",
          /*viewBox*/
          ctx2[1]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(svg);
      if (if_block)
        if_block.d();
      if (default_slot)
        default_slot.d(detaching);
    }
  };
}
function instance$q($$self, $$props, $$invalidate) {
  let { title = null } = $$props;
  let { viewBox } = $$props;
  let { $$slots = {}, $$scope } = $$props;
  $$self.$set = ($$props2) => {
    if ("title" in $$props2)
      $$invalidate(0, title = $$props2.title);
    if ("viewBox" in $$props2)
      $$invalidate(1, viewBox = $$props2.viewBox);
    if ("$$scope" in $$props2)
      $$invalidate(2, $$scope = $$props2.$$scope);
  };
  return [title, viewBox, $$scope, $$slots];
}
class IconBase extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-c8tyih-style"))
      add_css$j();
    init(this, options, instance$q, create_fragment$q, safe_not_equal, { title: 0, viewBox: 1 });
  }
}
function create_default_slot(ctx) {
  let path;
  return {
    c() {
      path = svg_element("path");
      attr(path, "d", "M504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zM212 140v116h-70.9c-10.7 0-16.1 13-8.5 20.5l114.9 114.3c4.7 4.7 12.2 4.7 16.9 0l114.9-114.3c7.6-7.6 2.2-20.5-8.5-20.5H300V140c0-6.6-5.4-12-12-12h-64c-6.6 0-12 5.4-12 12z");
    },
    m(target, anchor) {
      insert(target, path, anchor);
    },
    d(detaching) {
      if (detaching)
        detach(path);
    }
  };
}
function create_fragment$r(ctx) {
  let iconbase;
  let current;
  const iconbase_spread_levels = [
    { viewBox: "0 0 512 512" },
    /*$$props*/
    ctx[0]
  ];
  let iconbase_props = {
    $$slots: { default: [create_default_slot] },
    $$scope: { ctx }
  };
  for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
  }
  iconbase = new IconBase({ props: iconbase_props });
  return {
    c() {
      create_component(iconbase.$$.fragment);
    },
    m(target, anchor) {
      mount_component(iconbase, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const iconbase_changes = dirty & /*$$props*/
      1 ? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(
        /*$$props*/
        ctx2[0]
      )]) : {};
      if (dirty & /*$$scope*/
      2) {
        iconbase_changes.$$scope = { dirty, ctx: ctx2 };
      }
      iconbase.$set(iconbase_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(iconbase.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbase.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(iconbase, detaching);
    }
  };
}
function instance$r($$self, $$props, $$invalidate) {
  $$self.$set = ($$new_props) => {
    $$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
  };
  $$props = exclude_internal_props($$props);
  return [$$props];
}
class FaArrowAltCircleDown extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$r, create_fragment$r, safe_not_equal, {});
  }
}
function add_css$k() {
  var style = element("style");
  style.id = "svelte-1a7time-style";
  style.textContent = "div.svelte-1a7time{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;max-width:500px}";
  append(document.head, style);
}
function create_fragment$s(ctx) {
  let div;
  let t;
  return {
    c() {
      div = element("div");
      t = text(
        /*text*/
        ctx[0]
      );
      attr(
        div,
        "alt",
        /*text*/
        ctx[0]
      );
      attr(div, "class", "svelte-1a7time");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*text*/
      1)
        set_data(
          t,
          /*text*/
          ctx2[0]
        );
      if (dirty & /*text*/
      1) {
        attr(
          div,
          "alt",
          /*text*/
          ctx2[0]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function instance$s($$self, $$props, $$invalidate) {
  let { action } = $$props;
  let text2;
  $$self.$set = ($$props2) => {
    if ("action" in $$props2)
      $$invalidate(1, action = $$props2.action);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*action*/
    2) {
      {
        const { type, args } = action.payload;
        const argsFormatted = (args || []).join(",");
        $$invalidate(0, text2 = `${type}(${argsFormatted})`);
      }
    }
  };
  return [text2, action];
}
class Action extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1a7time-style"))
      add_css$k();
    init(this, options, instance$s, create_fragment$s, safe_not_equal, { action: 1 });
  }
}
function add_css$l() {
  var style = element("style");
  style.id = "svelte-ztcwsu-style";
  style.textContent = "table.svelte-ztcwsu.svelte-ztcwsu{font-size:12px;border-collapse:collapse;border:1px solid #ddd;padding:0}tr.svelte-ztcwsu.svelte-ztcwsu{cursor:pointer}tr.svelte-ztcwsu:hover td.svelte-ztcwsu{background:#eee}tr.selected.svelte-ztcwsu td.svelte-ztcwsu{background:#eee}td.svelte-ztcwsu.svelte-ztcwsu{padding:10px;height:10px;line-height:10px;font-size:12px;border:none}th.svelte-ztcwsu.svelte-ztcwsu{background:#888;color:#fff;padding:10px;text-align:center}";
  append(document.head, style);
}
function get_each_context$6(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[10] = list[i];
  child_ctx[12] = i;
  return child_ctx;
}
function create_each_block$6(ctx) {
  let tr;
  let td0;
  let t0_value = (
    /*child*/
    ctx[10].value + ""
  );
  let t0;
  let t1;
  let td1;
  let t2_value = (
    /*child*/
    ctx[10].visits + ""
  );
  let t2;
  let t3;
  let td2;
  let action;
  let t4;
  let current;
  let mounted;
  let dispose;
  action = new Action({
    props: { action: (
      /*child*/
      ctx[10].parentAction
    ) }
  });
  function click_handler(...args) {
    return (
      /*click_handler*/
      ctx[5](
        /*child*/
        ctx[10],
        /*i*/
        ctx[12],
        ...args
      )
    );
  }
  function mouseout_handler(...args) {
    return (
      /*mouseout_handler*/
      ctx[6](
        /*i*/
        ctx[12],
        ...args
      )
    );
  }
  function mouseover_handler(...args) {
    return (
      /*mouseover_handler*/
      ctx[7](
        /*child*/
        ctx[10],
        /*i*/
        ctx[12],
        ...args
      )
    );
  }
  return {
    c() {
      tr = element("tr");
      td0 = element("td");
      t0 = text(t0_value);
      t1 = space();
      td1 = element("td");
      t2 = text(t2_value);
      t3 = space();
      td2 = element("td");
      create_component(action.$$.fragment);
      t4 = space();
      attr(td0, "class", "svelte-ztcwsu");
      attr(td1, "class", "svelte-ztcwsu");
      attr(td2, "class", "svelte-ztcwsu");
      attr(tr, "class", "svelte-ztcwsu");
      toggle_class(
        tr,
        "clickable",
        /*children*/
        ctx[1].length > 0
      );
      toggle_class(
        tr,
        "selected",
        /*i*/
        ctx[12] === /*selectedIndex*/
        ctx[0]
      );
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, t0);
      append(tr, t1);
      append(tr, td1);
      append(td1, t2);
      append(tr, t3);
      append(tr, td2);
      mount_component(action, td2, null);
      append(tr, t4);
      current = true;
      if (!mounted) {
        dispose = [
          listen(tr, "click", click_handler),
          listen(tr, "mouseout", mouseout_handler),
          listen(tr, "mouseover", mouseover_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if ((!current || dirty & /*children*/
      2) && t0_value !== (t0_value = /*child*/
      ctx[10].value + ""))
        set_data(t0, t0_value);
      if ((!current || dirty & /*children*/
      2) && t2_value !== (t2_value = /*child*/
      ctx[10].visits + ""))
        set_data(t2, t2_value);
      const action_changes = {};
      if (dirty & /*children*/
      2)
        action_changes.action = /*child*/
        ctx[10].parentAction;
      action.$set(action_changes);
      if (dirty & /*children*/
      2) {
        toggle_class(
          tr,
          "clickable",
          /*children*/
          ctx[1].length > 0
        );
      }
      if (dirty & /*selectedIndex*/
      1) {
        toggle_class(
          tr,
          "selected",
          /*i*/
          ctx[12] === /*selectedIndex*/
          ctx[0]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(action.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(action.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(tr);
      destroy_component(action);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment$t(ctx) {
  let table;
  let thead;
  let t5;
  let tbody;
  let current;
  let each_value = (
    /*children*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      table = element("table");
      thead = element("thead");
      thead.innerHTML = `<th class="svelte-ztcwsu">Value</th> 
    <th class="svelte-ztcwsu">Visits</th> 
    <th class="svelte-ztcwsu">Action</th>`;
      t5 = space();
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(table, "class", "svelte-ztcwsu");
    },
    m(target, anchor) {
      insert(target, table, anchor);
      append(table, thead);
      append(table, t5);
      append(table, tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(tbody, null);
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*children, selectedIndex, Select, Preview*/
      15) {
        each_value = /*children*/
        ctx2[1];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$6(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$6(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(tbody, null);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(table);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$t($$self, $$props, $$invalidate) {
  let { root } = $$props;
  let { selectedIndex = null } = $$props;
  const dispatch2 = createEventDispatcher();
  let parents = [];
  let children2 = [];
  function Select(node, i) {
    dispatch2("select", { node, selectedIndex: i });
  }
  function Preview(node, i) {
    if (selectedIndex === null) {
      dispatch2("preview", { node });
    }
  }
  const click_handler = (child, i) => Select(child, i);
  const mouseout_handler = (i) => Preview(null);
  const mouseover_handler = (child, i) => Preview(child);
  $$self.$set = ($$props2) => {
    if ("root" in $$props2)
      $$invalidate(4, root = $$props2.root);
    if ("selectedIndex" in $$props2)
      $$invalidate(0, selectedIndex = $$props2.selectedIndex);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*root, parents*/
    272) {
      {
        let t = root;
        $$invalidate(8, parents = []);
        while (t.parent) {
          const parent = t.parent;
          const { type, args } = t.parentAction.payload;
          const argsFormatted = (args || []).join(",");
          const arrowText = `${type}(${argsFormatted})`;
          parents.push({ parent, arrowText });
          t = parent;
        }
        parents.reverse();
        $$invalidate(1, children2 = [...root.children].sort((a, b) => a.visits < b.visits ? 1 : -1).slice(0, 50));
      }
    }
  };
  return [
    selectedIndex,
    children2,
    Select,
    Preview,
    root,
    click_handler,
    mouseout_handler,
    mouseover_handler
  ];
}
class Table extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-ztcwsu-style"))
      add_css$l();
    init(this, options, instance$t, create_fragment$t, safe_not_equal, { root: 4, selectedIndex: 0 });
  }
}
function add_css$m() {
  var style = element("style");
  style.id = "svelte-1f0amz4-style";
  style.textContent = ".visualizer.svelte-1f0amz4{display:flex;flex-direction:column;align-items:center;padding:50px}.preview.svelte-1f0amz4{opacity:0.5}.icon.svelte-1f0amz4{color:#777;width:32px;height:32px;margin-bottom:20px}";
  append(document.head, style);
}
function get_each_context$7(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i].node;
  child_ctx[10] = list[i].selectedIndex;
  child_ctx[12] = i;
  return child_ctx;
}
function create_if_block_2$3(ctx) {
  let div;
  let arrow;
  let current;
  arrow = new FaArrowAltCircleDown({});
  return {
    c() {
      div = element("div");
      create_component(arrow.$$.fragment);
      attr(div, "class", "icon svelte-1f0amz4");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(arrow, div, null);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(arrow.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(arrow.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(arrow);
    }
  };
}
function create_else_block$2(ctx) {
  let table;
  let current;
  function select_handler_1(...args) {
    return (
      /*select_handler_1*/
      ctx[7](
        /*i*/
        ctx[12],
        ...args
      )
    );
  }
  table = new Table({
    props: {
      root: (
        /*node*/
        ctx[9]
      ),
      selectedIndex: (
        /*selectedIndex*/
        ctx[10]
      )
    }
  });
  table.$on("select", select_handler_1);
  return {
    c() {
      create_component(table.$$.fragment);
    },
    m(target, anchor) {
      mount_component(table, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const table_changes = {};
      if (dirty & /*nodes*/
      1)
        table_changes.root = /*node*/
        ctx[9];
      if (dirty & /*nodes*/
      1)
        table_changes.selectedIndex = /*selectedIndex*/
        ctx[10];
      table.$set(table_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(table.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(table.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(table, detaching);
    }
  };
}
function create_if_block_1$3(ctx) {
  let table;
  let current;
  function select_handler(...args) {
    return (
      /*select_handler*/
      ctx[5](
        /*i*/
        ctx[12],
        ...args
      )
    );
  }
  function preview_handler(...args) {
    return (
      /*preview_handler*/
      ctx[6](
        /*i*/
        ctx[12],
        ...args
      )
    );
  }
  table = new Table({ props: { root: (
    /*node*/
    ctx[9]
  ) } });
  table.$on("select", select_handler);
  table.$on("preview", preview_handler);
  return {
    c() {
      create_component(table.$$.fragment);
    },
    m(target, anchor) {
      mount_component(table, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const table_changes = {};
      if (dirty & /*nodes*/
      1)
        table_changes.root = /*node*/
        ctx[9];
      table.$set(table_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(table.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(table.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(table, detaching);
    }
  };
}
function create_each_block$7(ctx) {
  let t;
  let section;
  let current_block_type_index;
  let if_block1;
  let current;
  let if_block0 = (
    /*i*/
    ctx[12] !== 0 && create_if_block_2$3()
  );
  const if_block_creators = [create_if_block_1$3, create_else_block$2];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*i*/
      ctx2[12] === /*nodes*/
      ctx2[0].length - 1
    )
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      if (if_block0)
        if_block0.c();
      t = space();
      section = element("section");
      if_block1.c();
    },
    m(target, anchor) {
      if (if_block0)
        if_block0.m(target, anchor);
      insert(target, t, anchor);
      insert(target, section, anchor);
      if_blocks[current_block_type_index].m(section, null);
      current = true;
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block1 = if_blocks[current_block_type_index];
        if (!if_block1) {
          if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block1.c();
        }
        transition_in(if_block1, 1);
        if_block1.m(section, null);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (if_block0)
        if_block0.d(detaching);
      if (detaching)
        detach(t);
      if (detaching)
        detach(section);
      if_blocks[current_block_type_index].d();
    }
  };
}
function create_if_block$a(ctx) {
  let div;
  let arrow;
  let t;
  let section;
  let table;
  let current;
  arrow = new FaArrowAltCircleDown({});
  table = new Table({ props: { root: (
    /*preview*/
    ctx[1]
  ) } });
  return {
    c() {
      div = element("div");
      create_component(arrow.$$.fragment);
      t = space();
      section = element("section");
      create_component(table.$$.fragment);
      attr(div, "class", "icon svelte-1f0amz4");
      attr(section, "class", "preview svelte-1f0amz4");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(arrow, div, null);
      insert(target, t, anchor);
      insert(target, section, anchor);
      mount_component(table, section, null);
      current = true;
    },
    p(ctx2, dirty) {
      const table_changes = {};
      if (dirty & /*preview*/
      2)
        table_changes.root = /*preview*/
        ctx2[1];
      table.$set(table_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(arrow.$$.fragment, local);
      transition_in(table.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(arrow.$$.fragment, local);
      transition_out(table.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(arrow);
      if (detaching)
        detach(t);
      if (detaching)
        detach(section);
      destroy_component(table);
    }
  };
}
function create_fragment$u(ctx) {
  let div;
  let t;
  let current;
  let each_value = (
    /*nodes*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  let if_block = (
    /*preview*/
    ctx[1] && create_if_block$a(ctx)
  );
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t = space();
      if (if_block)
        if_block.c();
      attr(div, "class", "visualizer svelte-1f0amz4");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div, null);
      }
      append(div, t);
      if (if_block)
        if_block.m(div, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*nodes, SelectNode, PreviewNode*/
      13) {
        each_value = /*nodes*/
        ctx2[0];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$7(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$7(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(div, t);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      if (
        /*preview*/
        ctx2[1]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*preview*/
          2) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$a(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      transition_in(if_block);
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_each(each_blocks, detaching);
      if (if_block)
        if_block.d();
    }
  };
}
function instance$u($$self, $$props, $$invalidate) {
  let { metadata } = $$props;
  let nodes = [];
  let preview = null;
  function SelectNode({ node, selectedIndex }, i) {
    $$invalidate(1, preview = null);
    $$invalidate(0, nodes[i].selectedIndex = selectedIndex, nodes);
    $$invalidate(0, nodes = [...nodes.slice(0, i + 1), { node }]);
  }
  function PreviewNode({ node }, i) {
    $$invalidate(1, preview = node);
  }
  const select_handler = (i, e) => SelectNode(e.detail, i);
  const preview_handler = (i, e) => PreviewNode(e.detail);
  const select_handler_1 = (i, e) => SelectNode(e.detail, i);
  $$self.$set = ($$props2) => {
    if ("metadata" in $$props2)
      $$invalidate(4, metadata = $$props2.metadata);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*metadata*/
    16) {
      {
        $$invalidate(0, nodes = [{ node: metadata }]);
      }
    }
  };
  return [
    nodes,
    preview,
    SelectNode,
    PreviewNode,
    metadata,
    select_handler,
    preview_handler,
    select_handler_1
  ];
}
class MCTS extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1f0amz4-style"))
      add_css$m();
    init(this, options, instance$u, create_fragment$u, safe_not_equal, { metadata: 4 });
  }
}
function add_css$n() {
  var style = element("style");
  style.id = "svelte-1pq5e4b-style";
  style.textContent = ".gamelog.svelte-1pq5e4b{display:grid;grid-template-columns:30px 1fr 30px;grid-auto-rows:auto;grid-auto-flow:column}";
  append(document.head, style);
}
function get_each_context$8(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i].phase;
  child_ctx[18] = i;
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[19] = list[i].action;
  child_ctx[20] = list[i].metadata;
  child_ctx[18] = i;
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[22] = list[i].turn;
  child_ctx[18] = i;
  return child_ctx;
}
function create_if_block_1$4(ctx) {
  let turnmarker;
  let current;
  turnmarker = new TurnMarker({
    props: {
      turn: (
        /*turn*/
        ctx[22]
      ),
      numEvents: (
        /*turnBoundaries*/
        ctx[3][
          /*i*/
          ctx[18]
        ]
      )
    }
  });
  return {
    c() {
      create_component(turnmarker.$$.fragment);
    },
    m(target, anchor) {
      mount_component(turnmarker, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const turnmarker_changes = {};
      if (dirty & /*renderedLogEntries*/
      4)
        turnmarker_changes.turn = /*turn*/
        ctx2[22];
      if (dirty & /*turnBoundaries*/
      8)
        turnmarker_changes.numEvents = /*turnBoundaries*/
        ctx2[3][
          /*i*/
          ctx2[18]
        ];
      turnmarker.$set(turnmarker_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(turnmarker.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(turnmarker.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(turnmarker, detaching);
    }
  };
}
function create_each_block_2(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*i*/
    ctx[18] in /*turnBoundaries*/
    ctx[3] && create_if_block_1$4(ctx)
  );
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*i*/
        ctx2[18] in /*turnBoundaries*/
        ctx2[3]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*turnBoundaries*/
          8) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_1$4(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_each_block_1(ctx) {
  let logevent;
  let current;
  logevent = new LogEvent({
    props: {
      pinned: (
        /*i*/
        ctx[18] === /*pinned*/
        ctx[1]
      ),
      logIndex: (
        /*i*/
        ctx[18]
      ),
      action: (
        /*action*/
        ctx[19]
      ),
      metadata: (
        /*metadata*/
        ctx[20]
      )
    }
  });
  logevent.$on(
    "click",
    /*OnLogClick*/
    ctx[5]
  );
  logevent.$on(
    "mouseenter",
    /*OnMouseEnter*/
    ctx[6]
  );
  logevent.$on(
    "mouseleave",
    /*OnMouseLeave*/
    ctx[7]
  );
  return {
    c() {
      create_component(logevent.$$.fragment);
    },
    m(target, anchor) {
      mount_component(logevent, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const logevent_changes = {};
      if (dirty & /*pinned*/
      2)
        logevent_changes.pinned = /*i*/
        ctx2[18] === /*pinned*/
        ctx2[1];
      if (dirty & /*renderedLogEntries*/
      4)
        logevent_changes.action = /*action*/
        ctx2[19];
      if (dirty & /*renderedLogEntries*/
      4)
        logevent_changes.metadata = /*metadata*/
        ctx2[20];
      logevent.$set(logevent_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(logevent.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(logevent.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(logevent, detaching);
    }
  };
}
function create_if_block$b(ctx) {
  let phasemarker;
  let current;
  phasemarker = new PhaseMarker({
    props: {
      phase: (
        /*phase*/
        ctx[16]
      ),
      numEvents: (
        /*phaseBoundaries*/
        ctx[4][
          /*i*/
          ctx[18]
        ]
      )
    }
  });
  return {
    c() {
      create_component(phasemarker.$$.fragment);
    },
    m(target, anchor) {
      mount_component(phasemarker, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const phasemarker_changes = {};
      if (dirty & /*renderedLogEntries*/
      4)
        phasemarker_changes.phase = /*phase*/
        ctx2[16];
      if (dirty & /*phaseBoundaries*/
      16)
        phasemarker_changes.numEvents = /*phaseBoundaries*/
        ctx2[4][
          /*i*/
          ctx2[18]
        ];
      phasemarker.$set(phasemarker_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(phasemarker.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(phasemarker.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(phasemarker, detaching);
    }
  };
}
function create_each_block$8(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*i*/
    ctx[18] in /*phaseBoundaries*/
    ctx[4] && create_if_block$b(ctx)
  );
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*i*/
        ctx2[18] in /*phaseBoundaries*/
        ctx2[4]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*phaseBoundaries*/
          16) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$b(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_fragment$v(ctx) {
  let div;
  let t0;
  let t1;
  let current;
  let mounted;
  let dispose;
  let each_value_2 = (
    /*renderedLogEntries*/
    ctx[2]
  );
  let each_blocks_2 = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  }
  const out = (i) => transition_out(each_blocks_2[i], 1, 1, () => {
    each_blocks_2[i] = null;
  });
  let each_value_1 = (
    /*renderedLogEntries*/
    ctx[2]
  );
  let each_blocks_1 = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  const out_1 = (i) => transition_out(each_blocks_1[i], 1, 1, () => {
    each_blocks_1[i] = null;
  });
  let each_value = (
    /*renderedLogEntries*/
    ctx[2]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
  }
  const out_2 = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks_2.length; i += 1) {
        each_blocks_2[i].c();
      }
      t0 = space();
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].c();
      }
      t1 = space();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div, "class", "gamelog svelte-1pq5e4b");
      toggle_class(
        div,
        "pinned",
        /*pinned*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks_2.length; i += 1) {
        each_blocks_2[i].m(div, null);
      }
      append(div, t0);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].m(div, null);
      }
      append(div, t1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div, null);
      }
      current = true;
      if (!mounted) {
        dispose = listen(
          window,
          "keydown",
          /*OnKeyDown*/
          ctx[8]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*renderedLogEntries, turnBoundaries*/
      12) {
        each_value_2 = /*renderedLogEntries*/
        ctx2[2];
        let i;
        for (i = 0; i < each_value_2.length; i += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i);
          if (each_blocks_2[i]) {
            each_blocks_2[i].p(child_ctx, dirty);
            transition_in(each_blocks_2[i], 1);
          } else {
            each_blocks_2[i] = create_each_block_2(child_ctx);
            each_blocks_2[i].c();
            transition_in(each_blocks_2[i], 1);
            each_blocks_2[i].m(div, t0);
          }
        }
        group_outros();
        for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      if (dirty & /*pinned, renderedLogEntries, OnLogClick, OnMouseEnter, OnMouseLeave*/
      230) {
        each_value_1 = /*renderedLogEntries*/
        ctx2[2];
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks_1[i]) {
            each_blocks_1[i].p(child_ctx, dirty);
            transition_in(each_blocks_1[i], 1);
          } else {
            each_blocks_1[i] = create_each_block_1(child_ctx);
            each_blocks_1[i].c();
            transition_in(each_blocks_1[i], 1);
            each_blocks_1[i].m(div, t1);
          }
        }
        group_outros();
        for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
          out_1(i);
        }
        check_outros();
      }
      if (dirty & /*renderedLogEntries, phaseBoundaries*/
      20) {
        each_value = /*renderedLogEntries*/
        ctx2[2];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$8(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$8(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(div, null);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out_2(i);
        }
        check_outros();
      }
      if (dirty & /*pinned*/
      2) {
        toggle_class(
          div,
          "pinned",
          /*pinned*/
          ctx2[1]
        );
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value_2.length; i += 1) {
        transition_in(each_blocks_2[i]);
      }
      for (let i = 0; i < each_value_1.length; i += 1) {
        transition_in(each_blocks_1[i]);
      }
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks_2 = each_blocks_2.filter(Boolean);
      for (let i = 0; i < each_blocks_2.length; i += 1) {
        transition_out(each_blocks_2[i]);
      }
      each_blocks_1 = each_blocks_1.filter(Boolean);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        transition_out(each_blocks_1[i]);
      }
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_each(each_blocks_2, detaching);
      destroy_each(each_blocks_1, detaching);
      destroy_each(each_blocks, detaching);
      mounted = false;
      dispose();
    }
  };
}
function instance$v($$self, $$props, $$invalidate) {
  let $client, $$unsubscribe_client = noop, $$subscribe_client = () => ($$unsubscribe_client(), $$unsubscribe_client = subscribe(client, ($$value) => $$invalidate(10, $client = $$value)), client);
  $$self.$$.on_destroy.push(() => $$unsubscribe_client());
  let { client } = $$props;
  $$subscribe_client();
  const { secondaryPane } = getContext("secondaryPane");
  const reducer = CreateGameReducer({ game: client.game });
  const initialState = client.getInitialState();
  let { log } = $client;
  let pinned = null;
  function rewind(logIndex) {
    let state = initialState;
    for (let i = 0; i < log.length; i++) {
      const { action, automatic } = log[i];
      if (!automatic) {
        state = reducer(state, action);
        if (logIndex == 0) {
          break;
        }
        logIndex--;
      }
    }
    return {
      G: state.G,
      ctx: state.ctx,
      plugins: state.plugins
    };
  }
  function OnLogClick(e) {
    const { logIndex } = e.detail;
    const state = rewind(logIndex);
    const renderedLogEntries2 = log.filter((e2) => !e2.automatic);
    client.overrideGameState(state);
    if (pinned == logIndex) {
      $$invalidate(1, pinned = null);
      secondaryPane.set(null);
    } else {
      $$invalidate(1, pinned = logIndex);
      const { metadata } = renderedLogEntries2[logIndex].action.payload;
      if (metadata) {
        secondaryPane.set({ component: MCTS, metadata });
      }
    }
  }
  function OnMouseEnter(e) {
    const { logIndex } = e.detail;
    if (pinned === null) {
      const state = rewind(logIndex);
      client.overrideGameState(state);
    }
  }
  function OnMouseLeave() {
    if (pinned === null) {
      client.overrideGameState(null);
    }
  }
  function Reset() {
    $$invalidate(1, pinned = null);
    client.overrideGameState(null);
    secondaryPane.set(null);
  }
  onDestroy(Reset);
  function OnKeyDown(e) {
    if (e.keyCode == 27) {
      Reset();
    }
  }
  let renderedLogEntries;
  let turnBoundaries = {};
  let phaseBoundaries = {};
  $$self.$set = ($$props2) => {
    if ("client" in $$props2)
      $$subscribe_client($$invalidate(0, client = $$props2.client));
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$client, log, renderedLogEntries*/
    1540) {
      {
        $$invalidate(9, log = $client.log);
        $$invalidate(2, renderedLogEntries = log.filter((e) => !e.automatic));
        let eventsInCurrentPhase = 0;
        let eventsInCurrentTurn = 0;
        $$invalidate(3, turnBoundaries = {});
        $$invalidate(4, phaseBoundaries = {});
        for (let i = 0; i < renderedLogEntries.length; i++) {
          const { action, payload, turn, phase } = renderedLogEntries[i];
          eventsInCurrentTurn++;
          eventsInCurrentPhase++;
          if (i == renderedLogEntries.length - 1 || renderedLogEntries[i + 1].turn != turn) {
            $$invalidate(3, turnBoundaries[i] = eventsInCurrentTurn, turnBoundaries);
            eventsInCurrentTurn = 0;
          }
          if (i == renderedLogEntries.length - 1 || renderedLogEntries[i + 1].phase != phase) {
            $$invalidate(4, phaseBoundaries[i] = eventsInCurrentPhase, phaseBoundaries);
            eventsInCurrentPhase = 0;
          }
        }
      }
    }
  };
  return [
    client,
    pinned,
    renderedLogEntries,
    turnBoundaries,
    phaseBoundaries,
    OnLogClick,
    OnMouseEnter,
    OnMouseLeave,
    OnKeyDown
  ];
}
class Log extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1pq5e4b-style"))
      add_css$n();
    init(this, options, instance$v, create_fragment$v, safe_not_equal, { client: 0 });
  }
}
function add_css$o() {
  var style = element("style");
  style.id = "svelte-1fu900w-style";
  style.textContent = "label.svelte-1fu900w{color:#666}.option.svelte-1fu900w{margin-bottom:20px}.value.svelte-1fu900w{font-weight:bold;color:#000}input[type='checkbox'].svelte-1fu900w{vertical-align:middle}";
  append(document.head, style);
}
function get_each_context$9(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[5] = list[i][0];
  child_ctx[6] = list[i][1];
  return child_ctx;
}
function create_if_block_1$5(ctx) {
  let span;
  let t0_value = (
    /*values*/
    ctx[1][
      /*key*/
      ctx[5]
    ] + ""
  );
  let t0;
  let t1;
  let input;
  let input_min_value;
  let input_max_value;
  let mounted;
  let dispose;
  function input_change_input_handler() {
    ctx[3].call(
      input,
      /*key*/
      ctx[5]
    );
  }
  return {
    c() {
      span = element("span");
      t0 = text(t0_value);
      t1 = space();
      input = element("input");
      attr(span, "class", "value svelte-1fu900w");
      attr(input, "type", "range");
      attr(input, "min", input_min_value = /*value*/
      ctx[6].range.min);
      attr(input, "max", input_max_value = /*value*/
      ctx[6].range.max);
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      insert(target, t1, anchor);
      insert(target, input, anchor);
      set_input_value(
        input,
        /*values*/
        ctx[1][
          /*key*/
          ctx[5]
        ]
      );
      if (!mounted) {
        dispose = [
          listen(input, "change", input_change_input_handler),
          listen(input, "input", input_change_input_handler),
          listen(
            input,
            "change",
            /*OnChange*/
            ctx[2]
          )
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*values, bot*/
      3 && t0_value !== (t0_value = /*values*/
      ctx[1][
        /*key*/
        ctx[5]
      ] + ""))
        set_data(t0, t0_value);
      if (dirty & /*bot*/
      1 && input_min_value !== (input_min_value = /*value*/
      ctx[6].range.min)) {
        attr(input, "min", input_min_value);
      }
      if (dirty & /*bot*/
      1 && input_max_value !== (input_max_value = /*value*/
      ctx[6].range.max)) {
        attr(input, "max", input_max_value);
      }
      if (dirty & /*values, Object, bot*/
      3) {
        set_input_value(
          input,
          /*values*/
          ctx[1][
            /*key*/
            ctx[5]
          ]
        );
      }
    },
    d(detaching) {
      if (detaching)
        detach(span);
      if (detaching)
        detach(t1);
      if (detaching)
        detach(input);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$c(ctx) {
  let input;
  let mounted;
  let dispose;
  function input_change_handler() {
    ctx[4].call(
      input,
      /*key*/
      ctx[5]
    );
  }
  return {
    c() {
      input = element("input");
      attr(input, "type", "checkbox");
      attr(input, "class", "svelte-1fu900w");
    },
    m(target, anchor) {
      insert(target, input, anchor);
      input.checked = /*values*/
      ctx[1][
        /*key*/
        ctx[5]
      ];
      if (!mounted) {
        dispose = [
          listen(input, "change", input_change_handler),
          listen(
            input,
            "change",
            /*OnChange*/
            ctx[2]
          )
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*values, Object, bot*/
      3) {
        input.checked = /*values*/
        ctx[1][
          /*key*/
          ctx[5]
        ];
      }
    },
    d(detaching) {
      if (detaching)
        detach(input);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block$9(ctx) {
  let div;
  let label;
  let t0_value = (
    /*key*/
    ctx[5] + ""
  );
  let t0;
  let t1;
  let t2;
  let t3;
  let if_block0 = (
    /*value*/
    ctx[6].range && create_if_block_1$5(ctx)
  );
  let if_block1 = typeof /*value*/
  ctx[6].value === "boolean" && create_if_block$c(ctx);
  return {
    c() {
      div = element("div");
      label = element("label");
      t0 = text(t0_value);
      t1 = space();
      if (if_block0)
        if_block0.c();
      t2 = space();
      if (if_block1)
        if_block1.c();
      t3 = space();
      attr(label, "class", "svelte-1fu900w");
      attr(div, "class", "option svelte-1fu900w");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, label);
      append(label, t0);
      append(div, t1);
      if (if_block0)
        if_block0.m(div, null);
      append(div, t2);
      if (if_block1)
        if_block1.m(div, null);
      append(div, t3);
    },
    p(ctx2, dirty) {
      if (dirty & /*bot*/
      1 && t0_value !== (t0_value = /*key*/
      ctx2[5] + ""))
        set_data(t0, t0_value);
      if (
        /*value*/
        ctx2[6].range
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_1$5(ctx2);
          if_block0.c();
          if_block0.m(div, t2);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (typeof /*value*/
      ctx2[6].value === "boolean") {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block$c(ctx2);
          if_block1.c();
          if_block1.m(div, t3);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
    }
  };
}
function create_fragment$w(ctx) {
  let each_1_anchor;
  let each_value = Object.entries(
    /*bot*/
    ctx[0].opts()
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*values, Object, bot, OnChange*/
      7) {
        each_value = Object.entries(
          /*bot*/
          ctx2[0].opts()
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$9(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$9(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach(each_1_anchor);
    }
  };
}
function instance$w($$self, $$props, $$invalidate) {
  let { bot } = $$props;
  let values = {};
  for (let [key, value] of Object.entries(bot.opts())) {
    values[key] = value.value;
  }
  function OnChange() {
    for (let [key, value] of Object.entries(values)) {
      bot.setOpt(key, value);
    }
  }
  function input_change_input_handler(key) {
    values[key] = to_number(this.value);
    $$invalidate(1, values);
    $$invalidate(0, bot);
  }
  function input_change_handler(key) {
    values[key] = this.checked;
    $$invalidate(1, values);
    $$invalidate(0, bot);
  }
  $$self.$set = ($$props2) => {
    if ("bot" in $$props2)
      $$invalidate(0, bot = $$props2.bot);
  };
  return [bot, values, OnChange, input_change_input_handler, input_change_handler];
}
class Options extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1fu900w-style"))
      add_css$o();
    init(this, options, instance$w, create_fragment$w, safe_not_equal, { bot: 0 });
  }
}
function add_css$p() {
  var style = element("style");
  style.id = "svelte-lifdi8-style";
  style.textContent = "ul.svelte-lifdi8{padding-left:0}li.svelte-lifdi8{list-style:none;margin:none;margin-bottom:5px}h3.svelte-lifdi8{text-transform:uppercase}label.svelte-lifdi8{color:#666}input[type='checkbox'].svelte-lifdi8{vertical-align:middle}";
  append(document.head, style);
}
function get_each_context$a(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i];
  return child_ctx;
}
function create_else_block$3(ctx) {
  let p0;
  let t1;
  let p1;
  return {
    c() {
      p0 = element("p");
      p0.textContent = "No bots available.";
      t1 = space();
      p1 = element("p");
      p1.innerHTML = `Follow the instructions
        <a href="https://boardgame.io/documentation/#/tutorial?id=bots" target="_blank">here</a>
        to set up bots.`;
    },
    m(target, anchor) {
      insert(target, p0, anchor);
      insert(target, t1, anchor);
      insert(target, p1, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(p0);
      if (detaching)
        detach(t1);
      if (detaching)
        detach(p1);
    }
  };
}
function create_if_block_5(ctx) {
  let p;
  return {
    c() {
      p = element("p");
      p.textContent = "The bot debugger is only available in singleplayer mode.";
    },
    m(target, anchor) {
      insert(target, p, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_if_block$d(ctx) {
  let section0;
  let h30;
  let t1;
  let ul;
  let li0;
  let hotkey0;
  let t2;
  let li1;
  let hotkey1;
  let t3;
  let li2;
  let hotkey2;
  let t4;
  let section1;
  let h31;
  let t6;
  let select;
  let t7;
  let show_if = Object.keys(
    /*bot*/
    ctx[7].opts()
  ).length;
  let t8;
  let if_block1_anchor;
  let current;
  let mounted;
  let dispose;
  hotkey0 = new Hotkey({
    props: {
      value: "1",
      onPress: (
        /*Reset*/
        ctx[13]
      ),
      label: "reset"
    }
  });
  hotkey1 = new Hotkey({
    props: {
      value: "2",
      onPress: (
        /*Step*/
        ctx[11]
      ),
      label: "play"
    }
  });
  hotkey2 = new Hotkey({
    props: {
      value: "3",
      onPress: (
        /*Simulate*/
        ctx[12]
      ),
      label: "simulate"
    }
  });
  let each_value = Object.keys(
    /*bots*/
    ctx[8]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
  }
  let if_block0 = show_if && create_if_block_4(ctx);
  let if_block1 = (
    /*botAction*/
    (ctx[5] || /*iterationCounter*/
    ctx[3]) && create_if_block_1$6(ctx)
  );
  return {
    c() {
      section0 = element("section");
      h30 = element("h3");
      h30.textContent = "Controls";
      t1 = space();
      ul = element("ul");
      li0 = element("li");
      create_component(hotkey0.$$.fragment);
      t2 = space();
      li1 = element("li");
      create_component(hotkey1.$$.fragment);
      t3 = space();
      li2 = element("li");
      create_component(hotkey2.$$.fragment);
      t4 = space();
      section1 = element("section");
      h31 = element("h3");
      h31.textContent = "Bot";
      t6 = space();
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t7 = space();
      if (if_block0)
        if_block0.c();
      t8 = space();
      if (if_block1)
        if_block1.c();
      if_block1_anchor = empty();
      attr(h30, "class", "svelte-lifdi8");
      attr(li0, "class", "svelte-lifdi8");
      attr(li1, "class", "svelte-lifdi8");
      attr(li2, "class", "svelte-lifdi8");
      attr(ul, "class", "svelte-lifdi8");
      attr(h31, "class", "svelte-lifdi8");
      if (
        /*selectedBot*/
        ctx[4] === void 0
      )
        add_render_callback(() => (
          /*select_change_handler*/
          ctx[16].call(select)
        ));
    },
    m(target, anchor) {
      insert(target, section0, anchor);
      append(section0, h30);
      append(section0, t1);
      append(section0, ul);
      append(ul, li0);
      mount_component(hotkey0, li0, null);
      append(ul, t2);
      append(ul, li1);
      mount_component(hotkey1, li1, null);
      append(ul, t3);
      append(ul, li2);
      mount_component(hotkey2, li2, null);
      insert(target, t4, anchor);
      insert(target, section1, anchor);
      append(section1, h31);
      append(section1, t6);
      append(section1, select);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select, null);
      }
      select_option(
        select,
        /*selectedBot*/
        ctx[4]
      );
      insert(target, t7, anchor);
      if (if_block0)
        if_block0.m(target, anchor);
      insert(target, t8, anchor);
      if (if_block1)
        if_block1.m(target, anchor);
      insert(target, if_block1_anchor, anchor);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            select,
            "change",
            /*select_change_handler*/
            ctx[16]
          ),
          listen(
            select,
            "change",
            /*ChangeBot*/
            ctx[10]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*Object, bots*/
      256) {
        each_value = Object.keys(
          /*bots*/
          ctx2[8]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$a(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$a(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & /*selectedBot, Object, bots*/
      272) {
        select_option(
          select,
          /*selectedBot*/
          ctx2[4]
        );
      }
      if (dirty & /*bot*/
      128)
        show_if = Object.keys(
          /*bot*/
          ctx2[7].opts()
        ).length;
      if (show_if) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & /*bot*/
          128) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_4(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(t8.parentNode, t8);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (
        /*botAction*/
        ctx2[5] || /*iterationCounter*/
        ctx2[3]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_1$6(ctx2);
          if_block1.c();
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(hotkey0.$$.fragment, local);
      transition_in(hotkey1.$$.fragment, local);
      transition_in(hotkey2.$$.fragment, local);
      transition_in(if_block0);
      current = true;
    },
    o(local) {
      transition_out(hotkey0.$$.fragment, local);
      transition_out(hotkey1.$$.fragment, local);
      transition_out(hotkey2.$$.fragment, local);
      transition_out(if_block0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(section0);
      destroy_component(hotkey0);
      destroy_component(hotkey1);
      destroy_component(hotkey2);
      if (detaching)
        detach(t4);
      if (detaching)
        detach(section1);
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach(t7);
      if (if_block0)
        if_block0.d(detaching);
      if (detaching)
        detach(t8);
      if (if_block1)
        if_block1.d(detaching);
      if (detaching)
        detach(if_block1_anchor);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block$a(ctx) {
  let option;
  let t_value = (
    /*bot*/
    ctx[7] + ""
  );
  let t;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = /*bot*/
      ctx[7];
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
function create_if_block_4(ctx) {
  let section;
  let h3;
  let t1;
  let label;
  let t3;
  let input;
  let t4;
  let options;
  let current;
  let mounted;
  let dispose;
  options = new Options({ props: { bot: (
    /*bot*/
    ctx[7]
  ) } });
  return {
    c() {
      section = element("section");
      h3 = element("h3");
      h3.textContent = "Options";
      t1 = space();
      label = element("label");
      label.textContent = "debug";
      t3 = space();
      input = element("input");
      t4 = space();
      create_component(options.$$.fragment);
      attr(h3, "class", "svelte-lifdi8");
      attr(label, "class", "svelte-lifdi8");
      attr(input, "type", "checkbox");
      attr(input, "class", "svelte-lifdi8");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, h3);
      append(section, t1);
      append(section, label);
      append(section, t3);
      append(section, input);
      input.checked = /*debug*/
      ctx[1];
      append(section, t4);
      mount_component(options, section, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            input,
            "change",
            /*input_change_handler*/
            ctx[17]
          ),
          listen(
            input,
            "change",
            /*OnDebug*/
            ctx[9]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*debug*/
      2) {
        input.checked = /*debug*/
        ctx2[1];
      }
      const options_changes = {};
      if (dirty & /*bot*/
      128)
        options_changes.bot = /*bot*/
        ctx2[7];
      options.$set(options_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(options.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(options.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(section);
      destroy_component(options);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_1$6(ctx) {
  let section;
  let h3;
  let t1;
  let t2;
  let if_block0 = (
    /*progress*/
    ctx[2] && /*progress*/
    ctx[2] < 1 && create_if_block_3$1(ctx)
  );
  let if_block1 = (
    /*botAction*/
    ctx[5] && create_if_block_2$4(ctx)
  );
  return {
    c() {
      section = element("section");
      h3 = element("h3");
      h3.textContent = "Result";
      t1 = space();
      if (if_block0)
        if_block0.c();
      t2 = space();
      if (if_block1)
        if_block1.c();
      attr(h3, "class", "svelte-lifdi8");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, h3);
      append(section, t1);
      if (if_block0)
        if_block0.m(section, null);
      append(section, t2);
      if (if_block1)
        if_block1.m(section, null);
    },
    p(ctx2, dirty) {
      if (
        /*progress*/
        ctx2[2] && /*progress*/
        ctx2[2] < 1
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_3$1(ctx2);
          if_block0.c();
          if_block0.m(section, t2);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*botAction*/
        ctx2[5]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_2$4(ctx2);
          if_block1.c();
          if_block1.m(section, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching)
        detach(section);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
    }
  };
}
function create_if_block_3$1(ctx) {
  let progress_1;
  return {
    c() {
      progress_1 = element("progress");
      progress_1.value = /*progress*/
      ctx[2];
    },
    m(target, anchor) {
      insert(target, progress_1, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*progress*/
      4) {
        progress_1.value = /*progress*/
        ctx2[2];
      }
    },
    d(detaching) {
      if (detaching)
        detach(progress_1);
    }
  };
}
function create_if_block_2$4(ctx) {
  let ul;
  let li0;
  let t0;
  let t1;
  let t2;
  let li1;
  let t3;
  let t4_value = JSON.stringify(
    /*botActionArgs*/
    ctx[6]
  ) + "";
  let t4;
  return {
    c() {
      ul = element("ul");
      li0 = element("li");
      t0 = text("Action: ");
      t1 = text(
        /*botAction*/
        ctx[5]
      );
      t2 = space();
      li1 = element("li");
      t3 = text("Args: ");
      t4 = text(t4_value);
      attr(li0, "class", "svelte-lifdi8");
      attr(li1, "class", "svelte-lifdi8");
      attr(ul, "class", "svelte-lifdi8");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      append(ul, li0);
      append(li0, t0);
      append(li0, t1);
      append(ul, t2);
      append(ul, li1);
      append(li1, t3);
      append(li1, t4);
    },
    p(ctx2, dirty) {
      if (dirty & /*botAction*/
      32)
        set_data(
          t1,
          /*botAction*/
          ctx2[5]
        );
      if (dirty & /*botActionArgs*/
      64 && t4_value !== (t4_value = JSON.stringify(
        /*botActionArgs*/
        ctx2[6]
      ) + ""))
        set_data(t4, t4_value);
    },
    d(detaching) {
      if (detaching)
        detach(ul);
    }
  };
}
function create_fragment$x(ctx) {
  let section;
  let current_block_type_index;
  let if_block;
  let current;
  let mounted;
  let dispose;
  const if_block_creators = [create_if_block$d, create_if_block_5, create_else_block$3];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*client*/
      ctx2[0].game.ai && !/*client*/
      ctx2[0].multiplayer
    )
      return 0;
    if (
      /*client*/
      ctx2[0].multiplayer
    )
      return 1;
    return 2;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      section = element("section");
      if_block.c();
    },
    m(target, anchor) {
      insert(target, section, anchor);
      if_blocks[current_block_type_index].m(section, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          window,
          "keydown",
          /*OnKeyDown*/
          ctx[14]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        }
        transition_in(if_block, 1);
        if_block.m(section, null);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(section);
      if_blocks[current_block_type_index].d();
      mounted = false;
      dispose();
    }
  };
}
function instance$x($$self, $$props, $$invalidate) {
  let { client } = $$props;
  let { clientManager } = $$props;
  const { secondaryPane } = getContext("secondaryPane");
  const bots = { "MCTS": MCTSBot, "Random": RandomBot };
  let debug = false;
  let progress = null;
  let iterationCounter = 0;
  let metadata = null;
  const iterationCallback = ({ iterationCounter: c, numIterations, metadata: m }) => {
    $$invalidate(3, iterationCounter = c);
    $$invalidate(2, progress = c / numIterations);
    metadata = m;
    if (debug && metadata) {
      secondaryPane.set({ component: MCTS, metadata });
    }
  };
  function OnDebug() {
    if (debug && metadata) {
      secondaryPane.set({ component: MCTS, metadata });
    } else {
      secondaryPane.set(null);
    }
  }
  let bot;
  if (client.game.ai) {
    bot = new MCTSBot({
      game: client.game,
      enumerate: client.game.ai.enumerate,
      iterationCallback
    });
    bot.setOpt("async", true);
  }
  let selectedBot;
  let botAction;
  let botActionArgs;
  function ChangeBot() {
    const botConstructor = bots[selectedBot];
    $$invalidate(7, bot = new botConstructor({
      game: client.game,
      enumerate: client.game.ai.enumerate,
      iterationCallback
    }));
    bot.setOpt("async", true);
    $$invalidate(5, botAction = null);
    metadata = null;
    secondaryPane.set(null);
    $$invalidate(3, iterationCounter = 0);
  }
  async function Step$1() {
    $$invalidate(5, botAction = null);
    metadata = null;
    $$invalidate(3, iterationCounter = 0);
    const t = await Step(client, bot);
    if (t) {
      $$invalidate(5, botAction = t.payload.type);
      $$invalidate(6, botActionArgs = t.payload.args);
    }
  }
  function Simulate(iterations = 1e4, sleepTimeout = 100) {
    $$invalidate(5, botAction = null);
    metadata = null;
    $$invalidate(3, iterationCounter = 0);
    const step = async () => {
      for (let i = 0; i < iterations; i++) {
        const action = await Step(client, bot);
        if (!action)
          break;
        await new Promise((resolve) => setTimeout(resolve, sleepTimeout));
      }
    };
    return step();
  }
  function Exit() {
    client.overrideGameState(null);
    secondaryPane.set(null);
    $$invalidate(1, debug = false);
  }
  function Reset() {
    client.reset();
    $$invalidate(5, botAction = null);
    metadata = null;
    $$invalidate(3, iterationCounter = 0);
    Exit();
  }
  function OnKeyDown(e) {
    if (e.keyCode == 27) {
      Exit();
    }
  }
  onDestroy(Exit);
  function select_change_handler() {
    selectedBot = select_value(this);
    $$invalidate(4, selectedBot);
    $$invalidate(8, bots);
  }
  function input_change_handler() {
    debug = this.checked;
    $$invalidate(1, debug);
  }
  $$self.$set = ($$props2) => {
    if ("client" in $$props2)
      $$invalidate(0, client = $$props2.client);
    if ("clientManager" in $$props2)
      $$invalidate(15, clientManager = $$props2.clientManager);
  };
  return [
    client,
    debug,
    progress,
    iterationCounter,
    selectedBot,
    botAction,
    botActionArgs,
    bot,
    bots,
    OnDebug,
    ChangeBot,
    Step$1,
    Simulate,
    Reset,
    OnKeyDown,
    clientManager,
    select_change_handler,
    input_change_handler
  ];
}
class AI extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-lifdi8-style"))
      add_css$p();
    init(this, options, instance$x, create_fragment$x, safe_not_equal, { client: 0, clientManager: 15 });
  }
}
function add_css$q() {
  var style = element("style");
  style.id = "svelte-1dhkl71-style";
  style.textContent = ".debug-panel.svelte-1dhkl71{position:fixed;color:#555;font-family:monospace;display:flex;flex-direction:row;text-align:left;right:0;top:0;height:100%;font-size:14px;box-sizing:border-box;opacity:0.9;z-index:99999}.pane.svelte-1dhkl71{flex-grow:2;overflow-x:hidden;overflow-y:scroll;background:#fefefe;padding:20px;border-left:1px solid #ccc;box-shadow:-1px 0 5px rgba(0, 0, 0, 0.2);box-sizing:border-box;width:280px}.secondary-pane.svelte-1dhkl71{background:#fefefe;overflow-y:scroll}.debug-panel.svelte-1dhkl71 button,.debug-panel.svelte-1dhkl71 select{cursor:pointer;font-size:14px;font-family:monospace}.debug-panel.svelte-1dhkl71 select{background:#eee;border:1px solid #bbb;color:#555;padding:3px;border-radius:3px}.debug-panel.svelte-1dhkl71 section{margin-bottom:20px}.debug-panel.svelte-1dhkl71 .screen-reader-only{clip:rect(0 0 0 0);clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px}";
  append(document.head, style);
}
function create_if_block$e(ctx) {
  let section;
  let menu;
  let t0;
  let div;
  let switch_instance;
  let t1;
  let section_transition;
  let current;
  menu = new Menu({
    props: {
      panes: (
        /*panes*/
        ctx[6]
      ),
      pane: (
        /*pane*/
        ctx[2]
      )
    }
  });
  menu.$on(
    "change",
    /*MenuChange*/
    ctx[8]
  );
  var switch_value = (
    /*panes*/
    ctx[6][
      /*pane*/
      ctx[2]
    ].component
  );
  function switch_props(ctx2) {
    return {
      props: {
        client: (
          /*client*/
          ctx2[4]
        ),
        clientManager: (
          /*clientManager*/
          ctx2[0]
        )
      }
    };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
  }
  let if_block = (
    /*$secondaryPane*/
    ctx[5] && create_if_block_1$7(ctx)
  );
  return {
    c() {
      section = element("section");
      create_component(menu.$$.fragment);
      t0 = space();
      div = element("div");
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      t1 = space();
      if (if_block)
        if_block.c();
      attr(div, "class", "pane svelte-1dhkl71");
      attr(div, "role", "region");
      attr(
        div,
        "aria-label",
        /*pane*/
        ctx[2]
      );
      attr(div, "tabindex", "-1");
      attr(section, "aria-label", "boardgame.io Debug Panel");
      attr(section, "class", "debug-panel svelte-1dhkl71");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      mount_component(menu, section, null);
      append(section, t0);
      append(section, div);
      if (switch_instance) {
        mount_component(switch_instance, div, null);
      }
      ctx[10](div);
      append(section, t1);
      if (if_block)
        if_block.m(section, null);
      current = true;
    },
    p(ctx2, dirty) {
      const menu_changes = {};
      if (dirty & /*pane*/
      4)
        menu_changes.pane = /*pane*/
        ctx2[2];
      menu.$set(menu_changes);
      const switch_instance_changes = {};
      if (dirty & /*client*/
      16)
        switch_instance_changes.client = /*client*/
        ctx2[4];
      if (dirty & /*clientManager*/
      1)
        switch_instance_changes.clientManager = /*clientManager*/
        ctx2[0];
      if (switch_value !== (switch_value = /*panes*/
      ctx2[6][
        /*pane*/
        ctx2[2]
      ].component)) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx2));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, div, null);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty & /*pane*/
      4) {
        attr(
          div,
          "aria-label",
          /*pane*/
          ctx2[2]
        );
      }
      if (
        /*$secondaryPane*/
        ctx2[5]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*$secondaryPane*/
          32) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_1$7(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(section, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(menu.$$.fragment, local);
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      transition_in(if_block);
      add_render_callback(() => {
        if (!section_transition)
          section_transition = create_bidirectional_transition(section, fly, { x: 400 }, true);
        section_transition.run(1);
      });
      current = true;
    },
    o(local) {
      transition_out(menu.$$.fragment, local);
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      transition_out(if_block);
      if (!section_transition)
        section_transition = create_bidirectional_transition(section, fly, { x: 400 }, false);
      section_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(section);
      destroy_component(menu);
      if (switch_instance)
        destroy_component(switch_instance);
      ctx[10](null);
      if (if_block)
        if_block.d();
      if (detaching && section_transition)
        section_transition.end();
    }
  };
}
function create_if_block_1$7(ctx) {
  let div;
  let switch_instance;
  let current;
  var switch_value = (
    /*$secondaryPane*/
    ctx[5].component
  );
  function switch_props(ctx2) {
    return {
      props: {
        metadata: (
          /*$secondaryPane*/
          ctx2[5].metadata
        )
      }
    };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
  }
  return {
    c() {
      div = element("div");
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      attr(div, "class", "secondary-pane svelte-1dhkl71");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (switch_instance) {
        mount_component(switch_instance, div, null);
      }
      current = true;
    },
    p(ctx2, dirty) {
      const switch_instance_changes = {};
      if (dirty & /*$secondaryPane*/
      32)
        switch_instance_changes.metadata = /*$secondaryPane*/
        ctx2[5].metadata;
      if (switch_value !== (switch_value = /*$secondaryPane*/
      ctx2[5].component)) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx2));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, div, null);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i(local) {
      if (current)
        return;
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (switch_instance)
        destroy_component(switch_instance);
    }
  };
}
function create_fragment$y(ctx) {
  let if_block_anchor;
  let current;
  let mounted;
  let dispose;
  let if_block = (
    /*visible*/
    ctx[3] && create_if_block$e(ctx)
  );
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
      if (!mounted) {
        dispose = listen(
          window,
          "keypress",
          /*Keypress*/
          ctx[9]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*visible*/
        ctx2[3]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*visible*/
          8) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$e(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
      mounted = false;
      dispose();
    }
  };
}
function instance$y($$self, $$props, $$invalidate) {
  let $clientManager, $$unsubscribe_clientManager = noop, $$subscribe_clientManager = () => ($$unsubscribe_clientManager(), $$unsubscribe_clientManager = subscribe(clientManager, ($$value) => $$invalidate(11, $clientManager = $$value)), clientManager);
  let $secondaryPane;
  $$self.$$.on_destroy.push(() => $$unsubscribe_clientManager());
  let { clientManager } = $$props;
  $$subscribe_clientManager();
  const panes = {
    main: {
      label: "Main",
      shortcut: "m",
      component: Main
    },
    log: {
      label: "Log",
      shortcut: "l",
      component: Log
    },
    info: {
      label: "Info",
      shortcut: "i",
      component: Info
    },
    ai: {
      label: "AI",
      shortcut: "a",
      component: AI
    }
  };
  const disableHotkeys = writable(false);
  const secondaryPane = writable(null);
  component_subscribe($$self, secondaryPane, (value) => $$invalidate(5, $secondaryPane = value));
  setContext("hotkeys", { disableHotkeys });
  setContext("secondaryPane", { secondaryPane });
  let paneDiv;
  let pane = "main";
  function MenuChange(e) {
    $$invalidate(2, pane = e.detail);
    paneDiv.focus();
  }
  let visible = true;
  function Keypress(e) {
    if (e.key == ".") {
      $$invalidate(3, visible = !visible);
      return;
    }
    if (!visible)
      return;
    Object.entries(panes).forEach(([key, { shortcut }]) => {
      if (e.key == shortcut) {
        $$invalidate(2, pane = key);
      }
    });
  }
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      paneDiv = $$value;
      $$invalidate(1, paneDiv);
    });
  }
  $$self.$set = ($$props2) => {
    if ("clientManager" in $$props2)
      $$subscribe_clientManager($$invalidate(0, clientManager = $$props2.clientManager));
  };
  let client;
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$clientManager*/
    2048) {
      $$invalidate(4, client = $clientManager.client);
    }
  };
  return [
    clientManager,
    paneDiv,
    pane,
    visible,
    client,
    $secondaryPane,
    panes,
    secondaryPane,
    MenuChange,
    Keypress,
    div_binding
  ];
}
class Debug extends SvelteComponent {
  constructor(options) {
    super();
    if (!document.getElementById("svelte-1dhkl71-style"))
      add_css$q();
    init(this, options, instance$y, create_fragment$y, safe_not_equal, { clientManager: 0 });
  }
}
function InitializeGame({ game, numPlayers, setupData }) {
  game = ProcessGameConfig(game);
  if (!numPlayers) {
    numPlayers = 2;
  }
  const ctx = game.flow.ctx(numPlayers);
  let state = {
    // User managed state.
    G: {},
    // Framework managed state.
    ctx,
    // Plugin related state.
    plugins: {}
  };
  state = Setup(state, { game });
  state = Enhance(state, { game, playerID: void 0 });
  const enhancedCtx = EnhanceCtx(state);
  state.G = game.setup(enhancedCtx, setupData);
  let initial = {
    ...state,
    // List of {G, ctx} pairs that can be undone.
    _undo: [],
    // List of {G, ctx} pairs that can be redone.
    _redo: [],
    // A monotonically non-decreasing ID to ensure that
    // state updates are only allowed from clients that
    // are at the same version that the server.
    _stateID: 0
  };
  initial = game.flow.init(initial);
  initial = Flush(initial, { game });
  if (!game.disableUndo) {
    initial._undo = [
      {
        G: initial.G,
        ctx: initial.ctx,
        plugins: initial.plugins
      }
    ];
  }
  return initial;
}
class Transport {
  constructor({ store, gameName, playerID, matchID, credentials, numPlayers }) {
    this.store = store;
    this.gameName = gameName || "default";
    this.playerID = playerID || null;
    this.matchID = matchID || "default";
    this.credentials = credentials;
    this.numPlayers = numPlayers || 2;
  }
}
class DummyImpl extends Transport {
  connect() {
  }
  disconnect() {
  }
  onAction() {
  }
  onChatMessage() {
  }
  subscribe() {
  }
  subscribeChatMessage() {
  }
  subscribeMatchData() {
  }
  updateCredentials() {
  }
  updateMatchID() {
  }
  updatePlayerID() {
  }
}
const DummyTransport = (opts) => new DummyImpl(opts);
class ClientManager {
  constructor() {
    this.debugPanel = null;
    this.currentClient = null;
    this.clients = /* @__PURE__ */ new Map();
    this.subscribers = /* @__PURE__ */ new Map();
  }
  /**
   * Register a client with the client manager.
   */
  register(client) {
    this.clients.set(client, client);
    this.mountDebug(client);
    this.notifySubscribers();
  }
  /**
   * Unregister a client from the client manager.
   */
  unregister(client) {
    this.clients.delete(client);
    if (this.currentClient === client) {
      this.unmountDebug();
      for (const [client2] of this.clients) {
        if (this.debugPanel)
          break;
        this.mountDebug(client2);
      }
    }
    this.notifySubscribers();
  }
  /**
   * Subscribe to the client manager state.
   * Calls the passed callback each time the current client changes or a client
   * registers/unregisters.
   * Returns a function to unsubscribe from the state updates.
   */
  subscribe(callback) {
    const id = Symbol();
    this.subscribers.set(id, callback);
    callback(this.getState());
    return () => {
      this.subscribers.delete(id);
    };
  }
  /**
   * Switch to a client with a matching playerID.
   */
  switchPlayerID(playerID) {
    if (this.currentClient.multiplayer) {
      for (const [client] of this.clients) {
        if (client.playerID === playerID && client.debugOpt !== false && client.multiplayer === this.currentClient.multiplayer) {
          this.switchToClient(client);
          return;
        }
      }
    }
    this.currentClient.updatePlayerID(playerID);
    this.notifySubscribers();
  }
  /**
   * Set the passed client as the active client for debugging.
   */
  switchToClient(client) {
    if (client === this.currentClient)
      return;
    this.unmountDebug();
    this.mountDebug(client);
    this.notifySubscribers();
  }
  /**
   * Notify all subscribers of changes to the client manager state.
   */
  notifySubscribers() {
    const arg = this.getState();
    this.subscribers.forEach((cb) => {
      cb(arg);
    });
  }
  /**
   * Get the client manager state.
   */
  getState() {
    return {
      client: this.currentClient,
      debuggableClients: this.getDebuggableClients()
    };
  }
  /**
   * Get an array of the registered clients that haven’t disabled the debug panel.
   */
  getDebuggableClients() {
    return [...this.clients.values()].filter((client) => client.debugOpt !== false);
  }
  /**
   * Mount the debug panel using the passed client.
   */
  mountDebug(client) {
    if (client.debugOpt === false || this.debugPanel !== null || typeof document === "undefined") {
      return;
    }
    let DebugImpl;
    let target = document.body;
    if (process.env.NODE_ENV !== "production") {
      DebugImpl = Debug;
    }
    if (client.debugOpt && client.debugOpt !== true) {
      DebugImpl = client.debugOpt.impl || DebugImpl;
      target = client.debugOpt.target || target;
    }
    if (DebugImpl) {
      this.currentClient = client;
      this.debugPanel = new DebugImpl({
        target,
        props: { clientManager: this }
      });
    }
  }
  /**
   * Unmount the debug panel.
   */
  unmountDebug() {
    this.debugPanel.$destroy();
    this.debugPanel = null;
    this.currentClient = null;
  }
}
const GlobalClientManager = new ClientManager();
function assumedPlayerID(playerID, store, multiplayer) {
  if (!multiplayer && (playerID === null || playerID === void 0)) {
    const state = store.getState();
    playerID = state.ctx.currentPlayer;
  }
  return playerID;
}
function createDispatchers(storeActionType, innerActionNames, store, playerID, credentials, multiplayer) {
  return innerActionNames.reduce((dispatchers, name) => {
    dispatchers[name] = function(...args) {
      store.dispatch(ActionCreators[storeActionType](name, args, assumedPlayerID(playerID, store, multiplayer), credentials));
    };
    return dispatchers;
  }, {});
}
const createMoveDispatchers = createDispatchers.bind(null, "makeMove");
const createEventDispatchers = createDispatchers.bind(null, "gameEvent");
const createPluginDispatchers = createDispatchers.bind(null, "plugin");
class _ClientImpl {
  constructor({ game, debug, numPlayers, multiplayer, matchID, playerID, credentials, enhancer }) {
    this.game = ProcessGameConfig(game);
    this.playerID = playerID;
    this.matchID = matchID;
    this.credentials = credentials;
    this.multiplayer = multiplayer;
    this.debugOpt = debug;
    this.manager = GlobalClientManager;
    this.gameStateOverride = null;
    this.subscribers = {};
    this._running = false;
    this.reducer = CreateGameReducer({
      game: this.game,
      isClient: multiplayer !== void 0
    });
    this.initialState = null;
    if (!multiplayer) {
      this.initialState = InitializeGame({ game: this.game, numPlayers });
    }
    this.reset = () => {
      this.store.dispatch(reset(this.initialState));
    };
    this.undo = () => {
      const undo$1 = undo(assumedPlayerID(this.playerID, this.store, this.multiplayer), this.credentials);
      this.store.dispatch(undo$1);
    };
    this.redo = () => {
      const redo$1 = redo(assumedPlayerID(this.playerID, this.store, this.multiplayer), this.credentials);
      this.store.dispatch(redo$1);
    };
    this.log = [];
    const LogMiddleware = (store) => (next) => (action) => {
      const result = next(action);
      const state = store.getState();
      switch (action.type) {
        case MAKE_MOVE:
        case GAME_EVENT:
        case UNDO:
        case REDO: {
          const deltalog = state.deltalog;
          this.log = [...this.log, ...deltalog];
          break;
        }
        case RESET: {
          this.log = [];
          break;
        }
        case PATCH:
        case UPDATE: {
          let id = -1;
          if (this.log.length > 0) {
            id = this.log[this.log.length - 1]._stateID;
          }
          let deltalog = action.deltalog || [];
          deltalog = deltalog.filter((l) => l._stateID > id);
          this.log = [...this.log, ...deltalog];
          break;
        }
        case SYNC: {
          this.initialState = action.initialState;
          this.log = action.log || [];
          break;
        }
      }
      return result;
    };
    const TransportMiddleware = (store) => (next) => (action) => {
      const baseState = store.getState();
      const result = next(action);
      if (!("clientOnly" in action)) {
        this.transport.onAction(baseState, action);
      }
      return result;
    };
    const SubscriptionMiddleware = () => (next) => (action) => {
      const result = next(action);
      this.notifySubscribers();
      return result;
    };
    const middleware = applyMiddleware(TransientHandlingMiddleware, SubscriptionMiddleware, TransportMiddleware, LogMiddleware);
    enhancer = enhancer !== void 0 ? compose(middleware, enhancer) : middleware;
    this.store = createStore(this.reducer, this.initialState, enhancer);
    if (!multiplayer)
      multiplayer = DummyTransport;
    this.transport = multiplayer({
      gameKey: game,
      game: this.game,
      store: this.store,
      matchID,
      playerID,
      credentials,
      gameName: this.game.name,
      numPlayers
    });
    this.createDispatchers();
    this.transport.subscribeMatchData((metadata) => {
      this.matchData = metadata;
      this.notifySubscribers();
    });
    this.chatMessages = [];
    this.sendChatMessage = (payload) => {
      this.transport.onChatMessage(this.matchID, {
        id: nanoid(7),
        sender: this.playerID,
        payload
      });
    };
    this.transport.subscribeChatMessage((message) => {
      this.chatMessages = [...this.chatMessages, message];
      this.notifySubscribers();
    });
  }
  notifySubscribers() {
    Object.values(this.subscribers).forEach((fn) => fn(this.getState()));
  }
  overrideGameState(state) {
    this.gameStateOverride = state;
    this.notifySubscribers();
  }
  start() {
    this.transport.connect();
    this._running = true;
    this.manager.register(this);
  }
  stop() {
    this.transport.disconnect();
    this._running = false;
    this.manager.unregister(this);
  }
  subscribe(fn) {
    const id = Object.keys(this.subscribers).length;
    this.subscribers[id] = fn;
    this.transport.subscribe(() => this.notifySubscribers());
    if (this._running || !this.multiplayer) {
      fn(this.getState());
    }
    return () => {
      delete this.subscribers[id];
    };
  }
  getInitialState() {
    return this.initialState;
  }
  getState() {
    let state = this.store.getState();
    if (this.gameStateOverride !== null) {
      state = this.gameStateOverride;
    }
    if (state === null) {
      return state;
    }
    let isActive = true;
    const isPlayerActive = this.game.flow.isPlayerActive(state.G, state.ctx, this.playerID);
    if (this.multiplayer && !isPlayerActive) {
      isActive = false;
    }
    if (!this.multiplayer && this.playerID !== null && this.playerID !== void 0 && !isPlayerActive) {
      isActive = false;
    }
    if (state.ctx.gameover !== void 0) {
      isActive = false;
    }
    if (!this.multiplayer) {
      state = {
        ...state,
        G: this.game.playerView(state.G, state.ctx, this.playerID),
        plugins: PlayerView(state, this)
      };
    }
    return {
      ...state,
      log: this.log,
      isActive,
      isConnected: this.transport.isConnected
    };
  }
  createDispatchers() {
    this.moves = createMoveDispatchers(this.game.moveNames, this.store, this.playerID, this.credentials, this.multiplayer);
    this.events = createEventDispatchers(this.game.flow.enabledEventNames, this.store, this.playerID, this.credentials, this.multiplayer);
    this.plugins = createPluginDispatchers(this.game.pluginNames, this.store, this.playerID, this.credentials, this.multiplayer);
  }
  updatePlayerID(playerID) {
    this.playerID = playerID;
    this.createDispatchers();
    this.transport.updatePlayerID(playerID);
    this.notifySubscribers();
  }
  updateMatchID(matchID) {
    this.matchID = matchID;
    this.createDispatchers();
    this.transport.updateMatchID(matchID);
    this.notifySubscribers();
  }
  updateCredentials(credentials) {
    this.credentials = credentials;
    this.createDispatchers();
    this.transport.updateCredentials(credentials);
    this.notifySubscribers();
  }
}
function Client(opts) {
  return new _ClientImpl(opts);
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const App = Client({
    game: MyGame,
    board: MyBoardComponent,
    debug: true
  });
  return `  <main><h1 data-svelte-h="svelte-8n12i">My Board Game</h1> ${validate_component(App, "App").$$render($$result, {}, {}, {})}</main>`;
});
export {
  Page as default
};