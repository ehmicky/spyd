import { stderr } from 'process'

import isInteractive from 'is-interactive'

// Check if there should be no progress reporting
export const isSilent = function (reporters) {
  return reporters.some(isSilentReporter) || !isInteractive(stderr)
}

const isSilentReporter = function ({ id }) {
  return id === 'silent'
}
