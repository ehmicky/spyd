import { ALL_CONFIG } from '../config/all.js'
import { HISTORY_CONFIG } from '../config/history.js'
import { REMOVE_CONFIG } from '../config/remove.js'
import { REPORT_CONFIG } from '../config/report.js'
import { SELECT_CONFIG } from '../config/select.js'

export const REMOVE_COMMAND = {
  command: 'remove [delta]',
  describe: 'Remove a previous result',

  config: {
    ...ALL_CONFIG,
    ...SELECT_CONFIG,
    ...REPORT_CONFIG,
    ...REMOVE_CONFIG,
    ...HISTORY_CONFIG,
  },

  usage: `$0 [flags...] remove [delta]

Remove a previous result.

The "delta" argument targets the result. It can be:
  - 1 (default): last result
  - an integer: {integer}-th last result
  - "first": first result
  - a date|time: like "yyyy-mm-dd" or "yyyy-mm-dd hh:mm:ss"
  - a duration: like "1m", "5d", "1 month" or "1y"
  - a result id
  - a git commit, tag or branch
  - "ci": last CI build`,

  examples: [
    ['$0 remove', 'Remove the last result'],
    ['$0 remove 2', 'Remove the second-to-last result'],
    ['$0 remove first', 'Remove the first result'],
    [
      '$0 remove 2018-02-01',
      'Remove the last result before the 1st of February 2018',
    ],
    [
      '$0 remove 2018-02-01T15:00:00Z',
      'Remove the last result before the 1st of February 2018 at 15:00 UTC',
    ],
    ['$0 remove 1y', 'Remove the last result before 1 year ago'],
    [
      '$0 remove 4209c7d7-721d-4b5b-8465-4e038fa2890c',
      'Remove the result with this id',
    ],
    ['$0 remove 4221b22a', 'Remove the last result with this git commit'],
    ['$0 remove v1.0.1', 'Remove the last result with this git tag'],
    ['$0 remove feat/users', 'Remove the last result with this git branch'],
    ['$0 remove ci', 'Remove the last CI build'],
  ],
}
