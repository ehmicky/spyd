import { addGroups } from './group.js'
import { addSpeedInfo } from './speed.js'
import { addPrevious } from './previous.js'
import { normalizeStats, prettifyStats } from './stats/main.js'
import { prettifySystem } from './system.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const addPrintedInfo = function(
  { iterations, ...benchmark },
  { diff, verbose, benchmarks },
) {
  const {
    iterations: iterationsA,
    tasks,
    variations,
    commands,
    envs,
  } = addGroups(iterations)

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
    envs,
    systemPretty,
    iterations: iterationsE,
    previous,
  }
}

// Make timestamp more human-friendly.
// Must be done at end since `previous` must use raw timestamps.
const prettifyTimestamp = function({ timestamp }) {
  return new Date(timestamp).toLocaleString()
}
