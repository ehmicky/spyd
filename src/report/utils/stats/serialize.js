import { addColors } from './colors.js'
import { addPrefix } from './prefix.js'
import { shouldSkipStat } from './skip.js'
import { STAT_TYPES } from './types.js'
import { serializeValue } from './value.js'

// Serialize each stat measure using the right time unit, number of decimals
// and padding
export const serializeStats = function ({
  iterations,
  unit,
  scale,
  statsDecimals,
}) {
  return Object.entries(STAT_TYPES).reduce(
    (iterationsA, [name, type]) =>
      serializeIterationsStats({
        iterations: iterationsA,
        name,
        type,
        unit,
        scale,
        statsDecimals,
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
  statsDecimals,
}) {
  return iterations.map((iteration) =>
    serializeIterationStat({
      iteration,
      name,
      type,
      unit,
      scale,
      statsDecimals,
    }),
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
  statsDecimals,
}) {
  const statPretty = serializeStat({
    stat,
    name,
    type,
    unit,
    scale,
    statsDecimals,
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
  statsDecimals,
  loops,
}) {
  if (shouldSkipStat({ stat, name, loops })) {
    return ''
  }

  const decimals = statsDecimals[name]

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
