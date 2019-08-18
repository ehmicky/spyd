import { getLimit } from '../limit/main.js'
import { omit } from '../utils/main.js'

import { getDiffIndex, getDiff } from './diff.js'
import { normalizeStats } from './stats/main.js'

// Add:
//  - `benchmark.previous`: all previous benchmarks
//  - `benchmark.iterations[*].previous`: previous iteration with same runner,
//    task and variation
export const addPrevious = function(
  benchmarks,
  { timestamp, iterations, ...benchmark },
  { limits, diff, verbose },
) {
  // When combined with the 'show' option, we only show the benchmarks before it
  // We exclude benchmarks from the same job (since they are already grouped
  // by job).
  const previous = benchmarks.filter(
    benchmarkA => benchmarkA.timestamp < timestamp,
  )
  const diffIndex = getDiffIndex(previous, diff)
  const iterationsA = addPreviousIterations({
    iterations,
    previous,
    diffIndex,
    limits,
    verbose,
  })

  const previousA = previous.map(removeIterations)
  return {
    ...benchmark,
    timestamp,
    iterations: iterationsA,
    previous: previousA,
  }
}

const addPreviousIterations = function({
  iterations,
  previous,
  diffIndex,
  limits,
  verbose,
}) {
  const previousIterations = previous.flatMap(getIterations)
  const iterationsA = iterations.map(iteration =>
    addPreviousIteration({ iteration, previousIterations, diffIndex, limits }),
  )
  // Needs to be done again since we added `diff` and `limit`
  const iterationsB = normalizeStats(iterationsA, verbose)
  return iterationsB
}

const getIterations = function({ iterations }, benchmark) {
  return iterations.map(iteration => ({ ...iteration, benchmark }))
}

const addPreviousIteration = function({
  iteration,
  iteration: { stats },
  previousIterations,
  diffIndex,
  limits,
}) {
  const previous = previousIterations.filter(previousIteration =>
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

const isSameIteration = function(iterationA, iterationB) {
  return (
    iterationA.taskId === iterationB.taskId &&
    iterationA.variationId === iterationB.variationId &&
    iterationA.commandId === iterationB.commandId &&
    iterationA.envId === iterationB.envId
  )
}

const removeIterations = function(benchmark) {
  return omit(benchmark, ['iterations'])
}
