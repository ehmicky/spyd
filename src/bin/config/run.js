import { TASKS, HISTORY } from './groups.js'

// Configuration shared by commands that can run combinations: `bench`, `dev`
export const RUN_CONFIG = {
  tasks: {
    group: TASKS,
    alias: 't',
    array: true,
    string: true,
    requiresArg: true,
    describe: `Path to the tasks files.
This should only specify their main files.

When using multiple runners, each runner can have its own tasks file by using
--runnerId.tasks=path
Can be specified several times.
Can be a globbing pattern.

Default: "tasks.*"`,
  },
  runner: {
    group: TASKS,
    string: true,
    array: true,
    describe: `Tasks' programming language or platform.

Can be specified several times.

Built-in runners: node, cli
Custom runners can be installed from npm.

Runner-specific configuration properties can be specified by appending the runner's identifier: --runnerId.prop=value.
For example: --runnerNode.version=8

Default: "node"`,
  },
  inputs: {
    group: TASKS,
    describe: `Inputs passed to tasks.

The key uses a dot notation and specifies the input identifier, such as
--inputs.size=5
When using variations, the variation identifier must be specified too,
such as --inputs.size.small=5

The inputs values are passed to tasks as arguments.`,
  },
  system: {
    group: HISTORY,
    string: true,
    requiresArg: true,
    describe: `Identifier of the current hardware/software system.
Used to compare different machines or configurations together.
Default: "default_system"`,
  },
}
