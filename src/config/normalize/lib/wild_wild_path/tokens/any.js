import isPlainObj from 'is-plain-obj'

import { objectProps } from './common.js'

// Check the type of a parsed token
const testObject = function (token) {
  return isPlainObj(token) && token.type === ANY_TYPE
}

const ANY_TYPE = 'any'

// Serialize a token to a string
const serialize = function () {
  return ANY
}

// Check the type of a serialized token
const testString = function (chars) {
  return chars === ANY
}

// Parse a string into a token
const parse = function () {
  return { type: ANY_TYPE }
}

const ANY = '*'

// Normalize value after parsing or serializing
const normalize = function ({ type }) {
  return { type }
}

// Use the token to list entries against a target value.
// We purposely ignore symbol properties by using `Object.keys()`.
// eslint-disable-next-line max-params
const iterate = function (value, path, token, missing) {
  if (Array.isArray(value)) {
    return value.map((childValue, index) => ({
      value: childValue,
      path: [...path, index],
      missing,
    }))
  }

  return Object.keys(value).map((childKey) => ({
    value: value[childKey],
    path: [...path, childKey],
    missing,
  }))
}

// Check if two tokens are the same
const equals = function () {
  return true
}

export const ANY_TOKEN = {
  testObject,
  serialize,
  testString,
  parse,
  normalize,
  ...objectProps,
  iterate,
  equals,
}
