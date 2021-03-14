import stringWidth from 'string-width'

import { padStart } from '../../utils/padding.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'

import { STAT_COLUMNS } from './column.js'

// Retrieve a single row, except the row name
export const getCells = function (stats) {
  return STAT_COLUMNS.map((name) => getCell(stats, name)).join(COLUMN_SEPARATOR)
}

// Retrieve a single cell in the table, with a specific stat
export const getCell = function (stats, name) {
  const stat = stats[`${name}PrettyPadded`]
  const headerLength = STAT_TITLES[name].length
  const padSize = Math.max(headerLength, stringWidth(stat))

  const statA = padStart(stat, padSize)
  return statA
}
