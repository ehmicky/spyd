import { parseQuery } from './parse.js'

// Returns whether a query is a parent to another one, such as `a.b` and `a.b.c`
// Wildcards always match, i.e. `a.*` is a parent to `a.b.c` and
// `a.b` is a parent to `a.*.c`.
export const isParent = function (childQuery, parentQuery) {
  const childTokens = parseQuery(childQuery)
  const parentTokens = parseQuery(parentQuery)
  return (
    parentTokens.length < childTokens.length &&
    parentTokens.every((parentToken, index) =>
      isSameToken(parentTokens, childTokens[index]),
    )
  )
}

const isSameToken = function (tokenA, tokenB) {
  return tokenA.isAny || tokenB.isAny || tokenA.key === tokenB.key
}
