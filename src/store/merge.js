import { addCombinationsDiff } from '../compare/diff.js'
import { groupResultCombinations } from '../normalize/group.js'
import { isSameCategory } from '../select/ids.js'
import {
  startMergeSystems,
  mergeSystems,
  endMergeSystems,
} from '../system/merge.js'

// Merge previous results to the last result.
// We add `result.previous` so that previous results can be reported. This array
// of results has the same shape as the merged result except for the properties
// added during merge (`previous` and `combinations[*].stats.diff`). This allows
// reporters to re-use code when displaying them.
export const mergeResults = function ([lastResult, ...previous]) {
  const result = mergePairs(lastResult, previous)
  const resultA = addCombinationsDiff(result, previous)
  const resultB = groupResultCombinations(resultA)
  return { ...resultB, previous }
}

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
const mergePairs = function (lastResult, previous) {
  const lastResultA = startMergeSystems(lastResult)
  const lastResultB = previous.reduce(mergePair, lastResultA)
  const lastResultC = endMergeSystems(lastResultB)
  return lastResultC
}

const mergePair = function (
  { combinations, ...result },
  { combinations: previousCombinations, ...previousResult },
) {
  const newCombinations = getNewCombinations(previousCombinations, combinations)

  if (newCombinations.length === 0) {
    return { ...result, combinations }
  }

  return mergePreviousResult(result, {
    ...previousResult,
    combinations: newCombinations,
  })
}

// When merging two results, we keep most of the properties of the latest
// result. However, we still merge `system` so several systems are reported.
// This allows comparing different systems.
const mergePreviousResult = function (
  { combinations, systems, ...result },
  { combinations: newCombinations, system: previousSystem },
) {
  const combinationsA = [...combinations, ...newCombinations]
  const systemsA = mergeSystems(systems, previousSystem)
  const resultA = { ...result, combinations: combinationsA, systems: systemsA }
  return resultA
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
