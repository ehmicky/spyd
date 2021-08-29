import { prettifyStats } from '../../../utils/stats/main.js'

// Prettify the stats of `result.history`
export const prettifyHistoryResults = function (history) {
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
