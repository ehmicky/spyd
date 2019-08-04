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
  const statsA = Object.entries(stats).map(([name, stat]) =>
    serializeStat({ name, stat, unit, scale, statsDecimals, loops, verbose }),
  )
  const printedStats = Object.fromEntries(statsA)
  return { ...iteration, printedStats }
}

const serializeStat = function({
  name,
  stat,
  unit,
  scale,
  statsDecimals,
  loops,
  verbose,
}) {
  const type = STAT_TYPES[name]
  const decimals = statsDecimals[name]
  const statA = SERIALIZE_STAT[type]({ stat, scale, unit, decimals })
  const statB = handleDeviation({
    stat: statA,
    statNumber: stat,
    name,
    loops,
    verbose,
  })
  return [name, statB]
}

const serializeCount = function({ stat }) {
  return String(stat)
}

const serializeSkip = function({ stat }) {
  return stat
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

const serializeArray = function({ stat, scale, unit, decimals }) {
  return stat.map(integer =>
    serializeScalar({ integer, scale, unit, decimals }),
  )
}

const SERIALIZE_STAT = {
  count: serializeCount,
  skip: serializeSkip,
  scalar: serializeScalar,
  array: serializeArray,
}
