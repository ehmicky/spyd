import { ALL_CONFIG } from '../config/all.js'
import { SELECT_CONFIG } from '../config/select.js'

export const DEBUG_COMMAND = {
  input: 'debug [<files...>]',
  description: 'Run benchmarks in debug mode',

  config: { ...ALL_CONFIG, ...SELECT_CONFIG },

  usage: `$0 debug [options] [<files...>]

Run each benchmark task once without measuring them.

The tasks output is printed on the console.`,

  examples: [['$0 debug', 'Run benchmaks in debug mode']],
}
