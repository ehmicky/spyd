import omit from 'omit.js'

import { getLimit } from '../limit/main.js'

import { getDiffIndex, getDiff } from './diff.js'

// Add:
//  - `result.previous`: all previous results
//  - `result.combinations[*].previous`: previous combination with same
//    runner, task and input
// This also adds `combination.slow[Error]|stats.diff|limit`
//   - Not persisted in stores since it can be computed dynamically
//   - Also, the "previous" result might change depending on selection or after
//     results removals
export const addPrevious = function (
  results,
  { timestamp, combinations, ...result },
  { limits, diff },
) {
  // When combined with the 'show' configuration property, we only show the
  // results before it.
  // We exclude results from the same mergeId (since they are already merged)
  const previous = results.filter((resultA) => resultA.timestamp < timestamp)
  const diffIndex = getDiffIndex(previous, diff)
  const combinationsA = addPreviousCombinations({
    combinations,
    previous,
    diffIndex,
    limits,
  })

  const previousA = previous.map(removeCombinations)
  return {
    ...result,
    timestamp,
    combinations: combinationsA,
    previous: previousA,
  }
}

const addPreviousCombinations = function ({
  combinations,
  previous,
  diffIndex,
  limits,
}) {
  const previousCombinations = previous.flatMap(getCombinations)
  const combinationsA = combinations.map((combination) =>
    addPreviousCombination({
      combination,
      previousCombinations,
      diffIndex,
      limits,
    }),
  )
  return combinationsA
}

const getCombinations = function ({ combinations }, result) {
  return combinations.map((combination) => ({ ...combination, result }))
}

const addPreviousCombination = function ({
  combination,
  combination: { stats },
  previousCombinations,
  diffIndex,
  limits,
}) {
  const previous = previousCombinations.filter((previousCombination) =>
    isSameCombination(combination, previousCombination),
  )
  const { previousMedian, diff } = getDiff(previous, diffIndex, stats)
  const { limit, slow, slowError } = getLimit({
    combination,
    limits,
    previousMedian,
    diff,
  })
  return {
    ...combination,
    stats: { ...stats, diff, limit },
    slow,
    slowError,
    previous,
  }
}

const isSameCombination = function (combinationA, combinationB) {
  return (
    combinationA.taskId === combinationB.taskId &&
    combinationA.runnerId === combinationB.runnerId &&
    combinationA.systemId === combinationB.systemId
  )
}

const removeCombinations = function (result) {
  return omit(result, ['combinations'])
}
