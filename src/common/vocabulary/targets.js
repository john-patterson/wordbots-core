import { compact, fromPairs, isArray, isEmpty, isUndefined } from 'lodash';
import { pick } from 'shuffle-array';

import { arrayToSentence } from '../util/common';
import {
  opponent, currentPlayer, opponentPlayer, allObjectsOnBoard, getHex, ownerOf,
  logAction
} from '../util/game';

// Targets are all functions that return one of:
//    {type: 'cards', entries: <an array of cards in a players' hand>}
//    {type: 'objects', entries: <array of objects on the board>}
//    {type: 'players', entries: <array of players>}
// An empty array of entries means either that there are no valid targets
// or that a player still needs to choose a target.

export default function targets(state, currentObject) {
  return {
    all: function (collection) {
      return collection;
    },

    allPlayers: function () {
      return {type: 'players', entries: [currentPlayer(state), opponentPlayer(state)]};
    },

    // Note: Unlike other target functions, choose() can return a [hex]
    //       (if the chosen hex does not contain an object.)
    choose: function (collection) {
      const player = currentPlayer(state);

      if (player.target.chosen && player.target.chosen.length > 0) {
        // Return and clear chosen target.

        // If there's multiple targets, take the first (we treat target.chosen as a queue).
        const [ target, ...otherTargets ] = player.target.chosen;
        player.target.chosen = otherTargets;

        state.it = target;  // "it" stores most recently chosen salient object for lookup.

        if (collection.type === 'cards') {
          return {type: 'cards', entries: [target]};
        } else {
          // Return objects if possible or hexes if not.
          if (allObjectsOnBoard(state)[target]) {
            return {type: 'objects', entries: [allObjectsOnBoard(state)[target]]};
          } else {
            return {type: 'hexes', entries: [target]};
          }
        }
      } else {
        if (isEmpty(collection.entries)) {
          // No valid target!
          state.invalid = true;
        } else {
          // Prepare target selection.
          player.target.choosing = true;

          if (collection.type === 'cards') {
            player.target.possibleCards = collection.entries.map(card => card.id);
            player.target.possibleHexes = [];
          } else if (collection.type === 'objects') {
            // Don't allow player to pick the object that is being played (if any).
            player.target.possibleHexes = collection.entries.filter(obj => !obj.justPlayed).map(obj => getHex(state, obj));
            player.target.possibleCards = [];
          } else if (collection.type === 'hexes') {
            // Don't allow player to pick the hex of the object that is being played (if any).
            player.target.possibleHexes = collection.entries.filter(hex => {
              const obj = allObjectsOnBoard(state)[hex];
              return obj ? !obj.justPlayed : true;
            });
            player.target.possibleCards = [];
          }

          state.players[player.name] = player;
        }

        return {type: collection.type, entries: []};
      }
    },

    controllerOf: function (objects) {
      // Assume that only one object is ever passed in here.
      return {type: 'players', entries: (objects.entries.length === 1) ? [ownerOf(state, objects.entries[0])] : []};
    },

    // Currently salient object.
    it: function () {
      /* console.log({
        it: state.it ? state.it.name || state.it.card.name : null,
        currentObject: currentObject ? currentObject.name || currentObject.card.name : null
      }); */

      // currentObject has higher salience than state.it .
      // (This resolves the bug where robots' Haste ability would be triggered by other robots being played.)
      return {type: 'objects', entries: compact([currentObject || state.it])};
    },

    // Currently salient player.
    itP: function () {
      return {type: 'players', entries: compact([state.itP || opponentPlayer(state)])};
    },

    opponent: function () {
      if (currentObject) {
        return {type: 'players', entries: [state.players[opponent(ownerOf(state, currentObject).name)]]};
      } else {
        return {type: 'players', entries: [opponentPlayer(state)]};
      }
    },

    random: function (num, collection) {
      let chosen = pick(collection.entries, {picks: num, rng: state.rng});
      chosen = isUndefined(chosen) ? [] : (isArray(chosen) ? chosen : [chosen]);

      // Log the random selection.
      if (chosen.length > 0 && ['cards', 'objects'].includes(collection.type)) {
        const cards = fromPairs(chosen.map(c => c.card ? [c.card.name, c.card] : [c.name, c]));
        const names = Object.keys(cards).map(name => `|${name}|`);
        const explanationStr = `${arrayToSentence(names)} ${chosen.length === 1 ? 'was' : 'were'} selected`;
        logAction(state, null, explanationStr, cards);
      }

      return {type: collection.type, entries: chosen};
    },

    self: function () {
      if (currentObject) {
        return {type: 'players', entries: [ownerOf(state, currentObject)]};
      } else {
        return {type: 'players', entries: [currentPlayer(state)]};
      }
    },

    // Currently salient object (prioritizing object over subject).
    // e.g. contrast:
    //     Whenever this robot attacks a robot, it gains two health.
    //     ("it" is ambiguous, but we treat it as the subject)
    // with:
    //     Whenever this robot attacks a robot, destroy that robot.
    //     ("that robot" clearly refers to the object)
    that: function () {
      return {type: 'objects', entries: compact([state.that || state.it])};
    },

    // Prioritize current iteratee in a collection of objects.
    // e.g. "Set the attack of all robots to *their* health."
    they: function () {
      // Wrap it as a function of state because this needs to be evaluated as late as possible.
      return (currentState) => ({
        type: 'objects',
        entries: compact([currentState.currentObjectInCollection || currentState.it])
      });
    },

    thisRobot: function () {
      return {type: 'objects', entries: [currentObject]};
    }
  };
}
