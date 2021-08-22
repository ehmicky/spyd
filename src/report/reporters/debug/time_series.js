import { isSameDimension } from '../../../combination/ids.js'
import {
  getCombinationNameColor,
  getCombinationNameWidth,
} from '../../utils/name.js'
import { getResponsiveColumns } from '../../utils/responsive.js'
import { SEPARATOR_WIDTH, COLUMN_SEPARATOR } from '../../utils/separator.js'
import { prettifyStats } from '../../utils/stats/main.js'

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
    getCell(historyCombinations, combination),
  )
}

const getCell = function (historyCombinations, combination) {
  const historyCombinationA = historyCombinations.find((historyCombination) =>
    isSameDimension(historyCombination, combination),
  )

  // No matching previous combination
  if (historyCombinationA === undefined) {
    return { pretty: '', prettyColor: '' }
  }

  const {
    stats: { median, medianMin, medianMax },
  } = historyCombinationA

  // `showPrecision` is `false`
  if (combination.stats.median !== undefined) {
    return median
  }

  // Due to not enough measures
  if (medianMin !== undefined && medianMin.pretty !== '') {
    return {
      pretty: `${medianMin.pretty}-${medianMax.pretty}`,
      prettyColor: `${medianMin.prettyColor}-${medianMax.prettyColor}`,
    }
  }

  return { pretty: '', prettyColor: '' }
}

const getColumnWidth = function (columns) {
  const widths = columns.flat().map(getWidth)
  return Math.max(...widths)
}

const getAllColumns = function ({
  combinations,
  columns,
  screenWidth,
  columnWidth,
}) {
  const availableWidth = screenWidth - getCombinationNameWidth(combinations[0])
  return getResponsiveColumns({
    availableWidth,
    columnWidth,
    separatorWidth: SEPARATOR_WIDTH,
    columns,
  })
}

const getTable = function (combinations, columns, columnWidth) {
  return combinations
    .map((combination, rowIndex) =>
      getRow({ combination, rowIndex, columns, columnWidth }),
    )
    .join('\n')
}

const getRow = function ({ combination, rowIndex, columns, columnWidth }) {
  const combinationName = getCombinationNameColor(combination)
  const cells = columns
    .map((column) => padCell(column[rowIndex], columnWidth))
    .join(COLUMN_SEPARATOR)
  return `${combinationName}${cells}`
}

const padCell = function (cell, columnWidth) {
  const paddingWidth = columnWidth - getWidth(cell)
  const padding = ' '.repeat(paddingWidth)
  return `${padding}${cell.prettyColor}`
}

const getWidth = function ({ pretty }) {
  return pretty.length
}
