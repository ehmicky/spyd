import { ALL_CONFIG } from '../config.js'

export const REMOVE_COMMAND = {
  input: 'remove [benchmark]',
  description: 'Remove a previous benchmark',

  config: ALL_CONFIG,

  usage: `$0 [options] remove [integer|date|time]

Remove a previous benchmark.

The argument can be:
  - nothing: remove the last benchmark
  - integer: remove the {integer} previous benchmark
  - a date|time: remove the last benchmark before that date|time.
    Examples of valid values include: 'yyyy-mm-dd', 'yyyy-mm-dd hh:mm:ss'.`,

  examples: [
    ['$0 remove', 'Remove a previous benchmark'],
    ['$0 remove 2', 'Remove the second-to-last benchmark'],
    [
      '$0 remove 2018-02-01',
      'Remove the last benchmark before the 1st of February 2018',
    ],
    [
      '$0 remove "2018-02-01 15:00:00"',
      'Remove the last benchmark before the 1st of February 2018 at 15:00 local time',
    ],
  ],
}
