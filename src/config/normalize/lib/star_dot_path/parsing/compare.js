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

// Check if a query is a parent of another
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
