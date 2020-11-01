import { ALL_CONFIG } from '../config/all.js'
import { REPORT_CONFIG } from '../config/report.js'
import { RUN_CONFIG } from '../config/run.js'
import { SELECT_CONFIG } from '../config/select.js'
import { STORE_CONFIG } from '../config/store.js'

export const RUN_COMMAND = {
  input: ['run [<files...>]', '* [<files...>'],
  description: 'Run benchmarks',

  config: {
    ...ALL_CONFIG,
    ...STORE_CONFIG,
    ...REPORT_CONFIG,
    ...SELECT_CONFIG,
    ...RUN_CONFIG,
  },

  usage: `$0 [options] [<files...>]

Benchmark code.

FILE can be a globbing pattern.
It defaults to "./benchmarks.*" or "./benchmarks/index.*".

Each FILE must export the tasks to benchmark.

Several FILEs can be specified at once. Each set of 'variations' is specific to
the FILE which declared it.

The format of the FILE is runner-specific.`,

  examples: [
    ['$0', 'Run a new benchmark'],
    ['$0 -d 60', 'Benchmark each task for 60 seconds'],
  ],
}
