import {
  getNewIdInfos,
  getIdInfos,
  isSameIdInfos,
  isSameCategory,
} from '../combination/ids.js'
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
// Also add `result.history` pointing to previous results after `since` fitering
// This includes the current result:
//  - For `show|remove`, this is the result targeted by delta
//  - For `bench`, this is the currently measured result
//  - This allows time series reporters to use `result.history`
//     - Since those should report the current result not normalized,
//       i.e. before `mergeLastCombinations` with `show|remove`
//  - We ensure that that result has the same shape as other history results,
//    i.e. before normalization
// We do not expose some `combination.history` property
//  - This would complicate the data model by creating copies of the same
//    properties.
//  - Instead, reporters should use logic to retrieve the history of each
//    combination
export const applySince = async function (result, previous, { since, cwd }) {
  const sinceIndex = await findByDelta(previous, since, cwd)
  return sinceIndex === -1
    ? applyDefaultSince(result, previous)
    : applyRegularSince(result, previous, sinceIndex)
}

const applyDefaultSince = function (result, previous) {
  const sinceResult = previous[previous.length - 1]
  const history = sinceResult === undefined ? [result] : [sinceResult, result]
  return { ...result, history }
}

const applyRegularSince = function (result, previous, sinceIndex) {
  const beforeSince = previous.slice(0, sinceIndex)
  const sinceResult = previous[sinceIndex]
  const afterSince = previous.slice(sinceIndex + 1)

  const mergedResult = mergeResults(result, [sinceResult, ...afterSince])
  const sinceResultA = mergeResults(sinceResult, beforeSince)
  const sinceResultB = removeCombinations(sinceResultA, mergedResult)
  const history = [sinceResultB, ...afterSince, result]
  return { ...mergedResult, history }
}

const removeCombinations = function (result, resultA) {
  const combinations = result.combinations.filter((combination) =>
    matchesCombinations(combination, resultA),
  )
  return { ...result, combinations }
}

const matchesCombinations = function (combination, result) {
  return result.combinations.some((combinationA) =>
    isSameCategory(combination, combinationA),
  )
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
const mergeResults = function (result, previous) {
  const previousCombinations = getPreviousCombinations(result, previous)
  return previousCombinations.reduce(mergePreviousCombination, result)
}

// Retrieve previous combinations the result should be merged with
const getPreviousCombinations = function (result, previous) {
  // eslint-disable-next-line fp/no-mutating-methods
  const previousA = [...previous].reverse()
  const previousCombinations = previousA.flatMap(getCombinations)
  const newIdInfos = getNewIdInfos(result, previousA)
  return newIdInfos.map((idInfos) =>
    getPreviousCombination(previousCombinations, idInfos),
  )
}

const getCombinations = function (result) {
  return result.combinations.map((combination) => ({
    combination,
    idInfos: getIdInfos(combination),
    result,
  }))
}

const getPreviousCombination = function (previousCombinations, idInfos) {
  return previousCombinations.find((previousCombination) =>
    isSameIdInfos(previousCombination.idInfos, idInfos),
  )
}

// For each possible combination, if the last result already has it, we keep it.
// Otherwise, we copy the most recent one.
// When copying previous combinations, we do not remove them from the previous
// result. This means they are present both in the merged result and in
// `result.history`. This is intentional as it allows reporters to clearly
// display both the merged result and the time each combination was
// actually measured.
// When merging two results, we keep most of the properties of the latest
// result. However, we still merge `system` so several systems are reported.
// This allows comparing different systems.
// We make sure the latest `combinations` are first in the merged array, so we
// can prioritize them.
const mergePreviousCombination = function (
  result,
  { combination, result: { systems } },
) {
  const combinationsA = [...result.combinations, combination]
  const systemsA = mergeSystems(result.systems, systems)
  return { ...result, combinations: combinationsA, systems: systemsA }
}
