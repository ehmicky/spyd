// Configuration shared by commands that can select combinations:
// `run`, `debug`, `show`
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
  inputs: {
    alias: 'i',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Identifiers of the inputs.
Each identifier can start with a ! to exclude the input instead of selecting it.
Default: all inputs`,
  },
  system: {
    string: true,
    requiresArg: true,
    describe: `Name of the current hardware/software system.
Used to compare different machines or configurations together.
Can contain variables such as {{os}}, {{os_full}} or {{VAR}} where VAR is an
environment variable.
Default: ""`,
  },
  run: {
    describe: `Module to measure tasks for a specific programming language or
platform.
Built-in runners: node, cli.
Custom runners can be installed from npm.
Uses a dot notation such as --run.node (not --run=node nor --run node).
Runner-specific options can be specified using the same dot notation such as
--run.node.require.`,
  },
}
