// Configuration specific to `run`
export const RUN_CONFIG = {
  duration: {
    alias: 'd',
    number: true,
    requiresArg: true,
    describe: `How many seconds to benchmark each task.
Default: 10`,
  },
  group: {
    alias: 'g',
    string: true,
    describe: `Append the current benchmarks to the previous one.
Used to create a single benchmark in several incremental runs.
Can also be a group identifier. Benchmarks within the same group are reported together.
Default: random UUID`,
  },
  progress: {
    describe: `Module to report benchmark progress.
Built-in progress reporters: silent.
Custom progress reporters can be installed from npm.
Uses a dot notation such as --progress.bar (not --progress=bar nor --progress bar).`,
  },
  save: {
    alias: 's',
    boolean: true,
    describe: `Save the benchmarks.
Default: false`,
  },
}
