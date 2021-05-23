import { titleColor } from '../colors.js'
import { getCombinationName } from '../title.js'

// Retrieve sidebar with the combination name
export const getTitleBlock = function (titles, height, showStats) {
  const newlines = getNewlines(height, showStats)
  return `${newlines}${titleColor(getCombinationTitle(titles))}`
}

const getNewlines = function (height, showStats) {
  const newlinesHeight =
    height - (showStats ? STATS_VERTICAL_SHIFT : NO_STATS_VERTICAL_SHIFT)
  return '\n'.repeat(newlinesHeight)
}

export const getTitleWidth = function ([{ titles }]) {
  return getCombinationTitle(titles).length
}

const getCombinationTitle = function (titles) {
  return `${getCombinationName(titles)}${FIRST_CELL_PADDING}`
}

const STATS_VERTICAL_SHIFT = 0
const NO_STATS_VERTICAL_SHIFT = 1
const FIRST_CELL_PADDING_WIDTH = 2
const FIRST_CELL_PADDING = ' '.repeat(FIRST_CELL_PADDING_WIDTH)
