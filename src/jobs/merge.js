import fastDeepEqual from 'fast-deep-equal'

// Merge previous benchmarks part of the same `job`
export const mergeJobBenchmarks = function(benchmarks, benchmark) {
  return benchmarks
    .filter(benchmarkA => benchmarkA.job === benchmark.job)
    .reduce(mergeBenchmarks, benchmark)
}

const mergeBenchmarks = function(benchmark, previousBenchmark) {
  validateSameOpts(benchmark, previousBenchmark)

  const iterations = mergeIterations(benchmark, previousBenchmark)
  return { ...benchmark, iterations }
}

const validateSameOpts = function({ opts }, { opts: previousOpts }) {
  // TODO: replace with util.isDeepStrictEqual() once dropping support for
  // Node 8
  if (!fastDeepEqual(opts, previousOpts)) {
    throw new Error(`Several benchmarks with the same "job" cannot have different options:
${JSON.stringify(opts)}
${JSON.stringify(previousOpts)}`)
  }
}

const mergeIterations = function(
  { iterations },
  { iterations: previousIterations },
) {
  return [...iterations, ...previousIterations].filter(removeDuplicates)
}

// When two benchmarks of the same job define the same iteration, the last
// one prevails
const removeDuplicates = function(
  { taskId, variationId, commandId, envId },
  index,
  iterations,
) {
  return iterations
    .slice(index + 1)
    .every(
      iteration =>
        iteration.taskId !== taskId ||
        iteration.variationId !== variationId ||
        iteration.commandId !== commandId ||
        iteration.envId !== envId,
    )
}
