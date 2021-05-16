import {
  getResultsCombinations,
  getMatchingCombination,
  getNewCombinations,
  addResultIds,
} from '../combination/result.js'
import { mergeSystems } from '../system/merge.js'

// The `since` configuration property allows reporting several reports at once:
//  - This reports the most recent combination of each sets of categories
//  - This only uses the results up to the result targeted by `since`
//  - This allows incremental benchmarks
// This applies not only to the `show|remove` commands but also to `bench`:
//  - This ensures `bench` and `show` report the same result and behave the
//    same way
//  - This allows users to compare results while measuring, using a single
//    command as opposed to having to use `bench` then `show`
//  - This focuses `show` command on its main purpose, i.e. historical viewing
//  - The `select` configuration property can be used if the user wants to diff
//    with a previous result but does not want adding the combinations of the
//    results in-between
//     - If the users want to use `select` to filter measuring but not
//       reporting, they should call `bench` then `show` instead
// We explicitly avoid trying to guess the current set of categories beyond
// the current filtering properties because it is difficult.
//  - Instead, we just rely on the `since` delta
//  - All combination categories can be changed dynamically with
//    configuration properties. We cannot know whether missing combinations
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

// Retrieve previous combinations the result should be merged with.
// Those are only the combinations with different categories.
const getPreviousCombinations = function (result, previous) {
  // eslint-disable-next-line fp/no-mutating-methods
  const previousA = [...previous].reverse().map(addResultIds)
  const previousCombinations = getResultsCombinations(previousA)
  const newCombinations = getNewCombinations(result, previousA)
  return newCombinations.map((newCombination) =>
    getMatchingCombination(previousCombinations, newCombination),
  )
}

// When merging two results, we keep most of the properties of the latest
// result. However, we still merge `system` so several systems are reported.
// This allows comparing different systems.
const mergePreviousCombination = function (previous, result, combination) {
  const combinations = [...result.combinations, combination]
  const previousResult = previous.find(({ id }) => id === combination.resultId)
  const systems = mergeSystems(result.systems, previousResult.systems)
  return { ...result, combinations, systems }
}
