import { newGame, passTurn } from '../../util/game';

import { setSelectedCard, placeCard } from './game/cards';
import { deselect, setSelectedTile, moveRobot, attack, attackComplete, activateObject } from './game/board';
import { startTutorial, handleTutorialAction } from './game/tutorial';
import { startPractice, aiResponse } from './game/practice';

const gameHandlers = {
  newGame,
  passTurn,

  setSelectedCard,
  placeCard,

  deselect,
  setSelectedTile,
  moveRobot,
  attack,
  attackComplete,
  activateObject,

  startTutorial,
  handleTutorialAction,

  startPractice,
  aiResponse
};

export default gameHandlers;
