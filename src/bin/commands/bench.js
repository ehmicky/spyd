import { ALL_CONFIG } from '../config/all.js'
import { BENCH_CONFIG } from '../config/bench.js'
import { REPORT_CONFIG } from '../config/report.js'
import { RUN_CONFIG } from '../config/run.js'
import { SELECT_CONFIG } from '../config/select.js'
import { STORE_CONFIG } from '../config/store.js'

export const BENCH_COMMAND = {
  command: ['bench', '*'],
  describe: 'Measure tasks',

  config: {
    ...ALL_CONFIG,
    ...STORE_CONFIG,
    ...REPORT_CONFIG,
    ...SELECT_CONFIG,
    ...RUN_CONFIG,
    ...BENCH_CONFIG,
  },

  usage: `$0 [flags...]

Measure tasks.

Task files must be inside the settings directory.
Their filenames must end with ".task.*".
The file extension and contents of the task files depends on the runner.`,

  examples: [
    ['$0', 'Measure tasks'],
    ['$0 -d 60', 'Measure each task for 60 seconds'],
  ],
}
