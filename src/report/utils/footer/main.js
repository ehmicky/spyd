import { noteColor } from '../colors.js'

import { getSharedSystem, getSystems } from './systems.js'

// Retrieve footer: id, systems, timestamp, git, ci, link
export const getFooter = function ({ id, systems, timestamp }) {
  return [
    getSharedSystem(systems),
    getSystems(systems),
    {
      Id: id,
      Timestamp: getTimestamp(timestamp),
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
