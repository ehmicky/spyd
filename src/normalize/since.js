import { isSameCategory } from '../combination/ids.js'
import { findByDelta } from '../delta/main.js'
import { mergeSystems } from '../system/merge.js'

// The `since` configuration property is used to:
//  - Limit the number of results shown in `result.history` which is used with
//    time series reporters.
//  - Specify which previous reports should be merged to the current one with
//    `show|remove` commands
// It is purposely not used for `stats.diff`
//  - The `diff` configuration property is used for it instead. It is based on
//    all previous results regardless of `since`
//  - This decouples both features which is easier to understand
// `since` is relative to the reported result:
//  - For `bench`, this is the result being created
//  - For `show|remove`, this is the result being reported.
//     - This ensures result reported with `show` are shown the same way as when
//       when they were measured.
//     - This is also simpler to understand since it always involves only two
//       bases (the reported result and the "since" result)
// Previous results are filtered by `select`
//  - This purposely impacts the resolution of `since`.
// `since` defaults to 0, i.e. must be opted in.
export const applySince = async function (previous, { since, cwd }) {
  const sinceIndex = await findByDelta(previous, since, cwd)
  return sinceIndex === -1 ? [] : previous.slice(sinceIndex)
}

// `show|remove` commands allow reporting several reports at once using the
// `since` configuration property:
//  - This reports the most recent combination of each sets of categories
//  - This only uses the results up to the result targeted by `since`
// We purposely do not apply this with the `bench` command
//  - Otherwise, users might be confused to see previous combinations being
//    reported even though they are not being measured
//  - However, users can perform several results and select combinations with
//    `select|tasks|runner|inputs|system` then report an aggregation of them
//    with the `show` command
//     - This allows incremental benchmarks
// We explicitly avoid trying to guess the current set of categories beyond
// the current filtering properties because it is difficult.
//  - Instead, we just rely on the `since` delta
//  - All combination categories can be changed dynamically with
//    configuration properties. We cannot whether missing combinations
//    were temporarily or permanently removed.
//  - This is especially true for systems. There is always only one system
//    per result. It is hard to know where/whether in the results history the
//    user intends to stop using each of the previously used systems.
export const mergeLastCombinations = function (result, previous) {
  // eslint-disable-next-line fp/no-mutating-methods
  return [...previous].reverse().reduce(mergePair, result)
}

const mergePair = function (result, previousResult) {
  const previousCombinations = getPreviousCombinations(
    previousResult.combinations,
    result.combinations,
  )

  if (previousCombinations.length === 0) {
    return result
  }

  return mergePreviousResult(result, previousResult, previousCombinations)
}

const getPreviousCombinations = function (previousCombinations, combinations) {
  return previousCombinations.filter(
    (combination) => !isSameCombination(combination, combinations),
  )
}

const isSameCombination = function (combination, combinations) {
  return combinations.some((combinationA) =>
    isSameCategory(combination, combinationA),
  )
}

// For each possible combination, if the last result already has it, we keep it.
// Otherwise, we copy the most recent one.
// When copying previous combinations, we do not remove them from the previous
// result. This means they are present both in the merged result and in
// `result.previous`. This is intentional as it allows reporters to clearly
// display both the merged result and the time each combination was
// actually measured.
// When merging two results, we keep most of the properties of the latest
// result. However, we still merge `system` so several systems are reported.
// This allows comparing different systems.
// We make sure the latest `combinations` are first in the merged array, so we
// can prioritize them.
const mergePreviousResult = function (
  { combinations, systems, ...result },
  { systems: previousSystems },
  previousCombinations,
) {
  const combinationsA = [...combinations, ...previousCombinations]
  const systemsA = mergeSystems(systems, previousSystems)
  return { ...result, combinations: combinationsA, systems: systemsA }
}
