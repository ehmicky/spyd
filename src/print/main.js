import { prettifySystems } from '../system/pretty.js'
import { joinSystems } from '../system/join.js'
import { prettifyGit } from '../ci/git.js'

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
  git,
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

  const {
    timestampPretty,
    systemsPretty,
    gitPretty,
    commandsPretty,
  } = prettify({
    timestamp,
    systems: systemsA,
    git,
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
    gitPretty,
    commandsPretty,
    iterations: iterationsD,
  }
}

const prettify = function({ timestamp, systems, git, commands }) {
  const timestampPretty = prettifyTimestamp(timestamp)
  const systemsPretty = prettifySystems(systems)
  const gitPretty = prettifyGit(git)
  const commandsPretty = prettifyCommands(commands)
  return { timestampPretty, systemsPretty, gitPretty, commandsPretty }
}

// Make timestamp more human-friendly.
// Must be done at end since `previous` must use raw timestamps.
const prettifyTimestamp = function(timestamp) {
  return new Date(timestamp).toLocaleString()
}
