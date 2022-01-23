import { parse } from './parse.js'

// Returns whether a query is a parent to another one, such as `a.b` and `a.b.c`
// Wildcards always match
//  - `a.*` is a parent to `a.b.c`
//  - `a.b` is a parent to `a.*.c`
// Since this is used to define sorting order, properties with only
// differing wildcard are parents to each other:
//  - `*.b` is a parent to `a.*`
//  - `a.*` is a parent to `a.b`
// A query is not a parent to itself, nor to a sibling.
export const isParent = function (childQuery, parentQuery) {
  const childTokens = parse(childQuery)
  const parentTokens = parse(parentQuery)
  return (
    areSameTokens(parentTokens, childTokens) &&
    childTokens.length >= parentTokens.length &&
    (childTokens.length !== parentTokens.length ||
      compareSameSizeQueries(parentTokens, childTokens))
  )
}

const areSameTokens = function (parentTokens, childTokens) {
  return parentTokens.every((parentToken, index) =>
    isSameToken(parentToken, childTokens[index]),
  )
}

const isSameToken = function (tokenA, tokenB) {
  return tokenA.wildcard || tokenB.wildcard || tokenA.key === tokenB.key
}

const compareSameSizeQueries = function (parentTokens, childTokens) {
  const differentParentToken = parentTokens.find(
    (parentToken, index) => parentToken.key !== childTokens[index].key,
  )
  return differentParentToken !== undefined && differentParentToken.wildcard
}
