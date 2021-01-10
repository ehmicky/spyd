import { noteColor } from '../colors.js'

import { getCi } from './ci.js'
import { getGit } from './git.js'
import { getSharedSystem, getSystems } from './systems.js'

// Retrieve footer: runners, systems, mergeId, timestamp, git, ci, link
export const getFooter = function ({
  runners,
  systems,
  mergeId,
  timestamp,
  git,
  ci,
}) {
  return [
    { Runners: getRunners(runners) },
    getSharedSystem(systems),
    getSystems(systems),
    {
      Id: mergeId,
      Timestamp: getTimestamp(timestamp),
      ...getGit(git),
      ...getCi(ci),
    },
    LINK_FOOTER,
  ]
}

const getRunners = function (runners = []) {
  return runners.map(getRunnerVersions)
}

const getRunnerVersions = function ({ runnerVersions }) {
  return runnerVersions
}

const getTimestamp = function (timestamp) {
  if (timestamp === undefined) {
    return
  }

  return new Date(timestamp).toLocaleString()
}

const LINK_FOOTER = noteColor(
  'Benchmarked with spyd (https://github.com/ehmicky/spyd)',
)
