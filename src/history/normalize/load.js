import { selectRawResult } from '../../select/main.js'

import { decompressRawResult } from './compress.js'
import { migrateRawResults } from './migrate.js'

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
  const [targetResultA, ...historyA] = [targetResult, ...history].map(
    (rawResult) => normalizeRawResult(rawResult, select),
  )
  return { targetResult: targetResultA, history: historyA }
}

const normalizeRawResult = function (rawResult, select) {
  return selectRawResult(rawResult, select)
}
