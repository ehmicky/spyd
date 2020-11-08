import { dim } from 'chalk'

import { getCi } from './ci.js'
import { getCommands } from './commands.js'
import { getGit } from './git.js'
import { getMergeId } from './merge_id.js'
import { getSharedSystem, getSystems } from './systems.js'
import { getTimestamp } from './timestamp.js'

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
    getCommands(commands),
    getSharedSystem(systems),
    getSystems(systems),
    {
      ...getMergeId(mergeId),
      ...getTimestamp(timestamp),
      ...getGit(git),
      ...getCi(ci),
    },
    LINK_FOOTER,
  ]
}

const LINK_FOOTER = dim(
  'Benchmarked with spyd (https://github.com/ehmicky/spyd)',
)
