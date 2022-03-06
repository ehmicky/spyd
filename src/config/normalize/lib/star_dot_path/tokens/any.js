import isPlainObj from 'is-plain-obj'

import { isRecurseObject } from './recurse.js'
import { ANY, ESCAPE, SEPARATOR } from './special.js'

// Check if a token is *
export const isAnyToken = function (token) {
  return isPlainObj(token) && token.type === ANY_TYPE
}

const ANY_TYPE = 'any'

export const serializeAnyToken = function () {
  return ANY
}

// Parse a * string into a token
export const parseAnyToken = function (chars) {
  if (chars !== ANY) {
    throw new Error(
      `character "${ANY}" must not be preceded or followed by other characters except "${SEPARATOR}"
If you intend "${ANY}" as a wildcard character, please use a regular expression instead.
Otherwise, please escape it with a "${ESCAPE}".`,
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
