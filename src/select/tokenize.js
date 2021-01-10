import { UserError } from '../error/main.js'

// Tokenize a selector string into an an array of objects.
export const tokenizeSelector = function (selector, prefix) {
  const tokens = selector.trim().split(TOKEN_DELIMITER_REGEX)
  const tokensA = addTokensInverse(tokens, prefix)
  return tokensA
}

// Split around whitespaces.
// Also split exclamation marks to their own token, whether they are surrounded
// by whitespace or another exclamation mark or not.
const TOKEN_DELIMITER_REGEX = /\s+|(?<=!)/gu

const addTokensInverse = function (tokens, prefix) {
  const { tokens: tokensA, nextInverse } = tokens.reduce(
    addTokenInverse.bind(undefined, prefix),
    { tokens: [], nextInverse: false },
  )

  if (nextInverse) {
    throw new UserError(
      `${prefix}Exclamation marks must be followed by an identifier.`,
    )
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
    throw new UserError(
      `${prefix}Single exclamation marks must be used, not double.`,
    )
  }

  return { tokens, nextInverse: true }
}

const INVERSE_SYMBOL = '!'
