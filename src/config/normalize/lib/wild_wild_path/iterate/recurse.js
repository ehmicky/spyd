import { getTokenType } from '../../wild_wild_path_parser/main.js'

// Some tokens are recursive. Those are expanded iteratively at each level.
export const expandRecursiveTokens = function (entries, index) {
  return entries.flatMap((entry) => expandRecursiveToken(entry, index))
}

const expandRecursiveToken = function (entry, index) {
  const { queryArray } = entry
  const token = queryArray[index]
  const tokenTypeName = getTokenType(token)
  const recursor = RECURSORS[tokenTypeName]

  if (recursor === undefined) {
    return entry
  }

  const queryArrays = recursor(queryArray, index)
  return queryArrays.map((queryArrayA) => ({
    ...entry,
    queryArray: queryArrayA,
  }))
}

// Handle ** recursion.
// It matches 0, 1 or more levels.
//  - It can match 0 levels, i.e. the current object
// It is the same as the union of . * *.* *.*.* and so on.
// Using both * and ** can express minimum depth, e.g. *.** or *.*.**
const recurseAnyDeep = function (queryArray, index) {
  const parentQuery = queryArray.slice(0, index)
  const childQuery = queryArray.slice(index)
  return [parentQuery, [...parentQuery, { type: 'any' }, ...childQuery]]
}

const RECURSORS = {
  anyDeep: recurseAnyDeep,
}
