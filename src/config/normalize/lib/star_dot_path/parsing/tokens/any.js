import isPlainObj from 'is-plain-obj'

import { isRecurseObject } from './recurse.js'
import { ANY, SEPARATOR } from './special.js'

// Check if a token is *
export const isAnyToken = function (token) {
  return isPlainObj(token) && token.type === ANY_TYPE
}

const ANY_TYPE = 'any'

export const serializeAnyToken = function () {
  return ANY
}

// Parse a * string into a token
export const parseAnyToken = function (chars, query) {
  if (chars !== ANY) {
    throw new Error(
      `Invalid query "${query}": character ${ANY} must not be preceded or followed by other characters except "${SEPARATOR}"
Regular expressions can be used instead.`,
    )
  }

  return { type: ANY_TYPE }
}

// List entries when using *, e.g. `a.*`
// We purposely ignore symbol properties by using `Object.keys()`.
export const getAnyEntries = function (value, path) {
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
