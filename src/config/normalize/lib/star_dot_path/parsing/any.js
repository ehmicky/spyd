import isPlainObj from 'is-plain-obj'

// Create a new token for *
export const createAnyToken = function () {
  return { type: ANY_TYPE }
}

// Check if a token is *
export const isAnyToken = function (token) {
  return isPlainObj(token) && token.type === ANY_TYPE
}

const ANY_TYPE = 'any'
