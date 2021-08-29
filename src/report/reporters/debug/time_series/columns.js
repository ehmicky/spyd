import { isSameDimension } from '../../../../combination/ids.js'
import { getCombinationNameWidth } from '../../../utils/name.js'
import { getResponsiveColumns } from '../../../utils/responsive.js'
import {
  COLUMN_SEPARATOR,
  STATS_SEPARATOR,
  STATS_SEPARATOR_COLORED,
} from '../../../utils/separator.js'

import { getHeaderName, getHeaderLengths } from './header.js'
import { getStatLength } from './row.js'

// Retrieve all columns and their stats
export const getColumns = function (history, combinations) {
  return history.map((historyResult) => getColumn(historyResult, combinations))
}

const getColumn = function (historyResult, combinations) {
  const headerName = getHeaderName(historyResult)
  const cellStats = combinations.map((combination) =>
    getCellStat(historyResult, combination),
  )
  return { headerName, cellStats }
}

const getCellStat = function (historyResult, combination) {
  const historyCombinationA = historyResult.combinations.find(
    (historyCombination) => isSameDimension(historyCombination, combination),
  )

  if (historyCombinationA === undefined) {
    return
  }

  const {
    stats: { median, medianMin, medianMax },
  } = historyCombinationA
  return medianMin === undefined
    ? median
    : {
        pretty: `${medianMin.pretty}${STATS_SEPARATOR}${medianMax.pretty}`,
        prettyColor: `${medianMin.prettyColor}${STATS_SEPARATOR_COLORED}${medianMax.prettyColor}`,
      }
}

export const getColumnWidth = function (combinations, columns) {
  return Math.max(
    ...columns.map((column) => getStatColumnWidth(combinations, column)),
  )
}

const getStatColumnWidth = function (combinations, column) {
  const cellLengths = column.cellStats.filter(Boolean).map(getStatLength)
  return Math.max(...cellLengths, ...getHeaderLengths(column))
}

export const getAllColumns = function ({
  combinations,
  columns,
  screenWidth,
  columnWidth,
}) {
  const availableWidth = screenWidth - getCombinationNameWidth(combinations[0])
  return getResponsiveColumns({
    availableWidth,
    columnWidth,
    separatorWidth: COLUMN_SEPARATOR.length,
    columns,
  })
}
