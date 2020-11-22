import omit from 'omit.js'

import { getLimit } from '../limit/main.js'

import { getDiffIndex, getDiff } from './diff.js'

// Add:
//  - `benchmark.previous`: all previous benchmarks
//  - `benchmark.combinations[*].previous`: previous combination with same
//    runner, task and input
export const addPrevious = function (
  benchmarks,
  { timestamp, combinations, ...benchmark },
  { limits, diff },
) {
  // When combined with the 'show' option, we only show the benchmarks before it
  // We exclude benchmarks from the same mergeId (since they are already merged)
  const previous = benchmarks.filter(
    (benchmarkA) => benchmarkA.timestamp < timestamp,
  )
  const diffIndex = getDiffIndex(previous, diff)
  const combinationsA = addPreviousCombinations({
    combinations,
    previous,
    diffIndex,
    limits,
  })

  const previousA = previous.map(removeCombinations)
  return {
    ...benchmark,
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

const getCombinations = function ({ combinations }, benchmark) {
  return combinations.map((combination) => ({ ...combination, benchmark }))
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
    combinationA.inputId === combinationB.inputId &&
    combinationA.commandId === combinationB.commandId &&
    combinationA.systemId === combinationB.systemId
  )
}

const removeCombinations = function (benchmark) {
  return omit(benchmark, ['combinations'])
}
