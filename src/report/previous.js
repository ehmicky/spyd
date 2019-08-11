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
  const previous = benchmarks.filter(
    benchmarkA => benchmarkA.timestamp < timestamp,
  )
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
  const previousIterations = previous.flatMap(normalizeIterations)
  const normalizedIterations = normalizeIterations(benchmark)
  const iterationsA = benchmark.iterations.map((iteration, index) =>
    addPreviousIteration(
      iteration,
      previousIterations,
      normalizedIterations[index],
    ),
  )
  return iterationsA
}

const normalizeIterations = function({
  iterations,
  tasks,
  variations,
  commands,
}) {
  return iterations.map(iteration =>
    normalizeIteration({ iteration, tasks, variations, commands }),
  )
}

const normalizeIteration = function({
  iteration: { task, variation, command, ...iteration },
  tasks,
  variations,
  commands,
}) {
  const taskA = tasks[task]
  const variationA = variation === undefined ? {} : variations[variation]
  const commandA = commands[command]
  return { ...iteration, task: taskA, variation: variationA, command: commandA }
}

const addPreviousIteration = function(
  iteration,
  previousIterations,
  normalizedIteration,
) {
  const previous = previousIterations.filter(previousIteration =>
    isSameIteration(previousIteration, normalizedIteration),
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
