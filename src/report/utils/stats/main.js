import { addStatColor } from './colors.js'
import { STAT_KINDS } from './kinds.js'
import { addStatPadded } from './padding.js'
import { addStatsPretty } from './prettify.js'

// Add `combination.stats.*Pretty` which is like `combination.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
export const prettifyStats = function (combinations) {
  return STAT_KINDS.reduce(prettifyCombinationsStat, combinations)
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
