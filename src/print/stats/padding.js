import { STAT_TYPES } from './types.js'

// Pad `*.statsPretty` on the left so they vertically align.
// Right padding was already performed when setting the number of decimals.
export const addPaddings = function(iterations) {
  const paddings = getPaddings(iterations)
  return iterations.map(iteration => addPadding({ iteration, paddings }))
}

// Retrieve the maximum length of any measures for each stat
const getPaddings = function(iterations) {
  const paddings = Object.keys(STAT_TYPES).map(name =>
    getPadding(name, iterations),
  )
  return Object.fromEntries(paddings)
}

const getPadding = function(name, iterations) {
  const allLengths = iterations
    .flatMap(({ stats }) => stats[`${name}Pretty`])
    .map(getStatLength)

  if (allLengths.length === 0) {
    return [name, 0]
  }

  const padding = Math.max(...allLengths)
  return [name, padding]
}

const getStatLength = function(stat) {
  return stat.length
}

const addPadding = function({ iteration, iteration: { stats }, paddings }) {
  const prettyStats = Object.keys(STAT_TYPES).map(name =>
    padStat(name, stats, paddings),
  )
  const prettyStatsA = Object.fromEntries(prettyStats)
  return { ...iteration, stats: { ...stats, ...prettyStatsA } }
}

const padStat = function(name, stats, paddings) {
  const prettyName = `${name}Pretty`
  const stat = stats[prettyName]

  const padding = paddings[name]
  const statA = padValue(stat, padding)

  return [prettyName, statA]
}

const padValue = function(stat, padding) {
  if (Array.isArray(stat)) {
    return stat.map(statA => statA.padStart(padding))
  }

  return stat.padStart(padding)
}
