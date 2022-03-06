import isPlainObj from 'is-plain-obj'

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
