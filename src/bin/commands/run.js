import { ALL_CONFIG } from '../config/all.js'
import { STORE_CONFIG } from '../config/store.js'
import { REPORT_CONFIG } from '../config/report.js'
import { SELECT_CONFIG } from '../config/select.js'
import { RUN_CONFIG } from '../config/run.js'

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

Benchmark JavaScript code.

FILE can be a globbing pattern.
It defaults to "./benchmarks.*" or "./benchmarks/main.*".

Each FILE must export the tasks to benchmark.

Several FILEs can be specified at once. Each set of 'variations' is specific to
the FILE which declared it.

The format of the FILE is runner-specific. For example for Node.js, each task
must be an object with any of the following properties:

  main()      Function being benchmarked.
              Can be async.
              Required.

  before()    Function fired before each main(). Not benchmarked.
              Can be async.
              Its return value is passed as argument to main() and after().
              If the return value is not modified by main(), using a top-level
              variable instead of before() is preferred.

  after()     Function fired after each main(). Not benchmarked.
              Can be async.

  title       Title shown by reporters.
              Defaults to the task variable name.                       [string]

  variations  Ids of the variations this task should benchmark.
              Defaults to all available variations.                   [string[]]

In Node.js, FILE can also export a 'variations' array. One benchmark per
combination of tasks and variations are run. Each variation is an object with
the following properties:

  id          Variation identifier.
              Required.                                                 [string]

  title       Title shown by reporters.
              Defaults to the variation 'id'.                           [string]

  value       Passed as first argument to tasks main(), before() and
              after().                                                     [any]`,

  examples: [
    ['$0', 'Run a new benchmark'],
    ['$0 -d 60', 'Benchmark each task for 30 seconds'],
  ],
}
