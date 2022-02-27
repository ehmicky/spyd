import { ANY, isAnyToken } from './special.js'

// From an array of property names to an array to tokens
export const pathToTokens = function (path) {
  return path.map(getPropNameToken)
}

const getPropNameToken = function (propName) {
  return [propName]
}

// Inverse of `pathToTokens()`
export const tokensToPath = function (tokens) {
  return tokens.map(getTokenPropName)
}

const getTokenPropName = function (token) {
  if (isAnyToken(token)) {
    throw new Error(`Cannot use wildcard "${ANY}" when using tokensToPath().`)
  }

  return token[0]
}
