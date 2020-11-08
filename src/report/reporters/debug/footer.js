import { dim } from 'chalk'

import { addPadding } from '../../utils/indent.js'
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
  const footer = joinSections(
    [
      prettifyCommands(commands),
      prettifySharedSystem(systems),
      prettifySystems(systems),
      joinSections(
        [
          prettifyMergeId(mergeId),
          prettifyTimestamp(timestamp),
          prettifyGit(git),
          prettifyCi(ci),
        ],
        1,
      ),
      LINK_FOOTER,
    ],
    2,
  )

  if (footer === '') {
    return ''
  }

  const paddedFooter = addPadding(footer)
  return `\n\n${paddedFooter}`
}

const LINK_FOOTER = dim(
  'Benchmarked with spyd (https://github.com/ehmicky/spyd)',
)

const joinSections = function (sections, newlines) {
  return sections.filter(Boolean).join('\n'.repeat(newlines))
}
