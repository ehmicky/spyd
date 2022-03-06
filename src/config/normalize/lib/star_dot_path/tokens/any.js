import isPlainObj from 'is-plain-obj'

import { isRecurseObject } from './recurse.js'
import { ANY, ESCAPE, SEPARATOR } from './special.js'

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
const testString = function ({ hasAny }) {
  return hasAny
}

// Parse a string into a token
const parse = function (chars) {
  if (chars !== ANY) {
    throw new Error(
      `character "${ANY}" must not be preceded or followed by other characters except "${SEPARATOR}"
If you intend "${ANY}" as a wildcard character, please use a regular expression instead.
Otherwise, please escape it with a "${ESCAPE}".`,
    )
  }

  return { type: ANY_TYPE }
}

// When the token is missing a target value, add a default one.
// When missing, there are no entries, so no need to add missing entries.
const handleMissingValue = function (value) {
  return { value, missing: false }
}

// Use the token to list entries against a target value.
// We purposely ignore symbol properties by using `Object.keys()`.
const getEntries = function (value, path) {
  if (Array.isArray(value)) {
    return value.map((childValue, index) => ({
      value: childValue,
      path: [...path, index],
      missing: false,
    }))
  }

  if (isRecurseObject(value)) {
    return Object.keys(value).map((childKey) => ({
      value: value[childKey],
      path: [...path, childKey],
      missing: false,
    }))
  }

  return []
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
  handleMissingValue,
  getEntries,
  equals,
}
