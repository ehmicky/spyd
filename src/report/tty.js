import { stdout } from 'process'

import isInteractive from 'is-interactive'

// When stdout is a tty, we use preview by default
export const isTtyOutput = function () {
  return isInteractive(stdout)
}
