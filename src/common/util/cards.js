import { debounce, every, flatMap, fromPairs, reduce } from 'lodash';

import { TYPE_ROBOT, TYPE_EVENT, TYPE_STRUCTURE, typeToString } from '../constants';

//
// 0. Card-related constants (used below).
//

const PARSE_DEBOUNCE_MS = 500;

const SUBSTITUTIONS = {
  'creature': 'robot'
};

const KEYWORDS = {
  'defender': 'This robot can\'t attack',
  'haste': 'This robot can move and attack immediately after it is played',
  'jump': 'This robot can move over other objects',
  'taunt': 'Your opponent\'s adjacent robots can only attack this object'
};

//
// 1. Helper functions for card-related components.
//

export function isCardVisible(card, filters, costRange) {
  if ((!filters.robots && card.type === TYPE_ROBOT) ||
      (!filters.events && card.type === TYPE_EVENT) ||
      (!filters.structures && card.type === TYPE_STRUCTURE) ||
      (card.cost < costRange[0] || card.cost > costRange[1])) {
    return false;
  } else {
    return true;
  }
}

// Sorting functions for card grids:
// 0 = cost, 1 = name, 2 = type, 3 = source
export const sortFunctions = [
  c => [c.cost, c.name],
  c => c.name,
  c => [typeToString(c.type), c.cost, c.name],
  c => [c.source === 'builtin', c.cost, c.name]
];

//
// 2. Text parsing.
//

export function splitSentences(str) {
  return (str || '').split(/[\\.!\?]/).filter(s => /\S/.test(s));
}

export function getSentencesFromInput(text) {
  text = reduce(SUBSTITUTIONS, (str, output, input) => str.replace(new RegExp(input, 'g'), output), text);

  let sentences = splitSentences(text);
  sentences = flatMap(sentences, s => isKeywordExpression(s) ? s.replace(/,/g, ',|').split('|') : s);

  return sentences;
}

export const requestParse = debounce((sentences, mode, callback) => {
  sentences
    .forEach((sentence, idx) => {
      const parserInput = encodeURIComponent(expandKeywords(sentence));
      const parseUrl = `https://wordbots.herokuapp.com/parse?input=${parserInput}&format=js&mode=${mode}`;
      fetch(parseUrl)
        .then(response => response.json())
        .then(json => { callback(idx, sentence, json); });
  });
}, PARSE_DEBOUNCE_MS);

//
// 2.5. Keyword abilities.
//

function phrases(sentence) {
  return sentence.split(',')
                 .filter(s => /\S/.test(s))
                 .map(s => s.trim());
}

export function isKeywordExpression(sentence) {
  return every(phrases(sentence), p => KEYWORDS[p.toLowerCase()]);
}

export function keywordsInSentence(sentence) {
  if (isKeywordExpression(sentence)) {
    return fromPairs(phrases(sentence).map(p => [p, KEYWORDS[p.toLowerCase()]]));
  } else {
    return {};
  }
}

export function expandKeywords(sentence) {
  const keywords = keywordsInSentence(sentence);
  return reduce(keywords, (str, def, keyword) => str.replace(keyword, def), sentence);
}