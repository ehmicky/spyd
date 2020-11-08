import { addColors } from './colors.js'
import { getStatsDecimals } from './decimals.js'
import { addPaddings } from './padding.js'
import { addPrefix } from './prefix.js'
import { shouldSkipStat } from './skip.js'
import { STAT_TYPES } from './types.js'
import { getUnit } from './unit.js'
import { serializeValue } from './value.js'

// Add `iteration.stats.*Pretty` which is like `iteration.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
export const prettifyStats = function (iterations) {
  const { unit, scale } = getUnit(iterations)
  const iterationsA = serializeStats({ iterations, unit, scale })
  const iterationsB = addPaddings(iterationsA)
  return iterationsB
}

const serializeStats = function ({ iterations, unit, scale }) {
  return Object.entries(STAT_TYPES).reduce(
    (iterationsA, [name, type]) =>
      serializeIterationsStats({
        iterations: iterationsA,
        name,
        type,
        unit,
        scale,
      }),
    iterations,
  )
}

const serializeIterationsStats = function ({
  iterations,
  name,
  type,
  unit,
  scale,
}) {
  const decimals = getStatsDecimals({ iterations, name, type, scale })
  return iterations.map((iteration) =>
    serializeIterationStat({ iteration, name, type, unit, scale, decimals }),
  )
}

const serializeIterationStat = function ({
  name,
  iteration,
  iteration: {
    stats,
    stats: { [name]: stat, loops },
  },
  type,
  unit,
  scale,
  decimals,
}) {
  const statPretty = serializeStat({
    stat,
    name,
    type,
    unit,
    scale,
    decimals,
    loops,
  })
  return { ...iteration, stats: { ...stats, [`${name}Pretty`]: statPretty } }
}

const serializeStat = function ({
  stat,
  name,
  type,
  unit,
  scale,
  decimals,
  loops,
}) {
  if (shouldSkipStat({ stat, name, loops })) {
    return ''
  }

  if (Array.isArray(stat)) {
    return stat.map((statA) =>
      serializeItem({ stat: statA, type, name, scale, unit, decimals }),
    )
  }

  return serializeItem({ stat, type, name, scale, unit, decimals })
}

const serializeItem = function ({ stat, type, name, scale, unit, decimals }) {
  const statPretty = serializeValue({ stat, type, scale, unit, decimals })
  const statPrettyA = addPrefix(stat, statPretty, name)
  const statPrettyB = addColors(stat, statPrettyA, name)
  return statPrettyB
}
