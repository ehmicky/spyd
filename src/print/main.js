import { mergeBenchmarks } from '../jobs/merge.js'

import { normalizeEnvs, mergeEnvs } from './env.js'
import { addGroups } from './group.js'
import { addNames } from './name.js'
import { addSpeedInfo } from './speed.js'
import { addPrevious } from './previous.js'
import { normalizeStats } from './stats/main.js'
import { prettifySystems } from './system.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const addPrintedInfo = function(
  benchmarks,
  benchmark,
  { diff, verbose },
) {
  const benchmarksA = [...benchmarks, benchmark]

  const benchmarksB = normalizeEnvs(benchmarksA)
  const benchmarksC = mergeBenchmarks(benchmarksB)

  const benchmarksD = benchmarksC.map(benchmarkA =>
    addBenchmarkInfo(benchmarkA, { verbose }),
  )

  const benchmarkB = benchmarksD[benchmarksD.length - 1]
  const benchmarkC = addPrevious(benchmarksD, benchmarkB, { diff, verbose })
  return benchmarkC
}

const addBenchmarkInfo = function(
  { iterations, envs, ...benchmark },
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

  const timestampPretty = prettifyTimestamp(benchmark)

  const { envs: envsB, systemPretty } = prettifySystems(envsA)

  return {
    ...benchmark,
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
const prettifyTimestamp = function({ timestamp }) {
  return new Date(timestamp).toLocaleString()
}
