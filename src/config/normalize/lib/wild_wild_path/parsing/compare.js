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

const hasSamePath = function (paths, pathA) {
  return paths.some((pathB) => isSamePath(pathA, pathB))
}

const isSamePath = function (pathA, pathB) {
  return (
    pathA.length === pathB.length &&
    pathA.every((tokenA, index) => isSameToken(tokenA, pathB[index]))
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
    simplePathA.every((prop, index) => isSameProp(simplePathB[index], prop))
  )
}

// Check if a simple path is a parent to another
export const parent = function (parentSimplePath, childSimplePath) {
  return (
    childSimplePath.length > parentSimplePath.length &&
    childSimplePath.every(
      (childToken, index) =>
        index >= parentSimplePath.length ||
        isSameProp(childToken, parentSimplePath[index]),
    )
  )
}

export const isSameToken = function (tokenA, tokenB) {
  const tokenTypeA = getObjectTokenType(tokenA)
  const tokenTypeB = getObjectTokenType(tokenB)
  return tokenTypeA === tokenTypeB && tokenTypeA.equals(tokenA, tokenB)
}

const isSameProp = function (propA, propB) {
  return propA === propB
}
