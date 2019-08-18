import fastDeepEqual from 'fast-deep-equal'

import { removeDuplicates } from '../iterations/duplicate.js'

// Merge previous benchmarks part of the same `job`
export const mergeJobBenchmarks = function(benchmarks, benchmark) {
  return benchmarks
    .filter(benchmarkA => benchmarkA.job === benchmark.job)
    .reduce(mergeBenchmarks, benchmark)
}

const mergeBenchmarks = function(
  { envs, iterations, ...benchmark },
  { envs: [env], iterations: previousIterations },
) {
  const envsA = mergeEnv(envs, env)
  const iterationsA = removeDuplicates([...iterations, ...previousIterations])
  return { ...benchmark, envs: envsA, iterations: iterationsA }
}

const mergeEnv = function(envs, env) {
  const duplicateEnv = envs.find(envA => envA.id === env.id)

  if (duplicateEnv === undefined) {
    return [...envs, env]
  }

  SAME_ENV_PROPS.forEach(propName => validateEnv(duplicateEnv, env, propName))

  return envs
}

const SAME_ENV_PROPS = ['options']

const validateEnv = function(duplicateEnv, env, propName) {
  // TODO: replace with util.isDeepStrictEqual() once dropping support for
  // Node 8
  if (!fastDeepEqual(duplicateEnv[propName], env[propName])) {
    throw new Error(`Several benchmarks with the same "job" and "env" cannot have different ${propName}:
${JSON.stringify(duplicateEnv[propName])}
${JSON.stringify(env[propName])}`)
  }
}
