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
    string: true,
    describe: `Append the current benchmarks to the previous one.
Used to create a single benchmark incrementally.
Can also be a group identifier. Benchmarks with the group are reported together.
Default: random UUID`,
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
}
