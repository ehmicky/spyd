import { ALL_CONFIG } from '../config/all.js'
import { REPORT_CONFIG } from '../config/report.js'
import { SELECT_CONFIG } from '../config/select.js'
import { STORE_CONFIG } from '../config/store.js'

export const SHOW_COMMAND = {
  command: 'show [delta]',
  describe: 'Show a previous result',

  config: {
    ...ALL_CONFIG,
    ...STORE_CONFIG,
    ...SELECT_CONFIG,
    ...REPORT_CONFIG,
  },

  usage: `$0 [flags...] show [delta]

Show a previous result.

The 'delta' argument can be:
  - nothing: show the last result
  - integer: show the {integer}-th previous result
  - a date|time: show the last result before that date|time.
    Examples of valid values include: 'yyyy-mm-dd', 'yyyy-mm-dd hh:mm:ss'.`,

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
  ],
}
