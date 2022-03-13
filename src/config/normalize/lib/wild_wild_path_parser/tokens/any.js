import isPlainObj from 'is-plain-obj'

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

// Check if two tokens are the same
const equals = function () {
  return true
}

export const ANY_TOKEN = {
  name: 'any',
  testObject,
  serialize,
  testString,
  parse,
  normalize,
  equals,
}
