// Configuration shared by commands that run benchmark files: `run`, `debug`
export const RUN_SHARED_CONFIG = {
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
  run: {
    describe: `Module to run benchmarks for a specific programming language or
platform.
Built-in runners: node.
Custom runners (installed with npm) can also be used.
Uses a dot notation such as --run.node (not --run=node nor --run node).
Runner-specific options can be specified using the same dot notation such as
--run.node.require.`,
  },
}

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
  system: {
    string: true,
    requiresArg: true,
    describe: `Identifier of the current hardware/software system.
Used to compare different machines or configurations together.
If the reporting title is different from the identifier, it can be specified
after a slash: --system "systemId/systemTitle".
Default: ""`,
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
