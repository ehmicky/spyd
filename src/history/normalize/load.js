import { selectRawResult } from '../../select/main.js'

import { decompressRawResult } from './compress.js'
import { migrateRawResults } from './migrate.js'
import { filterUnusedCombinations } from './unused.js'

// Normalize rawResults on load
export const loadRawResults = function (rawResults) {
  const rawResultsA = migrateRawResults(rawResults)
  const rawResultsB = rawResultsA.map(decompressRawResult)
  return rawResultsB
}

// Normalize the history and target results after load, once the target result
// is known
export const normalizeRawResults = function (
  targetResult,
  history,
  { select },
) {
  const historyA = filterUnusedCombinations(history, targetResult)
  const [targetResultA, ...historyB] = [targetResult, ...historyA].map(
    (rawResult) => normalizeRawResult(rawResult, select),
  )
  return { targetResult: targetResultA, history: historyB }
}

const normalizeRawResult = function (rawResult, select) {
  return selectRawResult(rawResult, select)
}
