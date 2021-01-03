// Configuration specific to `bench`
export const BENCH_CONFIG = {
  duration: {
    alias: 'd',
    number: true,
    requiresArg: true,
    describe: `How many seconds to execute each combination.
Can also be:
  - 1: execute each combination once
  - 0: only stop when CTRL-C is typed
Default: 0 in interactive terminals, 1 otherwise.`,
  },
  concurrency: {
    alias: 'C',
    number: true,
    requiresArg: true,
  },
  merge: {
    string: true,
    describe: `Append the current results to the previous one.
Used to create a single result in several incremental benchmarks.
Can also be an id. Results within the same id are reported together.
Default: random UUID`,
  },
  progresses: {
    alias: 'P',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Module to report progress.
Built-in progress reporters: silent.
Custom progress reporters can be installed from npm.`,
  },
  progress: {
    describe: `Progress reporter-specific configuration properties.
Uses a dot notation such as --progress.name.prop=value`,
  },
  save: {
    alias: 's',
    boolean: true,
    describe: `Save the results.
Default: false`,
  },
}
