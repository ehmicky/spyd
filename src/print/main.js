import { prettifySystems } from '../system/pretty.js'
import { joinSystems } from '../system/join.js'

import { addCollections } from './collections.js'
import { addNames } from './name.js'
import { addSpeedInfo } from './speed.js'
import { normalizeStats } from './stats/main.js'
import { prettifyCommands } from './commands.js'

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
  const systemsA = joinSystems(systems, systemColls)

  const iterationsB = addNames(iterationsA)

  const iterationsC = addSpeedInfo(iterationsB)
  const iterationsD = normalizeStats(iterationsC)

  const { timestampPretty, systemsPretty, commandsPretty } = prettify({
    timestamp,
    systems: systemsA,
    commands,
  })

  return {
    ...benchmark,
    timestamp,
    timestampPretty,
    tasks,
    variations,
    commands,
    systems: systemsA,
    systemsPretty,
    commandsPretty,
    iterations: iterationsD,
  }
}

const prettify = function({ timestamp, systems, commands }) {
  const timestampPretty = prettifyTimestamp(timestamp)
  const systemsPretty = prettifySystems(systems)
  const commandsPretty = prettifyCommands(commands)
  return { timestampPretty, systemsPretty, commandsPretty }
}

// Make timestamp more human-friendly.
// Must be done at end since `previous` must use raw timestamps.
const prettifyTimestamp = function(timestamp) {
  return new Date(timestamp).toLocaleString()
}
