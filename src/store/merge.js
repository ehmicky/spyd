import { addCombinationsDiff } from '../compare/diff.js'
import { isSameCategory } from '../select/ids.js'

// Merge previous results to the last result.
// We add `result.previous` so that previous results can be reported. This array
// of results has the same shape as the merged result except for the properties
// added during merge (`previous` and `combinations[*].stats.diff`). This allows
// reporters to re-use code when displaying them.
export const mergeResults = function ([lastResult, ...previous]) {
  const result = previous.reduce(mergePair, lastResult)
  const resultA = addCombinationsDiff(result, previous)
  return { ...resultA, previous }
}

// `include|exclude` can be used to measure specific combinations, allowing
// incremental benchmarks. However, when reporting benchmarks, we show all
// combinations:
// We do not want to show previous benchmarks' identifiers that have been
// intentionally deleted.
//  - However, we still want to show identifiers that have been only filtered
//    out.
//  - We do so by using the `include|exclude` configuration properties to filter
//    combinations to show.
//  - This is done in a previous step while loading results.
const mergePair = function (
  { combinations, ...result },
  { combinations: previousCombinations },
) {
  const newCombinations = getNewCombinations(previousCombinations, combinations)

  if (newCombinations.length === 0) {
    return { ...result, combinations }
  }

  const combinationsA = [...combinations, ...newCombinations]
  return { ...result, combinations: combinationsA }
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
