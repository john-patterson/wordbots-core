import React, { Component } from 'react';
import { arrayOf, bool, func, number, object, string } from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Notification from 'react-web-notification';
import Paper from 'material-ui/Paper';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import screenfull from 'screenfull';

import { ANIMATION_TIME_MS, AI_RESPONSE_TIME_MS } from '../constants';
import { inBrowser } from '../util/browser';
import { currentTutorialStep } from '../util/game';
import Board from '../components/game/Board';
import Timer from '../components/game/Timer';
import EndTurnButton from '../components/game/EndTurnButton';
import ForfeitButton from '../components/game/ForfeitButton';
import SoundToggle from '../components/game/SoundToggle';
import FullscreenToggle from '../components/game/FullscreenToggle';
import PlayerArea from '../components/game/PlayerArea';
import Status from '../components/game/Status';
import Sfx from '../components/game/Sfx';
import EventAnimation from '../components/game/EventAnimation';
import VictoryScreen from '../components/game/VictoryScreen';
import TutorialTooltip from '../components/game/TutorialTooltip';
import Chat from '../components/multiplayer/Chat';
import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';
import { arbitraryPlayerState } from '../store/defaultGameState';

import Play from './Play';

function animate(fns) {
  if (fns.length > 0) {
    const [first, ...rest] = fns;
    first();
    setTimeout(() => animate(rest), ANIMATION_TIME_MS);
  }
}

export function mapStateToProps(state) {
  const activePlayer = state.game.players[state.game.player] || arbitraryPlayerState();
  const currentPlayer = state.game.players[state.game.currentTurn];

  return {
    started: state.game.started,
    player: state.game.player,
    currentTurn: state.game.currentTurn,
    usernames: state.game.usernames,
    winner: state.game.winner,

    selectedTile: activePlayer.selectedTile,
    selectedCard: activePlayer.selectedCard,
    playingCardType: currentPlayer.selectedCard !== null ? currentPlayer.hand[currentPlayer.selectedCard].type : null,

    status: activePlayer.status,
    target: activePlayer.target,
    attack: state.game.attack,

    blueHand: state.game.players.blue.hand,
    orangeHand: state.game.players.orange.hand,

    bluePieces: state.game.players.blue.robotsOnBoard,
    orangePieces: state.game.players.orange.robotsOnBoard,

    blueEnergy: state.game.players.blue.energy,
    orangeEnergy: state.game.players.orange.energy,

    blueDeck: state.game.players.blue.deck,
    orangeDeck: state.game.players.orange.deck,

    blueDiscardPile: state.game.players.blue.discardPile,
    orangeDiscardPile: state.game.players.orange.discardPile,

    eventQueue: state.game.eventQueue,
    sfxQueue: state.game.sfxQueue,
    tutorialStep: currentTutorialStep(state.game),
    isPractice: state.game.practice,

    sidebarOpen: state.global.sidebarOpen || state.game.tutorial,

    gameOver: state.game.winner !== null,
    isTutorial: state.game.tutorial,
    isMyTurn: state.game.currentTurn === state.game.player,
    isAttackHappening: state.game.attack && state.game.attack.from && state.game.attack.to && true,

    actionLog: state.game.actionLog,
    socket: state.socket
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onMoveRobot: (fromHexId, toHexId) => {
      dispatch(gameActions.moveRobot(fromHexId, toHexId));
    },
    onAttackRobot: (sourceHexId, targetHexId) => {
      animate([
        () => dispatch(gameActions.attack(sourceHexId, targetHexId)),
        () => dispatch(gameActions.attackRetract()),
        () => dispatch(gameActions.attackComplete())
      ]);
    },
    onMoveRobotAndAttack: (fromHexId, toHexId, targetHexId) => {
      animate([
        () => dispatch(gameActions.moveRobot(fromHexId, toHexId, true)),
        () => dispatch(gameActions.attack(toHexId, targetHexId)),
        () => dispatch(gameActions.attackRetract()),
        () => dispatch(gameActions.attackComplete())
      ]);
    },
    onAttackRetract: () => {
      dispatch(gameActions.attackRetract());
    },
    onAttackComplete: () => {
      dispatch(gameActions.attackComplete());
    },
    onActivateObject: (abilityIdx) => {
      dispatch(gameActions.activateObject(abilityIdx));
    },
    onPlaceRobot: (tileHexId, cardIdx) => {
      dispatch(gameActions.placeCard(tileHexId, cardIdx));
    },
    onSelectCard: (index, player) => {
      dispatch(gameActions.setSelectedCard(index, player));
    },
    onSelectTile: (hexId, player) => {
      dispatch(gameActions.setSelectedTile(hexId, player));
    },
    onDeselect: (player) => {
      dispatch(gameActions.deselect(player));
    },
    onPassTurn: (player) => {
      dispatch(gameActions.passTurn(player));
    },
    onEndGame: () => {
      dispatch([
        gameActions.endGame(),
        socketActions.leave()
      ]);
    },
    onForfeit: (winner) => {
      dispatch([
        socketActions.forfeit(winner),
        socketActions.leave()
      ]);
    },
    onStartTutorial: () => {
      dispatch(gameActions.startTutorial());
    },
    onTutorialStep: (back) => {
      dispatch(gameActions.tutorialStep(back));
    },
    onAIResponse: () => {
      dispatch(gameActions.aiResponse());
    },
    onSendChatMessage: (msg) => {
      dispatch(socketActions.chat(msg));
    }
  };
}

