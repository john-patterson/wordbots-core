import React, {Component} from 'react';
import {array, bool, func, number, string} from 'prop-types';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import {capitalize, compact} from 'lodash';

import {CREATABLE_TYPES, TYPE_ROBOT, TYPE_EVENT, typeToString} from '../../constants';
import {ensureInRange} from '../../util/common';
import {getSentencesFromInput, requestParse, numTargetsPerLogicalUnit, CardTextExampleStore} from '../../util/cards';
import {getCardTextCorpus} from '../../util/firebase';
import {prepareBigramProbs} from '../../util/language';
import Tooltip from '../Tooltip';
import MustBeLoggedIn from '../users/MustBeLoggedIn';

import CardTextField from './CardTextField';
import NumberField from './NumberField';

const exampleStore = new CardTextExampleStore();

export default class CardCreationForm extends Component {
  static propTypes = {
    name: string,
    type: number,
    text: string,
    sentences: array,
    attack: number,
    speed: number,
    health: number,
    energy: number,
    isNewCard: bool,
    loggedIn: bool,

    onSetName: func,
    onSetType: func,
    onSetText: func,
    onSetAttribute: func,
    onParseComplete: func,
    onSpriteClick: func,
    onAddToCollection: func,
    onOpenDialog: func
  };

  componentDidMount() {
    // Generate new spriteID on reload.
    if (!this.props.isNewCard) {
      this.props.onSpriteClick();
    }

    // This should only happen when we're loading an existing card (from Collection view).
    if (this.props.text !== '') {
      this.onUpdateText(this.props.text, this.props.type);
    }

    getCardTextCorpus((corpus, examples) => {
      this.setState({
        bigramProbs: prepareBigramProbs(corpus)
      });
      exampleStore.loadExamples(examples, 100);
    });
  }

  get robot() {
    return this.props.type === TYPE_ROBOT;
  }
  get event() {
    return this.props.type === TYPE_EVENT;
  }

  get nonEmptySentences() {
    return this.props.sentences.filter(s => /\S/.test(s.sentence));
  }

  get hasCardText() {
    return this.nonEmptySentences.length > 0;
  }

  get fullParse() {
    return compact(this.nonEmptySentences.map(s => s.result.js)).join(' ');
  }

  get parserMode() {
    return this.props.type === TYPE_EVENT ? 'event' : 'object';
  }

  get parseErrors() {
    return compact(this.nonEmptySentences.map(s => s.result.error)).map(error =>
      `${error}.`.replace('..', '.').replace('Parser did not produce a valid expression', 'Parser error')
    );
  }

  get nameError() {
    if (!this.props.name || this.props.name === '[Unnamed]') {
      return 'This card needs a name!';
    }
  }

  get typeError() {
    if (!CREATABLE_TYPES.includes(this.props.type)) {
      return 'Invalid type.';
    }
  }

  get costError() {
    return ensureInRange('cost', this.props.energy, 0, 20);
  }

  get attackError() {
    if (this.robot) {
      return ensureInRange('attack', this.props.attack, 0, 10);
    }
  }

  get healthError() {
    if (!this.event) {
      return ensureInRange('health', this.props.health, 1, 10);
    }
  }

  get speedError() {
    if (this.robot) {
      return ensureInRange('speed', this.props.speed, 0, 3);
    }
  }

  get textError() {
    if (this.event && !this.hasCardText) {
      return 'Events must have card text.';
    }

    if (this.parseErrors.length > 0) {
      return this.parseErrors.join(' ');
    } else if (this.nonEmptySentences.find(s => !s.result.js)) {
      return 'Sentences are still being parsed ...';
    } else {
      // Check for >1 target in each logical unit of the parsed JS.
      const tooManyTargets = numTargetsPerLogicalUnit(this.fullParse).find(n => n > 1);
      if (tooManyTargets) {
        return `We do not yet support multiple target selection (expected 0 or 1 targets, got ${tooManyTargets}).`;
      }
    }
  }

  get isValid() {
    return (
      !this.nameError &&
      !this.typeError &&
      !this.costError &&
      !this.attackError &&
      !this.healthError &&
      !this.speedError &&
      !this.textError
    );
  }

