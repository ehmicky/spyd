import { isSameCategory } from '../combination/ids.js'
import { startMergeSystems, mergeSystems } from '../system/merge.js'

// `include|exclude` can be used to measure specific combinations, allowing
// incremental benchmarks. However, when reporting benchmarks, we show all
// combinations.
// We do not want to show previous benchmarks' identifiers that have been
// intentionally deleted.
//  - However, we still want to show identifiers that have been only filtered
//    out.
//  - We do so by using the `include|exclude` configuration properties to filter
//    combinations to show.
//  - This is done in a previous step while loading results.
// The set of possible combinations is guessed from the current
// `include`/`exclude` properties:
//  - We do not use the last measured combinations, nor try to guess what the
//    current set of possible combinations is.
//  - This is because guessing the current set of possible combinations is
//    difficult.
//     - All combination categories can be changed dynamically with
//       configuration properties. We cannot whether missing combinations
//       were temporarily or permanently removed.
//     - This is especially for systems. There is always only one system per
//       result. It is hard to know where/whether in the results history the
//       user intends to stop using each of the previously used systems.
//  - Instead, we just use any previous combinations matching the current
//    `include`/`exclude` properties. This is explicit and predictable.
export const mergeLastCombinations = function (lastResult, previous) {
  const lastResultA = startMergeSystems(lastResult)
  // eslint-disable-next-line fp/no-mutating-methods
  return [...previous].reverse().reduce(mergePair, lastResultA)
}

const mergePair = function (result, previousResult) {
  const newCombinations = getNewCombinations(
    previousResult.combinations,
    result.combinations,
  )

  if (newCombinations.length === 0) {
    return result
  }

  return mergePreviousResult(result, previousResult, newCombinations)
}

// When merging two results, we keep most of the properties of the latest
// result. However, we still merge `system` so several systems are reported.
// This allows comparing different systems.
// We make sure the latest `combinations` are first in the merged array, so we
// can prioritize them.
const mergePreviousResult = function (
  { combinations, systems, ...result },
  { system: previousSystem },
  newCombinations,
) {
  const combinationsA = [...combinations, ...newCombinations]
  const systemsA = mergeSystems(systems, previousSystem)
  return { ...result, combinations: combinationsA, systems: systemsA }
}

// For each possible combination, if the last result already has it, we keep it.
// Otherwise, we copy the most recent one.
// When copying previous combinations, we do not remove them from the previous
// result. This means they are present both in the merged result and in
// `result.previous`. This is intentional as it allows reporters to clearly
// display both the merged result and the time each combination was
// actually measured.
const getNewCombinations = function (previousCombinations, combinations) {
  return previousCombinations.filter((combination) =>
    isNewCombination(combination, combinations),
  )
}

const isNewCombination = function (combination, combinations) {
  return !combinations.some((combinationA) =>
    isSameCategory(combination, combinationA),
  )
}
