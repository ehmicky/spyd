import { STAT_TYPES } from './types.js'

export const serializeStats = function({
  iteration,
  iteration: { stats },
  units,
}) {
  const statsA = Object.entries(stats).map(([name, stat]) =>
    serializeStat({ name, stat, units }),
  )
  const printedStats = Object.fromEntries(statsA)
  return { ...iteration, printedStats }
}

const serializeStat = function({ name, stat, units }) {
  const type = STAT_TYPES[name]
  const { unit, scale } = units[name]
  const statA = SERIALIZE_STAT[type](stat, scale, unit)
  return [name, statA]
}

const serializeCount = function(stat) {
  return String(stat)
}

const serializeSkip = function(stat) {
  return stat
}

const serializeScalar = function(stat, scale, unit) {
  return `${Math.round(stat / scale)}${unit}`
}

const serializeArray = function(stat, scale, unit) {
  return stat.map(integer => serializeScalar(integer, scale, unit))
}

const SERIALIZE_STAT = {
  count: serializeCount,
  skip: serializeSkip,
  scalar: serializeScalar,
  array: serializeArray,
}
