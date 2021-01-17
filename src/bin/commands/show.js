import { ALL_CONFIG } from '../config/all.js'
import { REPORT_CONFIG } from '../config/report.js'
import { SELECT_CONFIG } from '../config/select.js'
import { STORE_CONFIG } from '../config/store.js'

export const SHOW_COMMAND = {
  command: 'show [delta]',
  describe: 'Show a previous result',

  config: {
    ...ALL_CONFIG,
    ...SELECT_CONFIG,
    ...REPORT_CONFIG,
    ...STORE_CONFIG,
  },

  usage: `$0 [flags...] show [delta]

Show a previous result.

The "delta" argument targets the result. It can be:
  - empty: last result
  - an integer: {integer}-th previous result
  - a date|time: like "yyyy-mm-dd" or "yyyy-mm-dd hh:mm:ss"
  - a result id
  - a git commit`,

  examples: [
    ['$0 show', 'Show the last result'],
    ['$0 show 2', 'Show the second-to-last result'],
    [
      '$0 show 2018-02-01',
      'Show the last result before the 1st of February 2018',
    ],
    [
      '$0 show 2018-02-01T15:00:00Z',
      'Show the last result before the 1st of February 2018 at 15:00 UTC',
    ],
    [
      '$0 show 4209c7d7-721d-4b5b-8465-4e038fa2890c',
      'Show the result with this id',
    ],
    ['$0 show 4221b22a', 'Show the last result with this git commit'],
  ],
}
