import { titleColor } from '../../utils/colors.js'
import { SEPARATOR_SIGN } from '../../utils/separator.js'

import { getCells } from './cell.js'
import { SEPARATOR } from './column.js'

// Retrieve a single row, including the row name
export const getRow = function ({ row, stats }) {
  const rowName = getRowName(row)
  const rowNameA = formatRowName(rowName)
  const statsStr = getCells(stats)
  return `${rowNameA} ${statsStr}`
}

// Retrieve the spaces left instead of combination name in the header
export const getEmptyRowName = function (row) {
  const { length } = getRowName(row)
  const rowNameSpaces = ''.padStart(length)
  return formatRowName(rowNameSpaces)
}

const getRowName = function (row) {
  return row.join(SEPARATOR)
}

const formatRowName = function (rowName) {
  return titleColor(`${rowName} ${SEPARATOR_SIGN}`)
}
