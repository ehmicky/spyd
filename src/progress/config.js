import { stderr } from 'process'

import isInteractive from 'is-interactive'

// Normalize `quiet` configuration property
export const normalizeQuiet = function ({ progress, ...config }) {
  const quiet = !isInteractive(stderr) || progress.silent !== undefined
  return { ...config, progress, quiet }
}
