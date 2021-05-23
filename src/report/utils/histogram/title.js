import { titleColor } from '../colors.js'
import { getCombinationName } from '../title.js'

// Retrieve sidebar with the combination name
export const getTitleBlock = function (combination, height, showStats) {
  const newlines = getNewlines(height, showStats)
  return `${newlines}${getFirstCellColor(combination)}`
}

const getNewlines = function (height, showStats) {
  const newlinesHeight =
    height - (showStats ? STATS_VERTICAL_SHIFT : NO_STATS_VERTICAL_SHIFT)
  return '\n'.repeat(newlinesHeight)
}

const STATS_VERTICAL_SHIFT = 0
const NO_STATS_VERTICAL_SHIFT = 1

export const getFirstCellWidth = function ([combination]) {
  return getFirstCell(combination).length
}

const getFirstCellColor = function (combination) {
  return titleColor(getFirstCell(combination))
}

const getFirstCell = function ({ titles }) {
  const combinationName = getCombinationName(titles)
  return `${combinationName}${FIRST_CELL_PADDING}`
}

const FIRST_CELL_PADDING_WIDTH = 2
const FIRST_CELL_PADDING = ' '.repeat(FIRST_CELL_PADDING_WIDTH)
