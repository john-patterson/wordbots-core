import React, { Component } from 'react';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import { isEqual } from 'lodash';

import CardTooltip from '../card/CardTooltip';
import { collection } from '../../store/cards';

export default class CardSelector extends Component {
  state = {
    selectedCard: null
  }

  onCardSelect = (card) => {
    const selectedCard = this.state.selectedCard;

    if (card === selectedCard) {
      this.setState({ selectedCard: null });
    } else {
      this.setState({ selectedCard: card });
    }
  }

  get cardsList() {
    const cards = collection.map((card, index) => 
      <CardTooltip card={card} key={index}>
        <div 
          style={{
            padding: 5,
            borderBottom: '1px solid #CCC',
            backgroundColor: isEqual(this.state.selectedCard, card) ? '#D8D8D8' : 'transparent',
            cursor: 'pointer'
          }}
          onClick={() => this.onCardSelect(card)}>
          {card.name}
        </div>
      </CardTooltip>
    );

    return (
      <div>{cards}</div>
    );
  }

  render() {
    return (
      <div style={{
        height: '100%',
        width: 256
      }}>
        <div style={{
          height: 'calc(100% - 64px)',
          overflowY: 'scroll',
          width: '100%'
        }}>{this.cardsList}</div>
        <div style={{
          height: 64,
          display: 'flex',
          width: '100%'
        }}>
          <RaisedButton
            style={{
              width: '50%'
            }}
            backgroundColor="rgb(186, 219, 255)"
            buttonStyle={{
              height: '64px',
              lineHeight: '64px'
            }}
            overlayStyle={{
              height: '64px'
            }}
            onTouchTap={this.onGiveToBlue}
            icon={
              <FontIcon
                className="material-icons"
                style={{
                  lineHeight: '64px',
                  verticalAlign: 'none'
              }}>
                fast_rewind
              </FontIcon>
            }
            disabled={!this.state.selectedCard} />
          <RaisedButton
            style={{
              width: '50%'
            }}
            backgroundColor="rgb(255, 184, 93)"
            buttonStyle={{
              height: '64px',
              lineHeight: '64px'
            }}
            overlayStyle={{
              height: '64px'
            }}
            onTouchTap={this.onGiveToBlue}
            icon={
              <FontIcon
                className="material-icons"
                style={{
                  lineHeight: '64px',
                  verticalAlign: 'none'
              }}>
                fast_forward
              </FontIcon>
            }
            disabled={!this.state.selectedCard} />
        </div>
      </div>
    );
  }
}
