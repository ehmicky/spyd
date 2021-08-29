import { padString } from '../../../utils/pad.js'
import { COLUMN_SEPARATOR_COLORED } from '../../../utils/separator.js'

// Retrieve the header rows
export const getHeader = function (columns, columnsWidth, firstColumnWidth) {
  const combinationNamePadding = ' '.repeat(firstColumnWidth)
  const { length } = columns[0].headerNames
  return Array.from({ length }, (_, rowIndex) =>
    getHeaderRow({ columns, columnsWidth, rowIndex, combinationNamePadding }),
  ).join('\n')
}

const getHeaderRow = function ({
  columns,
  columnsWidth,
  rowIndex,
  combinationNamePadding,
}) {
  const headerCells = columns
    .map(({ headerNames }) => padString(headerNames[rowIndex], columnsWidth))
    .join(COLUMN_SEPARATOR_COLORED)
  return `${combinationNamePadding}${headerCells}`
}
