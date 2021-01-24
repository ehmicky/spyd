import { TASKS, PROGRESS, STORE } from './groups.js'

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
  concurrency: {
    group: TASKS,
    alias: 'C',
    number: true,
    requiresArg: true,
  },
  system: {
    group: STORE,
    string: true,
    requiresArg: true,
    describe: `Identifier of the current hardware/software system.
Used to compare different machines or configurations together.
Default: "default_system"`,
  },
  progress: {
    group: PROGRESS,
    alias: 'P',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Module to report progress.
Can be specified several times.
Built-in progress reporters: silent.
Custom progress reporters can be installed from npm.
Progress-reporter-specific configuration properties can be specified by
appending the progress reporter's name: --progressName.prop=value`,
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
    requiresArg: true,
    describe: `Report when the average duration has increased by more than a
specific percentage such as "50%".
The limit can be scoped to specific combinations by appending their identifiers
after the percentage. The syntax is the same as the "include" configuration
property. For example "50% taskOne node" applies only to taskOne when the
runner is node.
Several limits can be specified at once.`,
  },
}
