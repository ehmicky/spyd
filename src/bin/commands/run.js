/* eslint-disable max-lines */
import { ALL_CONFIG, REPORT_CONFIG } from '../config.js'

export const RUN_COMMAND = {
  input: ['run [<files...>]', '* [<files...>'],
  description: 'Run benchmarks',

  config: {
    ...ALL_CONFIG,
    ...REPORT_CONFIG,
    duration: {
      alias: 'd',
      number: true,
      requiresArg: true,
      describe: `How many seconds to benchmark each task.
Default: 10`,
    },
    tasks: {
      alias: 't',
      string: true,
      array: true,
      requiresArg: true,
      describe: `Identifiers of the tasks to benchmark.
Each identifier can start with a ! to exclude the task instead of selecting it.
Default: all tasks`,
    },
    variations: {
      alias: 'v',
      string: true,
      array: true,
      requiresArg: true,
      describe: `Identifiers of the variations to benchmark.
Each identifier can start with a ! to exclude the variation instead of selecting it.
Default: all variations`,
    },
    job: {
      string: true,
      requiresArg: true,
      describe: `Identifier of the current job.
Running several benchmarks with the same 'job' reports them together.
Used to create a single benchmark incrementally.
The value can be "same" to re-use the previous benchmark's job.
Default: random UUID`,
    },
    env: {
      string: true,
      requiresArg: true,
      describe: `Name of the current hardware/software environment.
Used to compare different machines or configurations together.
Meant to be used together with the 'job' option.
Default: ""`,
    },
    run: {
      describe: `Module to run benchmarks for a specific programming language or
platform.
Built-in runners: node.
Custom runners (installed with npm) can also be used.
Uses a dot notation such as --run.node (not --run=node nor --run node).
Runner-specific options can be specified using the same dot notation such as
--run.node.require.`,
    },
    progress: {
      describe: `Module to report benchmark progress.
Built-in progress reporters: silent.
Custom progress reporters (installed with npm) can also be used.
Uses a dot notation such as --progress.bar (not --progress=bar nor --progress bar).`,
    },
    save: {
      boolean: true,
      describe: `Save the benchmarks.
Default: false`,
    },
  },

  usage: `$0 [options] [<file...>]

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
/* eslint-enable max-lines */
