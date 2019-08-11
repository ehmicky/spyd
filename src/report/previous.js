import { dereferenceBenchmark } from './dereference.js'

// Add:
//  - `benchmark.previous`: all previous benchmarks
//  - `benchmark.iterations[*].previous`: previous iteration with same runner,
//    task and variation
// When combined with the 'show' option, we only show the benchmarks before it.
export const addPrevious = async function({
  benchmark,
  benchmark: { timestamp },
  dataDir,
  store,
}) {
  const benchmarks = await listBenchmarks({ dataDir, store })
  const previous = benchmarks
    .filter(benchmarkA => benchmarkA.timestamp < timestamp)
    .map(dereferenceBenchmark)
  const iterationsA = addPreviousIterations(benchmark, previous)
  return { ...benchmark, timestamp, iterations: iterationsA, previous }
}

const listBenchmarks = async function({ dataDir, store: { list: listStore } }) {
  try {
    const benchmarks = await listStore(dataDir)
    return benchmarks
  } catch (error) {
    throw new Error(
      `Could not list benchmarks from '${dataDir}':\n${error.message}`,
    )
  }
}

const addPreviousIterations = function(benchmark, previous) {
  const previousIterations = previous.flatMap(getIterations)
  const iterationsA = benchmark.iterations.map(iteration =>
    addPreviousIteration(iteration, previousIterations),
  )
  return iterationsA
}

const getIterations = function({ iterations }) {
  return iterations
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
