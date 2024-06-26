import { HISTORY } from './groups.js'

// Configuration shared by commands that use history: `run`, `show`, `remove`
export const HISTORY_CONFIG = {
  since: {
    group: HISTORY,
    describe: `Specifies which result to compare with when using the "showDiff"
or "limit" configuration properties.

Also specifies the first result shown in the history.

Can be:
  - 1 (default): last result
  - an integer: {integer}-th last result
  - "first": first result
  - 0: no result
  - a date|time: like "yyyy-mm-dd" or "yyyy-mm-dd hh:mm:ss"
  - a duration: like "1m", "5d", "1 month" or "1y"
  - a result id
  - a git commit, tag or branch`,
  },
}
