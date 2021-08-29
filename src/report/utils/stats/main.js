import { addStatColor } from './colors.js'
import { STAT_KINDS } from './kinds.js'
import { addStatPadded } from './padding.js'
import { addStatsPretty } from './prettify.js'

// Add `combination.stats.*Pretty` which is like `combination.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
// When prettifying several results at once:
//  - This function is called on each `result.combinations`
//  - However, we pass an additional `allCombinations` for the other results
//    combinations. This ensures results are all printed with the same scale.
//  - This is used when printing `result.history`
// When prettifying history results, we adjust the scale based on all history
// results, i.e. we need to also pass those as `allCombinations`.
export const prettifyHistoryStats = function (result, history) {
  const allCombinations = history.flatMap(getCombinations)
  const combinations = prettifyStats(result.combinations, allCombinations)
  return { ...result, combinations }
}

const getCombinations = function ({ combinations }) {
  return combinations
}

export const prettifyTargetStats = function (result) {
  const combinations = prettifyStats(result.combinations, result.combinations)
  return { ...result, combinations }
}

const prettifyStats = function (combinations, allCombinations) {
  return STAT_KINDS.reduce(
    (combinationsA, statKind) =>
      prettifyCombinationsStat(statKind, combinationsA, allCombinations),
    combinations,
  )
}

const prettifyCombinationsStat = function (
  { name, kind, signed },
  combinations,
  allCombinations,
) {
  const combinationsA = addStatsPretty({
    combinations,
    allCombinations,
    name,
    kind,
    signed,
  })
  const combinationsB = addStatPadded(combinationsA, name)
  const combinationsC = combinationsB.map((combination) =>
    addStatColor({ name, combination }),
  )
  return combinationsC
}
