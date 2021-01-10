import omit from 'omit.js'

import { getCombinationIds } from '../select/ids.js'

import { getDiffIndex, getDiff } from './diff.js'
import { addLimits, isSlow } from './limit.js'

// Add:
//  - `result.previous`: all previous results
// This also adds `combination.stats.diff|slow|limit`
//   - Not persisted in stores since it can be computed dynamically
//   - Also, the "previous" result might change depending on selection or after
//     results removals
export const compareResults = function (results, { diff, limit }) {
  const diffIndex = getDiffIndex(results, diff)
  return results.map(addCombinationKeys).map((result, index, resultsA) =>
    addResultPrevious(result, resultsA.slice(0, index - 1), {
      diffIndex,
      limit,
    }),
  )
}

// Add stable key describing combinations identity
const addCombinationKeys = function ({ combinations, ...result }) {
  const combinationsA = combinations.map(addCombinationKey)
  return { ...result, combinations: combinationsA }
}

const addCombinationKey = function (combination) {
  const key = getCombinationIds(combination).join(' ')
  return { ...combination, key }
}

const addResultPrevious = function (
  { combinations, ...result },
  previous,
  { diffIndex, limit },
) {
  const combinationsA = addLimits(combinations, limit)
  const combinationsB = addPreviousCombinations({
    combinations: combinationsA,
    previous,
    diffIndex,
  })
  const previousA = previous.map(removeCombinations)
  return { ...result, combinations: combinationsB, previous: previousA }
}

const addPreviousCombinations = function ({
  combinations,
  previous,
  diffIndex,
}) {
  const previousCombinations = previous.flatMap(getCombinations)
  return combinations.map((combination) =>
    addPreviousCombination({
      combination,
      previousCombinations,
      diffIndex,
    }),
  )
}

const getCombinations = function ({ combinations }, result) {
  return combinations.map((combination) => ({ ...combination, result }))
}

const addPreviousCombination = function ({
  combination,
  combination: { stats },
  previousCombinations,
  diffIndex,
}) {
  const previous = previousCombinations.filter((previousCombination) =>
    isSameCombination(combination, previousCombination),
  )
  const diff = getDiff(previous, diffIndex, stats)
  const slow = isSlow(combination, diff)
  return { ...combination, stats: { ...stats, diff, slow } }
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
