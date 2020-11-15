import { noteColor } from '../colors.js'

import { getCi } from './ci.js'
import { getGit } from './git.js'
import { getSharedSystem, getSystems } from './systems.js'

// Retrieve footer: commands, systems, mergeId, timestamp, git, ci, link
export const getFooter = function ({
  commands,
  systems,
  mergeId,
  timestamp,
  git,
  ci,
}) {
  return [
    { Runners: getCommands(commands) },
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

const getCommands = function (commands = []) {
  return commands.map(getCommandDescription)
}

const getCommandDescription = function ({ description }) {
  return description
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
