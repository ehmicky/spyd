import { ALL_CONFIG } from '../config/all.js'
import { STORE_CONFIG } from '../config/store.js'

export const REMOVE_COMMAND = {
  command: 'remove [delta]',
  describe: 'Remove a previous result',

  config: { ...ALL_CONFIG, ...STORE_CONFIG },

  usage: `$0 [flags...] remove [delta]

Remove a previous result.

The 'delta' argument can be:
  - nothing: remove the last result
  - integer: remove the {integer}-th previous result
  - a date|time: remove the last result before that date|time.
    Examples of valid values include: 'yyyy-mm-dd', 'yyyy-mm-dd hh:mm:ss'.`,

  examples: [
    ['$0 remove', 'Remove a previous result'],
    ['$0 remove 2', 'Remove the second-to-last result'],
    [
      '$0 remove 2018-02-01',
      'Remove the last result before the 1st of February 2018',
    ],
    [
      '$0 remove 2018-02-01T15:00:00Z',
      'Remove the last result before the 1st of February 2018 at 15:00 UTC',
    ],
  ],
}
