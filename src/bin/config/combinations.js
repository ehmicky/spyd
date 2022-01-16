import { TASKS, HISTORY } from './groups.js'

// Configuration shared by commands that can run combinations: `run`, `dev`
export const COMBINATIONS_CONFIG = {
  tasks: {
    group: TASKS,
    alias: 't',
    requiresArg: true,
    describe: `Path to the tasks files.
This should only specify their main files.

By default, any "tasks.*" file in the current or parent directories is used.
It can also be inside a "benchmark" or "packages/spyd-config-*" sub-directory.

When using multiple runners, each runner can have its own tasks file by using
--runnerId.tasks=path
Can be specified several times.
Can be a globbing pattern.`,
  },
  runner: {
    group: TASKS,
    describe: `Tasks' programming language or platform.
Can be specified several times.

Built-in runners: node, cli
Custom runners can be installed from npm.
Default: "node"`,
  },
  runnerConfig: {
    group: TASKS,
    describe: `Runners' configuration.
Each runner has its own configuration namespaced by its identifier.
For example: --runnerConfig.node.version=8`,
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
    requiresArg: true,
    describe: `Identifiers of the current hardware/software system.
Used to compare different machines or configurations together.
Both the identifier and its type must be specified, such as --system.os=linux or
--system.node_version=node_16
Default: none`,
  },
}
