import stringWidth from 'string-width'

import { padStart } from '../../utils/padding.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'

// Retrieve a single row, except the row name
export const getCells = function (stats, statColumns) {
  return statColumns
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
