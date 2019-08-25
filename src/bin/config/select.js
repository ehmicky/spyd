// Configuration shared by commands that can select iterations: `run`, `debug`,
// `show`
export const SELECT_CONFIG = {
  tasks: {
    alias: 't',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Identifiers of the tasks.
Each identifier can start with a ! to exclude the task instead of selecting it.
Default: all tasks`,
  },
  variations: {
    alias: 'v',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Identifiers of the variations.
Each identifier can start with a ! to exclude the variation instead of selecting it.
Default: all variations`,
  },
  system: {
    string: true,
    requiresArg: true,
    describe: `Name of the current hardware/software system.
Used to compare different machines or configurations together.
Can contain variables such as <<OS>>, <<OS_FULL>> or <<VAR>> where VAR is an
environment variable.
Default: ""`,
  },
  run: {
    describe: `Module to run benchmarks for a specific programming language or
platform.
Built-in runners: node, cli.
Custom runners (installed with npm) can also be used.
Uses a dot notation such as --run.node (not --run=node nor --run node).
Runner-specific options can be specified using the same dot notation such as
--run.node.require.`,
  },
}
