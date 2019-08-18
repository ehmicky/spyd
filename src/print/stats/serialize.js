import { STAT_TYPES } from './types.js'
import { handleDeviation } from './deviation.js'

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

  if (stat === undefined) {
    return [prettyName, '']
  }

  const decimals = statsDecimals[name]
  const statA = SERIALIZE_STAT[type]({ stat, scale, unit, decimals })
  const statB = handleDeviation({
    stat: statA,
    statNumber: stat,
    name,
    loops,
    verbose,
  })
  return [prettyName, statB]
}

const serializeCount = function({ stat }) {
  return String(stat)
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

  if (stat >= 0) {
    return `+${percentage}%`
  }

  return `-${percentage}%`
}

const PERCENTAGE_SCALE = 1e2

const serializeArray = function({ stat, scale, unit, decimals }) {
  return stat.map(statA =>
    serializeScalar({ stat: statA, scale, unit, decimals }),
  )
}

const SERIALIZE_STAT = {
  count: serializeCount,
  scalar: serializeScalar,
  percentage: serializePercentage,
  array: serializeArray,
}
