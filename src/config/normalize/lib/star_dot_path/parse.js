// Parse a query string into an array of tokens.
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
//  - Backslashes can escape dots
// We allow passing an array of tokens instead of a string with the above syntax
//  - This is sometimes more convenient
//  - Also, this allows property names to include special characters (dots,
//    brackets, star) or to be symbols
//  - This removes the need for an escape character with the string syntax
//    (array of tokens should be used instead)
// TODO: add support for `**`, which should behave like: `` or `*` or `*/*` or
// `*/*/*` and so on.
// TODO: do not recurse over `__proto__`, `prototype` or `constructor`
export const maybeParse = function (queryOrTokens) {
  return Array.isArray(queryOrTokens) ? queryOrTokens : parse(queryOrTokens)
}

// Use imperative logic for performance
/* eslint-disable complexity, max-depth, max-statements, fp/no-loops,
   fp/no-mutation, fp/no-let, no-continue, fp/no-mutating-methods */
export const parse = function (query) {
  if (query === '') {
    return []
  }

  const tokens = []
  let token = ''
  let index = query[0] === SEPARATOR ? 1 : 0

  for (; index < query.length; index += 1) {
    const character = query[index]

    if (character === ESCAPE) {
      index += 1
      const escapedCharacter = query[index]
      validateEscape(escapedCharacter, query, character, index)
      token += escapedCharacter
      continue
    }

    if (character === SEPARATOR) {
      tokens.push(parseIndex(token))
      token = ''
      continue
    }

    token += character
  }

  tokens.push(parseIndex(token))
  return tokens
}
/* eslint-enable complexity, max-depth, max-statements, fp/no-loops,
   fp/no-mutation, fp/no-let, no-continue, fp/no-mutating-methods */

// eslint-disable-next-line max-params
const validateEscape = function (escapedCharacter, query, character, index) {
  if (escapedCharacter !== ESCAPE && escapedCharacter !== SEPARATOR) {
    throw new Error(
      `Invalid query "${query}": character ${character} at index ${index} must be followed by ${SEPARATOR} or ${ESCAPE}`,
    )
  }
}

const parseIndex = function (token) {
  return POSITIVE_INTEGER_REGEXP.test(token) ? Number(token) : token
}

const POSITIVE_INTEGER_REGEXP = /^\d+$/u

// Inverse of `parse()`
export const serialize = function (tokens) {
  return tokens.map(serializeToken).join(SEPARATOR)
}

const serializeToken = function (token, index) {
  if (typeof token !== 'string') {
    return String(token)
  }

  if (index === 0 && token === '') {
    return SEPARATOR
  }

  return token.replace(UNESCAPED_CHARS_REGEXP, '\\$&')
}

export const isParent = function (parentQuery, childQuery) {
  return childQuery.startsWith(`${parentQuery}${SEPARATOR}`)
}

const ESCAPE = '\\'
export const ANY = '*'
export const SEPARATOR = '.'
const UNESCAPED_CHARS_REGEXP = /[\\.]/gu
