import { ALL_CONFIG } from '../config/all.js'
import { BENCH_CONFIG } from '../config/bench.js'
import { REPORT_CONFIG } from '../config/report.js'
import { SELECT_CONFIG } from '../config/select.js'
import { STORE_CONFIG } from '../config/store.js'

export const BENCH_COMMAND = {
  input: ['bench', '*'],
  description: 'Measure tasks',

  config: {
    ...ALL_CONFIG,
    ...STORE_CONFIG,
    ...REPORT_CONFIG,
    ...SELECT_CONFIG,
    ...BENCH_CONFIG,
  },

  usage: `$0 [flags...]

Measure tasks.

Task files must be inside the settings directory.
The settings directory defaults to a "benchmark" directory in the current
directory or any parent directory.
Task filenames must end with ".task.*".

The file extension and contents of the task file depends on the runner.`,

  examples: [
    ['$0', 'Measure tasks'],
    ['$0 -d 60', 'Measure each task for 60 seconds'],
  ],
}
