import fastDeepEqual from 'fast-deep-equal'

import { groupBy } from '../utils/group.js'
import { removeDuplicates } from '../iterations/duplicate.js'

// Merge previous benchmarks part of the same `job`.
// Later benchmarks have priority.
export const mergeBenchmarks = function(benchmarks) {
  const benchmarksA = benchmarks.map(normalizeEnv)
  return Object.values(groupBy(benchmarksA, 'job')).map(mergeGroup)
}

// Each benchmark has a single `env|opts|system`. When merged, those are put
// together inside `envs` array. Iterations then point to them using `envId`.
// We need to do this before merging benchmarks.
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

const mergeGroup = function([benchmark, ...benchmarks]) {
  return benchmarks.reduce(mergePair, benchmark)
}

const mergePair = function(
  { envs: previousEnvs, iterations: previousIterations },
  { envs: [env], iterations, ...benchmark },
) {
  const envs = mergeEnvs(previousEnvs, env)
  const iterationsA = removeDuplicates([...previousIterations, ...iterations])
  return { ...benchmark, envs, iterations: iterationsA }
}

// Several benchmarks can have the same env, providing it is exactly the same
const mergeEnvs = function(previousEnvs, env) {
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
