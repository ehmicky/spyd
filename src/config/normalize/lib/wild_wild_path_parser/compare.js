import { validatePath } from './normalize.js'
import { parseQuery } from './parse.js'
import { getObjectTokenType } from './tokens/main.js'

// Check if two queries are equal.
// Works with:
//  - Normalization, e.g. `:` === `0:`
//  - Unions, e.g. `a b` === `b a`
//  - Duplicates, e.g. `a a` === `a`
export const isSameQuery = function (queryA, queryB) {
  const queryArraysA = parseQuery(queryA)
  const queryArraysB = parseQuery(queryB)
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
export const isSamePath = function (pathA, pathB) {
  validatePath(pathA)
  validatePath(pathB)
  return (
    pathA.length === pathB.length &&
    pathA.every((prop, index) => isSameToken(pathB[index], prop))
  )
}

// Check if a path is a parent to another
export const isParentPath = function (parentPath, childPath) {
  return (
    childPath.length > parentPath.length &&
    childPath.every(
      (childToken, index) =>
        index >= parentPath.length ||
        isSameToken(childToken, parentPath[index]),
    )
  )
}

// Check if two tokens are equal
export const isSameToken = function (tokenA, tokenB) {
  if (tokenA === tokenB) {
    return true
  }

  const tokenTypeA = getObjectTokenType(tokenA)
  const tokenTypeB = getObjectTokenType(tokenB)
  return tokenTypeA === tokenTypeB && tokenTypeA.equals(tokenA, tokenB)
}