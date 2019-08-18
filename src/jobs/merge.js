import fastDeepEqual from 'fast-deep-equal'

import { groupBy } from '../utils/group.js'
import { removeDuplicates } from '../iterations/duplicate.js'

// Merge previous benchmarks part of the same `job`.
// Later benchmarks have priority.
export const mergeBenchmarks = function(benchmarks) {
  return Object.values(groupBy(benchmarks, 'job')).map(mergeGroup)
}

const mergeGroup = function([benchmark, ...benchmarks]) {
  return benchmarks.reduce(mergePair, benchmark)
}

const mergePair = function(
  { envs: previousEnvs, iterations: previousIterations },
  { envs: [env], iterations, ...benchmark },
) {
  const envs = mergeEnv(previousEnvs, env)
  const iterationsA = removeDuplicates([...previousIterations, ...iterations])
  return { ...benchmark, envs, iterations: iterationsA }
}

const mergeEnv = function(previousEnvs, env) {
  const duplicateEnv = previousEnvs.find(envA => envA.id === env.id)

  if (duplicateEnv === undefined) {
    return [...previousEnvs, env]
  }

  SAME_ENV_PROPS.forEach(propName => validateEnv(duplicateEnv, env, propName))

  const previousEnvsA = previousEnvs.filter(envA => envA.id !== env.id)
  return [...previousEnvsA, env]
}

const SAME_ENV_PROPS = ['opts']

const validateEnv = function(duplicateEnv, env, propName) {
  // TODO: replace with util.isDeepStrictEqual() once dropping support for
  // Node 8
  if (!fastDeepEqual(duplicateEnv[propName], env[propName])) {
    throw new Error(`Several benchmarks with the same "job" and "env" cannot have different ${propName}:
${JSON.stringify(duplicateEnv[propName])}
${JSON.stringify(env[propName])}`)
  }
}
