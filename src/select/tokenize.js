import { UserError } from '../error/main.js'

// Tokenize a raw selector string into an an array of objects.
export const tokenizeSelector = function (rawSelector, prefix) {
  const tokens = rawSelector.trim().split(TOKEN_DELIMITER_REGEX)
  const tokensA = addTokensInverse(tokens, prefix)
  return tokensA
}

// Split around whitespaces.
// Also split tildes to their own token, whether they are surrounded by
// whitespace or another tilde or not.
const TOKEN_DELIMITER_REGEX = /\s+|(?<=~)/gu

const addTokensInverse = function (tokens, prefix) {
  const { tokens: tokensA, nextInverse } = tokens.reduce(
    addTokenInverse.bind(undefined, prefix),
    { tokens: [], nextInverse: false },
  )

  if (nextInverse) {
    throw new UserError(`${prefix}Tildes must be followed by an identifier.`)
  }

  return tokensA
}

const addTokenInverse = function (prefix, { tokens, nextInverse }, token) {
  if (token !== INVERSE_SYMBOL) {
    return {
      tokens: [...tokens, { id: token, inverse: nextInverse }],
      nextInverse: false,
    }
  }

  if (nextInverse) {
    throw new UserError(`${prefix}Single tildes must be used, not double.`)
  }

  return { tokens, nextInverse: true }
}

// We do not use exclamation marks because they need to be escaped in shells.
// We do not use dashes because they are used in identifiers (which would
// make it confusing) and in CLI flags.
const INVERSE_SYMBOL = '~'
