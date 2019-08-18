// Each benchmark has a single `env|opts|system`. When merged, those are put
// together inside `envs` array. Iterations then point to them using `envId`.
export const normalizeEnv = function({
  opts,
  system,
  env,
  iterations,
  ...benchmark
}) {
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

// We merge two groups of similar `envs`:
//  - after merging with previous benchmarks of same job, to retrieve their
//    options and systems
//  - after grouping iterations, to retrieve their speed and set iteration.rank
export const mergeEnvs = function(envs, envGroups) {
  return envGroups.map(envGroup => mergeEnv(envs, envGroup))
}

const mergeEnv = function(envs, envGroup) {
  const env = envs.find(envA => envA.id === envGroup.id)
  return { ...envGroup, ...env }
}
