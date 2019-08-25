import { mergeSystems } from './env.js'
import { addCollections } from './collections.js'
import { addNames } from './name.js'
import { addSpeedInfo } from './speed.js'
import { normalizeStats } from './stats/main.js'
import { prettifySystems } from './system.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const addPrintedInfo = function({
  iterations,
  systems,
  timestamp,
  ...benchmark
}) {
  const {
    iterations: iterationsA,
    tasks,
    variations,
    commands,
    systems: systemColls,
  } = addCollections(iterations)
  const systemsA = mergeSystems(systems, systemColls)

  const iterationsB = addNames(iterationsA)

  const iterationsC = addSpeedInfo(iterationsB)
  const iterationsD = normalizeStats(iterationsC)

  const timestampPretty = prettifyTimestamp(timestamp)

  const systemPretty = prettifySystems(systemsA)

  return {
    ...benchmark,
    timestamp,
    timestampPretty,
    tasks,
    variations,
    commands,
    systems: systemsA,
    systemPretty,
    iterations: iterationsD,
  }
}

// Make timestamp more human-friendly.
// Must be done at end since `previous` must use raw timestamps.
const prettifyTimestamp = function(timestamp) {
  return new Date(timestamp).toLocaleString()
}
