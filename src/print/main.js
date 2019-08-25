import { prettifySystems } from '../system/pretty.js'
import { joinSystems } from '../system/join.js'
import { prettifyGit } from '../ci/git.js'
import { prettifyCi } from '../ci/pretty.js'

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
  ci,
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
    ciPretty,
    commandsPretty,
  } = prettify({
    timestamp,
    systems: systemsA,
    git,
    ci,
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
    ciPretty,
    commandsPretty,
    iterations: iterationsD,
  }
}

const prettify = function({ timestamp, systems, git, ci, commands }) {
  const timestampPretty = prettifyTimestamp(timestamp)
  const systemsPretty = prettifySystems(systems)
  const gitPretty = prettifyGit(git)
  const ciPretty = prettifyCi(ci)
  const commandsPretty = prettifyCommands(commands)
  return { timestampPretty, systemsPretty, gitPretty, ciPretty, commandsPretty }
}

// Make timestamp more human-friendly.
// Must be done at end since `previous` must use raw timestamps.
const prettifyTimestamp = function(timestamp) {
  return new Date(timestamp).toLocaleString()
}
