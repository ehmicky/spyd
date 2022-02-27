import { ANY } from './special.js'
import { isAnyToken, createPropPart, getPropPartValue } from './token.js'

// From an array of property names to an array to tokens
export const pathToTokens = function (path) {
  return path.map(getPropNameToken)
}

const getPropNameToken = function (propName) {
  return [createPropPart(propName)]
}

// Inverse of `pathToTokens()`
export const tokensToPath = function (tokens) {
  return tokens.map(getTokenPropName)
}

const getTokenPropName = function (token) {
  if (isAnyToken(token)) {
    throw new Error(`Cannot use wildcard "${ANY}" when using tokensToPath().`)
  }

  return getPropPartValue(token[0])
}
