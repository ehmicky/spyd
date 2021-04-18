import { TASKS, REPORT, HISTORY } from './groups.js'

// Configuration specific to `bench`
export const BENCH_CONFIG = {
  precision: {
    group: TASKS,
    alias: 'p',
    number: true,
    requiresArg: true,
    describe: `Precision level of the results, between 0 and 4.
The default is 2.
A higher level increases precision but makes the benchmark last longer.`,
  },
  quiet: {
    group: REPORT,
    alias: 'q',
    boolean: true,
    describe: `Preview the results and display a progress bar.
Reporters are still used.
Default: false if the terminal is interactive.`,
  },
  concurrency: {
    group: TASKS,
    number: true,
    requiresArg: true,
  },
  save: {
    group: HISTORY,
    alias: 's',
    boolean: true,
    describe: `Save the results.
Default: false`,
  },
  limit: {
    group: HISTORY,
    alias: 'l',
    string: true,
    array: true,
    describe: `Report when the average duration has increased by more than a
specific percentage such as "50%".
The limit can be scoped to specific combinations by appending their identifiers
after the percentage. The syntax is the same as the "include" configuration
property. For example "50% taskOne node" applies only to taskOne when the
runner is node.
Several limits can be specified at once.`,
  },
}
