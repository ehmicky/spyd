import { ALL_CONFIG } from '../config/all.js'
import { COMBINATIONS_CONFIG } from '../config/combinations.js'
import { HISTORY_CONFIG } from '../config/history.js'
import { REPORT_CONFIG } from '../config/report.js'
import { RUN_CONFIG } from '../config/run.js'
import { SELECT_CONFIG } from '../config/select.js'

export const RUN_COMMAND = {
  command: ['run [runner.tasks]', '* [runner.tasks]'],
  describe: 'Measure tasks',

  config: {
    ...ALL_CONFIG,
    ...COMBINATIONS_CONFIG,
    ...SELECT_CONFIG,
    ...RUN_CONFIG,
    ...REPORT_CONFIG,
    ...HISTORY_CONFIG,
  },

  usage: `$0 [flags...] [runner.tasks]

Measure tasks.`,

  examples: [
    ['$0', 'Measure tasks, using the default specific tasks file'],
    ['$0 /path/to/tasks.js', 'Measure tasks in a specific tasks file'],
    ['$0 -d 60', 'Measure each task for 60 seconds'],
  ],
}
