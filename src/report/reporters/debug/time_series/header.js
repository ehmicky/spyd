import { fieldColor } from '../../../utils/colors.js'
import { getCombinationNameWidth } from '../../../utils/name.js'
import { COLUMN_SEPARATOR_COLORED } from '../../../utils/separator.js'

// Retrieve header name
export const getHeaderName = function ({ timestamp }) {
  const [day, ...timeAndTimezone] = timestamp.split(' ')
  const time = timeAndTimezone.join(' ')
  return { day, time }
}

// Retrieve the header row
export const getHeader = function ([combination], columns, columnWidth) {
  const combinationNamePadding = ' '.repeat(
    getCombinationNameWidth(combination),
  )
  return FULL_HEADER_PROP_NAMES.map((propName) =>
    getHeaderRow({ columns, columnWidth, propName, combinationNamePadding }),
  ).join('\n')
}

const getHeaderRow = function ({
  columns,
  columnWidth,
  propName,
  combinationNamePadding,
}) {
  const headerRow = columns
    .map((column) => getHeaderCell(column, columnWidth, propName))
    .join(COLUMN_SEPARATOR_COLORED)
  return `${combinationNamePadding}${headerRow}`
}

// Retrieve a cell in the header row
const getHeaderCell = function (column, columnWidth, propName) {
  if (propName === '') {
    return ' '.repeat(columnWidth)
  }

  const headerName = column.headerName[propName].padStart(columnWidth)
  return fieldColor(headerName)
}

export const getHeaderLengths = function ({ headerName }) {
  return HEADER_PROP_NAMES.map((propName) => headerName[propName].length)
}

const HEADER_PROP_NAMES = ['day', 'time']
const FULL_HEADER_PROP_NAMES = [...HEADER_PROP_NAMES, '']
