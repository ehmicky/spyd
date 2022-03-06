import { REGEXP_DELIM } from './special.js'

// Check if a token is a /.../ RegExp
export const isRegExpToken = function (token) {
  return token instanceof RegExp
}

// Serialize a RegExp token into a string
export const serializeRegExpToken = function (token) {
  return String(token)
}

// Parse a RegExp string into a token
export const parseRegExpToken = function (chars, query) {
  const endIndex = chars.lastIndexOf(REGEXP_DELIM)

  if (endIndex === 0) {
    throw new Error(
      `Invalid query "${query}": regular expression "${chars}" is missing a ${REGEXP_DELIM} at the end.`,
    )
  }

  const regExpString = chars.slice(1, endIndex)
  const regExpFlags = chars.slice(endIndex + 1)

  try {
    return new RegExp(regExpString, regExpFlags)
  } catch (error) {
    throw new Error(
      `Invalid query "${query}": regular expression "${chars}" is invalid.\n${error.message}`,
    )
  }
}
