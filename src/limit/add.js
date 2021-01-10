import { matchSelectors } from '../select/match.js'

// Ensure ids exist
export const addLimits = function (combinations, combinationsIds, limits) {
  const limitedCombinations = combinations.filter((combination) =>
    matchSelectors(limits, 'limits', { combination, combinationsIds }),
  )
}
