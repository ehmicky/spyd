import { createAnyToken } from './node.js'
import { pathToNodes } from './path.js'
import { ESCAPE, SEPARATOR, ANY } from './special.js'

// Parse a query string into an array of nodes.
// This is similar to JSON paths but:
//  - simpler, with fewer features
//  - faster
//  - this works better when setting multiple elements at once
// Syntax:
//  - Dots are used for object properties, e.g. `one.two`
//  - Dots are also used for array elements, e.g. `one.5`
//  - This can be used deeply, e.g. `one.two.5`
//  - Wildcards are used with both objects and arrays to recurse over their
//    children, e.g. `one.*`
//  - Empty keys are supported, e.g. `one.` for `{ one: { "": value } }`
//    or `one..two` for `{ one: { "": { two: value } } }`
//  - An empty string matches the root value
//  - Backslashes can escape special characters: . * \
// We allow passing an array of property names instead of a string with the
// above syntax
//  - This is sometimes more convenient
//  - Also, this allows property names to include special characters (dots,
//    brackets, star) or to be symbols
//  - This removes the need for an escape character with the string syntax
//    (array of property names should be used instead)
// TODO: add support for `**`, which should behave like: `` or `*` or `*/*` or
// `*/*/*` and so on.
// TODO: do not recurse over `__proto__`, `prototype` or `constructor`
export const maybeParse = function (queryOrPropNames) {
  return Array.isArray(queryOrPropNames)
    ? pathToNodes(queryOrPropNames)
    : parse(queryOrPropNames)
}

// Use imperative logic for performance
/* eslint-disable complexity, max-depth, max-statements, fp/no-loops,
   fp/no-mutation, fp/no-let, no-continue, fp/no-mutating-methods */
export const parse = function (query) {
  if (query === '') {
    return []
  }

  const nodes = []
  let node = []
  let chars = ''
  let index = query[0] === SEPARATOR ? 1 : 0

  for (; index <= query.length; index += 1) {
    const character = query[index]

    if (character === ESCAPE) {
      index += 1
      const escapedCharacter = query[index]
      validateEscape(escapedCharacter, query, character, index)
      chars += escapedCharacter
      continue
    }

    if (character === SEPARATOR || index === query.length) {
      if (chars !== '' || node.length === 0) {
        node.push(parseIndex(chars, node))
        chars = ''
      }

      nodes.push(node)
      node = []
      continue
    }

    if (character === ANY) {
      if (chars !== '') {
        node.push(chars)
        chars = ''
      }

      node.push(createAnyToken())
      continue
    }

    chars += character
  }

  return nodes
}
/* eslint-enable complexity, max-depth, max-statements, fp/no-loops,
   fp/no-mutation, fp/no-let, no-continue, fp/no-mutating-methods */

const parseIndex = function (chars, node) {
  return node.length === 0 && POSITIVE_INTEGER_REGEXP.test(chars)
    ? Number(chars)
    : chars
}

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

const POSITIVE_INTEGER_REGEXP = /^\d+$/u
