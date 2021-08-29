import { isSameDimension } from '../../../combination/ids.js'
import { fieldColor } from '../../utils/colors.js'
import { getCombinationNamePadded } from '../../utils/name.js'
import {
  STATS_SEPARATOR,
  STATS_SEPARATOR_COLORED,
} from '../../utils/separator.js'
import { prettifyStats } from '../../utils/stats/main.js'

import { getTables } from './common/main.js'

// Show `result.history` as a time series
export const getTimeSeries = function (history, combinations, screenWidth) {
  const firstColumn = combinations.map(getCombinationNamePadded)
  const historyA = prettifyHistoryResults(history)
  const columns = historyA.map((historyResult) =>
    getColumn(historyResult, combinations),
  )
  return getTables(firstColumn, columns, screenWidth)
}

// Prettify the stats of `result.history`
const prettifyHistoryResults = function (history) {
  const allCombinations = history.flatMap(getCombinations)
  return history.map((historyResult) =>
    prettifyHistoryResult(historyResult, allCombinations),
  )
}

const getCombinations = function ({ combinations }) {
  return combinations
}

const prettifyHistoryResult = function (historyResult, allCombinations) {
  const combinations = prettifyStats(
    historyResult.combinations,
    allCombinations,
  )
  return { ...historyResult, combinations }
}

const getColumn = function (historyResult, combinations) {
  const headerNames = getHeaderNames(historyResult)
  const cellStats = combinations.map((combination) =>
    getCellStat(historyResult, combination),
  )
  return { headerNames, cellStats }
}

const getHeaderNames = function ({ timestamp }) {
  const [day, ...timeAndTimezone] = timestamp.split(' ')
  const time = timeAndTimezone.join(' ')
  return [fieldColor(day), fieldColor(time), '']
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
