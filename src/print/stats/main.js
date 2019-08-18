import { getUnit } from './unit.js'
import { getStatsDecimals } from './decimals.js'
import { serializeStats } from './serialize.js'
import { addPaddings } from './padding.js'

// Some stats are removed when `--save` is used. When showing saved benchmarks,
// those will be `undefined`. We default them to `[]`.
export const normalizeStats = function(iterations, verbose) {
  const iterationsA = iterations.map(normalizeIterationStats)
  const iterationsB = prettifyStats(iterationsA, verbose)
  return iterationsB
}

const normalizeIterationStats = function({
  stats: { histogram = [], percentiles = [], ...stats },
  ...iteration
}) {
  return { ...iteration, stats: { ...stats, histogram, percentiles } }
}

// Add `iteration.stats.*Pretty` which is like `iteration.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
const prettifyStats = function(iterations, verbose) {
  const { unit, scale } = getUnit(iterations)
  const statsDecimals = getStatsDecimals(iterations, scale)
  const iterationsA = iterations.map(iteration =>
    serializeStats({ iteration, unit, scale, statsDecimals, verbose }),
  )
  const iterationsB = addPaddings(iterationsA)
  return iterationsB
}
