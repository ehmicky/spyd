// Each benchmark has a single `env|opts|system`. When merged, those are put
// together inside `envs` array. Iterations then point to them using `envId`.
export const normalizeEnvs = function(benchmark, benchmarks) {
  const benchmarkA = normalizeEnv(benchmark)
  const benchmarksA = benchmarks.map(normalizeEnv)
  return { benchmark: benchmarkA, benchmarks: benchmarksA }
}

const normalizeEnv = function({ opts, system, env, iterations, ...benchmark }) {
  const iterationsA = iterations.map(iteration => ({
    ...iteration,
    envId: env,
    envTitle: env,
  }))
  return {
    ...benchmark,
    iterations: iterationsA,
    envs: [{ id: env, title: env, opts, system }],
  }
}
