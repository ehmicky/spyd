import { fieldColor } from '../../../utils/colors.js'
import { getCombinationNameWidth } from '../../../utils/name.js'
import { COLUMN_SEPARATOR_COLORED } from '../../../utils/separator.js'

// Retrieve header name
export const getHeaderNames = function ({ timestamp }) {
  const [day, ...timeAndTimezone] = timestamp.split(' ')
  const time = timeAndTimezone.join(' ')
  return [day, time, '']
}

export const getHeaderLength = function (headerName) {
  return headerName.length
}

// Retrieve the header rows
export const getHeader = function ([combination], columns, columnWidth) {
  const combinationNamePadding = ' '.repeat(
    getCombinationNameWidth(combination),
  )
  const { length } = columns[0].headerNames
  return Array.from({ length }, (_, rowIndex) =>
    getHeaderRow({ columns, columnWidth, rowIndex, combinationNamePadding }),
  ).join('\n')
}

const getHeaderRow = function ({
  columns,
  columnWidth,
  rowIndex,
  combinationNamePadding,
}) {
  const headerCells = columns
    .map((column) => getHeaderCell(column, rowIndex, columnWidth))
    .join(COLUMN_SEPARATOR_COLORED)
  return `${combinationNamePadding}${headerCells}`
}

// Retrieve a cell in the header row
const getHeaderCell = function ({ headerNames }, rowIndex, columnWidth) {
  const headerName = headerNames[rowIndex].padStart(columnWidth)
  return fieldColor(headerName)
}