  get styles() {
    return {
      container: {width: '60%', flex: 1, padding: 64},
      paper: {padding: 30, maxWidth: 800, margin: '0 auto'},

      section: {display: 'flex', justifyContent: 'space-between'},

      leftCol: {width: '70%', marginRight: 25},
      rightColContainer: {display: 'flex', alignItems: 'center'},
      rightCol: {width: 210},
      attribute: {width: '100%', marginRight: 25},
      saveButton: {marginTop: 20},

      icon: {verticalAlign: 'middle', color: 'white'}
    };
  }

  setAttribute = key => value => {
    this.props.onSetAttribute(key, value);
  };

  onUpdateText(text, cardType, dontIndex = false) {
    const parserMode = cardType === TYPE_EVENT ? 'event' : 'object';
    const sentences = getSentencesFromInput(text);

    this.props.onSetText(text);
    requestParse(sentences, parserMode, this.props.onParseComplete, !dontIndex);
  }

  renderButton = (label, icon, onClick) => (
    <RaisedButton label={label} primary style={{width: '31%', marginBottom: 8}} onClick={onClick}>
      <FontIcon className="material-icons" style={{verticalAlign: 'middle', color: 'white'}}>
        {icon}
      </FontIcon>
    </RaisedButton>
  );

  renderAttributeField(attribute, enabled = true, opts = {}) {
    return (
      <NumberField
        label={capitalize(attribute)}
        value={this.props[attribute]}
        maxValue={opts.max || 10}
        style={this.styles.attribute}
        disabled={!enabled}
        errorText={this[`${attribute}Error`]}
        onChange={this.setAttribute(attribute)}
      />
    );
  }

  render() {
    return (
      <div style={this.styles.container}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}>
          {this.renderButton('Help', 'help_outline', () => {
            this.props.onOpenDialog('help');
          })}
          {this.renderButton('Dictionary', 'book', () => {
            this.props.onOpenDialog('dictionary');
          })}
          {this.renderButton('Randomize', 'refresh', () => {
            this.onUpdateText(exampleStore.getExample(this.parserMode), this.props.type, true);
          })}
        </div>

        <Paper style={this.styles.paper}>
          <div style={this.styles.section}>
            <TextField
              value={this.props.name}
              floatingLabelText="Card Name"
              style={this.styles.leftCol}
              errorText={this.nameError}
              onChange={e => {
                this.props.onSetName(e.target.value);
              }}
            />
            <NumberField
              label="Energy Cost"
              value={this.props.energy}
              maxValue={20}
              style={this.styles.rightCol}
              errorText={this.costError}
              onChange={this.setAttribute('energy')}
            />
          </div>

          <div style={this.styles.section}>
            <SelectField
              value={this.props.type}
              floatingLabelText="Card Type"
              style={{width: 'calc(100% - 60px)'}}
              onChange={(e, i, value) => {
                this.props.onSetType(value);
                // Re-parse card text because different card types now have different validations.
                this.onUpdateText(this.props.text, value);
              }}
            >
              {CREATABLE_TYPES.map(type => <MenuItem key={type} value={type} primaryText={typeToString(type)} />)}
            </SelectField>
            <div style={this.styles.rightColContainer}>
              <Tooltip text="Generate a new image">
                <RaisedButton
                  secondary
                  style={{width: 40, minWidth: 40}}
                  labelPosition="after"
                  onTouchTap={() => {
                    this.props.onSpriteClick();
                  }}
                >
                  <FontIcon className="material-icons" style={this.styles.icon}>
                    refresh
                  </FontIcon>
                </RaisedButton>
              </Tooltip>
            </div>
          </div>

          <CardTextField
            type={this.props.type}
            text={this.props.text}
            sentences={this.nonEmptySentences}
            error={this.textError}
            onOpenDialog={this.props.onOpenDialog}
          />

          <div style={this.styles.section}>
            {this.renderAttributeField('attack', this.robot)}
            {this.renderAttributeField('health', !this.event)}
            {this.renderAttributeField('speed', this.robot, {max: 3})}
          </div>

          <MustBeLoggedIn loggedIn={this.props.loggedIn}>
            <RaisedButton
              primary
              fullWidth
              label={this.props.isNewCard ? 'Save Edits' : 'Add to Collection'}
              disabled={!this.isValid}
              style={this.styles.saveButton}
              onTouchTap={() => {
                this.props.onAddToCollection();
              }}
            />
          </MustBeLoggedIn>
        </Paper>
      </div>
    );
  }
}
