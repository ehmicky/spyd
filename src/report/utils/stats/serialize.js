import { addColors } from './colors.js'
import { addPrefix } from './prefix.js'
import { shouldSkipStat } from './skip.js'
import { STAT_TYPES } from './types.js'

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
      serializeValue({ stat: statA, type, name, scale, unit, decimals }),
    )
  }

  return serializeValue({ stat, type, name, scale, unit, decimals })
}

const serializeValue = function ({ stat, type, name, scale, unit, decimals }) {
  const statPretty = SERIALIZE_STAT[type](stat, { scale, unit, decimals })
  const statPrettyA = addPrefix(stat, statPretty, name)
  const statPrettyB = addColors(stat, statPrettyA, name)
  return statPrettyB
}

const serializeCount = function (stat) {
  // Adds thousands separators
  return stat.toLocaleString()
}

const serializePercentage = function (stat) {
  const percentage = Math.abs(Math.floor(stat * PERCENTAGE_SCALE))
  return `${percentage}%`
}

const PERCENTAGE_SCALE = 1e2

const serializeDuration = function (stat, { scale, unit, decimals }) {
  const scaledStat = stat / scale
  const integer = Math.floor(scaledStat)
  const fraction = getFraction({ scaledStat, integer, decimals })
  return `${integer}${fraction}${unit}`
}

const getFraction = function ({ scaledStat, integer, decimals }) {
  if (Number.isInteger(scaledStat) || decimals === 0) {
    return ''
  }

  return (scaledStat - integer).toFixed(decimals).slice(1)
}

const SERIALIZE_STAT = {
  count: serializeCount,
  percentage: serializePercentage,
  duration: serializeDuration,
}
