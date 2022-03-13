import { getObjectTokenType } from '../tokens/main.js'

import { validatePath } from './normalize.js'
import { parse } from './parse.js'

// Check if two queries are equal.
// Works with:
//  - Normalization, e.g. `:` === `0:`
//  - Unions, e.g. `a b` === `b a`
//  - Duplicates, e.g. `a a` === `a`
export const equals = function (queryA, queryB) {
  const queryArraysA = parse(queryA)
  const queryArraysB = parse(queryB)
  return (
    queryArraysA.length === queryArraysB.length &&
    queryArraysA.every((queryArrayA) =>
      hasSameQueryArray(queryArraysB, queryArrayA),
    ) &&
    queryArraysB.every((queryArrayB) =>
      hasSameQueryArray(queryArraysA, queryArrayB),
    )
  )
}

const hasSameQueryArray = function (queryArrays, queryArrayA) {
  return queryArrays.some((queryArrayB) =>
    isSameQueryArray(queryArrayA, queryArrayB),
  )
}

const isSameQueryArray = function (queryArrayA, queryArrayB) {
  return (
    queryArrayA.length === queryArrayB.length &&
    queryArrayA.every((tokenA, index) =>
      isSameToken(tokenA, queryArrayB[index]),
    )
  )
}

// Check if two paths are equal
export const equalsSimple = function (pathA, pathB) {
  validatePath(pathA)
  validatePath(pathB)
  return fastEqualsSimple(pathA, pathB)
}

// Same as `equalsSimple()` but without validation
export const fastEqualsSimple = function (pathA, pathB) {
  return (
    pathA.length === pathB.length &&
    pathA.every((prop, index) => isSameProp(pathB[index], prop))
  )
}

// Check if a path is a parent to another
export const parent = function (parentPath, childPath) {
  return (
    childPath.length > parentPath.length &&
    childPath.every(
      (childToken, index) =>
        index >= parentPath.length || isSameProp(childToken, parentPath[index]),
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
