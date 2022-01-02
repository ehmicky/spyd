import { keepResultCombinations } from '../../combination/result.js'
import { selectRawResult } from '../../select/main.js'
import { validateMatches } from '../../select/validate.js'

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
export const normalizeRawResults = function (targetResult, history, config) {
  const historyA = filterUnusedCombinations(history, targetResult)
  const [targetResultA, ...historyB] = [targetResult, ...historyA].map(
    (rawResult) => normalizeRawResult(rawResult, config),
  )
  validateMatches(targetResultA, config)
  return { targetResult: targetResultA, history: historyB }
}

// We ignore the combinations from history results that do not exist in the
// target result.
// This simplifies both the implementation and the user experience.
const filterUnusedCombinations = function (history, targetResult) {
  return history.map((rawResult) =>
    keepResultCombinations(rawResult, targetResult),
  )
}

const normalizeRawResult = function (rawResult, { select }) {
  return selectRawResult(rawResult, select)
}
