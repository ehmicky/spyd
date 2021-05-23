import { isSameCategory } from '../../../combination/ids.js'
import { titleColor } from '../../utils/colors.js'
import { prettifyStats } from '../../utils/stats/main.js'
import { getCombinationName } from '../../utils/title.js'

// Show `result.history` as a time series
export const getTimeSeries = function (history, combinations) {
  const timeSeries = combinations.map((combination) =>
    getTimeSerie(history, combination),
  )
  const columnWidth = getColumnWidth(timeSeries)
  const rows = timeSeries.map((timeSerie) => getRow(timeSerie, columnWidth))
  return rows
}

const getTimeSerie = function (history, combination) {
  const title = getTitle(combination)
  const medians = history.map((result) => getMedian(result, combination))
  return { title, medians }
}

const getTitle = function ({ titles }) {
  return titleColor(getCombinationName(titles))
}

const getMedian = function (result, combination) {
  const combinations = prettifyStats(result.combinations)
  const combinationB = combinations.find((combinationA) =>
    isSameCategory(combinationA, combination),
  )

  if (combinationB === undefined) {
    return { pretty: '', prettyColor: '' }
  }

  return combinationB.stats.median
}

const getColumnWidth = function (timeSeries) {
  const medians = timeSeries.flatMap(getMediansProp)
  return Math.max(...medians)
}

const getMediansProp = function ({ medians }) {
  return medians.map(getLength)
}

const getRow = function ({ title, medians }, columnWidth) {
  const columns = medians
    .map((median) => getColumn(median, columnWidth))
    .join(' ')
  return `${title}  ${columns}`
}

const getColumn = function (median, columnWidth) {
  const paddingWidth = Math.max(columnWidth - getLength(median), 0)
  const padding = ' '.repeat(paddingWidth)
  return `${padding}${median.prettyColor}`
}

const getLength = function ({ pretty }) {
  return pretty.length
}
