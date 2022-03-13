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

// Handle ** recursion
const recurseAnyDeep = function (queryArray, index) {
  const parentQuery = queryArray.slice(0, index)
  const childQuery = queryArray.slice(index)
  return [parentQuery, [...parentQuery, { type: 'any' }, ...childQuery]]
}

const RECURSORS = {
  anyDeep: recurseAnyDeep,
}
