// Parse a query string into an array of tokens.
// This is similar to JSON paths but:
//  - simpler, with fewer features
//  - faster
//  - this works better when setting multiple elements at once
// Syntax:
//  - Dots are used for object properties, e.g. `one.two`
//  - Brackets are used for array elements, e.g. `one[5]`
//  - Dots and brackets can be used deeply, e.g. `one.two[5]`
//  - Wildcards are used with both objects and arrays to recurse over their
//    children, e.g. `one.*` or `one[*]`.
//  - Empty keys are supported, e.g. `one.` for `{ one: { "": value } }`
//    or `one..two` for `{ one: { "": { two: value } } }`
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
  if (query === '') {
    return []
  }

  const normalizedQuery = prependDot(query)
  const matchResults = [...normalizedQuery.matchAll(QUERY_REGEXP)]
  validateQuery(matchResults, query, normalizedQuery)
  const tokens = matchResults.map(getToken)
  return tokens
}

// Queries can start with an optional dot.
const prependDot = function (query) {
  const [firstChar] = query
  return firstChar !== '.' && firstChar !== '[' ? `.${query}` : query
}

const QUERY_REGEXP =
  /((\.(?<name>([^.[\]*\d][^.[\]*]*|(?<nameWildcard>\*)|((?=[.[]|$)))))|(\[(?<index>([\d]+|(?<indexWildcard>\*)))\]))/guy

// Validate against syntax errors in the query
// TODO: add more error messages for common mistakes
const validateQuery = function (matchResults, query, normalizedQuery) {
  const matchedQuery = matchResults.map(getMatch).join('')

  if (matchedQuery !== normalizedQuery) {
    throw new Error(
      `Syntax error in path "${query}" (starting at index ${matchedQuery.length})`,
    )
  }
}

const getMatch = function ([match]) {
  return match
}

const getToken = function ({
  groups: { name, nameWildcard, index, indexWildcard },
}) {
  const key = getKey(name, index)
  const array = index !== undefined
  const wildcard = nameWildcard !== undefined || indexWildcard !== undefined
  return { key, array, wildcard }
}

const getKey = function (name, index) {
  if (name !== undefined) {
    return name
  }

  return index === '*' ? index : Number(index)
}
