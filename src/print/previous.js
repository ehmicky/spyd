import { omitBy } from '../utils/main.js'

import { getDiffIndex, getDiff } from './diff.js'

// Add:
//  - `benchmark.previous`: all previous benchmarks
//  - `benchmark.iterations[*].previous`: previous iteration with same runner,
//    task and variation
// When combined with the 'show' option, we only show the benchmarks before it.
export const addPrevious = function({
  benchmarks,
  benchmark: { timestamp },
  iterations,
  show,
  diff,
  verbose,
  addPrintedInfo,
}) {
  if (benchmarks === undefined) {
    return { iterations }
  }

  const previous = benchmarks.filter(
    benchmarkA => benchmarkA.timestamp < timestamp,
  )
  const diffIndex = getDiffIndex(previous, diff)

  // Apply `addPrintedInfo()` recursively on the `previous` benchmarks
  const previousA = previous.map(benchmark =>
    addPrintedInfo(benchmark, { show, diff, verbose }),
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
    iterationA.task.id === iterationB.task.id &&
    iterationA.variation.id === iterationB.variation.id &&
    iterationA.command.id === iterationB.command.id
  )
}

const removeIterations = function(benchmark) {
  return omitBy(benchmark, key => key === 'iterations')
}
