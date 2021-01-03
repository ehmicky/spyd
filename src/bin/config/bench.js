// Configuration specific to `bench`
export const BENCH_CONFIG = {
  duration: {
    alias: 'd',
    number: true,
    requiresArg: true,
    describe: `How many seconds to execute each combination.
The default is 1 which executes each combination once.
Can also be 0 which only stops when CTRL-C is typed.`,
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