export class GameArea extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    started: bool,
    player: string,
    currentTurn: string,
    usernames: object,
    winner: string,

    selectedTile: string,
    selectedCard: number,
    playingCardType: number,

    status: object,
    target: object,
    attack: object,

    blueHand: arrayOf(object),
    orangeHand: arrayOf(object),

    bluePieces: object,
    orangePieces: object,

    blueEnergy: object,
    orangeEnergy: object,

    blueDeck: arrayOf(object),
    orangeDeck: arrayOf(object),

    blueDiscardPile: arrayOf(object),
    orangeDiscardPile: arrayOf(object),

    eventQueue: arrayOf(object),
    sfxQueue: arrayOf(string),
    tutorialStep: object,
    isPractice: bool,

    sidebarOpen: bool,

    history: object,
    location: object,

    gameOver: bool,
    isTutorial: bool,
    isMyTurn: bool,
    isSpectator: bool,
    isAttackHappening: bool,

    actionLog: arrayOf(object),
    socket: object,

    onMoveRobot: func,
    onAttackRobot: func,
    onMoveRobotAndAttack: func,
    onAttackRetract: func,
    onAttackComplete: func,
    onActivateObject: func,
    onPlaceRobot: func,
    onSelectCard: func,
    onSelectTile: func,
    onDeselect: func,
    onPassTurn: func,
    onEndGame: func,
    onForfeit: func,
    onStartTutorial: func,
    onTutorialStep: func,
    onAIResponse: func,
    onSendChatMessage: func
  };
  /* eslint-enable react/no-unused-prop-types */

  state = {
    areaHeight: 1250,
    boardSize: 1000,
    chatOpen: true
  };

  constructor(props) {
    super(props);

    const { started, history, location, onStartTutorial } = props;

    // If the game hasn't started yet, that means that the player got here
    // by messing with the URL (rather than by clicking a button in the lobby).
    // If the URL is '/play/tutorial', just start the tutorial.
    // Otherwise, return to the lobby because we can't do anything else.
    if (!started) {
      if (location.pathname.startsWith(Play.urlForGameMode('tutorial'))) {
        onStartTutorial();
      } else {
        history.push(Play.baseUrl);
      }
    }
  }

  // For testing.
  static childContextTypes = {
    muiTheme: object.isRequired
  };
  getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)})

  componentDidMount() {
    this.updateDimensions();
    window.onresize = () => { this.updateDimensions(); };

    this.interval = setInterval(() => {
      if (this.props.isPractice && !this.props.winner && this.props.currentTurn === 'blue') {
        animate([
          this.props.onAIResponse,
          this.props.onAttackRetract,
          this.props.onAttackComplete
        ]);
      }
    }, AI_RESPONSE_TIME_MS);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sidebarOpen !== this.props.sidebarOpen) {
      this.updateDimensions(nextProps);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  isMyTurn() {
    return this.props.currentTurn === this.props.player;
  }

  allPieces() {
    return Object.assign({}, this.props.bluePieces, this.props.orangePieces);
  }

  myPieces() {
    return this.props.player === 'blue' ? this.props.bluePieces : this.props.orangePieces;
  }

  updateDimensions = (props = this.props) => {
    const maxBoardHeight = window.innerHeight - 64 - 150;
    const maxBoardWidth = window.innerWidth - (props.sidebarOpen ? 512 : 256);

    this.setState({
      areaHeight: window.innerHeight - 64,
      boardSize: Math.min(maxBoardWidth, maxBoardHeight)
    });
  }

  toggleChat = () => {
    this.setState(state => ({ chatOpen: !state.chatOpen }));
  }

  movePiece = (hexId, asPartOfAttack = false) => {
    this.props.onMoveRobot(this.props.selectedTile, hexId, asPartOfAttack);
  }

  attackPiece = (hexId, intermediateMoveHexId) => {
    if (intermediateMoveHexId) {
      this.props.onMoveRobotAndAttack(this.props.selectedTile, intermediateMoveHexId, hexId);
    } else {
      this.props.onAttackRobot(this.props.selectedTile, hexId);
    }
  }

  placePiece = (hexId) => {
    this.props.onPlaceRobot(hexId, this.props.selectedCard);
  }

  onSelectTile = (hexId, action = null, intermediateMoveHexId = null) => {
    if (this.props.attack) {
      return;  // Can't move/attack while an attack is in progress.
    } if (action === 'move') {
      this.movePiece(hexId);
    } else if (action === 'attack') {
      this.attackPiece(hexId, intermediateMoveHexId);
    } else if (action === 'place') {
      this.placePiece(hexId);
    } else {
      this.props.onSelectTile(hexId, this.props.player);
    }
  }

  loadBackground() {
    return inBrowser() ? require('../components/img/black_bg_lodyas.png') : '';
  }

  handleClickGameArea = evt => {
    const { className } = evt.target;
    const { baseVal } = className;
    if ((baseVal !== undefined ? baseVal : className).includes('background')) {
      this.props.onDeselect(this.props.player);
    }
  }

  handleClickEndGame = () => {
    this.props.onEndGame();
    this.props.history.push('/play');
  }

  handleNextTutorialStep = () => {
    this.props.onTutorialStep();
  }

  handlePrevTutorialStep = () => {
    this.props.onTutorialStep(true);
  }

  handleToggleFullScreen = () => {
    screenfull.toggle(this.gameArea);
  }

  renderNotification() {
    const options = {
      tag: 'wordbots',
      icon: '/static/icons/android-icon-144x144.png',
      lang: 'en',
      dir: 'ltr',
      timestamp: Math.floor(Date.now())
    };

    if (this.props.currentTurn === this.props.player) {
      return (
        <Notification
          timeout={2000}
          title="Wordbots."
          options={{...options, body: 'It\'s your turn!'}}
          onClick={window.focus} />
      );
    }
  }

  render() {
    return (
      <div
        id="gameArea"
        className="gameArea"
        ref={(gameArea) => { this.gameArea = gameArea; }}
        style={
          screenfull.isFullscreen ? {width: '100%', height: '100%'} : {}
        }
      >
        <div>
          {this.renderNotification()}
          <Sfx queue={this.props.sfxQueue} />
        </div>

        <Paper
          className="background"
          style={{
            position: 'relative',
            marginRight: this.state.chatOpen ? 256 : 64,
            height: screenfull.isFullscreen ? this.state.areaHeight + 64 : this.state.areaHeight,
            background: `url(${this.loadBackground()})`
          }}
          onClick={this.handleClickGameArea}
        >
          <div
            className="background"
            style={{
              display: 'flex',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div
              className="background"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 20,
                zIndex: 9999
              }}
            >
              <Timer
                player={this.props.player}
                currentTurn={this.props.currentTurn}
                gameOver={this.props.gameOver}
                isTutorial={this.props.isTutorial}
                isMyTurn={this.props.isMyTurn}
                isAttackHappening={this.props.isAttackHappening}
                onPassTurn={this.props.onPassTurn} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: 10
              }}>
                <SoundToggle />
                <FullscreenToggle onClick={this.handleToggleFullScreen} />
              </div>
            </div>
            <div
              className="background"
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginRight: 20,
                zIndex: 9999
              }}
            >
              <TutorialTooltip
                tutorialStep={this.props.tutorialStep}
                enabled={this.props.tutorialStep && this.props.tutorialStep.tooltip.location === 'endTurnButton'}
                top={0}
                place="left"
                onNextStep={this.handleNextTutorialStep}
                onPrevStep={this.handlePrevTutorialStep}
              >
                <EndTurnButton
                  player={this.props.player}
                  gameOver={this.props.gameOver}
                  isMyTurn={this.props.isMyTurn}
                  isAttackHappening={this.props.isAttackHappening}
                  onPassTurn={this.props.onPassTurn} />
              </TutorialTooltip>
              <ForfeitButton
                player={this.props.player}
                history={this.props.history}
                gameOver={this.props.gameOver}
                isSpectator={this.props.isSpectator}
                isTutorial={this.props.isTutorial}
                onForfeit={this.props.onForfeit} />
            </div>
          </div>
          <PlayerArea opponent gameProps={this.props} />
          <div
            className="background"
            style={{
              position: 'absolute',
              left: 0,
              top: 75,
              bottom: 75,
              right: 0,
              margin: '0 auto',
              zIndex: 999,
              width: this.state.boardSize
            }}
          >
            <Status status={this.isMyTurn() ? this.props.status : {}} />
            <Board
              size={this.state.boardSize}
              player={this.props.player}
              currentTurn={this.props.currentTurn}
              selectedTile={this.props.selectedTile}
              target={this.props.target}
              bluePieces={this.props.bluePieces}
              orangePieces={this.props.orangePieces}
              playingCardType={this.props.playingCardType}
              tutorialStep={this.props.tutorialStep}
              attack={this.props.attack}
              isGameOver={!!this.props.winner}
              onSelectTile={this.onSelectTile}
              onActivateAbility={this.props.onActivateObject}
              onTutorialStep={this.props.onTutorialStep}
              onEndGame={this.handleClickEndGame} />
          </div>
          <PlayerArea gameProps={this.props} />
          <EventAnimation eventQueue={this.props.eventQueue} currentTurn={this.props.currentTurn} />
          <VictoryScreen
            winnerColor={this.props.winner}
            winnerName={this.props.winner ? this.props.usernames[this.props.winner] : null}
            onClick={this.handleClickEndGame} />
        </Paper>

        <Chat
          inGame
          fullscreen={screenfull.isFullscreen}
          open={this.state.chatOpen}
          toggleChat={this.toggleChat}
          roomName={this.props.socket.hosting ? null : this.props.socket.gameName}
          messages={this.props.socket.chatMessages.concat(this.props.actionLog)}
          onSendMessage={this.props.onSendChatMessage} />
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameArea));
