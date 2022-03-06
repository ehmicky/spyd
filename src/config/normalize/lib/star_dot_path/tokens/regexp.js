import { escapeSpecialChars } from './escape.js'
import { isRecurseObject } from './recurse.js'
import { REGEXP_DELIM } from './special.js'

// Check the type of a parsed token
const testObject = function (token) {
  return token instanceof RegExp
}

// Serialize a token to a string
const serialize = function (token) {
  const source = escapeSpecialChars(token.source)
  return `${REGEXP_DELIM}${source}${REGEXP_DELIM}${token.flags}`
}

// Check the type of a serialized token
const testString = function ({ hasRegExp }) {
  return hasRegExp
}

// Parse a string into a token
// This might throw if the RegExp is invalid.
const parse = function (chars) {
  const endIndex = chars.lastIndexOf(REGEXP_DELIM)

  if (endIndex === 0) {
    throw new Error(
      `regular expression "${chars}" is missing a "${REGEXP_DELIM}" at the end.`,
    )
  }

  const regExpString = chars.slice(1, endIndex)
  const regExpFlags = chars.slice(endIndex + 1)
  return new RegExp(regExpString, regExpFlags)
}

// When the token is missing a target value, add a default one.
// When missing, there are no entries, so no need to add missing entries.
const handleMissingValue = function (value) {
  return { value, missing: false }
}

// Use the token to list entries against a target value.
const getEntries = function (value, path, token) {
  if (!isRecurseObject(value)) {
    return []
  }

  return Object.keys(value)
    .filter((childKey) => token.test(childKey))
    .map((childKey) => ({
      value: value[childKey],
      path: [...path, childKey],
      missing: false,
    }))
}

export const REGEXP_TOKEN = {
  testObject,
  serialize,
  testString,
  parse,
  handleMissingValue,
  getEntries,
}
