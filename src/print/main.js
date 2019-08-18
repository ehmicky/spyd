import { mergeBenchmarks } from '../jobs/merge.js'

import { normalizeEnv, mergeEnvs } from './env.js'
import { addGroups } from './group.js'
import { addNames } from './name.js'
import { addSpeedInfo } from './speed.js'
import { normalizeStats } from './stats/main.js'
import { prettifySystems } from './system.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const addPrintedInfo = function(benchmarks, { verbose }) {
  const benchmarksA = benchmarks.map(normalizeEnv)

  const benchmarksB = mergeBenchmarks(benchmarksA)

  const benchmarksC = benchmarksB.map(benchmark =>
    addBenchmarkInfo(benchmark, { verbose }),
  )
  return benchmarksC
}

const addBenchmarkInfo = function(
  { iterations, envs, timestamp, ...benchmark },
  { verbose },
) {
  const {
    iterations: iterationsA,
    tasks,
    variations,
    commands,
    envs: envGroups,
  } = addGroups(iterations)
  const envsA = mergeEnvs(envs, envGroups)

  const iterationsB = addNames(iterationsA)

  const iterationsC = addSpeedInfo(iterationsB)
  const iterationsD = normalizeStats(iterationsC, verbose)

  const timestampPretty = prettifyTimestamp(timestamp)

  const { envs: envsB, systemPretty } = prettifySystems(envsA)

  return {
    ...benchmark,
    timestamp,
    timestampPretty,
    tasks,
    variations,
    commands,
    envs: envsB,
    systemPretty,
    iterations: iterationsD,
  }
}

// Make timestamp more human-friendly.
// Must be done at end since `previous` must use raw timestamps.
const prettifyTimestamp = function(timestamp) {
  return new Date(timestamp).toLocaleString()
}
