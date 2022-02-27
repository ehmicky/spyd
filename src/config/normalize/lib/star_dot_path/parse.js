import isPlainObj from 'is-plain-obj'

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
//  - Backslashes can escape special characters: . * \
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
  let token = []
  let tokenPart = ''
  let index = query[0] === SEPARATOR ? 1 : 0

  for (; index <= query.length; index += 1) {
    const character = query[index]

    if (character === ESCAPE) {
      index += 1
      const escapedCharacter = query[index]
      validateEscape(escapedCharacter, query, character, index)
      tokenPart += escapedCharacter
      continue
    }

    if (character === SEPARATOR || index === query.length) {
      if (tokenPart !== '' || token.length === 0) {
        const tokenPartA =
          token.length === 0 && POSITIVE_INTEGER_REGEXP.test(tokenPart)
            ? Number(tokenPart)
            : tokenPart
        token.push(tokenPartA)
        tokenPart = ''
      }

      tokens.push(token)
      token = []
      continue
    }

    if (character === ANY) {
      if (tokenPart !== '') {
        token.push(tokenPart)
        tokenPart = ''
      }

      token.push({ type: ANY_TYPE })
      continue
    }

    tokenPart += character
  }

  return tokens
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

const POSITIVE_INTEGER_REGEXP = /^\d+$/u

// Inverse of `parse()`
export const serialize = function (tokens) {
  return tokens.map(serializeToken).join(SEPARATOR)
}

const serializeToken = function (token, index) {
  if (index === 0 && token[0] === '') {
    return SEPARATOR
  }

  return token.map(serializeTokenPart).join('')
}

const serializeTokenPart = function (tokenPart) {
  if (Number.isInteger(tokenPart)) {
    return String(tokenPart)
  }

  if (isPlainObj(tokenPart)) {
    return ANY
  }

  return tokenPart.replace(UNESCAPED_CHARS_REGEXP, '\\$&')
}

export const isParent = function (parentQuery, childQuery) {
  return childQuery.startsWith(`${parentQuery}${SEPARATOR}`)
}

const ESCAPE = '\\'
export const SEPARATOR = '.'
export const ANY = '*'
const ANY_TYPE = 'any'
const UNESCAPED_CHARS_REGEXP = /[\\.*]/gu
