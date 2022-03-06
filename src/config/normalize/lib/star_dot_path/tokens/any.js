import isPlainObj from 'is-plain-obj'

import { isRecurseObject } from './recurse.js'
import { ANY, ESCAPE, SEPARATOR } from './special.js'

// Check if a token is *
const test = function (token) {
  return isPlainObj(token) && token.type === ANY_TYPE
}

const ANY_TYPE = 'any'

const serialize = function () {
  return ANY
}

const testChars = function ({ hasAny }) {
  return hasAny
}

// Parse a * string into a token
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

// When missing, there are no entries, so no need to add missing entries.
const handleMissingValue = function (value) {
  return { value, missing: false }
}

// List entries when using *, e.g. `a.*`
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

export const ANY_TOKEN = {
  test,
  serialize,
  testChars,
  parse,
  handleMissingValue,
  getEntries,
}
