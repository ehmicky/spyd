import { parse } from './parse.js'

// Check if two queries are equal, after normalization
export const equals = function (queryOrPathA, queryOrPathB) {
  const pathA = parse(queryOrPathA)
  const pathB = parse(queryOrPathB)
  return (
    pathA.length === pathB.length &&
    pathA.every((tokenA, index) => isSameToken(tokenA, pathB[index]))
  )
}

// Check if a query is a parent of another.
// The comparison is currently token type-wise, i.e.:
//  - * does not match other token types
//  - RegExps does not match prop tokens
//  - Unions are not resolved
// Also, this is only for the query without any target, i.e.:
//  - Negative indices do not match positive indices
// But this works perfectly when only prop and positive indices are used.
//  - E.g. on the entries returned by `list()`
export const parent = function (parentQueryOrPath, childQueryOrPath) {
  const parentPath = parse(parentQueryOrPath)
  const childPath = parse(childQueryOrPath)
  return (
    childPath.length > parentPath.length &&
    childPath.every(
      (childToken, index) =>
        index >= parentPath.length ||
        isSameToken(childToken, parentPath[index]),
    )
  )
}

const isSameToken = function (tokenA, tokenB) {
  return Object.is(tokenA, tokenB)
}
