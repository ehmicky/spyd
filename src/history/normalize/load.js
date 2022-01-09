import { addDefaultIds } from '../../combination/default.js'
import { keepResultCombinations } from '../../combination/result.js'
import { selectRawResult } from '../../select/main.js'
import { mergeResults } from '../merge/results.js'

import { decompressRawResult } from './decompress.js'
import { migrateRawResults } from './migrate.js'

// Normalize rawResults after they have been loaded from result files.
export const loadRawResults = function (rawResults) {
  const rawResultsA = migrateRawResults(rawResults)
  const rawResultsB = rawResultsA.map(decompressRawResult)
  return rawResultsB
}

// Normalize the history and target results after the target result is known,
// as reporting starts.
// The result is only used by the reporting logic, not the measuring logic,
// and it is not persisted in result files.
// We separate into two functions: this one is for new results with `run`.
export const normalizeNewResults = function (targetResult, history) {
  const { history: historyA, targetResult: targetResultA } = mergeResults(
    history,
    targetResult,
  )
  const historyB = normalizeHistory(historyA, targetResultA)
  return { targetResult: targetResultA, history: historyB }
}

// Same but for previous results with `show|remove`.
export const normalizePreviousResults = function (
  targetResult,
  history,
  { select },
) {
  const { history: historyA, targetResult: targetResultA } = mergeResults(
    history,
    targetResult,
  )
  const targetResultB = selectRawResult(targetResultA, select)
  const historyB = normalizeHistory(historyA, targetResultB)
  return { targetResult: targetResultB, history: historyB }
}

const normalizeHistory = function (history, targetResult) {
  const historyA = addDefaultIds(history, targetResult)
  const historyB = filterUnusedCombinations(historyA, targetResult)
  return historyB
}

// We ignore the combinations from history results that do not exist in the
// target result.
// This simplifies both the implementation and the user experience.
const filterUnusedCombinations = function (history, targetResult) {
  return history.map((rawResult) =>
    keepResultCombinations(rawResult, targetResult),
  )
}
