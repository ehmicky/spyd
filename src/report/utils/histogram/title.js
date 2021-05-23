import { getCombinationNameColor } from '../first.js'

// Retrieve sidebar with the combination name
export const getTitleBlock = function (combination, height, showStats) {
  const newlines = getNewlines(height, showStats)
  return `${newlines}${getCombinationNameColor(combination)}`
}

const getNewlines = function (height, showStats) {
  const newlinesHeight =
    height - (showStats ? STATS_VERTICAL_SHIFT : NO_STATS_VERTICAL_SHIFT)
  return '\n'.repeat(newlinesHeight)
}

const STATS_VERTICAL_SHIFT = 0
const NO_STATS_VERTICAL_SHIFT = 1
