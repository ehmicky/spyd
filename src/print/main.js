import { addGroups } from './group.js'
import { addSpeedInfo } from './speed.js'
import { addPrevious } from './previous.js'
import { normalizeStats, prettifyStats } from './stats/main.js'
import { prettifySystem } from './system.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const addPrintedInfo = function(
  { iterations, env, envs = [env], ...benchmark },
  { diff, verbose, benchmarks },
) {
  const {
    iterations: iterationsA,
    tasks,
    variations,
    commands,
    envs: envGroups,
  } = addGroups(iterations)
  const envsA = mergeEnvs(envs, envGroups)

  const iterationsB = addSpeedInfo(iterationsA)

  const { previous, iterations: iterationsC } = addPrevious({
    benchmarks,
    benchmark,
    iterations: iterationsB,
    diff,
    verbose,
    addPrintedInfo,
  })

  const iterationsD = normalizeStats(iterationsC)
  const iterationsE = prettifyStats(iterationsD, verbose)

  const timestamp = prettifyTimestamp(benchmark)

  const systemPretty = prettifySystem(benchmark)

  return {
    ...benchmark,
    timestamp,
    tasks,
    variations,
    commands,
    envs: envsA,
    systemPretty,
    iterations: iterationsE,
    previous,
  }
}

// We merge two groups of similar `envs`:
//  - after merging with previous benchmarks of same job, to retrieve their
//    options and systems
//  - after grouping iterations, to retrieve their speed and set iteration.rank
const mergeEnvs = function(envs, envGroups) {
  return envGroups.map(envGroup => mergeEnv(envs, envGroup))
}

const mergeEnv = function(envs, envGroup) {
  const env = envs.find(envA => envA.id === envGroup.id)
  return { ...envGroup, ...env }
}

// Make timestamp more human-friendly.
// Must be done at end since `previous` must use raw timestamps.
const prettifyTimestamp = function({ timestamp }) {
  return new Date(timestamp).toLocaleString()
}
