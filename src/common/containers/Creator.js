import React, { Component } from 'react';
import { arrayOf, bool, func, number, object, oneOfType, string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import RouterDialog from '../components/RouterDialog';
import CardCreationForm from '../components/cards/CardCreationForm';
import CardPreview from '../components/cards/CardPreview';
import * as creatorActions from '../actions/creator';

export function mapStateToProps(state) {
  return {
    id: state.creator.id,
    name: state.creator.name,
    type: state.creator.type,
    attack: state.creator.attack,
    speed: state.creator.speed,
    health: state.creator.health,
    cost: state.creator.energy,
    spriteID: state.creator.spriteID,
    sentences: state.creator.sentences,
    text: state.creator.text,
    loggedIn: state.global.user !== null
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onSetName: (name) => {
      dispatch(creatorActions.setName(name));
    },
    onSetType: (type) => {
      dispatch(creatorActions.setType(type));
    },
    onSetText: (text) => {
      dispatch(creatorActions.setText(text));
    },
    onSetAttribute: (attr, value) => {
      dispatch(creatorActions.setAttribute(attr, value));
    },
    onParseComplete: (idx, sentence, result) => {
      dispatch(creatorActions.parseComplete(idx, sentence, result));
    },
    onSpriteClick: () => {
      dispatch(creatorActions.regenerateSprite());
    },
    onAddToCollection: (props) => {
      dispatch(creatorActions.addToCollection(props));
    }
  };
}

export class Creator extends Component {
  static propTypes = {
    id: string,
    name: string,
    type: number,
    text: string,
    sentences: arrayOf(object),
    spriteID: string,
    attack: number,
    speed: number,
    health: number,
    cost: number,
    loggedIn: bool,

    history: oneOfType([arrayOf(object), object]),

    onSetName: func,
    onSetType: func,
    onSetText: func,
    onSetAttribute: func,
    onParseComplete: func,
    onSpriteClick: func,
    onAddToCollection: func
  };

  static defaultProps = {
    history: []
  }

  // For testing.
  static childContextTypes = {
    muiTheme: object.isRequired
  };
  getChildContext = () => ({muiTheme: getMuiTheme(baseTheme)})

  openDialog = (dialogPath) => {
    RouterDialog.openDialog(this.props.history, dialogPath);
  }

  addToCollection = () => {
    this.props.onAddToCollection(this.props);
    this.props.history.push('/collection');
  }

  render() {
    return (
      <div style={{position: 'relative'}}>
        <Helmet title="Creator"/>

        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <CardCreationForm
            loggedIn={this.props.loggedIn}
            name={this.props.name}
            type={this.props.type}
            attack={this.props.attack}
            speed={this.props.speed}
            health={this.props.health}
            energy={this.props.cost}
            text={this.props.text}
            sentences={this.props.sentences}
            isNewCard={this.props.id ? true : false}
            onSetName={this.props.onSetName}
            onSetType={this.props.onSetType}
            onSetText={this.props.onSetText}
            onSetAttribute={this.props.onSetAttribute}
            onParseComplete={this.props.onParseComplete}
            onSpriteClick={this.props.onSpriteClick}
            onOpenDialog={this.openDialog}
            onAddToCollection={this.addToCollection} />
          <CardPreview
            name={this.props.name}
            type={this.props.type}
            spriteID={this.props.spriteID}
            sentences={this.props.sentences}
            attack={this.props.attack}
            speed={this.props.speed}
            health={this.props.health}
            energy={this.props.cost}
            onSpriteClick={this.props.onSpriteClick} />
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Creator));
