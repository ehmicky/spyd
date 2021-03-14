import stringWidth from 'string-width'

import { titleColor } from '../../utils/colors.js'

import { getCells } from './cell.js'

// Retrieve a single row, including the row name
export const getRow = function ({ row, stats }) {
  const rowName = getRowName(row)
  const statsStr = getCells(stats)
  return `${rowName} ${statsStr}`
}

// Retrieve the spaces left instead of combination name in the header
export const getEmptyRowName = function (row) {
  const rowName = getRowName(row)
  return ' '.repeat(stringWidth(rowName))
}

const getRowName = function (row) {
  const rowName = row.join(NAME_MIDDLE_SEPARATOR)
  return titleColor(`${NAME_LEFT_SEPARATOR}${rowName}${NAME_RIGHT_SEPARATOR} `)
}

const NAME_MIDDLE_SEPARATOR = ' '
const NAME_LEFT_SEPARATOR = '[ '
const NAME_RIGHT_SEPARATOR = ' ]'
