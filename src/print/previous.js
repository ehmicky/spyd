import omit from 'omit.js'

import { getLimit } from '../limit/main.js'

import { getDiffIndex, getDiff } from './diff.js'
import { normalizeStats } from './stats/main.js'

// Add:
//  - `benchmark.previous`: all previous benchmarks
//  - `benchmark.iterations[*].previous`: previous iteration with same runner,
//    task and input
export const addPrevious = function (
  benchmarks,
  { timestamp, iterations, ...benchmark },
  { limits, diff },
) {
  // When combined with the 'show' option, we only show the benchmarks before it
  // We exclude benchmarks from the same mergeId (since they are already merged)
  const previous = benchmarks.filter(
    (benchmarkA) => benchmarkA.timestamp < timestamp,
  )
  const diffIndex = getDiffIndex(previous, diff)
  const iterationsA = addPreviousIterations({
    iterations,
    previous,
    diffIndex,
    limits,
  })

  const previousA = previous.map(removeIterations)
  return {
    ...benchmark,
    timestamp,
    iterations: iterationsA,
    previous: previousA,
  }
}

const addPreviousIterations = function ({
  iterations,
  previous,
  diffIndex,
  limits,
}) {
  const previousIterations = previous.flatMap(getIterations)
  const iterationsA = iterations.map((iteration) =>
    addPreviousIteration({ iteration, previousIterations, diffIndex, limits }),
  )
  // Needs to be done again since we added `diff` and `limit`
  const iterationsB = normalizeStats(iterationsA)
  return iterationsB
}

const getIterations = function ({ iterations }, benchmark) {
  return iterations.map((iteration) => ({ ...iteration, benchmark }))
}

const addPreviousIteration = function ({
  iteration,
  iteration: { stats },
  previousIterations,
  diffIndex,
  limits,
}) {
  const previous = previousIterations.filter((previousIteration) =>
    isSameIteration(iteration, previousIteration),
  )
  const { previousMedian, diff } = getDiff(previous, diffIndex, stats)
  const { limit, slow, slowError } = getLimit({
    iteration,
    limits,
    previousMedian,
    diff,
  })
  return {
    ...iteration,
    stats: { ...stats, diff, limit },
    slow,
    slowError,
    previous,
  }
}

const isSameIteration = function (iterationA, iterationB) {
  return (
    iterationA.taskId === iterationB.taskId &&
    iterationA.inputId === iterationB.inputId &&
    iterationA.commandId === iterationB.commandId &&
    iterationA.systemId === iterationB.systemId
  )
}

const removeIterations = function (benchmark) {
  return omit(benchmark, ['iterations'])
}
