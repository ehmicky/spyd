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
