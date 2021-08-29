import { fieldColor } from '../../../utils/colors.js'
import { COLUMN_SEPARATOR_COLORED } from '../../../utils/separator.js'

// Retrieve the header rows
export const getHeader = function (firstColumn, columns, columnsWidth) {
  const firstColumnWidth = Math.max(...firstColumn.map(getLength))
  const combinationNamePadding = ' '.repeat(firstColumnWidth)
  const { length } = columns[0].headerNames
  return Array.from({ length }, (_, rowIndex) =>
    getHeaderRow({ columns, columnsWidth, rowIndex, combinationNamePadding }),
  ).join('\n')
}

const getLength = function ({ length }) {
  return length
}

const getHeaderRow = function ({
  columns,
  columnsWidth,
  rowIndex,
  combinationNamePadding,
}) {
  const headerCells = columns
    .map((column) => getHeaderCell(column, rowIndex, columnsWidth))
    .join(COLUMN_SEPARATOR_COLORED)
  return `${combinationNamePadding}${headerCells}`
}

// Retrieve a cell in the header row
const getHeaderCell = function ({ headerNames }, rowIndex, columnsWidth) {
  const headerName = headerNames[rowIndex].padStart(columnsWidth)
  return fieldColor(headerName)
}
