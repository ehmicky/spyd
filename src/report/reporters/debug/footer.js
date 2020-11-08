import { blue, dim, underline } from 'chalk'
import indentString from 'indent-string'

import { prettifyGit } from '../../../ci/git.js'
import { prettifyCi } from '../../../ci/pretty.js'
import { prettifyCommands } from '../../../print/commands.js'
import { prettifySystems } from '../../../system/pretty.js'

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
    prettifyGit(git),
    prettifyCi(ci),
    LINK_FOOTER,
  ].filter(Boolean)

  if (footers.length === 0) {
    return ''
  }

  const footer = footers.map(indentFooter).join('\n\n')
  return `\n\n${footer}`
}

// Make timestamp more human-friendly.
// Must be done at end since `previous` must use raw timestamps.
const prettifyTimestamp = function (timestamp) {
  if (timestamp === undefined) {
    return ''
  }

  return new Date(timestamp).toLocaleString()
}

const addPrefix = function (name, value) {
  if (value === undefined || value === '') {
    return
  }

  return `${blue.bold(`${name}:`)} ${value}`
}

const LINK_FOOTER = dim(
  `Benchmarked with spyd (${underline('https://github.com/ehmicky/spyd')})`,
)

const indentFooter = function (footer) {
  return indentString(footer, 1)
}
