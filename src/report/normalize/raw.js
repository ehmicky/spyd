import { addDefaultIds } from '../../combination/default.js'
import { getNoDimensions } from '../../combination/filter.js'
import { keepResultCombinations } from '../../combination/result.js'
import { mergeResults } from '../../history/merge/results.js'
import { selectResult } from '../../select/main.js'

// Transform:
//  - A `rawResult`: persisted in result files
//  - To a `result`: used by the reporting logic
// Applied to several rawResults: targetResult and history.
// We make sure the two are not mixed:
//  - For example, merged combinations should be reported, but not measured,
//    previewed nor saved
//  - And merged systems and default ids should not be saved
// Also apply history normalization logic which depends on knowing all possible
// combinations of the target result.
// `select` is applied:
//  - On all combinations of the target result with `show|remove`
//  - But only on merged combinations, not new combinations, with `run`
//  - Otherwise, `select` would most likely filter out all of those
//    merged combinations
//  - This would be bad as:
//     - This would require a separate `show` command to see the merged
//       result
//     - Merging is meant as a continuation of the same result, i.e. already
//       measured combinations are expected to be reported
//  - The core issue is due to `select` having two purposes with the `run`
//    command: restricting measuring and reporting
export const normalizeReportedResults = (targetResult, history, { select }) => {
  const { history: historyA, targetResult: targetResultA } = mergeResults(
    history,
    targetResult,
  )
  const targetResultB = selectResult(targetResultA, select)
  const { combinations } = targetResultB
  const historyB = addDefaultIds(historyA, combinations)
  const historyC = filterUnusedCombinations(historyB, combinations)
  const noDimensions = getNoDimensions(combinations)
  return { result: targetResultB, history: historyC, noDimensions }
}

// We ignore the combinations from history results that do not exist in the
// target result.
// This simplifies both the implementation and the user experience.
const filterUnusedCombinations = (history, combinations) =>
  history.map((historyResult) =>
    keepResultCombinations(historyResult, combinations),
  )
