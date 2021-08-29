import { getTables } from '../common/main.js'

import { getColumns } from './columns.js'
import { prettifyHistoryResults } from './history.js'

// Show `result.history` as a time series
export const getTimeSeries = function (history, combinations, screenWidth) {
  const historyA = prettifyHistoryResults(history)
  const columns = getColumns(historyA, combinations)
  return getTables(combinations, columns, screenWidth)
}
