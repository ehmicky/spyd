import { isSameDimension } from '../../../combination/ids.js'
import { fieldColor } from '../../utils/colors.js'
import { getCombinationNameColor } from '../../utils/name.js'
import { STATS_SEPARATOR_COLORED } from '../../utils/separator.js'
import { prettifyStats } from '../../utils/stats/main.js'
import { getTables } from '../../utils/table.js'

// Show `result.history` as a time series
export const getTimeSeries = function (history, combinations, screenWidth) {
  const historyA = prettifyHistoryResults(history)
  const headerRows = getHeaderRows(historyA)
  const bodyRows = getBodyRows(combinations, historyA)
  return getTables([...headerRows, ...bodyRows], screenWidth)
}

// Prettify the stats of `result.history`
const prettifyHistoryResults = function (history) {
  const allCombinations = history.flatMap(getCombinations)
  return history.map((historyResult) => ({
    ...historyResult,
    combinations: prettifyStats(historyResult.combinations, allCombinations),
  }))
}

const getCombinations = function ({ combinations }) {
  return combinations
}

const getHeaderRows = function (history) {
  const timestamps = history.map(getTimestamp)
  return [
    ['', ...timestamps.map(getResultDay)],
    ['', ...timestamps.map(getResultTime)],
    [],
  ]
}

const getTimestamp = function ({ timestamp }) {
  return timestamp.split(' ')
}

const getResultDay = function ([day]) {
  return fieldColor(day)
}

const getResultTime = function ([, ...time]) {
  return fieldColor(time.join(' '))
}

const getBodyRows = function (combinations, history) {
  return combinations.map((combination) => getBodyRow(combination, history))
}

const getBodyRow = function (combination, history) {
  const leftCell = getCombinationNameColor(combination)
  const rightCells = history.map((historyResult) =>
    getCell(historyResult, combination),
  )
  return [leftCell, ...rightCells]
}

const getCell = function (historyResult, combination) {
  const historyCombinationA = historyResult.combinations.find(
    (historyCombination) => isSameDimension(historyCombination, combination),
  )

  if (historyCombinationA === undefined) {
    return ''
  }

  const {
    stats: { median, medianMin, medianMax },
  } = historyCombinationA

  if (medianMin !== undefined) {
    return `${medianMin.prettyColor}${STATS_SEPARATOR_COLORED}${medianMax.prettyColor}`
  }

  if (median !== undefined) {
    return median.prettyColor
  }

  return ''
}
