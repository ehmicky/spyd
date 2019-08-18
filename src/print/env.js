// We merge two collection of similar `envs`:
//  - after merging with previous benchmarks of same job, to retrieve their
//    options and systems
//  - after grouping iterations, to retrieve their speed and set iteration.rank
export const mergeEnvs = function(envs, envCollections) {
  return envCollections.map(envCollection => mergeEnv(envs, envCollection))
}

const mergeEnv = function(envs, envCollection) {
  const env = envs.find(envA => envA.id === envCollection.id)
  return { ...envCollection, ...env }
}
