import fastDeepEqual from 'fast-deep-equal'

import { removeDuplicates } from '../iterations/duplicate.js'

// Merge previous benchmarks part of the same `job`
export const mergeJobBenchmarks = function(benchmarks, benchmark) {
  return benchmarks
    .filter(benchmarkA => benchmarkA.job === benchmark.job)
    .reduce(mergeBenchmarks, benchmark)
}

const mergeBenchmarks = function(benchmark, previousBenchmark) {
  validateSameOpts(benchmark, previousBenchmark)

  const iterations = removeDuplicates([
    ...benchmark.iterations,
    ...previousBenchmark.iterations,
  ])
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
