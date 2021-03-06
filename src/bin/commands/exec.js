import { ALL_CONFIG } from '../config/all.js'
import { RUN_CONFIG } from '../config/run.js'
import { SELECT_CONFIG } from '../config/select.js'

export const EXEC_COMMAND = {
  command: 'exec [tasks]',
  describe: 'Execute tasks without benchmarking them',

  config: { ...ALL_CONFIG, ...RUN_CONFIG, ...SELECT_CONFIG },

  usage: `$0 exec [flags...] [tasks]

Execute each task once without benchmarking them.

The tasks output is printed on the console.`,

  examples: [['$0 exec', 'Execute tasks without benchmarking them']],
}
