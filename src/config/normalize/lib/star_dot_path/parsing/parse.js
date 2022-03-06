import { normalizePath } from './normalize.js'
import { convertIndexInteger } from './path.js'
import { ESCAPE, SEPARATOR, ANY, SPECIAL_CHARS, ANY_TOKEN } from './special.js'

// Parse a query string into an array of tokens.
// This is inspired by JSON paths and JSON pointers.
// Syntax:
//  - Dots are used for object properties, e.g. `one.two`
//  - Dots are also used for array elements, e.g. `one.5`
//  - This can be used deeply, e.g. `one.two.5`
//  - Wildcards are used with both objects and arrays to recurse over their
//    children, e.g. `one.*`
//  - Empty keys are supported, e.g. `one.` for `{ one: { "": value } }`
//    or `one..two` for `{ one: { "": { two: value } } }`
//  - A leading dot can be optionally used, e.g. `.one`. It is ignored.
//  - An empty string matches the root value
//  - Backslashes can escape special characters: . * \
// Tokens are an array of one of:
//  - Object property as a string or symbol
//  - Array index as a number or string
//  - `Symbol.for('*')` for wildcards
//     - We use symbols as it allows using dynamic strings without injection
//       risk
// We allow passing an array of tokens instead of a query string:
//  - This is sometimes more convenient
//  - Also, this allows property names to include special characters or to be
//    symbols
//  - This removes the need for escaping
// Exceptions are thrown on syntax errors:
//  - I.e. query or path syntax errors, or wrong arguments
//  - But queries matching nothing do not throw: instead they return nothing
export const maybeParse = function (queryOrPath) {
  return Array.isArray(queryOrPath)
    ? normalizePath(queryOrPath)
    : parse(queryOrPath)
}

export const parse = function (query) {
  return normalizePath(parseQuery(query))
}

// Use imperative logic for performance
/* eslint-disable complexity, max-depth, max-statements, fp/no-loops,
   fp/no-mutation, fp/no-mutating-methods, fp/no-let */
const parseQuery = function (query) {
  if (query === '') {
    return []
  }

  const path = []
  let chars = ''
  let hasAny = false
  let index = query[0] === SEPARATOR ? 1 : 0

  for (; index <= query.length; index += 1) {
    const char = query[index]

    if (char === ESCAPE) {
      chars += getEscapedChar(query, index)
      index += 1
    } else if (char === SEPARATOR || index === query.length) {
      path.push(getToken(chars, query, hasAny))
      chars = ''
      hasAny = false
    } else {
      hasAny = hasAny || char === ANY
      chars += char
    }
  }

  return path
}
/* eslint-enable complexity, max-depth, max-statements, fp/no-loops,
   fp/no-mutation, fp/no-mutating-methods, fp/no-let */

const getEscapedChar = function (query, index) {
  const escapedChar = query[index + 1]
  validateEscape(escapedChar, query, index)
  return escapedChar
}

const validateEscape = function (escapedChar, query, index) {
  if (!SPECIAL_CHARS.has(escapedChar)) {
    throw new Error(
      `Invalid query "${query}": character ${ESCAPE} at index ${index} must be followed by ${SEPARATOR} ${ANY} or ${ESCAPE}`,
    )
  }
}

const getToken = function (chars, query, hasAny) {
  if (hasAny) {
    return getAnyToken(chars, query)
  }

  return convertIndexInteger(chars)
}

const getAnyToken = function (chars, query) {
  if (chars !== ANY) {
    throw new Error(
      `Invalid query "${query}": character ${ANY} must not be preceded or followed by other characters except "${SEPARATOR}"
Regular expressions can be used instead.`,
    )
  }

  return ANY_TOKEN
}
