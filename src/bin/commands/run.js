import { ALL_CONFIG } from '../config/all.js'
import { REPORT_CONFIG } from '../config/report.js'
import { RUN_CONFIG } from '../config/run.js'
import { SELECT_CONFIG } from '../config/select.js'
import { STORE_CONFIG } from '../config/store.js'

export const RUN_COMMAND = {
  input: ['run [<files...>]', '* [<files...>'],
  description: 'Measure tasks',

  config: {
    ...ALL_CONFIG,
    ...STORE_CONFIG,
    ...REPORT_CONFIG,
    ...SELECT_CONFIG,
    ...RUN_CONFIG,
  },

  usage: `$0 [flags...] [<files...>]

Measure tasks.

FILE can be a globbing pattern.
It defaults to "./benchmarks.*" or "./benchmarks/index.*".

Each FILE must export the tasks to measure.

Several FILEs can be specified at once.
Each set of 'inputs' is specific to the FILE which declared it.

The format of the FILE is runner-specific.`,

  examples: [
    ['$0', 'Measure tasks'],
    ['$0 -d 60', 'Measure each task for 60 seconds'],
  ],
}
