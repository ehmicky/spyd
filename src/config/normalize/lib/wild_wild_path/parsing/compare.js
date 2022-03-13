import { getObjectTokenType } from '../tokens/main.js'

import { parse } from './parse.js'

// Check if two queries are equal.
// Works with:
//  - Normalization, e.g. `:` === `0:`
//  - Unions, e.g. `a b` === `b a`
//  - Duplicates, e.g. `a a` === `a`
export const equals = function (queryOrPathsA, queryOrPathsB) {
  const pathsA = parse(queryOrPathsA)
  const pathsB = parse(queryOrPathsB)
  return (
    pathsA.length === pathsB.length &&
    pathsA.every((pathA) => hasSamePath(pathsB, pathA)) &&
    pathsB.every((pathB) => hasSamePath(pathsA, pathB))
  )
}

// Check if a query is a parent of another.
// The comparison is currently token type-wise.
// Also it does not check whether a token is a subset of another, i.e.:
//  - * does not match other token types
//  - RegExps does not match prop tokens
//  - Unions are not resolved
// Also, this is only for the query without any target, i.e.:
//  - Negative indices do not match positive indices
// This makes it more useful for queries with only prop and positive indices
// tokens:
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

const hasSamePath = function (paths, pathA) {
  return paths.some((pathB) => isSamePath(pathA, pathB))
}

const isSamePath = function (pathA, pathB) {
  return (
    pathA.length === pathB.length &&
    pathA.every((tokenA, index) => isSameToken(tokenA, pathB[index]))
  )
}

const isSameToken = function (tokenA, tokenB) {
  const tokenTypeA = getObjectTokenType(tokenA)
  const tokenTypeB = getObjectTokenType(tokenB)
  return tokenTypeA === tokenTypeB && tokenTypeA.equals(tokenA, tokenB)
}
