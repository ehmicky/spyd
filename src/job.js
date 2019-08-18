// Add `benchmark.job` using the `job` option.
// That option can be "same" to re-use the previous benchmark's job.
export const addJobId = function(benchmarks, benchmark, { job }) {
  const jobA = handleSame(benchmarks, benchmark, job)
  return { ...benchmark, job: jobA }
}

const handleSame = function(benchmarks, benchmark, job) {
  if (job !== SAME_JOB) {
    return job
  }

  const lastBenchmark = benchmarks[benchmarks.length - 1]

  if (lastBenchmark === undefined) {
    throw new Error(
      "Cannot use 'job' 'same' because there are no previous benchmarks",
    )
  }

  return lastBenchmark.job
}

const SAME_JOB = 'same'

export const addJobBenchmarks = function(benchmarks, benchmark) {
  return benchmark
}
