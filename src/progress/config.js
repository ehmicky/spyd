import { stderr } from 'process'

import isInteractive from 'is-interactive'

// Normalize `progress` option
export const normalizeProgress = function ({ progress, ...opts }) {
  if (!isInteractive(stderr)) {
    return { ...opts, progress: { silent: {} } }
  }

  return { ...opts, progress }
}
