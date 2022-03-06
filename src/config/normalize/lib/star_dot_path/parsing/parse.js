import { normalizePath } from './normalize.js'
import { convertIndexInteger } from './path.js'
import { ESCAPE, SEPARATOR, ANY, ANY_TOKEN } from './special.js'

// Parse a query string into an array of nodes.
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
//  - An array of the above
// We allow passing an array of tokens instead of a query string:
//  - This is sometimes more convenient
//  - Also, this allows property names to include special characters (dots,
//    brackets, star) or to be symbols
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
   fp/no-mutation, fp/no-let, no-continue, fp/no-mutating-methods */
const parseQuery = function (query) {
  if (query === '') {
    return []
  }

  const path = []
  let node = []
  let token = ''
  let index = query[0] === SEPARATOR ? 1 : 0

  for (; index <= query.length; index += 1) {
    const character = query[index]

    if (character === ESCAPE) {
      index += 1
      const escapedCharacter = query[index]
      validateEscape(escapedCharacter, query, character, index)
      token += escapedCharacter
      continue
    }

    if (character === SEPARATOR || index === query.length) {
      if (token !== '' || node.length === 0) {
        node.push(convertIndexInteger(token))
        token = ''
      }

      path.push(node)
      node = []
      continue
    }

    if (character === ANY) {
      if (token !== '') {
        node.push(token)
        token = ''
      }

      node.push(ANY_TOKEN)
      continue
    }

    token += character
  }

  return path
}
/* eslint-enable complexity, max-depth, max-statements, fp/no-loops,
   fp/no-mutation, fp/no-let, no-continue, fp/no-mutating-methods */

// eslint-disable-next-line max-params
const validateEscape = function (escapedCharacter, query, character, index) {
  if (
    escapedCharacter !== ESCAPE &&
    escapedCharacter !== SEPARATOR &&
    escapedCharacter !== ANY
  ) {
    throw new Error(
      `Invalid query "${query}": character ${character} at index ${index} must be followed by ${SEPARATOR}, ${ANY} or ${ESCAPE}`,
    )
  }
}
