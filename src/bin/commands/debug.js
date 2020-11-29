import { ALL_CONFIG } from '../config/all.js'
import { SELECT_CONFIG } from '../config/select.js'

export const DEBUG_COMMAND = {
  input: 'debug [<files...>]',
  description: 'Execute tasks without benchmarking them',

  config: { ...ALL_CONFIG, ...SELECT_CONFIG },

  usage: `$0 debug [flags...] [<files...>]

Execute each task once without benchmarking them.

The tasks output is printed on the console.`,

  examples: [['$0 debug', 'Execute tasks without benchmarking them']],
}
