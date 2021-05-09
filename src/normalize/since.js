import { isSameCategory } from '../combination/ids.js'
import { findByDelta } from '../delta/main.js'
import { mergeSystems } from '../system/merge.js'

// The `since` configuration property is used to:
//  - Specify which result to compare to with `showDiff` and `limit`.
//  - Limit the number of results shown in `previous`.
//    This is useful with time series reporters.
// We use a single configuration property for both so it is simpler for users.
// `since` can never point to the reported result, only to previous results.
// `since` might not be able to resolve:
//  - For example, this happens when setting a specific `since` using an
//    absolute delta format (like `id`) and using the `show` command pointing
//    to an earlier result.
//  - When this happens, we ignore `showDiff`, `limit` and leave `previous`
//    empty.
//  - However, we still ignore when the `since` is erroneous from a syntax or
//    semantics standpoint.
// `since` is relative to the reported result:
//  - For `bench`, this is the result being created
//  - For `show` and `remove`, this is the result being reported.
//    This ensures result reported with `show` are shown the same way as when
//    when they were measured. This is also simpler to understand since it
//    always involves only two bases (the reported result and the "since"
//    result)
// Previous results are filtered by `select`. This purposely impacts the
// resolution of `since`.
export const applySince = async function (previous, { since, cwd }) {
  const sinceIndex = await findByDelta(previous, since, cwd)
  return sinceIndex === -1 ? [] : previous.slice(sinceIndex)
}

// Several configuration properties can be used to change the sets of
// combinations being measured: `select`, `tasks`, `runner`, `inputs`, `system`.
//  - This can also be used for incremental benchmarks.
// After measuring, only the measured combinations are reported.
//  - We do not show previously measured combinations with different
//    combinations for comparison.
//     - This is more predictable and avoid distracting users from the current
//       measuring.
//     - This also prevents showing previous categories that have been
//       intentionally removed from the configuration.
//  - We explictily avoid trying to guess the current set of categories beyond
//    the current filtering properties because it is difficult.
//     - All combination categories can be changed dynamically with
//       configuration properties. We cannot whether missing combinations
//       were temporarily or permanently removed.
//     - This is especially true for systems. There is always only one system
//       per result. It is hard to know where/whether in the results history the
//       user intends to stop using each of the previously used systems.
//  - To compare with other categories, one must use `show` after `bench` and
//    the `since` configuration property
//     - Including when comparing different systems
// If `previous` is empty due to the `since` property, this is noop.
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
