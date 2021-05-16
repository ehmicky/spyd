import {
  getResultsCombinations,
  getMatchingCombination,
  getNewCombinations,
} from '../combination/result.js'
import { mergeSystems } from '../system/merge.js'

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
export const mergeResults = function (result, previous) {
  const previousCombinations = getPreviousCombinations(result, previous)
  return previousCombinations.reduce(
    mergePreviousCombination.bind(undefined, previous),
    result,
  )
}

// Retrieve previous combinations the result should be merged with
const getPreviousCombinations = function (result, previous) {
  // eslint-disable-next-line fp/no-mutating-methods
  const previousA = [...previous].reverse()
  const previousCombinations = getResultsCombinations(previousA)
  const newCombinations = getNewCombinations(result, previousA)
  return newCombinations.map((newCombination) =>
    getMatchingCombination(previousCombinations, newCombination),
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
const mergePreviousCombination = function (previous, result, combination) {
  const combinations = [...result.combinations, combination]
  const previousResult = previous.find(({ id }) => id === combination.resultId)
  const systems = mergeSystems(result.systems, previousResult.systems)
  return { ...result, combinations, systems }
}
