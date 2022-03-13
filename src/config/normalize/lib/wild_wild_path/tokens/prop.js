import { objectProps } from './common.js'
import { ESCAPE, TOKEN_SEPARATOR, escapeSpecialChars } from './escape.js'
import { getOtherStringTokenType } from './other.js'

// Check the type of a parsed token
const testObject = function (token) {
  return typeof token === 'string'
}

// Serialize a token to a string
const serialize = function (token, index) {
  if (token === '' && index === 0) {
    return TOKEN_SEPARATOR
  }

  const chars = escapeSpecialChars(token)
  return getOtherStringTokenType(chars) === undefined
    ? chars
    : `${ESCAPE}${chars}`
}

// Check the type of a serialized token
const testString = function () {
  return true
}

// Parse a string into a token
const parse = function (chars) {
  return chars
}

// Normalize value after parsing or serializing
const normalize = function (token) {
  return token
}

// Use the token to list entries against a target value.
// We distinguish between:
//  - Missing property name: return no entries
//  - Property exists but has `undefined` value: return an entry
const iterate = function (value, token, missing) {
  return [
    { value: value[token], prop: token, missing: missing || !(token in value) },
  ]
}

// Check if two tokens are the same
const equals = function (tokenA, tokenB) {
  return tokenA === tokenB
}

export const PROP_TOKEN = {
  testObject,
  serialize,
  testString,
  parse,
  normalize,
  ...objectProps,
  iterate,
  equals,
}
