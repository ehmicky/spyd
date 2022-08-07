import { REPORT } from './groups.js'

// Configuration specific to `remove`
export const REMOVE_CONFIG = {
  force: {
    group: REPORT,
    alias: 'f',
    boolean: true,
    describe: `Do not report the result nor ask for confirmation.
Default: true unless the terminal is interactive.`,
  },
}
