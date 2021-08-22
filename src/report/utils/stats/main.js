import { addStatColor } from './colors.js'
import { getStatKinds } from './kinds.js'
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
export const prettifyStats = function (
  combinations,
  allCombinations = combinations,
) {
  const statKinds = getStatKinds(combinations)
  const combinationsA = addCombinationsStatsRaw(combinations, statKinds)
  const allCombinationsA = addCombinationsStatsRaw(allCombinations, statKinds)
  return statKinds.reduce(
    (combinationsB, statKind) =>
      prettifyCombinationsStat(statKind, combinationsB, allCombinationsA),
    combinationsA,
  )
}

// Replace `stats.*` string to an object with single property `raw`.
// This allows adding more properties alongside it: `pretty`, `padded`, etc.
const addCombinationsStatsRaw = function (combinations, statKinds) {
  return combinations.map((combination) =>
    statKinds.reduce(addStatRaw, combination),
  )
}

const addStatRaw = function (combination, { name }) {
  return {
    ...combination,
    stats: { ...combination.stats, [name]: { raw: combination.stats[name] } },
  }
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
