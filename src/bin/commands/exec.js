import { ALL_CONFIG } from '../config/all.js'
import { SELECT_CONFIG } from '../config/select.js'

export const EXEC_COMMAND = {
  command: 'exec',
  describe: 'Execute tasks without benchmarking them',

  config: { ...ALL_CONFIG, ...SELECT_CONFIG },

  usage: `$0 exec [flags...]

Execute each task once without benchmarking them.

The tasks output is printed on the console.`,

  examples: [['$0 exec', 'Execute tasks without benchmarking them']],
}
