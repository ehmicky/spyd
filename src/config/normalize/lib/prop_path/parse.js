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
// We allow passing an array of tokens instead of a string with the above syntax
//  - This is sometimes more convenient
//  - Also, this allows property names to include special characters (dots,
//    brackets, star)
//  - This removes the need for an escape character with the string syntax
//    (array of tokens should be used instead)
// TODO: add support for `**`, which should behave like: `` or `*` or `*/*` or
// `*/*/*` and so on.
// TODO: do not recurse over `__proto__`, `prototype` or `constructor`
export const maybeParse = function (queryOrTokens) {
  return Array.isArray(queryOrTokens) ? queryOrTokens : parse(queryOrTokens)
}

export const parse = function (query) {
  return query === '' ? [] : query.split(SEPARATOR).map(getToken)
}

export const SEPARATOR = '.'

const getToken = function (token) {
  return POSITIVE_INTEGER_REGEXP.test(token) ? Number(token) : token
}

const POSITIVE_INTEGER_REGEXP = /^\d+$/u
