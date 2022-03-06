import { convertIndexInteger } from './array.js'
import { normalizePath } from './normalize.js'
import {
  ESCAPE,
  SEPARATOR,
  ANY,
  MINUS,
  SPECIAL_CHARS,
  ANY_TOKEN,
} from './special.js'
import { isQueryString } from './validate.js'

// Parse a query string into an array of tokens.
// Also validate and normalize it.
// This is inspired by JSON paths and JSON pointers.
// Syntax:
//  - Dots are used for object properties, e.g. `one.two`
//  - Dots are also used for array elements, e.g. `one.5`
//  - Negatives indices can be used to get elements at the end, e.g. `one.-2`
//     - Including -0 which can be used to append elements, e.g. `one.-0`
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
//  - Array index as a positive|negative integer|string
//  - `Symbol.for('*')` for wildcards
//     - We use symbols as it allows using dynamic strings without injection
//       risk
// We allow passing an array of tokens instead of a query string which:
//  - Removes the need for escaping
//  - Is sometimes more convenient
// Symbols are always ignored
//  - Both in the query string|path and in the target value
//  - This is because symbols cannot be serialized in a query string
//     - This would remove the guarantee that both query and path syntaxes are
//       equivalent and interchangeable
//     - We do not use `symbol.description` as this should not be used for
//       identity purpose
// Exceptions are thrown on syntax errors:
//  - I.e. query or path syntax errors, or wrong arguments
//  - But queries matching nothing do not throw: instead they return nothing
export const parse = function (queryOrPath) {
  const path = isQueryString(queryOrPath)
    ? parseQuery(queryOrPath)
    : queryOrPath
  return normalizePath(path)
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
  let hasMinus = false
  let index = query[0] === SEPARATOR ? 1 : 0

  for (; index <= query.length; index += 1) {
    const char = query[index]

    if (char === ESCAPE) {
      chars += getEscapedChar(query, index)
      index += 1
    } else if (char === SEPARATOR || index === query.length) {
      path.push(getToken(chars, query, hasAny, hasMinus))
      chars = ''
      hasAny = false
    } else {
      hasAny = hasAny || char === ANY
      hasMinus = hasMinus || char === MINUS
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
      `Invalid query "${query}": character ${ESCAPE} at index ${index} must be followed by ${SEPARATOR} ${ANY} ${MINUS} or ${ESCAPE}`,
    )
  }
}

// eslint-disable-next-line max-params
const getToken = function (chars, query, hasAny, hasMinus) {
  if (hasAny) {
    return getAnyToken(chars, query)
  }

  if (chars[0] === MINUS && !hasMinus) {
    return chars
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
