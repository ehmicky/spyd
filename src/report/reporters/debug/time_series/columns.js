import { isSameDimension } from '../../../../combination/ids.js'
import { getCombinationNameWidth } from '../../../utils/name.js'
import { getResponsiveColumns } from '../../../utils/responsive.js'
import {
  COLUMN_SEPARATOR,
  STATS_SEPARATOR,
  STATS_SEPARATOR_COLORED,
} from '../../../utils/separator.js'
import { prettifyStats } from '../../../utils/stats/main.js'

import { getHeaderName, getHeaderLengths } from './header.js'
import { getStatLength } from './row.js'

// Retrieve all columns and their stats
export const getColumns = function (history, combinations) {
  const allCombinations = history.flatMap(getCombinations)
  return history.map((historyResult) =>
    getColumn(historyResult, combinations, allCombinations),
  )
}

const getCombinations = function ({ combinations }) {
  return combinations
}

const getColumn = function (historyResult, combinations, allCombinations) {
  const headerName = getHeaderName(historyResult)
  const historyCombinations = prettifyStats(
    historyResult.combinations,
    allCombinations,
  )
  const cellStats = combinations.map((combination) =>
    getCellStat(historyCombinations, combination),
  )
  return { headerName, cellStats }
}

const getCellStat = function (historyCombinations, combination) {
  const historyCombinationA = historyCombinations.find((historyCombination) =>
    isSameDimension(historyCombination, combination),
  )

  // No matching previous combination
  if (historyCombinationA === undefined) {
    return
  }

  const {
    stats: { median, medianMin, medianMax },
  } = historyCombinationA

  // `showPrecision` is `false`
  if (combination.stats.medianMin === undefined) {
    return median
  }

  // Due to not enough measures
  if (medianMin === undefined) {
    return
  }

  return {
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
