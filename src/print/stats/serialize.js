import { STAT_TYPES } from './types.js'
import { shouldSkipStat } from './skip.js'
import { addPrefix } from './prefix.js'
import { addColors } from './colors.js'

// Serialize each stat measure using the right time unit, number of decimals
// and padding
export const serializeStats = function({
  iteration,
  iteration: {
    stats,
    stats: { loops },
  },
  unit,
  scale,
  statsDecimals,
}) {
  const statsA = Object.entries(STAT_TYPES).map(([name, type]) =>
    serializeStat({
      name,
      type,
      stats,
      unit,
      scale,
      statsDecimals,
      loops,
    }),
  )
  const statsPretty = Object.fromEntries(statsA)
  return { ...iteration, stats: { ...stats, ...statsPretty } }
}

const serializeStat = function({
  name,
  type,
  stats,
  unit,
  scale,
  statsDecimals,
  loops,
}) {
  const prettyName = `${name}Pretty`
  const stat = stats[name]

  if (shouldSkipStat({ stat, name, loops })) {
    return [prettyName, '']
  }

  const decimals = statsDecimals[name]
  const statPretty = serialize({ stat, type, name, scale, unit, decimals })
  return [prettyName, statPretty]
}

const serialize = function({ stat, type, name, scale, unit, decimals }) {
  if (Array.isArray(stat)) {
    return stat.map(statA =>
      serializeEach({ stat: statA, type, name, scale, unit, decimals }),
    )
  }

  return serializeEach({ stat, type, name, scale, unit, decimals })
}

const serializeEach = function({ stat, type, name, scale, unit, decimals }) {
  const statPretty = SERIALIZE_STAT[type]({ stat, scale, unit, decimals })
  const statPrettyA = addPrefix(stat, statPretty, name)
  const statPrettyB = addColors(stat, statPrettyA, name)
  return statPrettyB
}

const serializeCount = function({ stat }) {
  // Adds thousands separators
  return stat.toLocaleString()
}

const serializeScalar = function({ stat, scale, unit, decimals }) {
  const statA = stat / scale
  const integer = Math.floor(statA)
  const fraction = getFraction({ stat: statA, integer, decimals })
  return `${integer}${fraction}${unit}`
}

const getFraction = function({ stat, integer, decimals }) {
  if (Number.isInteger(stat) || decimals === 0) {
    return ''
  }

  return (stat - integer).toFixed(decimals).slice(1)
}

const serializePercentage = function({ stat }) {
  const percentage = Math.abs(Math.floor(stat * PERCENTAGE_SCALE))
  return `${percentage}%`
}

const PERCENTAGE_SCALE = 1e2

const SERIALIZE_STAT = {
  count: serializeCount,
  scalar: serializeScalar,
  percentage: serializePercentage,
}
