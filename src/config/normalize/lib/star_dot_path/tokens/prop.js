import { escapeSpecialChars } from './escape.js'
import { isRecurseObject } from './recurse.js'
import { SEPARATOR } from './special.js'

// Check the type of a parsed token
const testObject = function (token) {
  return typeof token === 'string'
}

// Serialize a token to a string
const serialize = function (token, index) {
  return token === '' && index === 0 ? SEPARATOR : escapeSpecialChars(token)
}

// Check the type of a serialized token
const testString = function () {
  return true
}

// Parse a string into a token
const parse = function (chars) {
  return chars
}

// When the token is missing a target value, add a default one.
const isDefined = function (value) {
  return isRecurseObject(value)
}

// Default value when token is missing
const defaultValue = {}

// Use the token to list entries against a target value.
// We distinguish between:
//  - Missing property name: return no entries
//  - Property exists but has `undefined` value: return an entry
// eslint-disable-next-line max-params
const getEntries = function (value, path, token, defined) {
  return [
    {
      value: value[token],
      path: [...path, token],
      defined: defined && token in value,
    },
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
  isDefined,
  defaultValue,
  getEntries,
  equals,
}
