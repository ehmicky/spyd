import { ALL_CONFIG } from '../config/all.js'
import { RUN_CONFIG } from '../config/run.js'
import { SELECT_CONFIG } from '../config/select.js'

export const DEV_COMMAND = {
  command: 'dev [tasks]',
  describe: 'Execute tasks without benchmarking them',

  config: { ...ALL_CONFIG, ...RUN_CONFIG, ...SELECT_CONFIG },

  usage: `$0 dev [flags...] [tasks]

Execute each task once without benchmarking them.

The tasks output is printed on the console.`,

  examples: [['$0 dev', 'Execute each task without benchmarking them']],
}
