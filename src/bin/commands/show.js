import { ALL_CONFIG } from '../config/all.js'
import { HISTORY_CONFIG } from '../config/history.js'
import { REPORT_CONFIG } from '../config/report.js'
import { SELECT_CONFIG } from '../config/select.js'

export const SHOW_COMMAND = {
  command: 'show [delta]',
  describe: 'Show a previous result',

  config: {
    ...ALL_CONFIG,
    ...SELECT_CONFIG,
    ...REPORT_CONFIG,
    ...HISTORY_CONFIG,
  },

  usage: `$0 [flags...] show [delta]

Show a previous result.

The "delta" argument targets the result. It can be:
  - an integer: {integer}-th last result
  - "first": first result
  - a date|time: like "yyyy-mm-dd" or "yyyy-mm-dd hh:mm:ss"
  - a duration: like "1m", "5d", "1 month" or "1y"
  - a result id
  - a git commit, tag or branch
  - "ci": last CI build

The default "delta" is the last CI build when in CI, or the last result
otherwise.`,

  examples: [
    ['$0 show', 'Show the last result'],
    ['$0 show 2', 'Show the second-to-last result'],
    ['$0 show first', 'Show the first result'],
    [
      '$0 show 2018-02-01',
      'Show the last result before the 1st of February 2018',
    ],
    [
      '$0 show 2018-02-01T15:00:00Z',
      'Show the last result before the 1st of February 2018 at 15:00 UTC',
    ],
    ['$0 show 1y', 'Show the last result before 1 year ago'],
    [
      '$0 show 4209c7d7-721d-4b5b-8465-4e038fa2890c',
      'Show the result with this id',
    ],
    ['$0 show 4221b22a', 'Show the last result with this git commit'],
    ['$0 show v1.0.1', 'Show the last result with this git tag'],
    ['$0 show feat/users', 'Show the last result with this git branch'],
    ['$0 show ci', 'Show the last CI build'],
  ],
}
