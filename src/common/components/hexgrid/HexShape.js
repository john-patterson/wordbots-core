import React from 'react';
import { arrayOf, bool, object, string } from 'prop-types';

import { DISPLAY_HEX_IDS, SHOW_TOOLTIP_TIMEOUT_MS } from '../../constants';
import CardTooltip from '../card/CardTooltip';
import AbilitiesTooltip from '../game/AbilitiesTooltip';
import TutorialTooltip from '../game/TutorialTooltip';

import FillPattern from './FillPattern';
import HexUtils from './HexUtils';

export default class HexShape extends React.Component {
  static propTypes = {
    hex: object.isRequired,
    layout: object.isRequired,
    actions: object.isRequired,
    card: object,
    tutorialStep: object,
    activatedAbilities: arrayOf(object),
    fill: string,
    selected: bool,
    hovered: bool,
    isGameOver: bool
  };

  state = {
    displayTooltip: false,
    tooltipTimeout: null
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.hovered !== nextProps.hovered) {
      if (nextProps.hovered) {
        this.triggerTooltip();
      } else {
        this.untriggerTooltip();
      }
    }
  }

  componentWillUnmount = () => {
    this.untriggerTooltip();
  }

  get points() {
    const points = this.props.layout.getPolygonPoints(this.props.hex);
    return points.map(point => `${point.x},${point.y}`).join(' ');
  }

  get translate() {
    const hex = this.props.hex;
    const pixel = HexUtils.hexToPixel(hex, this.props.layout);
    return `translate(${pixel.x}, ${pixel.y})`;
  }

  get hexStyles() {
    const { hex, selected } = this.props;

    if (selected) {
      return {
        stroke: '#666',
        strokeWidth: 0.6,
        fillOpacity: 0
      };
    } else {
      return {
        fill: `url(#${HexUtils.getID(hex)})`
      };
    }
  }

  get shouldRenderTutorialTooltip() {
    return this.props.tutorialStep && (HexUtils.getID(this.props.hex) === this.props.tutorialStep.tooltip.hex);
  }

  handleMouseEnter = evt => this.props.actions.onHexHover(this.props.hex, evt);
  handleMouseLeave = evt => this.props.actions.onHexHover(this.props.hex, evt);
  handleClickHex = evt => this.props.actions.onClick(this.props.hex, evt);
  handleClickNextTutorialStep = () => { this.props.actions.onTutorialStep(false); };
  handleClickPrevTutorialStep = () => { this.props.actions.onTutorialStep(true); };

  triggerTooltip = () => {
    this.setState({
      tooltipTimeout: setTimeout(() => {
        this.setState({displayTooltip: true});
      }, SHOW_TOOLTIP_TIMEOUT_MS)
    });
  };

  untriggerTooltip = () => {
    if (this.state.tooltipTimeout) {
      clearTimeout(this.state.tooltipTimeout);
    }

    this.setState({
      displayTooltip: false,
      tooltipTimeout: null
    });
  }

  renderPattern() {
    if (!this.props.selected) {
      return (
        <FillPattern
          hex={this.props.hex}
          fill={this.props.fill} />
      );
    } else {
      return null;
    }
  }

  renderText() {
    if (DISPLAY_HEX_IDS) {
      return <text x="0" y="0.3em" textAnchor="middle">{HexUtils.getID(this.props.hex) || ''}</text>;
    }
  }

  renderHex() {
    return (
      <g
        draggable
        transform={this.translate}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClickHex}
      >
        {this.renderPattern()}
        <polygon key="p1" points={this.points} style={this.hexStyles} />
        {this.renderText()}
      </g>
    );
  }

  render() {
    if (this.shouldRenderTutorialTooltip) {
      return (
        <TutorialTooltip
          tutorialStep={this.props.tutorialStep}
          onNextStep={this.handleClickNextTutorialStep}
          onPrevStep={this.handleClickPrevTutorialStep}
          onEndTutorial={this.props.actions.onEndGame}
          place={this.props.tutorialStep.tooltip.place || 'above'}
        >
          {this.renderHex()}
        </TutorialTooltip>
      );
    } else if (this.props.isGameOver) {
      return this.renderHex();
    } else if ((this.props.activatedAbilities || []).length > 0) {
      return (
        <AbilitiesTooltip
          activatedAbilities={this.props.activatedAbilities}
          onActivateAbility={this.props.actions.onActivateAbility}
        >
          {this.renderHex()}
        </AbilitiesTooltip>
      );
    } else {
     return (
        <CardTooltip popover card={this.props.card} isOpen={this.state.displayTooltip}>
          {this.renderHex()}
        </CardTooltip>
      );
    }
  }
}
