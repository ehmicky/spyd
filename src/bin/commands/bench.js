import { ALL_CONFIG } from '../config/all.js'
import { BENCH_CONFIG } from '../config/bench.js'
import { REPORT_CONFIG } from '../config/report.js'
import { RUN_CONFIG } from '../config/run.js'
import { SELECT_CONFIG } from '../config/select.js'
import { STORE_CONFIG } from '../config/store.js'

export const BENCH_COMMAND = {
  command: ['bench [tasks]', '* [tasks]'],
  describe: 'Measure tasks',

  config: {
    ...ALL_CONFIG,
    ...RUN_CONFIG,
    ...SELECT_CONFIG,
    ...BENCH_CONFIG,
    ...REPORT_CONFIG,
    ...STORE_CONFIG,
  },

  usage: `$0 [flags...] [tasks]

Measure tasks.`,

  examples: [
    ['$0', 'Measure tasks, using the default specific tasks file'],
    ['$0 /path/to/tasks.js', 'Measure tasks in a specific tasks file'],
    ['$0 -d 60', 'Measure each task for 60 seconds'],
  ],
}
