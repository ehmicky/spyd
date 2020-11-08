import { dim, underline } from 'chalk'
import indentString from 'indent-string'

import { addPrefix, addIndentedPrefix } from '../../utils/prefix.js'
import { prettifyCi } from '../../utils/pretty/ci.js'
import { prettifyCommands } from '../../utils/pretty/commands.js'
import { prettifyGit } from '../../utils/pretty/git.js'
import { prettifySystems } from '../../utils/pretty/systems.js'
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
    prettifySystems(systems),
    addPrefix('Id', mergeId),
    addPrefix('Timestamp', prettifyTimestamp(timestamp)),
    addIndentedPrefix('Git', prettifyGit(git)),
    prettifyCi(ci),
    LINK_FOOTER,
  ].filter(Boolean)

  if (footers.length === 0) {
    return ''
  }

  const footer = footers.map(indentFooter).join('\n\n')
  return `\n\n${footer}`
}

const LINK_FOOTER = dim(
  `Benchmarked with spyd (${underline('https://github.com/ehmicky/spyd')})`,
)

const indentFooter = function (footer) {
  return indentString(footer, 1)
}
