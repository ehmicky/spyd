import { throwValidationError } from './validate.js'

// Tokenize a raw selector string into an an array of objects.
export const tokenizeSelector = function (rawSelector, propName) {
  const tokens = rawSelector.trim().split(TOKEN_DELIMITER_REGEX)
  const negation = usesNegation(tokens)
  const ids = negation ? tokens.slice(1) : tokens
  ids.forEach((id) => {
    validateId(id, rawSelector, propName)
  })
  return { ids, negation }
}

// Split around whitespaces.
const TOKEN_DELIMITER_REGEX = /\s+/gu

// "not" can be prepended to selections to exclude instead of include.
const usesNegation = function ([firstToken]) {
  return firstToken === NEGATION_SYMBOL
}

const validateId = function (id, rawSelector, propName) {
  if (id === NEGATION_SYMBOL) {
    throwValidationError(
      `"${id}" can only be used at the start.`,
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
