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

// Transform:
//  - A `rawResult`:
//     - Used by the measuring logic and persisted in result files
//  - To a `result`:
//     - Used by the reporting logic
// We make sure the two are not mixed
//  - For example, merged combinations should be reported, but not measured,
//    previewed nor saved
//  - And merged systems and default ids should not be saved
// Also apply history normalization logic which depends on knowing all possible
// combinations of the target result.
// This is applied on any new result created by the `run` command.
export const normalizeNewResults = function (targetResult, history) {
  const { history: historyA, targetResult: targetResultA } = mergeResults(
    history,
    targetResult,
  )
  const historyB = normalizeHistory(historyA, targetResultA)
  return { targetResult: targetResultA, history: historyB }
}

// Same but applies to results loaded exclusively from the history by the
// `show|remove` commands.
// We apply `select` on all combinations of the target result.
//  - Unlike the `new` command, which applies it only on the new combinations,
//    not the ones merged to the target result
//     - Otherwise, `select` would most likely filter out all of those
//       merged combinations
//     - This would be bad as:
//        - This would require a separate `show` command to see the merged
//          result
//        - Merging is meant as a continuation of the same result, i.e. already
//          measured combinations are expected to be reported
//     - The core issue is due to `select` having two purposes with the `run`
//       command: restricting measuring and reporting
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
