import { stderr } from 'process'

import isInteractive from 'is-interactive'

// Check if there should be no progress reporting
export const isSilent = function (progresses) {
  return progresses.some(isSilentProgress) || !isInteractive(stderr)
}

const isSilentProgress = function ({ id }) {
  return id === 'silent'
}
