import { stderr } from 'process'

import isInteractive from 'is-interactive'

// Normalize `progress` configuration property
export const normalizeProgress = function ({ progress, ...config }) {
  if (!isInteractive(stderr)) {
    return { ...config, progress: { silent: {} } }
  }

  return { ...config, progress }
}
