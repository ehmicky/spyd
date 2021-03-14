import { getStatsDecimals } from './decimals.js'
import { STAT_KINDS } from './kinds.js'
import { padCombinations } from './padding.js'
import { prettifyCombinationStats } from './prettify.js'
import { getScale } from './scale.js'

// Add `combination.stats.*Pretty` which is like `combination.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
export const prettifyStats = function (combinations) {
  return STAT_KINDS.reduce(prettifyCombinationsStat, combinations)
}

const prettifyCombinationsStat = function (combinations, { name, kind }) {
  const scale = getScale(combinations, name, kind)
  const decimals = getStatsDecimals(combinations, name, scale)
  const combinationsA = combinations.map((combination) =>
    prettifyCombinationStats({ name, combination, kind, scale, decimals }),
  )
  const combinationsB = padCombinations(combinationsA, name)
  return combinationsB
}
