import { isSameDimension } from '../../../../combination/ids.js'
import { prettifyStats } from '../../../utils/stats/main.js'

import { getAllColumns } from './columns.js'
import { getRow, getStatLength } from './row.js'

// Show `result.history` as a time series
export const getTimeSeries = function (history, combinations, screenWidth) {
  const allCombinations = history.flatMap(getCombinations)
  const columns = history.map((historyResult) =>
    getColumn(historyResult, combinations, allCombinations),
  )
  const columnWidth = getColumnWidth(columns)
  const allColumns = getAllColumns({
    combinations,
    columns,
    screenWidth,
    columnWidth,
  })
  return allColumns.map((columnsA) =>
    getTable(combinations, columnsA, columnWidth),
  )
}

const getCombinations = function ({ combinations }) {
  return combinations
}

const getColumn = function (historyResult, combinations, allCombinations) {
  const historyCombinations = prettifyStats(
    historyResult.combinations,
    allCombinations,
  )
  return combinations.map((combination) =>
    getCellStat(historyCombinations, combination),
  )
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
    pretty: `${medianMin.pretty}-${medianMax.pretty}`,
    prettyColor: `${medianMin.prettyColor}-${medianMax.prettyColor}`,
  }
}

const getColumnWidth = function (columns) {
  const widths = columns.flat().filter(Boolean).map(getStatLength)
  return Math.max(...widths)
}

const getTable = function (combinations, columns, columnWidth) {
  return combinations
    .map((combination, rowIndex) =>
      getRow({ combination, rowIndex, columns, columnWidth }),
    )
    .join('\n')
}
