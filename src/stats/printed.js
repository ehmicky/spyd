export const addPrintedStats = function(iterations) {
  const units = getUnits(iterations)
  const iterationsA = iterations.map(iteration =>
    addIterationStats({ iteration, units }),
  )
  const iterationsB = addPaddings(iterationsA)
  return iterationsB
}

const getUnits = function(iterations) {
  const units = Object.entries(STAT_TYPES).map(([name, type]) =>
    getUnit({ name, type, iterations }),
  )
  return Object.fromEntries(units)
}

const getUnit = function({ name, type, iterations }) {
  if (type === 'count' || type === 'skip') {
    return [name, {}]
  }

  const allStats = iterations.flatMap(({ stats }) => stats[name])
  const { unit, scale } = findPreciseUnit(allStats)
  return [name, { unit, scale }]
}

const findPreciseUnit = function(floats) {
  const unit = findUnit(floats)
  const scale = UNITS[unit]
  return { unit, scale }
}

const findUnit = function(floats) {
  const floatsA = floats.filter(isNotZero)

  if (floatsA.length === 0) {
    return DEFAULT_UNIT
  }

  const float = Math.min(...floatsA)

  const preciseUnit = Object.entries(UNITS).find(([, minUnit]) =>
    isPreciseUnit(float, minUnit),
  )

  if (preciseUnit === undefined) {
    return MIN_UNIT
  }

  return preciseUnit[0]
}

const isNotZero = function(number) {
  return number !== 0
}

const isPreciseUnit = function(float, minUnit) {
  const minPrecision = minUnit * MIN_PRECISION
  return float >= minPrecision
}

/* eslint-disable id-length */
const UNITS = {
  d: 864e11,
  h: 36e11,
  m: 6e10,
  s: 1e9,
  ms: 1e6,
  μs: 1e3,
  ns: 1,
  ps: 1e-3,
  fs: 1e-6,
}
/* eslint-enable id-length */

const DEFAULT_UNIT = 'ns'
const MIN_UNIT = 'fs'
const MIN_PRECISION = 1e1

const addIterationStats = function({ iteration, iteration: { stats }, units }) {
  const statsA = Object.entries(stats).map(([name, stat]) =>
    addPrintedStat({ name, stat, units }),
  )
  const printedStats = Object.fromEntries(statsA)
  return { ...iteration, printedStats }
}

const addPrintedStat = function({ name, stat, units }) {
  const type = STAT_TYPES[name]
  const { unit, scale } = units[name]
  const statA = PRINT_STAT[type](stat, scale, unit)
  return [name, statA]
}

const printCount = function(stat) {
  return String(stat)
}

const printSkip = function(stat) {
  return stat
}

const printScalar = function(stat, scale, unit) {
  return `${Math.round(stat / scale)}${unit}`
}

const printArray = function(stat, scale, unit) {
  return stat.map(integer => printScalar(integer, scale, unit))
}

const PRINT_STAT = {
  count: printCount,
  skip: printSkip,
  scalar: printScalar,
  array: printArray,
}

const addPaddings = function(iterations) {
  const paddings = getPaddings(iterations)
  const iterationsA = iterations.map(iteration =>
    addPadding({ iteration, paddings }),
  )
  return iterationsA
}

const getPaddings = function(iterations) {
  const paddings = Object.entries(STAT_TYPES).map(([name, type]) =>
    getPadding({ name, type, iterations }),
  )
  return Object.fromEntries(paddings)
}

const getPadding = function({ name, type, iterations }) {
  if (type === 'skip') {
    return [name]
  }

  const allPrintedStats = iterations.flatMap(
    ({ printedStats }) => printedStats[name].length,
  )
  const padding = Math.max(...allPrintedStats)
  return [name, padding]
}

const addPadding = function({
  iteration,
  iteration: { printedStats },
  paddings,
}) {
  const printedStatsA = Object.entries(printedStats).map(
    ([name, printedStat]) => padStat({ name, printedStat, paddings }),
  )
  const printedStatsB = Object.fromEntries(printedStatsA)
  return { ...iteration, printedStats: printedStatsB }
}

const padStat = function({ name, printedStat, paddings }) {
  const type = STAT_TYPES[name]
  const padding = paddings[name]
  const printedStatA = PADDING_STAT[type](printedStat, padding)
  return [name, printedStatA]
}

const noPadding = function(printedStat) {
  return printedStat
}

const padScalar = function(printedStat, padding) {
  return printedStat.padStart(padding)
}

const padArray = function(printedStat, padding) {
  return printedStat.map(string => padScalar(string, padding))
}

const PADDING_STAT = {
  count: padScalar,
  skip: noPadding,
  scalar: padScalar,
  array: padArray,
}

const STAT_TYPES = {
  median: 'scalar',
  mean: 'scalar',
  min: 'scalar',
  max: 'scalar',
  deviation: 'scalar',
  variance: 'scalar',
  count: 'count',
  loops: 'count',
  repeat: 'count',
  processes: 'count',
  histogram: 'skip',
  percentiles: 'array',
}
