import { dim } from 'chalk'
import indentString from 'indent-string'

import { prettifyCi } from '../../utils/pretty/ci.js'
import { prettifyCommands } from '../../utils/pretty/commands.js'
import { prettifyGit } from '../../utils/pretty/git.js'
import { prettifyMergeId } from '../../utils/pretty/merge_id.js'
import {
  prettifySharedSystem,
  prettifySystems,
} from '../../utils/pretty/systems.js'
import { prettifyTimestamp } from '../../utils/pretty/timestamp.js'

// Retrieve footer: system, timestamp, mergeId, link
export const getFooter = function ({
  timestamp,
  systems,
  git,
  ci,
  commands,
  mergeId,
}) {
  const footers = [
    prettifyCommands(commands),
    prettifySharedSystem(systems),
    prettifySystems(systems),
    prettifyMergeId(mergeId),
    prettifyTimestamp(timestamp),
    prettifyGit(git),
    prettifyCi(ci),
    LINK_FOOTER,
  ]
    .filter(Boolean)
    .join('\n\n')

  if (footers === '') {
    return ''
  }

  const footer = indentString(footers, 1)
  return `\n\n${footer}`
}

const LINK_FOOTER = dim(
  'Benchmarked with spyd (https://github.com/ehmicky/spyd)',
)
