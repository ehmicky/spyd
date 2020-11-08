import { getStatsDecimals } from './decimals.js'
import { addPaddings } from './padding.js'
import { serializeStats } from './serialize.js'
import { getUnit } from './unit.js'

// Add `iteration.stats.*Pretty` which is like `iteration.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
export const prettifyStats = function (iterations) {
  const { unit, scale } = getUnit(iterations)
  const statsDecimals = getStatsDecimals(iterations, scale)
  const iterationsA = serializeStats({ iterations, unit, scale, statsDecimals })
  const iterationsB = addPaddings(iterationsA)
  return iterationsB
}
