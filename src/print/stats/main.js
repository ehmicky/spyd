import { getUnit } from './unit.js'
import { getStatsDecimals } from './decimals.js'
import { serializeStats } from './serialize.js'
import { addPaddings } from './padding.js'

// Some stats are removed when `--save` is used. When showing saved benchmarks,
// those will be `undefined`. We default them to `[]`.
// Also add `iteration.stats.*Pretty` which is like `iteration.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
export const normalizeStats = function (iterations) {
  const iterationsA = iterations.map(normalizeIterationStats)

  const { unit, scale } = getUnit(iterationsA)
  const statsDecimals = getStatsDecimals(iterationsA, scale)
  const iterationsB = iterationsA.map((iteration) =>
    serializeStats({ iteration, unit, scale, statsDecimals }),
  )
  const iterationsC = addPaddings(iterationsB)
  return iterationsC
}

const normalizeIterationStats = function ({
  stats: { histogram = [], percentiles = [], ...stats },
  ...iteration
}) {
  return { ...iteration, stats: { ...stats, histogram, percentiles } }
}
