import { STAT_TYPES } from './types.js'

// Pad `printedStats` on the left so they vertically align.
// Right padding was already performed when setting the number of decimals.
export const addPaddings = function(iterations) {
  const paddings = getPaddings(iterations)
  const iterationsA = iterations.map(iteration =>
    addPadding({ iteration, paddings }),
  )
  return iterationsA
}

// Retrieve the maximum length of any measures for each stat
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
