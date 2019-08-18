import { ALL_CONFIG } from '../config/all.js'
import { RUN_SHARED_CONFIG } from '../config/run.js'

export const DEBUG_COMMAND = {
  input: 'debug [<files...>]',
  description: 'Run benchmarks in debug mode',

  config: { ...ALL_CONFIG, ...RUN_SHARED_CONFIG },

  usage: `$0 debug [options] [<files...>]

Run each benchmark task once without measuring them.

The tasks output is printed on the console.`,

  examples: [['$0 debug', 'Run benchmaks in debug mode']],
}
