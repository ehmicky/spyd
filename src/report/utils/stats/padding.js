import mapObj from 'map-obj'
import stringWidth from 'string-width'

import { STAT_TYPES } from './types.js'

// Pad `*.statsPretty` on the left so they vertically align.
// Right padding was already performed when setting the number of decimals.
export const addPaddings = function (iterations) {
  const paddings = mapObj(STAT_TYPES, (name) => [
    name,
    getPadding(name, iterations),
  ])
  return iterations.map((iteration) => addPadding({ iteration, paddings }))
}

// Retrieve the maximum length of any measures for each stat
const getPadding = function (name, iterations) {
  const allLengths = iterations
    .flatMap(({ stats }) => stats[`${name}Pretty`])
    .map(stringWidth)

  if (allLengths.length === 0) {
    return 0
  }

  return Math.max(...allLengths)
}

const addPadding = function ({ iteration, iteration: { stats }, paddings }) {
  const prettyStats = Object.keys(STAT_TYPES).map((name) =>
    padStat(name, stats, paddings),
  )
  const prettyStatsA = Object.fromEntries(prettyStats)
  return { ...iteration, stats: { ...stats, ...prettyStatsA } }
}

const padStat = function (name, stats, paddings) {
  const prettyName = `${name}Pretty`
  const stat = stats[prettyName]

  const padding = paddings[name]
  const statA = padValue(stat, padding)

  return [prettyName, statA]
}

const padValue = function (stat, padding) {
  if (Array.isArray(stat)) {
    return stat.map((statA) => coloredPad(statA, padding))
  }

  return coloredPad(stat, padding)
}

// Pad that takes into account ANSI color sequences
const coloredPad = function (stat, padding) {
  const ansiLength = stat.length - stringWidth(stat)
  return stat.padStart(padding + ansiLength)
}
