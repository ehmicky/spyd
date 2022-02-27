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

export const parse = function (query) {
  return query === '' ? [] : query.split(UNESCAPED_SEP_REGEXP).map(parseToken)
}

const parseToken = function (token) {
  if (POSITIVE_INTEGER_REGEXP.test(token)) {
    return Number(token)
  }

  return token.replace(ESCAPED_SEP_REGEXP, SEPARATOR)
}

const POSITIVE_INTEGER_REGEXP = /^\d+$/u

// Inverse of `parse()`
export const serialize = function (tokens) {
  return tokens.map(serializeToken).join(SEPARATOR)
}

const serializeToken = function (token) {
  if (typeof token !== 'string') {
    return String(token)
  }

  return token.replace(SEP_REGEXP, ESCAPED_SEPARATOR)
}

export const isParent = function (parentQuery, childQuery) {
  return childQuery.startsWith(`${parentQuery}${SEPARATOR}`)
}

export const SEPARATOR = '.'
const ESCAPED_SEPARATOR = '\\.'
const SEP_REGEXP = /\./gu
// Matches dots not escaped with a backslash
const UNESCAPED_SEP_REGEXP = /(?<!\\)\./gu
// Matches dots escaped with a backslash
const ESCAPED_SEP_REGEXP = /\\\./gu
