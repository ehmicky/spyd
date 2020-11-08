import { dim } from 'chalk'

import { prettifyCi } from './ci.js'
import { prettifyCommands } from './commands.js'
import { prettifyGit } from './git.js'
import { prettifyMergeId } from './merge_id.js'
import { prettifySharedSystem, prettifySystems } from './systems.js'
import { prettifyTimestamp } from './timestamp.js'

// Retrieve footer: system, timestamp, mergeId, link
export const getFooter = function ({
  timestamp,
  systems,
  git,
  ci,
  commands,
  mergeId,
}) {
  return [
    prettifyCommands(commands),
    prettifySharedSystem(systems),
    prettifySystems(systems),
    {
      ...prettifyMergeId(mergeId),
      ...prettifyTimestamp(timestamp),
      ...prettifyGit(git),
      ...prettifyCi(ci),
    },
    LINK_FOOTER,
  ]
}

const LINK_FOOTER = dim(
  'Benchmarked with spyd (https://github.com/ehmicky/spyd)',
)
