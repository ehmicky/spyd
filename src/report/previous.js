import { omitBy } from '../utils/main.js'

import { getDiffIndex, getDiff } from './diff.js'

// Add:
//  - `benchmark.previous`: all previous benchmarks
//  - `benchmark.iterations[*].previous`: previous iteration with same runner,
//    task and variation
// When combined with the 'show' option, we only show the benchmarks before it.
export const addPrevious = async function({
  benchmark,
  benchmark: { timestamp, iterations },
  diff,
  dataDir,
  store: { list: listStore },
  nestedNormalize,
}) {
  if (nestedNormalize === undefined) {
    return benchmark
  }

  const benchmarks = await listBenchmarks(dataDir, listStore)
  const previous = benchmarks.filter(
    benchmarkA => benchmarkA.timestamp < timestamp,
  )
  const diffIndex = getDiffIndex(previous, diff)
  const previousA = await Promise.all(previous.map(nestedNormalize))
  const iterationsA = addPreviousIterations(iterations, previousA, diffIndex)
  const previousB = previousA.map(removeIterations)
  return { ...benchmark, previous: previousB, iterations: iterationsA }
}

const listBenchmarks = async function(dataDir, listStore) {
  try {
    return await listStore(dataDir)
  } catch (error) {
    throw new Error(
      `Could not list benchmarks from '${dataDir}':\n${error.message}`,
    )
  }
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
    iterationA.task.taskId === iterationB.task.taskId &&
    iterationA.variation.variationId === iterationB.variation.variationId &&
    iterationA.command.commandId === iterationB.command.commandId
  )
}

const removeIterations = function(benchmark) {
  return omitBy(benchmark, key => key === 'iterations')
}
