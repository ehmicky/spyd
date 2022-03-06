import { REGEXP_DELIM, SPECIAL_CHARS_REGEXP } from './special.js'

// Check if a token is a /.../ RegExp
export const isRegExpToken = function (token) {
  return token instanceof RegExp
}

// Serialize a RegExp token into a string
export const serializeRegExpToken = function (token) {
  const source = token.source.replace(SPECIAL_CHARS_REGEXP, '\\$&')
  return `${REGEXP_DELIM}${source}${REGEXP_DELIM}${token.flags}`
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
