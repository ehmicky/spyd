// Add `benchmark.job`.
// Also the `job` option can be "same" to re-use the previous benchmark's job.
export const addJob = function(benchmark, benchmarks, { job }) {
  const jobA = handleSame(benchmarks, job)
  return { ...benchmark, job: jobA }
}

const handleSame = function(benchmarks, job) {
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
