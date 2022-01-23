import { parse } from './parse.js'

// Returns whether a query is a parent to another one, such as `a.b` and `a.b.c`
// Wildcards always match, i.e. `a.*` is a parent to `a.b.c` and
// `a.b` is a parent to `a.*.c`.
export const isParent = function (childQuery, parentQuery) {
  const childTokens = parse(childQuery)
  const parentTokens = parse(parentQuery)
  return (
    parentTokens.length < childTokens.length &&
    parentTokens.every((parentToken, index) =>
      isSameToken(parentToken, childTokens[index]),
    )
  )
}

const isSameToken = function (tokenA, tokenB) {
  return tokenA.wildcard || tokenB.wildcard || tokenA.key === tokenB.key
}
