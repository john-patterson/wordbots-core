import React, { Component } from 'react';
import { arrayOf, bool, func, number, object } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router';

import Chat from '../components/multiplayer/Chat';
import Lobby from '../components/multiplayer/Lobby';
import * as collectionActions from '../actions/collection';
import * as gameActions from '../actions/game';
import * as socketActions from '../actions/socket';

import GameArea from './GameArea';

export function mapStateToProps(state) {
  const validDecks = state.collection.decks.filter(d => d.cardIds.length === 30);

  return {
    started: state.game.started,
    actionLog: state.game.actionLog,

    socket: state.socket,
    cards: state.collection.cards,
    availableDecks: validDecks,
    selectedDeckIdx: Math.min(state.collection.selectedDeckIdx || 0, validDecks.length)
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onConnect: () => {
      dispatch(socketActions.connect());
    },
    onHostGame: (name, deck) => {
      dispatch(socketActions.host(name, deck));
    },
    onJoinGame: (id, name, deck) => {
      dispatch(socketActions.join(id, name, deck));
    },
    onSpectateGame: (id) => {
      dispatch(socketActions.spectate(id));
    },
    onStartPractice: (deck) => {
      dispatch(gameActions.startPractice(deck));
    },
    onStartTutorial: () => {
      dispatch(gameActions.startTutorial());
    },
    onSendChatMessage: (msg) => {
      dispatch(socketActions.chat(msg));
    },
    onSelectDeck: (deckIdx) => {
      dispatch(collectionActions.selectDeck(deckIdx));
    }
  };
}

export class Play extends Component {
  static propTypes = {
    started: bool,
    actionLog: arrayOf(object),

    socket: object,
    cards: arrayOf(object),
    availableDecks: arrayOf(object),
    selectedDeckIdx: number,

    history: object,

    onConnect: func,
    onHostGame: func,
    onJoinGame: func,
    onSpectateGame: func,
    onStartTutorial: func,
    onStartPractice: func,
    onSendChatMessage: func,
    onSelectDeck: func
  };

  static baseUrl = '/play';
  static urlForGameMode = (mode) => `/${Play.baseUrl}/${mode}`;

  componentDidMount() {
    if (!this.props.socket.connected) {
      this.props.onConnect();
    }
  }

  get rightMenu() {
    if (!this.props.started) {
      return (
        <Chat
          roomName={this.props.socket.hosting ? null : this.props.socket.gameName}
          messages={this.props.socket.chatMessages.concat(this.props.actionLog)}
          onSendMessage={this.props.onSendChatMessage} />
      );
    }
  }

  selectMode = (mode, deck) => {
    if (mode === 'tutorial') {
      this.props.onStartTutorial();
    } else if (mode === 'practice') {
      this.props.onStartPractice(deck);
    }

    this.props.history.push(Play.urlForGameMode(mode));
  }

  renderLobby = () => {
    if (this.props.started) {
      return <GameArea />;
    } else {
      return (
        <Lobby
          socket={this.props.socket}
          gameMode={this.props.history.location.pathname.split('/play')[1]}
          cards={this.props.cards}
          availableDecks={this.props.availableDecks}
          selectedDeckIdx={this.props.selectedDeckIdx}
          onConnect={this.props.onConnect}
          onHostGame={this.props.onHostGame}
          onJoinGame={this.props.onJoinGame}
          onSpectateGame={this.props.onSpectateGame}
          onSelectDeck={this.props.onSelectDeck}
          onSelectMode={this.selectMode} />
      );
    }
  }

  render() {
    return (
      <div>
        <Helmet title="Play"/>

        <Switch>
          <Route path={Play.urlForGameMode('tutorial')} component={GameArea} />
          <Route path={Play.urlForGameMode('practice')} component={GameArea} />
          <Route path={Play.urlForGameMode('casual')} render={this.renderLobby} />
          <Route render={this.renderLobby} />
        </Switch>

        {this.rightMenu}
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Play));
