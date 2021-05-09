import { addStatColor } from './colors.js'
import { STAT_KINDS } from './kinds.js'
import { addStatPadded } from './padding.js'
import { addStatsPretty } from './prettify.js'

// Add `combination.stats.*Pretty` which is like `combination.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
export const prettifyStats = function (combinations) {
  const combinationsA = combinations.map(addStatsRaw)
  return STAT_KINDS.reduce(prettifyCombinationsStat, combinationsA)
}

// Replace `stats.*` string to an object with single property `raw`.
// This allows adding more properties alongside it: `pretty`, `padded`, etc.
const addStatsRaw = function (combination) {
  return STAT_KINDS.reduce(addStatRaw, combination)
}

const addStatRaw = function (combination, { name }) {
  return {
    ...combination,
    stats: { ...combination.stats, [name]: { raw: combination.stats[name] } },
  }
}

const prettifyCombinationsStat = function (
  combinations,
  { name, kind, signed },
) {
  const combinationsA = addStatsPretty({ combinations, name, kind, signed })
  const combinationsB = addStatPadded(combinationsA, name)
  const combinationsC = combinationsB.map((combination) =>
    addStatColor({ name, combination }),
  )
  return combinationsC
}
