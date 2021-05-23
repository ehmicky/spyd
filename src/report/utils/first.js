import { titleColor } from './colors.js'
import { getCombinationName } from './title.js'

export const getFirstCellWidth = function (combination) {
  return getFirstCell(combination).length
}

export const getFirstCellColor = function (combination) {
  return titleColor(getFirstCell(combination))
}

const getFirstCell = function ({ titles }) {
  const combinationName = getCombinationName(titles)
  return `${combinationName}${FIRST_CELL_PADDING}`
}

const FIRST_CELL_PADDING_WIDTH = 2
const FIRST_CELL_PADDING = ' '.repeat(FIRST_CELL_PADDING_WIDTH)
