import { STAT_TYPES } from './types.js'
import { shouldSkipStat } from './skip.js'
import { getPrefix } from './prefix.js'

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
  verbose,
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
      verbose,
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
  verbose,
}) {
  const prettyName = `${name}Pretty`
  const stat = stats[name]

  if (shouldSkipStat({ stat, name, loops, verbose })) {
    return [prettyName, '']
  }

  const decimals = statsDecimals[name]
  const statA = SERIALIZE_STAT[type]({ stat, name, scale, unit, decimals })
  return [prettyName, statA]
}

const serializeCount = function({ stat }) {
  return String(stat)
}

const serializeScalar = function({ stat, name, scale, unit, decimals }) {
  const prefix = getPrefix(stat, name)
  const statA = stat / scale
  const integer = Math.floor(statA)
  const fraction = getFraction({ stat: statA, integer, decimals })
  return `${prefix}${integer}${fraction}${unit}`
}

const getFraction = function({ stat, integer, decimals }) {
  if (Number.isInteger(stat) || decimals === 0) {
    return ''
  }

  return (stat - integer).toFixed(decimals).slice(1)
}

const serializePercentage = function({ stat, name }) {
  const prefix = getPrefix(stat, name)
  const percentage = Math.abs(Math.floor(stat * PERCENTAGE_SCALE))
  return `${prefix}${percentage}%`
}

const PERCENTAGE_SCALE = 1e2

const serializeArray = function({ stat, name, scale, unit, decimals }) {
  return stat.map(statA =>
    serializeScalar({ stat: statA, name, scale, unit, decimals }),
  )
}

const SERIALIZE_STAT = {
  count: serializeCount,
  scalar: serializeScalar,
  percentage: serializePercentage,
  array: serializeArray,
}
