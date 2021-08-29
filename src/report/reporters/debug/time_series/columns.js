import { isSameDimension } from '../../../../combination/ids.js'
import {
  STATS_SEPARATOR,
  STATS_SEPARATOR_COLORED,
} from '../../../utils/separator.js'

// Retrieve all columns and their stats
export const getColumns = function (history, combinations) {
  return history.map((historyResult) => getColumn(historyResult, combinations))
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
  return [day, time, '']
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
