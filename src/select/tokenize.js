import { throwValidationError } from './validate.js'

// Tokenize a raw selector string into an an array of objects.
export const tokenizeSelector = function (rawSelector, propName) {
  return rawSelector
    .trim()
    .split(TOKEN_DELIMITER_REGEX)
    .filter(Boolean)
    .reduce(
      (memo, token, index) =>
        parseToken(memo, { token, index, rawSelector, propName }),
      { ids: [], negation: false },
    )
}

// Split around whitespaces.
const TOKEN_DELIMITER_REGEX = /\s+/gu

const parseToken = function (
  { ids, negation },
  { token, index, rawSelector, propName },
) {
  if (token === NEGATION_SYMBOL) {
    validateNegation(index, rawSelector, propName)
    return { ids, negation: true }
  }

  const idsA = [...ids, token]
  return { ids: idsA, negation }
}

// "not" can be prepended to selectors to exclude instead of include.
// "not" is only meaningful at the beginning of the selector.
//  - However, we explicitly forbid it elsewhere to avoid confusion, in case
//    users think it can be prepended to any id instead. This provides with a
//    clearer error message.
//  - This means it is not possible to select an id named "not"
const validateNegation = function (index, rawSelector, propName) {
  if (index !== 0) {
    throwValidationError(
      `"${NEGATION_SYMBOL}" can only be used at the start.`,
      [rawSelector],
      propName,
    )
  }
}

// We use a word instead of:
//  - Exclamation mark or tilde because they need to be escaped in shells.
//  - Dash because they are used in identifiers (which would make it confusing)
//    and in CLI flags.
const NEGATION_SYMBOL = 'not'
