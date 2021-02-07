import { HISTORY } from './groups.js'

// Configuration shared by commands that use history: `bench`, `show`, `remove`
export const HISTORY_CONFIG = {
  since: {
    group: HISTORY,
    describe: `Which result to compare to when using the "limit" or "showDiff"
configuration properties.
For reporters showing all previous results, this also defines the first result.
Can be:
  - an integer: {integer}-th last result
  - "first": first result
  - a date|time: like "yyyy-mm-dd" or "yyyy-mm-dd hh:mm:ss"
  - a duration: like "1m", "5d", "1 month" or "1y"
  - a result id
  - a git commit, tag or branch
  - "ci": last CI build
Default: the last CI build when in CI, or the last result otherwise.`,
  },
}
