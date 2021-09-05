import { isSameDimension } from '../../../combination/ids.js'
import { fieldColor } from '../../utils/colors.js'
import { getCombinationNameColor } from '../../utils/name.js'
import { STATS_SEPARATOR_COLORED } from '../../utils/separator.js'
import { getTables } from '../../utils/table.js'

// Show `result.history` as a time series
export const getTimeSeries = function (history, combinations, screenWidth) {
  const headerRows = getHeaderRows(history)
  const bodyRows = getBodyRows(combinations, history)
  return getTables([...headerRows, ...bodyRows], screenWidth)
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
    stats: { mean, meanMin, meanMax },
  } = historyCombinationA

  if (meanMin !== undefined) {
    return `${meanMin.prettyColor}${STATS_SEPARATOR_COLORED}${meanMax.prettyColor}`
  }

  if (mean !== undefined) {
    return mean.prettyColor
  }

  return ''
}
