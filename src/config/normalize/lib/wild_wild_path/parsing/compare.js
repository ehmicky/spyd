import { getObjectTokenType } from '../tokens/main.js'

import { validateSimplePath } from './normalize.js'
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

// Check if two simple paths are equal
export const equalsSimple = function (simplePathA, simplePathB) {
  validateSimplePath(simplePathA)
  validateSimplePath(simplePathB)
  return fastEqualsSimple(simplePathA, simplePathB)
}

// Same as `equalsSimple()` but without validation
export const fastEqualsSimple = function (simplePathA, simplePathB) {
  return (
    simplePathA.length === simplePathB.length &&
    simplePathA.every((prop, index) => simplePathB[index] === prop)
  )
}

// Check if a query is a parent of another.
// With unions, it checks if any query is a parent of any of the other one.
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
export const parent = function (parentQueryOrPaths, childQueryOrPaths) {
  const parentPaths = parse(parentQueryOrPaths)
  const childPaths = parse(childQueryOrPaths)
  return parentPaths.some((parentPath) => hasParentPath(parentPath, childPaths))
}

const hasParentPath = function (parentPath, childPaths) {
  return childPaths.some((childPath) => isParentPath(parentPath, childPath))
}

const isParentPath = function (parentPath, childPath) {
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

export const isSameToken = function (tokenA, tokenB) {
  const tokenTypeA = getObjectTokenType(tokenA)
  const tokenTypeB = getObjectTokenType(tokenB)
  return tokenTypeA === tokenTypeB && tokenTypeA.equals(tokenA, tokenB)
}
