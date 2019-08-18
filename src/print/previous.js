import { omitBy } from '../utils/main.js'

import { getDiffIndex, getDiff } from './diff.js'

// Add:
//  - `benchmark.previous`: all previous benchmarks
//  - `benchmark.iterations[*].previous`: previous iteration with same runner,
//    task and variation
export const addPrevious = function({
  benchmarks,
  benchmark: { timestamp, job },
  iterations,
  diff,
  verbose,
  addPrintedInfo,
}) {
  // Nested calls: we do not add `previous` to `previous` itself
  if (benchmarks === undefined) {
    return { iterations }
  }

  // When combined with the 'show' option, we only show the benchmarks before it
  // We exclude benchmarks from the same job.
  const previous = benchmarks.filter(
    benchmarkA => benchmarkA.timestamp < timestamp && benchmarkA.job !== job,
  )
  const diffIndex = getDiffIndex(previous, diff)

  // Apply `addPrintedInfo()` recursively on the `previous` benchmarks
  const previousA = previous.map(benchmark =>
    addPrintedInfo(benchmark, { diff, verbose }),
  )

  const iterationsA = addPreviousIterations(iterations, previousA, diffIndex)
  const previousB = previousA.map(removeIterations)
  return { iterations: iterationsA, previous: previousB }
}

const addPreviousIterations = function(iterations, previous, diffIndex) {
  const previousIterations = previous.flatMap(getIterations)
  return iterations.map(iteration =>
    addPreviousIteration(iteration, previousIterations, diffIndex),
  )
}

const getIterations = function({ iterations }, benchmark) {
  return iterations.map(iteration => ({ ...iteration, benchmark }))
}

const addPreviousIteration = function(
  { stats, ...iteration },
  previousIterations,
  diffIndex,
) {
  const previous = previousIterations.filter(previousIteration =>
    isSameIteration(iteration, previousIteration),
  )
  const diff = getDiff(previous, diffIndex, stats)
  return { ...iteration, stats: { ...stats, diff }, previous }
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
  return omitBy(benchmark, key => key === 'iterations')
}
