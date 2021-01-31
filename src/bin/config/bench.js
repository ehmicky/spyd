import { TASKS, REPORT, STORE } from './groups.js'

// Configuration specific to `bench`
export const BENCH_CONFIG = {
  duration: {
    group: TASKS,
    alias: 'd',
    number: true,
    requiresArg: true,
    describe: `How many seconds to execute each combination.
The default is 1 which executes each combination once.
Can also be 0 which only stops when CTRL-C is typed.`,
  },
  preview: {
    group: REPORT,
    boolean: true,
    describe: `Preview the results and display a progress bar.
Default: true if a reporter is printing to the terminal.`,
  },
  concurrency: {
    group: TASKS,
    number: true,
    requiresArg: true,
  },
  save: {
    group: STORE,
    alias: 's',
    boolean: true,
    describe: `Save the results.
Default: false`,
  },
  limit: {
    group: STORE,
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
