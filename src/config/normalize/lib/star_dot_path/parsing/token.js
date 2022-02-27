import isPlainObj from 'is-plain-obj'

// Check if at least one token has some ANY parts
export const isAnyTokens = function (tokens) {
  return tokens.some(isAnyToken)
}

// Check if a token has some ANY parts
export const isAnyToken = function (token) {
  return token.some(isAnyPart)
}

// Check if a token part is ANY
export const isAnyPart = function (part) {
  return isPlainObj(part) && part.type === ANY_TYPE
}

export const createAnyPart = function () {
  return { type: ANY_TYPE }
}

const ANY_TYPE = 'any'
