import { matchSelectors } from '../select/match.js'
import { parseSelectors } from '../select/parse.js'

// Add `combination.limit` to each combiantion using the `limit` property
export const addLimits = function (combinations, combinationsIds, limit) {
  const limitSelectors = parseSelectors(limit, 'limit', combinationsIds)
  return combinations.map((combination) =>
    addCombinationLimits(combination, limitSelectors),
  )
}

const addCombinationLimits = function (combination, limitSelectors) {
  if (!matchSelectors(combination, limitSelectors)) {
    return combination
  }

  return combination
}
