import { omitBy } from '../utils/main.js'

// Add:
//  - `benchmark.previous`: all previous benchmarks
//  - `benchmark.iterations[*].previous`: previous iteration with same runner,
//    task and variation
// When combined with the 'show' option, we only show the benchmarks before it.
export const addPrevious = async function({
  benchmark,
  benchmark: { timestamp, iterations },
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
  const previousA = await Promise.all(previous.map(nestedNormalize))
  const iterationsA = addPreviousIterations(iterations, previousA)
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

const addPreviousIterations = function(iterations, previous) {
  const previousIterations = previous.flatMap(getIterations)
  return iterations.map(iteration =>
    addPreviousIteration(iteration, previousIterations),
  )
}

const getIterations = function({ iterations }, benchmark) {
  return iterations.map(iteration => ({ ...iteration, benchmark }))
}

const addPreviousIteration = function(iteration, previousIterations) {
  const previous = previousIterations.filter(previousIteration =>
    isSameIteration(iteration, previousIteration),
  )
  return { ...iteration, previous }
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
