import { noteColor } from '../colors.js'

import { getCi } from './ci.js'
import { getGit } from './git.js'
import { getSharedSystem, getSystems } from './systems.js'

// Retrieve footer: systems, timestamp, git, ci, link
export const getFooter = function ({ systems, timestamp, git, ci }) {
  return [
    getSharedSystem(systems),
    getSystems(systems),
    {
      Timestamp: getTimestamp(timestamp),
      ...getGit(git),
      ...getCi(ci),
    },
    LINK_FOOTER,
  ]
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
