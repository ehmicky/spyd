import { isSameDimension } from '../../../../combination/ids.js'
import { getCombinationNameWidth } from '../../../utils/name.js'
import { getResponsiveColumns } from '../../../utils/responsive.js'
import { SEPARATOR_WIDTH } from '../../../utils/separator.js'
import { prettifyStats } from '../../../utils/stats/main.js'

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

export const getColumnWidth = function (columns) {
  const widths = columns.flat().filter(Boolean).map(getStatLength)
  return Math.max(...widths)
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
    separatorWidth: SEPARATOR_WIDTH,
    columns,
  })
}
