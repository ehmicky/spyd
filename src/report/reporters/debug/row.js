import stringWidth from 'string-width'

import { padStart } from '../../utils/padding.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getCombinationName } from '../../utils/title.js'

import { NAME_RIGHT_PADDING } from './column.js'

// Retrieve a single row, including the row name
export const getRow = function ({ titles, stats }, statNames) {
  const combinationName = getCombinationName(titles)
  const cells = getCells(stats, statNames)
  return `${combinationName}${NAME_RIGHT_PADDING}${cells}`
}

// Retrieve a single row, except the row name
const getCells = function (stats, statNames) {
  return statNames
    .map((statName) => getCell(stats, statName))
    .join(COLUMN_SEPARATOR)
}

// Retrieve a single cell in the table, with a specific stat
export const getCell = function (stats, statName) {
  const stat = stats[`${statName}Padded`]
  const headerLength = STAT_TITLES[statName].length
  const padSize = Math.max(headerLength, stringWidth(stat))

  const statA = padStart(stat, padSize)
  return statA
}
