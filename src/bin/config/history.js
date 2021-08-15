import { HISTORY } from './groups.js'

// Configuration shared by commands that use history: `bench`, `show`, `remove`
export const HISTORY_CONFIG = {
  since: {
    group: HISTORY,
    describe: `Specifies which result to compare with when using the "showDiff"
or "limit" configuration properties.

That result and all later ones will be shown in the report.
This allows reporting several previous results at once.

Can be:
  - 0 (default): compare with last result but do not report any previous results
  - 1: last result
  - an integer: {integer}-th last result
  - "first": first result
  - a date|time: like "yyyy-mm-dd" or "yyyy-mm-dd hh:mm:ss"
  - a duration: like "1m", "5d", "1 month" or "1y"
  - a result id
  - a git commit, tag or branch`,
  },
}
