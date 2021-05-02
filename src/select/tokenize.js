import { throwValidationError } from './prefix.js'

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

// We do not use exclamation marks nor tildes because they need to be escaped
// in shells.
// We do not use dashes because they are used in identifiers (which would
// make it confusing) and in CLI flags.
const NEGATION_SYMBOL = 'not'
