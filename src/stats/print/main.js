import { getUnit } from './unit.js'
import { getStatsDecimals } from './decimals.js'
import { serializeStats } from './serialize.js'
import { addPaddings } from './padding.js'

// Add `iteration.printedStats` which is like `iteration.stats` but serialized
// and reporter-friendly. It adds time units, rounding, padding and ensures
// proper vertical alignment.
export const addPrintedStats = function(iterations) {
  const { unit, scale } = getUnit(iterations)
  const statsDecimals = getStatsDecimals(iterations, scale)
  const iterationsA = iterations.map(iteration =>
    serializeStats({ iteration, unit, scale, statsDecimals }),
  )
  const iterationsB = addPaddings(iterationsA)
  return iterationsB
}
